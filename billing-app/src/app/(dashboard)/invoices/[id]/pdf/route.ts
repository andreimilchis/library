import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { formatCurrency, formatDate, generateInvoiceNumber } from "@/lib/utils";

async function getInvoiceData(id: string) {
  return prisma.invoice.findUnique({
    where: { id },
    include: {
      company: {
        include: { bankAccounts: true },
      },
      client: true,
      lines: {
        orderBy: { orderIndex: "asc" },
        include: { product: true },
      },
    },
  });
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const invoice = await getInvoiceData(id);

  if (!invoice) {
    return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
  }

  const invoiceNumber = generateInvoiceNumber(invoice.seriesPrefix, invoice.number);
  const defaultBank = invoice.company.bankAccounts.find((b) => b.isDefault && b.currency === invoice.currency)
    || invoice.company.bankAccounts.find((b) => b.isDefault)
    || invoice.company.bankAccounts[0];

  // Generate HTML-based PDF
  const html = `<!DOCTYPE html>
<html lang="ro">
<head>
  <meta charset="UTF-8">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: Arial, Helvetica, sans-serif; font-size: 11px; color: #333; padding: 40px; }
    .header { display: flex; justify-content: space-between; margin-bottom: 30px; }
    .header-left h1 { font-size: 24px; color: #1a56db; margin-bottom: 4px; }
    .header-left p { font-size: 12px; color: #666; }
    .header-right { text-align: right; }
    .header-right .inv-number { font-size: 20px; font-weight: bold; color: #1a56db; }
    .header-right .inv-date { color: #666; margin-top: 4px; }
    .parties { display: flex; justify-content: space-between; margin-bottom: 30px; gap: 40px; }
    .party { flex: 1; }
    .party h3 { font-size: 10px; text-transform: uppercase; color: #999; letter-spacing: 1px; margin-bottom: 8px; }
    .party .name { font-size: 14px; font-weight: bold; margin-bottom: 4px; }
    .party p { margin-bottom: 2px; color: #555; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
    thead th { background: #f8f9fa; border-bottom: 2px solid #dee2e6; padding: 8px 6px; text-align: left; font-size: 10px; text-transform: uppercase; color: #666; }
    tbody td { padding: 8px 6px; border-bottom: 1px solid #eee; }
    .text-right { text-align: right; }
    .totals { display: flex; justify-content: flex-end; margin-bottom: 30px; }
    .totals-table { width: 250px; }
    .totals-table .row { display: flex; justify-content: space-between; padding: 4px 0; }
    .totals-table .total-row { border-top: 2px solid #333; padding-top: 8px; margin-top: 4px; font-size: 14px; font-weight: bold; }
    .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #eee; }
    .footer .bank { margin-bottom: 10px; }
    .footer .bank h4 { font-size: 10px; text-transform: uppercase; color: #999; margin-bottom: 4px; }
    .notes { margin-top: 20px; padding: 12px; background: #f8f9fa; border-radius: 4px; }
    .notes h4 { font-size: 10px; text-transform: uppercase; color: #999; margin-bottom: 4px; }
    .reverse-charge { color: #dc2626; font-weight: bold; margin: 10px 0; }
  </style>
</head>
<body>
  <div class="header">
    <div class="header-left">
      <h1>${invoice.company.name}</h1>
      <p>CUI: ${invoice.company.cui}${invoice.company.jNumber ? ' | J: ' + invoice.company.jNumber : ''}</p>
      <p>${invoice.company.address}</p>
      <p>${invoice.company.city}, ${invoice.company.county}</p>
      ${invoice.company.phone ? '<p>Tel: ' + invoice.company.phone + '</p>' : ''}
      ${invoice.company.email ? '<p>Email: ' + invoice.company.email + '</p>' : ''}
    </div>
    <div class="header-right">
      <div class="inv-number">${invoice.type === 'FACTURA' ? 'FACTURA' : invoice.type === 'FACTURA_PROFORMA' ? 'FACTURA PROFORMA' : invoice.type} ${invoiceNumber}</div>
      <div class="inv-date">
        <p>Data emitere: ${formatDate(invoice.issueDate)}</p>
        <p>Data scadenta: ${formatDate(invoice.dueDate)}</p>
        ${invoice.deliveryDate ? '<p>Data livrare: ' + formatDate(invoice.deliveryDate) + '</p>' : ''}
      </div>
    </div>
  </div>

  <div class="parties">
    <div class="party">
      <h3>Furnizor</h3>
      <div class="name">${invoice.company.name}</div>
      <p>CUI: ${invoice.company.cui}</p>
      ${invoice.company.jNumber ? '<p>Reg. Com.: ' + invoice.company.jNumber + '</p>' : ''}
      <p>${invoice.company.address}</p>
      <p>${invoice.company.city}, ${invoice.company.county}</p>
    </div>
    <div class="party">
      <h3>Client</h3>
      <div class="name">${invoice.client.name}</div>
      ${invoice.client.cui ? '<p>CUI: ' + invoice.client.cui + '</p>' : ''}
      ${invoice.client.jNumber ? '<p>Reg. Com.: ' + invoice.client.jNumber + '</p>' : ''}
      ${invoice.client.address ? '<p>' + invoice.client.address + '</p>' : ''}
      ${invoice.client.city ? '<p>' + invoice.client.city + (invoice.client.county ? ', ' + invoice.client.county : '') + '</p>' : ''}
    </div>
  </div>

  ${invoice.reverseCharge ? '<div class="reverse-charge">TAXARE INVERSA - TVA se aplica de catre cumparator</div>' : ''}

  <table>
    <thead>
      <tr>
        <th style="width:30px">#</th>
        <th>Descriere</th>
        <th class="text-right" style="width:60px">Cant.</th>
        <th style="width:40px">UM</th>
        <th class="text-right" style="width:90px">Pret unitar</th>
        <th class="text-right" style="width:60px">TVA %</th>
        <th class="text-right" style="width:80px">TVA</th>
        <th class="text-right" style="width:90px">Total</th>
      </tr>
    </thead>
    <tbody>
      ${invoice.lines.map((line, idx) => `
        <tr>
          <td>${idx + 1}</td>
          <td>${line.description}</td>
          <td class="text-right">${line.quantity}</td>
          <td>${line.unitOfMeasure}</td>
          <td class="text-right">${formatCurrency(line.unitPrice, invoice.currency)}</td>
          <td class="text-right">${line.tvaRate}%</td>
          <td class="text-right">${formatCurrency(line.tvaAmount, invoice.currency)}</td>
          <td class="text-right">${formatCurrency(line.lineTotal, invoice.currency)}</td>
        </tr>
      `).join('')}
    </tbody>
  </table>

  <div class="totals">
    <div class="totals-table">
      <div class="row">
        <span>Subtotal (fara TVA):</span>
        <span>${formatCurrency(invoice.subtotal, invoice.currency)}</span>
      </div>
      ${invoice.discountTotal > 0 ? '<div class="row"><span>Discount:</span><span>-' + formatCurrency(invoice.discountTotal, invoice.currency) + '</span></div>' : ''}
      <div class="row">
        <span>TVA:</span>
        <span>${formatCurrency(invoice.tvaAmount, invoice.currency)}</span>
      </div>
      <div class="row total-row">
        <span>TOTAL:</span>
        <span>${formatCurrency(invoice.total, invoice.currency)}</span>
      </div>
      ${invoice.currency !== 'RON' ? '<div class="row"><span>Echivalent RON:</span><span>' + formatCurrency(invoice.total * invoice.exchangeRate, 'RON') + '</span></div><div class="row" style="font-size:9px;color:#999"><span>Curs BNR: 1 ' + invoice.currency + ' = ' + invoice.exchangeRate + ' RON</span></div>' : ''}
    </div>
  </div>

  <div class="footer">
    ${defaultBank ? '<div class="bank"><h4>Cont bancar</h4><p>IBAN: ' + defaultBank.iban + '</p><p>Banca: ' + defaultBank.bankName + '</p></div>' : ''}
    <p><strong>Metoda de plata:</strong> ${
      invoice.paymentMethod === 'TRANSFER_BANCAR' ? 'Transfer bancar' :
      invoice.paymentMethod === 'NUMERAR' ? 'Numerar' :
      invoice.paymentMethod === 'CARD' ? 'Card' :
      invoice.paymentMethod === 'OP' ? 'Ordin de plata' : invoice.paymentMethod
    }</p>
  </div>

  ${invoice.notes ? '<div class="notes"><h4>Observatii</h4><p>' + invoice.notes + '</p></div>' : ''}
</body>
</html>`;

  return new NextResponse(html, {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Content-Disposition": `inline; filename="${invoiceNumber}.html"`,
    },
  });
}
