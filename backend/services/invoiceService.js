const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");

/**
 * Generate a professional "Apple-style" PDF invoice for an order.
 * @param {Object} order - The order object.
 * @returns {Promise<string>} The absolute path to the generated PDF.
 */
const generateInvoice = (order) => {
  return new Promise((resolve, reject) => {
    try {
      // Ensure the uploads/invoices directory exists
      const invoicesDir = path.join(__dirname, "..", "uploads", "invoices");
      if (!fs.existsSync(invoicesDir)) {
        fs.mkdirSync(invoicesDir, { recursive: true });
      }

      const orderIdStr = String(order._id).slice(-8).toUpperCase();
      const filePath = path.join(invoicesDir, `${orderIdStr}.pdf`);

      // Create a document
      const doc = new PDFDocument({ size: "A4", margin: 50 });

      // Pipe its output somewhere, like to a file or HTTP response
      const stream = fs.createWriteStream(filePath);
      doc.pipe(stream);

      // Add a clean Apple-style header
      doc
        .fillColor("#111111")
        .fontSize(28)
        .font("Helvetica-Bold")
        .text("Timo Store", 50, 57, { align: "center" })
        .fontSize(10)
        .font("Helvetica")
        .fillColor("#86868b")
        .text("Premium Fragrances & Colognes", 50, 90, { align: "center" });

      doc.moveDown(3);

      // Divider Line
      doc.strokeColor("#eaeaea").lineWidth(1).moveTo(50, 130).lineTo(545, 130).stroke();

      // Invoice Details
      doc
        .fontSize(20)
        .fillColor("#111111")
        .font("Helvetica-Bold")
        .text("Invoice", 50, 160);

      doc
        .fontSize(10)
        .font("Helvetica")
        .fillColor("#111111")
        .text(`Order ID: #${orderIdStr}`, 50, 190)
        .text(`Date: ${new Date().toLocaleDateString()}`, 50, 205)
        .text(`Customer: ${order.customerName || "Valued Customer"}`, 50, 220);

      // Table Header
      const tableTop = 270;
      doc.font("Helvetica-Bold").fontSize(10).fillColor("#86868b");
      doc.text("Item", 50, tableTop);
      doc.text("Qty", 350, tableTop, { width: 50, align: "center" });
      doc.text("Price", 420, tableTop, { width: 50, align: "right" });
      doc.text("Total", 495, tableTop, { width: 50, align: "right" });

      doc.strokeColor("#eaeaea").lineWidth(1).moveTo(50, tableTop + 15).lineTo(545, tableTop + 15).stroke();

      // Table Body
      let yPosition = tableTop + 25;
      doc.font("Helvetica").fillColor("#111111");

      (order.items || []).forEach((item) => {
        const itemTotal = item.price * item.quantity;
        
        doc.text(item.name, 50, yPosition, { width: 280 });
        doc.text(`x${item.quantity}`, 350, yPosition, { width: 50, align: "center" });
        doc.text(`$${item.price.toFixed(2)}`, 420, yPosition, { width: 50, align: "right" });
        doc.text(`$${itemTotal.toFixed(2)}`, 495, yPosition, { width: 50, align: "right" });
        
        yPosition += 20;
        doc.strokeColor("#f5f5f7").lineWidth(1).moveTo(50, yPosition - 5).lineTo(545, yPosition - 5).stroke();
      });

      // Summary Section
      const summaryTop = yPosition + 20;
      doc.font("Helvetica-Bold").fontSize(12).fillColor("#111111");
      doc.text("Total:", 400, summaryTop, { width: 70, align: "right" });
      doc.text(`$${(order.totalPrice || 0).toFixed(2)}`, 470, summaryTop, { width: 75, align: "right" });

      doc.font("Helvetica").fontSize(10).fillColor("#86868b");
      doc.text(`Status: ${String(order.status || "Pending").toUpperCase()}`, 50, summaryTop);

      // Footer
      const pageHeight = doc.page.height;
      doc
        .fontSize(10)
        .fillColor("#86868b")
        .text(`© ${new Date().getFullYear()} Timo Store. All rights reserved.`, 50, pageHeight - 50, { align: "center" });

      // Finalize PDF file
      doc.end();

      stream.on("finish", () => {
        resolve(filePath);
      });

      stream.on("error", (err) => {
        reject(err);
      });
    } catch (error) {
      reject(error);
    }
  });
};

module.exports = {
  generateInvoice,
};
