/* eslint-disable @typescript-eslint/no-explicit-any */
import PDFDocument from "pdfkit";
import AppError from "../errorHelpers/appError.js";

// Call this function liek this:
// const pdfBuffer = await generateInvoice({
//       invoiceNo: "INV-10001",
//       date: "08 Jul 2026",

//       customer: {
//         name: "John Doe",
//         address: "123 Main Street, New York, USA",
//         phone: "+1 123-456-7890",
//       },

//       items: [
//         {
//           description: "React Development",
//           quantity: 2,
//           price: 150,
//         },
//         {
//           description: "Node.js API",
//           quantity: 1,
//           price: 300,
//         },
//         {
//           description: "UI Design",
//           quantity: 3,
//           price: 75,
//         },
//       ],

//       shipping: 20,
//       tax: 15,

//       paymentMethod: "Bank Transfer",
//       accountName: "ABC Company",
//       bankName: "City Bank",
//     });

export const generateInvoice = async (
  data: any,
  outputPath = "invoice.pdf",
): Promise<Buffer<ArrayBufferLike>> => {
  try {
    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({
        size: "A4",
        margin: 40,
      });

      const buffer: Uint8Array[] = [];

      doc.on("data", (chunk) => buffer.push(chunk));
      doc.on("end", () => resolve(Buffer.concat(buffer)));
      doc.on("error", (err) => reject(err));

      // Don't write to file system on serverless (Vercel has read-only fs)
      // doc.pipe(fs.createWriteStream(outputPath));

      // ==========================
      // Header
      // ==========================
      doc.rect(0, 0, doc.page.width, 90).fill("#0B5FA5");

      // Curve
      doc.circle(250, 0, 65).fill("#FFFFFF");
      doc.circle(260, -8, 55).fill("#0B5FA5");

      doc
        .fillColor("white")
        .font("Helvetica-Bold")
        .fontSize(22)
        .text("INVOICE", 40, 30);

      doc.fontSize(10).text("LOGO HERE", 470, 35);

      // ==========================
      // Customer Info
      // ==========================

      const top = 115;

      doc.fillColor("#333");

      doc.fontSize(9).font("Helvetica").text("Invoice To:", 40, top);

      doc
        .font("Helvetica-Bold")
        .fontSize(13)
        .text(data.customer.name, 40, top + 15);

      doc
        .font("Helvetica")
        .fontSize(9)
        .text(data.customer.address, 40, top + 35);

      doc.text(data.customer.phone, 40, top + 50);

      doc.font("Helvetica-Bold").text("Invoice #", 390, top);

      doc.font("Helvetica").text(data.invoiceNo, 470, top);

      doc.font("Helvetica-Bold").text("Date", 390, top + 20);

      doc.font("Helvetica").text(data.date, 470, top + 20);

      // ==========================
      // Table Header
      // ==========================

      let tableY = 190;

      doc.rect(40, tableY, 515, 24).fill("#163D75");

      doc.fillColor("white").font("Helvetica-Bold").fontSize(9);

      doc.text("SL", 50, tableY + 7);
      doc.text("Description", 90, tableY + 7);
      doc.text("Price", 325, tableY + 7);
      doc.text("Qty", 395, tableY + 7);
      doc.text("Total", 470, tableY + 7);

      tableY += 30;

      let subtotal = 0;

      data.items.forEach((item: any, index: any) => {
        const total = item.price * item.quantity;
        subtotal += total;

        doc.fillColor("#333").font("Helvetica").fontSize(9);

        doc.text(index + 1, 50, tableY);

        doc.text(item.description, 90, tableY, {
          width: 220,
        });

        doc.text(`$${item.price.toFixed(2)}`, 325, tableY);

        doc.text(item.quantity, 405, tableY);

        doc.text(`$${total.toFixed(2)}`, 470, tableY);

        doc
          .moveTo(40, tableY + 18)
          .lineTo(555, tableY + 18)
          .strokeColor("#E5E5E5")
          .stroke();

        tableY += 25;
      });

      // ==========================
      // Summary
      // ==========================

      const shipping = data.shipping || 0;
      const tax = data.tax || 0;
      const grandTotal = subtotal + shipping + tax;

      const summaryY = tableY + 20;

      doc.font("Helvetica").fontSize(10).fillColor("#333");

      doc.text("Sub Total", 360, summaryY);
      doc.text(`$${subtotal.toFixed(2)}`, 485, summaryY);

      doc.text("Shipping", 360, summaryY + 18);
      doc.text(`$${shipping.toFixed(2)}`, 485, summaryY + 18);
      doc.text("Tax", 360, summaryY + 36);
      doc.text(`$${tax.toFixed(2)}`, 485, summaryY + 36);

      doc.rect(350, summaryY + 60, 205, 28).fill("#163D75");

      doc.fillColor("white").font("Helvetica-Bold").fontSize(12);

      doc.text("TOTAL", 365, summaryY + 69);

      doc.text(`$${grandTotal.toFixed(2)}`, 485, summaryY + 69);

      // ==========================
      // Payment Info
      // ==========================

      doc.fillColor("#333").font("Helvetica-Bold").fontSize(9);

      doc.text("Payment Info", 40, summaryY);

      doc.font("Helvetica").fontSize(8);

      doc.text(
        `Payment Method : ${data.paymentMethod || "Cash"}\n` +
          `Account Name   : ${data.accountName || "ABC Company"}\n` +
          `Bank Name      : ${data.bankName || "Sample Bank"}`,
        40,
        summaryY + 15,
      );

      // ==========================
      // Footer
      // ==========================

      const footerY = 730;

      doc
        .font("Helvetica-Bold")
        .fontSize(9)
        .fillColor("#333")
        .text("For Any Query", 40, footerY);

      doc
        .font("Helvetica")
        .fontSize(8)
        .text(
          "Call : +8801700000000\nEmail : info@example.com",
          40,
          footerY + 15,
        );

      doc
        .moveTo(390, footerY + 25)
        .lineTo(540, footerY + 25)
        .stroke();

      doc.text("Authorized Signature", 410, footerY + 35);

      doc.end();
    });
  } catch (error: any) {
    throw new AppError(500, `Failed to generate invoice: ${error.message}`);
  }
};
