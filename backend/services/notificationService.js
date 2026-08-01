const nodemailer = require("nodemailer");
const logger = require("../utils/logger");

/**
 * Create Nodemailer transporter using SMTP credentials from .env
 */
const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || "smtp.gmail.com",
    port: Number(process.env.SMTP_PORT) || 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_EMAIL,
      pass: process.env.SMTP_PASSWORD,
    },
  });
};

/**
 * Generate HTML template for admin new order notification
 */
const buildAdminOrderEmailHTML = (order, customerName) => {
  const statusColors = {
    pending: "#F59E0B",
    processing: "#3B82F6",
    shipped: "#8B5CF6",
    delivered: "#10B981",
    cancelled: "#EF4444",
  };

  const statusColor = statusColors[order.status] || "#D4AF37";

  const itemsRows = order.items
    .map(
      (item) => `
      <tr>
        <td style="padding: 10px 12px; border-bottom: 1px solid #2a2a2a; color: #e5e5e5;">${item.name}</td>
        <td style="padding: 10px 12px; border-bottom: 1px solid #2a2a2a; color: #9ca3af; text-align: center;">${item.quantity}</td>
        <td style="padding: 10px 12px; border-bottom: 1px solid #2a2a2a; color: #D4AF37; text-align: right;">$${item.price.toFixed(2)}</td>
        <td style="padding: 10px 12px; border-bottom: 1px solid #2a2a2a; color: #D4AF37; text-align: right;">$${(item.price * item.quantity).toFixed(2)}</td>
      </tr>
    `
    )
    .join("");

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>New Order Alert — Timo Store</title>
</head>
<body style="margin: 0; padding: 0; background-color: #0a0a0a; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
  <div style="max-width: 640px; margin: 40px auto; background: #111111; border: 1px solid #1e1e1e; border-radius: 16px; overflow: hidden;">
    
    <!-- Header -->
    <div style="background: linear-gradient(135deg, #1a1400 0%, #2d2200 100%); border-bottom: 1px solid #D4AF37; padding: 32px;">
      <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 8px;">
        <div style="width: 40px; height: 40px; background: linear-gradient(135deg, #D4AF37, #F0D060); border-radius: 50%; display: flex; align-items: center; justify-content: center;">
          <span style="font-size: 20px; font-weight: 900; color: #0a0a0a;">T</span>
        </div>
        <span style="font-size: 20px; font-weight: 700; color: #D4AF37; letter-spacing: 1px;">TIMO STORE</span>
      </div>
      <h1 style="margin: 0; font-size: 28px; font-weight: 800; color: #ffffff;">🔥 New Order Received!</h1>
      <p style="margin: 8px 0 0; color: #9ca3af; font-size: 14px;">A new order has been placed and requires your attention.</p>
    </div>

    <!-- Order Info Banner -->
    <div style="padding: 20px 32px; background: #161616; border-bottom: 1px solid #1e1e1e;">
      <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px;">
        <div>
          <p style="margin: 0; font-size: 12px; color: #6b7280; text-transform: uppercase; letter-spacing: 1px;">Order ID</p>
          <p style="margin: 4px 0 0; font-size: 16px; font-weight: 700; color: #D4AF37; font-family: monospace;">#${String(order._id).slice(-8).toUpperCase()}</p>
        </div>
        <div>
          <p style="margin: 0; font-size: 12px; color: #6b7280; text-transform: uppercase; letter-spacing: 1px;">Date</p>
          <p style="margin: 4px 0 0; font-size: 14px; color: #e5e5e5;">${new Date(order.createdAt).toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" })}</p>
        </div>
        <div>
          <span style="display: inline-block; background: ${statusColor}22; color: ${statusColor}; border: 1px solid ${statusColor}55; border-radius: 999px; padding: 4px 14px; font-size: 13px; font-weight: 600; text-transform: capitalize;">${order.status}</span>
        </div>
      </div>
    </div>

    <!-- Customer Details -->
    <div style="padding: 24px 32px; border-bottom: 1px solid #1e1e1e;">
      <h2 style="margin: 0 0 16px; font-size: 16px; font-weight: 700; color: #D4AF37; text-transform: uppercase; letter-spacing: 1px;">👤 Customer</h2>
      <div style="display: grid; gap: 8px;">
        <div style="display: flex; gap: 8px;">
          <span style="color: #6b7280; min-width: 80px;">Name:</span>
          <span style="color: #e5e5e5; font-weight: 600;">${customerName || "N/A"}</span>
        </div>
        <div style="display: flex; gap: 8px;">
          <span style="color: #6b7280; min-width: 80px;">Payment:</span>
          <span style="color: #e5e5e5;">${order.paymentMethod?.replace(/_/g, " ") || "N/A"}</span>
        </div>
        ${
          order.shippingAddress
            ? `
        <div style="display: flex; gap: 8px;">
          <span style="color: #6b7280; min-width: 80px;">Address:</span>
          <span style="color: #e5e5e5;">${order.shippingAddress.street}, ${order.shippingAddress.city}, ${order.shippingAddress.country}</span>
        </div>`
            : ""
        }
        ${
          order.notes
            ? `
        <div style="display: flex; gap: 8px;">
          <span style="color: #6b7280; min-width: 80px;">Notes:</span>
          <span style="color: #e5e5e5;">${order.notes}</span>
        </div>`
            : ""
        }
      </div>
    </div>

    <!-- Order Items -->
    <div style="padding: 24px 32px; border-bottom: 1px solid #1e1e1e;">
      <h2 style="margin: 0 0 16px; font-size: 16px; font-weight: 700; color: #D4AF37; text-transform: uppercase; letter-spacing: 1px;">🛍️ Order Items</h2>
      <table style="width: 100%; border-collapse: collapse;">
        <thead>
          <tr style="background: #1a1a1a;">
            <th style="padding: 10px 12px; text-align: left; color: #6b7280; font-size: 12px; text-transform: uppercase;">Product</th>
            <th style="padding: 10px 12px; text-align: center; color: #6b7280; font-size: 12px; text-transform: uppercase;">Qty</th>
            <th style="padding: 10px 12px; text-align: right; color: #6b7280; font-size: 12px; text-transform: uppercase;">Price</th>
            <th style="padding: 10px 12px; text-align: right; color: #6b7280; font-size: 12px; text-transform: uppercase;">Total</th>
          </tr>
        </thead>
        <tbody>${itemsRows}</tbody>
      </table>
    </div>

    <!-- Price Summary -->
    <div style="padding: 24px 32px; border-bottom: 1px solid #1e1e1e;">
      <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
        <span style="color: #9ca3af;">Subtotal</span>
        <span style="color: #e5e5e5;">$${(order.subtotal || order.totalPrice).toFixed(2)}</span>
      </div>
      ${
        order.discount > 0
          ? `
      <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
        <span style="color: #9ca3af;">Discount ${order.coupon ? `(${order.coupon})` : ""}</span>
        <span style="color: #10B981;">-$${order.discount.toFixed(2)}</span>
      </div>`
          : ""
      }
      <div style="display: flex; justify-content: space-between; padding-top: 12px; border-top: 1px solid #2a2a2a; margin-top: 8px;">
        <span style="color: #ffffff; font-weight: 700; font-size: 16px;">Total</span>
        <span style="color: #D4AF37; font-weight: 800; font-size: 20px;">$${order.totalPrice.toFixed(2)}</span>
      </div>
    </div>

    <!-- CTA -->
    <div style="padding: 24px 32px; text-align: center;">
      <p style="color: #6b7280; font-size: 13px; margin: 0 0 16px;">Manage this order from your admin dashboard</p>
      <a href="${process.env.CLIENT_URL || "http://localhost:3000"}/admin/orders/${order._id}"
         style="display: inline-block; background: linear-gradient(135deg, #D4AF37, #F0D060); color: #0a0a0a; text-decoration: none; font-weight: 700; font-size: 14px; padding: 12px 28px; border-radius: 8px; letter-spacing: 0.5px;">
        View Order →
      </a>
    </div>

    <!-- Footer -->
    <div style="padding: 16px 32px; background: #0d0d0d; border-top: 1px solid #1e1e1e; text-align: center;">
      <p style="margin: 0; color: #4b5563; font-size: 12px;">Timo Store Admin Notification — Do not reply to this email</p>
    </div>

  </div>
</body>
</html>`;
};

/**
 * Send admin notification email when a new order is placed
 * @param {Object} order - The created order document
 * @param {string} customerName - Customer's name
 */
const sendAdminOrderNotification = async (order, customerName) => {
  try {
    if (!process.env.SMTP_EMAIL || !process.env.SMTP_PASSWORD) {
      logger.warn("SMTP credentials not found. Skipping admin notification email.");
      return;
    }

    const adminEmail = process.env.ADMIN_EMAIL || process.env.SMTP_EMAIL;
    const transporter = createTransporter();

    await transporter.sendMail({
      from: `"Timo Store" <${process.env.SMTP_EMAIL}>`,
      to: adminEmail,
      subject: `🔥 New Order #${String(order._id).slice(-8).toUpperCase()} — $${order.totalPrice.toFixed(2)}`,
      html: buildAdminOrderEmailHTML(order, customerName),
    });

    logger.info(`✅ Admin order notification sent to ${adminEmail} for order ${order._id}`);
  } catch (error) {
    logger.error(`❌ Failed to send admin notification email: ${error.message}`);
    // Don't throw — email failure shouldn't break order creation
  }
};

module.exports = { sendAdminOrderNotification };
