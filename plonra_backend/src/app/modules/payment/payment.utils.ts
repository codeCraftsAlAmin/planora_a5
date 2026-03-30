import PDFDocument from "pdfkit";

interface IGenerateInvoicePdfPayload {
  invoiceId: string;
  userName: string;
  userEmail: string;
  eventName: string;
  eventDate: string;
  amount: number;
  transactionId: string;
  paymentDate: string;
}

export const generateInvoicePdf = async (
  payload: IGenerateInvoicePdfPayload,
): Promise<Buffer> => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({
        size: "A4",
        margin: 50,
      });

      const chunks: Buffer[] = [];
      doc.on("data", (chunk) => chunks.push(chunk));
      doc.on("end", () => resolve(Buffer.concat(chunks)));
      doc.on("error", (error) => reject(error));

      // --- Color Palette ---
      const primaryColor = "#1e293b"; // Dark Slate
      const accentColor = "#3b82f6"; // Planora Blue

      // --- Header / Logo ---
      doc
        .fillColor(accentColor)
        .fontSize(28)
        .font("Helvetica-Bold")
        .text("PLANORA", 50, 50);

      doc
        .fillColor(primaryColor)
        .fontSize(10)
        .font("Helvetica")
        .text("Your Ultimate Event Partner", 50, 80);

      doc
        .fillColor(primaryColor)
        .fontSize(20)
        .font("Helvetica-Bold")
        .text("INVOICE", 400, 50, { align: "right" });

      doc.moveDown(2);

      // --- Background Header Strip ---
      doc.rect(50, 110, 495, 2).fill(accentColor);

      doc.moveDown(2);

      // --- Two Column Layout for Info ---
      const topRow = 130;

      // Left Column: Bill To
      doc
        .fillColor(accentColor)
        .fontSize(12)
        .font("Helvetica-Bold")
        .text("BILL TO:", 50, topRow);

      doc
        .fillColor(primaryColor)
        .fontSize(10)
        .font("Helvetica")
        .text(payload.userName, 50, topRow + 15)
        .text(payload.userEmail, 50, topRow + 30);

      // Right Column: Invoice Details
      doc
        .fillColor(accentColor)
        .fontSize(12)
        .font("Helvetica-Bold")
        .text("DETAILS:", 350, topRow);

      doc
        .fillColor(primaryColor)
        .fontSize(10)
        .font("Helvetica")
        .text(
          `Invoice ID: #${payload.invoiceId.slice(-8).toUpperCase()}`,
          350,
          topRow + 15,
        )
        .text(
          `Date: ${new Date(payload.paymentDate).toLocaleDateString()}`,
          350,
          topRow + 30,
        )
        .text(`Txn ID: ${payload.transactionId}`, 350, topRow + 45);

      doc.moveDown(4);

      // --- Event Details Section ---
      doc.rect(50, 210, 495, 30).fill("#f1f5f9"); // Light background for table header

      const tableTop = 220;
      doc
        .fillColor(primaryColor)
        .font("Helvetica-Bold")
        .fontSize(10)
        .text("EVENT DESCRIPTION", 60, tableTop)
        .text("EVENT DATE", 300, tableTop)
        .text("PRICE", 480, tableTop, { align: "right" });

      // Item Row
      const itemY = 255;
      doc
        .font("Helvetica")
        .text(payload.eventName, 60, itemY)
        .text(new Date(payload.eventDate).toLocaleDateString(), 300, itemY)
        .text(`${payload.amount.toFixed(2)} BDT`, 480, itemY, {
          align: "right",
        });

      // Line Separator
      doc
        .moveTo(50, 280)
        .lineTo(545, 280)
        .lineWidth(0.5)
        .strokeColor("#cbd5e1")
        .stroke();

      // --- Summary Section ---
      const summaryY = 300;
      doc.fontSize(12).font("Helvetica-Bold").text("Total Paid", 350, summaryY);

      doc
        .fontSize(14)
        .fillColor(accentColor)
        .text(`${payload.amount.toFixed(2)} BDT`, 450, summaryY, {
          align: "right",
        });

      // --- Instructions / Note ---
      doc.moveDown(5);
      doc
        .fillColor(primaryColor)
        .fontSize(11)
        .font("Helvetica-Bold")
        .text("Instructions for Attendance:", 50);

      doc
        .fontSize(10)
        .font("Helvetica")
        .text(
          "1. Please present this invoice (digital or printed) at the entrance.",
          50,
        )
        .text("2. Admission is subject to organizer approval.", 50)
        .text(
          "3. For any queries, contact the host via Planora Dashboard.",
          50,
        );

      // --- Footer ---
      const footerY = 750;
      doc
        .fontSize(8)
        .fillColor("#94a3b8")
        .text("Planora Events - Sylhet, Bangladesh", 50, footerY, {
          align: "center",
        })
        .text("This is a computer-generated invoice. No signature required.", {
          align: "center",
        });

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
};
