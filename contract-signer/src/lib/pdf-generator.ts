import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import { prisma } from "./prisma";
import { getFile, uploadFile } from "./storage";

/**
 * Generate a signed PDF by overlaying all field values (signatures, text, dates)
 * onto the original PDF. Returns the URL of the signed PDF.
 */
export async function generateSignedPdf(documentId: string): Promise<string> {
  // Fetch document with all fields and signers
  const document = await prisma.document.findUnique({
    where: { id: documentId },
    include: {
      fields: {
        include: {
          signer: true,
        },
      },
      signers: true,
    },
  });

  if (!document) {
    throw new Error("Document not found");
  }

  // Load the original PDF
  const originalFileName = document.originalPdfUrl.split("/").pop();
  if (!originalFileName) {
    throw new Error("Original PDF not found");
  }

  const originalPdfBytes = await getFile(originalFileName);
  const pdfDoc = await PDFDocument.load(originalPdfBytes);
  const pages = pdfDoc.getPages();
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  // Process each field
  for (const field of document.fields) {
    if (!field.value) continue;

    const pageIndex = field.page - 1; // fields are 1-indexed
    if (pageIndex < 0 || pageIndex >= pages.length) continue;

    const page = pages[pageIndex];
    const pageHeight = page.getHeight();
    const pageWidth = page.getWidth();

    // Convert percentage-based positions to PDF coordinates
    const x = (field.posX / 100) * pageWidth;
    const y = pageHeight - ((field.posY / 100) * pageHeight) - ((field.height / 100) * pageHeight);
    const fieldWidth = (field.width / 100) * pageWidth;
    const fieldHeight = (field.height / 100) * pageHeight;

    if (field.type === "SIGNATURE" || field.type === "INITIALS") {
      // Handle signature images (data URLs) and typed signatures
      if (field.value.startsWith("data:image/")) {
        try {
          const base64Data = field.value.split(",")[1];
          const imageBytes = Buffer.from(base64Data, "base64");

          let image;
          if (field.value.includes("image/png")) {
            image = await pdfDoc.embedPng(imageBytes);
          } else if (field.value.includes("image/jpeg") || field.value.includes("image/jpg")) {
            image = await pdfDoc.embedJpg(imageBytes);
          }

          if (image) {
            // Scale image to fit the field while maintaining aspect ratio
            const imgAspect = image.width / image.height;
            const fieldAspect = fieldWidth / fieldHeight;

            let drawWidth = fieldWidth;
            let drawHeight = fieldHeight;

            if (imgAspect > fieldAspect) {
              drawHeight = fieldWidth / imgAspect;
            } else {
              drawWidth = fieldHeight * imgAspect;
            }

            // Center the image in the field
            const drawX = x + (fieldWidth - drawWidth) / 2;
            const drawY = y + (fieldHeight - drawHeight) / 2;

            page.drawImage(image, {
              x: drawX,
              y: drawY,
              width: drawWidth,
              height: drawHeight,
            });
          }
        } catch (err) {
          console.error(`Failed to embed signature image for field ${field.id}:`, err);
          // Fallback: draw text
          page.drawText("[Signature]", {
            x,
            y: y + fieldHeight / 2 - 6,
            size: 12,
            font: fontBold,
            color: rgb(0, 0, 0.5),
          });
        }
      } else if (field.value.startsWith("typed:")) {
        // Typed signature
        const typedText = field.value.replace("typed:", "");
        const fontSize = Math.min(fieldHeight * 0.6, 24);
        page.drawText(typedText, {
          x: x + 4,
          y: y + fieldHeight / 2 - fontSize / 3,
          size: fontSize,
          font: fontBold,
          color: rgb(0, 0, 0.4),
        });
      }
    } else {
      // Text fields: DATE_SIGNED, FULL_NAME, EMAIL, COMPANY, TITLE, TEXT
      const fontSize = Math.min(fieldHeight * 0.5, 12);
      const text = field.value;

      page.drawText(text, {
        x: x + 2,
        y: y + fieldHeight / 2 - fontSize / 3,
        size: fontSize,
        font,
        color: rgb(0, 0, 0),
      });
    }
  }

  // Add a completion stamp at the bottom of the last page
  const lastPage = pages[pages.length - 1];
  const stampY = 20;
  const stampText = `Electronically signed via NETkyu Contract Signer — Completed ${new Date().toISOString().split("T")[0]}`;
  lastPage.drawText(stampText, {
    x: 40,
    y: stampY,
    size: 7,
    font,
    color: rgb(0.5, 0.5, 0.5),
  });

  // Save the signed PDF
  const signedPdfBytes = await pdfDoc.save();
  const signedPdfBuffer = Buffer.from(signedPdfBytes);

  // Upload and store the signed PDF
  const signedPdfUrl = await uploadFile(signedPdfBuffer, `${document.name}-signed.pdf`);

  // Update the document with the signed PDF URL
  await prisma.document.update({
    where: { id: documentId },
    data: { signedPdfUrl },
  });

  console.log(`[PDF] Generated signed PDF for document ${documentId}`);

  return signedPdfUrl;
}

/**
 * Get the signed PDF as a Buffer. Falls back to original if signed version doesn't exist.
 */
export async function getSignedPdfBuffer(documentId: string): Promise<Buffer> {
  const document = await prisma.document.findUnique({
    where: { id: documentId },
  });

  if (!document) {
    throw new Error("Document not found");
  }

  const pdfUrl = document.signedPdfUrl || document.originalPdfUrl;
  const fileName = pdfUrl.split("/").pop();

  if (!fileName) {
    throw new Error("PDF file not found");
  }

  return getFile(fileName);
}
