/**
 * Email Templates
 * HTML templates used by the email service
 */

/**
 * Welcome email template sent to new users
 */
const welcomeEmailTemplate = (userName) => `
<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8" /><title>Welcome to Timo Store</title></head>
<body style="margin:0;padding:0;background:#0a0a0a;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <div style="max-width:600px;margin:40px auto;background:#111;border:1px solid #1e1e1e;border-radius:16px;overflow:hidden;">
    <div style="background:linear-gradient(135deg,#1a1400,#2d2200);border-bottom:1px solid #D4AF37;padding:32px;text-align:center;">
      <h1 style="margin:0;color:#D4AF37;font-size:28px;font-weight:800;">Welcome to Timo Store 🎉</h1>
    </div>
    <div style="padding:32px;">
      <p style="color:#e5e5e5;font-size:16px;">Hi <strong style="color:#D4AF37;">${userName}</strong>,</p>
      <p style="color:#9ca3af;">Thank you for joining Timo Store! We're thrilled to have you with us.</p>
      <p style="color:#9ca3af;">As a welcome gift, enjoy <strong style="color:#D4AF37;">15% off</strong> your first order.</p>
      <div style="text-align:center;margin:32px 0;">
        <a href="${process.env.CLIENT_URL || 'http://localhost:3000'}/products"
           style="display:inline-block;background:linear-gradient(135deg,#D4AF37,#F0D060);color:#0a0a0a;text-decoration:none;font-weight:700;padding:14px 32px;border-radius:8px;">
          Start Shopping →
        </a>
      </div>
    </div>
    <div style="padding:16px 32px;background:#0d0d0d;border-top:1px solid #1e1e1e;text-align:center;">
      <p style="margin:0;color:#4b5563;font-size:12px;">Timo Store — Premium Quality Products</p>
    </div>
  </div>
</body>
</html>`;

/**
 * Order confirmation template sent to customer after placing an order
 */
const orderConfirmationTemplate = (userName, order) => {
  const itemsRows = order.items
    .map(
      (item) => `
      <tr>
        <td style="padding:10px 12px;border-bottom:1px solid #2a2a2a;color:#e5e5e5;">${item.name}</td>
        <td style="padding:10px 12px;border-bottom:1px solid #2a2a2a;color:#9ca3af;text-align:center;">${item.quantity}</td>
        <td style="padding:10px 12px;border-bottom:1px solid #2a2a2a;color:#D4AF37;text-align:right;">$${(item.price * item.quantity).toFixed(2)}</td>
      </tr>`
    )
    .join("");

  return `
<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8" /><title>Order Confirmed — Timo Store</title></head>
<body style="margin:0;padding:0;background:#0a0a0a;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <div style="max-width:600px;margin:40px auto;background:#111;border:1px solid #1e1e1e;border-radius:16px;overflow:hidden;">
    <div style="background:linear-gradient(135deg,#1a1400,#2d2200);border-bottom:1px solid #D4AF37;padding:32px;">
      <h1 style="margin:0;color:#ffffff;font-size:26px;font-weight:800;">Order Confirmed ✅</h1>
      <p style="margin:8px 0 0;color:#9ca3af;">Order #${String(order._id).slice(-8).toUpperCase()}</p>
    </div>
    <div style="padding:32px;">
      <p style="color:#e5e5e5;">Hi <strong style="color:#D4AF37;">${userName}</strong>, your order has been placed successfully!</p>
      <table style="width:100%;border-collapse:collapse;margin:16px 0;">
        <thead>
          <tr style="background:#1a1a1a;">
            <th style="padding:10px 12px;text-align:left;color:#6b7280;font-size:12px;text-transform:uppercase;">Product</th>
            <th style="padding:10px 12px;text-align:center;color:#6b7280;font-size:12px;text-transform:uppercase;">Qty</th>
            <th style="padding:10px 12px;text-align:right;color:#6b7280;font-size:12px;text-transform:uppercase;">Total</th>
          </tr>
        </thead>
        <tbody>${itemsRows}</tbody>
      </table>
      <div style="text-align:right;padding-top:12px;border-top:1px solid #2a2a2a;">
        <span style="color:#D4AF37;font-weight:800;font-size:20px;">Total: $${order.totalPrice.toFixed(2)}</span>
      </div>
    </div>
    <div style="padding:16px 32px;background:#0d0d0d;border-top:1px solid #1e1e1e;text-align:center;">
      <p style="margin:0;color:#4b5563;font-size:12px;">Thank you for shopping at Timo Store!</p>
    </div>
  </div>
</body>
</html>`;
};

/**
 * Abandoned cart email template
 */
const abandonedCartTemplate = (userName, cart) => `
<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8" /><title>Your Cart is Waiting — Timo Store</title></head>
<body style="margin:0;padding:0;background:#0a0a0a;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <div style="max-width:600px;margin:40px auto;background:#111;border:1px solid #1e1e1e;border-radius:16px;overflow:hidden;">
    <div style="background:linear-gradient(135deg,#1a1400,#2d2200);border-bottom:1px solid #D4AF37;padding:32px;">
      <h1 style="margin:0;color:#ffffff;font-size:26px;font-weight:800;">You left something behind 🛒</h1>
    </div>
    <div style="padding:32px;">
      <p style="color:#e5e5e5;">Hi <strong style="color:#D4AF37;">${userName}</strong>,</p>
      <p style="color:#9ca3af;">Your cart is still waiting for you. Don't miss out on your selected items!</p>
      <div style="text-align:center;margin:32px 0;">
        <a href="${process.env.CLIENT_URL || 'http://localhost:3000'}/cart"
           style="display:inline-block;background:linear-gradient(135deg,#D4AF37,#F0D060);color:#0a0a0a;text-decoration:none;font-weight:700;padding:14px 32px;border-radius:8px;">
          Return to Cart →
        </a>
      </div>
    </div>
    <div style="padding:16px 32px;background:#0d0d0d;border-top:1px solid #1e1e1e;text-align:center;">
      <p style="margin:0;color:#4b5563;font-size:12px;">Timo Store — Premium Quality Products</p>
    </div>
  </div>
</body>
</html>`;

module.exports = {
  welcomeEmailTemplate,
  orderConfirmationTemplate,
  abandonedCartTemplate,
};
