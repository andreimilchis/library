import { PrismaClient } from "../src/generated/prisma";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // Create admin user
  const passwordHash = await bcrypt.hash("admin123", 10);
  const user = await prisma.user.upsert({
    where: { email: "admin@horsemen.agency" },
    update: {},
    create: {
      name: "Admin",
      email: "admin@horsemen.agency",
      passwordHash,
      role: "ADMIN",
    },
  });
  console.log("Created user:", user.email);

  // Create company
  const company = await prisma.company.create({
    data: {
      name: "The Horsemen Agency SRL",
      cui: "RO12345678",
      jNumber: "J40/1234/2020",
      address: "Str. Exemplu nr. 10, Sector 1",
      city: "Bucuresti",
      county: "Bucuresti",
      country: "Romania",
      phone: "+40 721 123 456",
      email: "contact@horsemen.agency",
      website: "https://horsemen.agency",
      tvaRegistered: true,
      tvaRateDefault: 19,
      defaultPaymentTerms: 30,
      defaultCurrency: "RON",
    },
  });
  console.log("Created company:", company.name);

  // Company user access
  await prisma.companyUserAccess.create({
    data: {
      companyId: company.id,
      userId: user.id,
      role: "ADMIN",
    },
  });

  // Create bank accounts
  await prisma.companyBankAccount.createMany({
    data: [
      {
        companyId: company.id,
        iban: "RO49AAAA1B31007593840000",
        bankName: "Banca Transilvania",
        currency: "RON",
        isDefault: true,
      },
      {
        companyId: company.id,
        iban: "RO49AAAA1B31007593840001",
        bankName: "Banca Transilvania",
        currency: "EUR",
        isDefault: false,
      },
    ],
  });

  // Create invoice series
  const facturaSeries = await prisma.invoiceSeries.create({
    data: {
      companyId: company.id,
      prefix: "HRS",
      currentNumber: 0,
      type: "FACTURA",
      isActive: true,
    },
  });

  await prisma.invoiceSeries.create({
    data: {
      companyId: company.id,
      prefix: "PRF",
      currentNumber: 0,
      type: "FACTURA_PROFORMA",
      isActive: true,
    },
  });
  console.log("Created invoice series: HRS, PRF");

  // Create clients
  const client1 = await prisma.client.create({
    data: {
      companyId: company.id,
      type: "SRL",
      name: "TechVision Solutions SRL",
      cui: "RO87654321",
      jNumber: "J40/5678/2019",
      address: "Bd. Unirii nr. 20, Sector 3",
      city: "Bucuresti",
      county: "Bucuresti",
      contactPerson: "Mihai Popescu",
      email: "mihai@techvision.ro",
      phone: "+40 722 345 678",
      paymentTermDays: 30,
    },
  });

  const client2 = await prisma.client.create({
    data: {
      companyId: company.id,
      type: "SRL",
      name: "Digital Marketing Pro SRL",
      cui: "RO11223344",
      jNumber: "J12/9876/2021",
      address: "Str. Libertatii nr. 5",
      city: "Cluj-Napoca",
      county: "Cluj",
      contactPerson: "Ana Ionescu",
      email: "ana@dmpro.ro",
      phone: "+40 723 456 789",
      paymentTermDays: 15,
    },
  });

  const client3 = await prisma.client.create({
    data: {
      companyId: company.id,
      type: "PFA",
      name: "Andrei Gheorghe PFA",
      cui: "RO55667788",
      address: "Str. Victoriei nr. 12",
      city: "Timisoara",
      county: "Timis",
      contactPerson: "Andrei Gheorghe",
      email: "andrei@gheorghe.ro",
      phone: "+40 724 567 890",
      paymentTermDays: 14,
    },
  });
  console.log("Created 3 clients");

  // Create products/services
  const service1 = await prisma.product.create({
    data: {
      companyId: company.id,
      name: "Consultanta strategie digitala",
      description: "Servicii de consultanta in strategie digitala si marketing online",
      type: "SERVICE",
      unitOfMeasure: "ora",
      defaultPrice: 150,
      tvaRate: 19,
      currency: "RON",
      category: "Consultanta",
      isActive: true,
    },
  });

  const service2 = await prisma.product.create({
    data: {
      companyId: company.id,
      name: "Dezvoltare website",
      description: "Servicii de dezvoltare si design website",
      type: "SERVICE",
      unitOfMeasure: "ora",
      defaultPrice: 200,
      tvaRate: 19,
      currency: "RON",
      category: "Web Development",
      isActive: true,
    },
  });

  const service3 = await prisma.product.create({
    data: {
      companyId: company.id,
      name: "Management campanii PPC",
      description: "Gestionarea campaniilor Google Ads si Facebook Ads",
      type: "SERVICE",
      unitOfMeasure: "luna",
      defaultPrice: 2500,
      tvaRate: 19,
      currency: "RON",
      category: "Marketing",
      isActive: true,
    },
  });

  const service4 = await prisma.product.create({
    data: {
      companyId: company.id,
      name: "SEO Optimization",
      description: "Optimizare SEO on-page si off-page",
      type: "SERVICE",
      unitOfMeasure: "luna",
      defaultPrice: 1800,
      tvaRate: 19,
      currency: "EUR",
      category: "Marketing",
      isActive: true,
    },
  });
  console.log("Created 4 products/services");

  // Create sample invoices
  const invoice1 = await prisma.invoice.create({
    data: {
      companyId: company.id,
      seriesId: facturaSeries.id,
      seriesPrefix: "HRS",
      number: 1,
      type: "FACTURA",
      status: "PAID",
      clientId: client1.id,
      issueDate: new Date("2025-01-15"),
      dueDate: new Date("2025-02-14"),
      currency: "RON",
      exchangeRate: 1,
      subtotal: 6000,
      tvaAmount: 1140,
      total: 7140,
      paymentMethod: "TRANSFER_BANCAR",
      lines: {
        create: [
          {
            productId: service1.id,
            description: "Consultanta strategie digitala",
            quantity: 20,
            unitOfMeasure: "ora",
            unitPrice: 150,
            tvaRate: 19,
            tvaAmount: 570,
            lineTotal: 3570,
            orderIndex: 0,
          },
          {
            productId: service2.id,
            description: "Dezvoltare website prezentare",
            quantity: 15,
            unitOfMeasure: "ora",
            unitPrice: 200,
            tvaRate: 19,
            tvaAmount: 570,
            lineTotal: 3570,
            orderIndex: 1,
          },
        ],
      },
    },
  });

  // Payment for invoice 1
  await prisma.payment.create({
    data: {
      companyId: company.id,
      invoiceId: invoice1.id,
      clientId: client1.id,
      amount: 7140,
      currency: "RON",
      paymentDate: new Date("2025-02-10"),
      paymentMethod: "TRANSFER_BANCAR",
      reference: "OP-2025-0234",
    },
  });

  const invoice2 = await prisma.invoice.create({
    data: {
      companyId: company.id,
      seriesId: facturaSeries.id,
      seriesPrefix: "HRS",
      number: 2,
      type: "FACTURA",
      status: "SENT",
      clientId: client2.id,
      issueDate: new Date("2025-02-01"),
      dueDate: new Date("2025-02-16"),
      currency: "RON",
      exchangeRate: 1,
      subtotal: 2500,
      tvaAmount: 475,
      total: 2975,
      paymentMethod: "TRANSFER_BANCAR",
      lines: {
        create: [
          {
            productId: service3.id,
            description: "Management campanii PPC - Ianuarie 2025",
            quantity: 1,
            unitOfMeasure: "luna",
            unitPrice: 2500,
            tvaRate: 19,
            tvaAmount: 475,
            lineTotal: 2975,
            orderIndex: 0,
          },
        ],
      },
    },
  });

  await prisma.invoice.create({
    data: {
      companyId: company.id,
      seriesId: facturaSeries.id,
      seriesPrefix: "HRS",
      number: 3,
      type: "FACTURA",
      status: "DRAFT",
      clientId: client3.id,
      issueDate: new Date("2025-02-20"),
      dueDate: new Date("2025-03-06"),
      currency: "EUR",
      exchangeRate: 4.97,
      subtotal: 1800,
      tvaAmount: 342,
      total: 2142,
      paymentMethod: "TRANSFER_BANCAR",
      lines: {
        create: [
          {
            productId: service4.id,
            description: "SEO Optimization - Februarie 2025",
            quantity: 1,
            unitOfMeasure: "luna",
            unitPrice: 1800,
            tvaRate: 19,
            tvaAmount: 342,
            lineTotal: 2142,
            orderIndex: 0,
          },
        ],
      },
    },
  });

  // Update series counter
  await prisma.invoiceSeries.update({
    where: { id: facturaSeries.id },
    data: { currentNumber: 3 },
  });

  console.log("Created 3 invoices with payments");

  // Create a warehouse
  await prisma.warehouse.create({
    data: {
      companyId: company.id,
      name: "Depozit principal",
      address: "Str. Exemplu nr. 10, Sector 1, Bucuresti",
      isDefault: true,
    },
  });
  console.log("Created default warehouse");

  console.log("Seed completed successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
