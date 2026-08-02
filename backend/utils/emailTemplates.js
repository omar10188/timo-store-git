/**
 * Email Templates
 * Premium "Apple-style" templates for Timo Store
 */

const getYear = () => new Date().getFullYear();

/**
 * Premium Order Confirmation Template
 */
const orderConfirmationTemplate = (userName, order) => {
  const itemsRows = order.items
    .map(
      (item) => `
      <tr>
        <td style="padding:16px 0;border-bottom:1px solid #eaeaea;color:#1d1d1f;font-weight:500;">${item.name}</td>
        <td style="padding:16px 0;border-bottom:1px solid #eaeaea;color:#86868b;text-align:center;">x${item.quantity}</td>
        <td style="padding:16px 0;border-bottom:1px solid #eaeaea;color:#1d1d1f;text-align:right;">$${(item.price * item.quantity).toFixed(2)}</td>
      </tr>`
    )
    .join("");

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Order Confirmed — Timo Store</title>
</head>
<body style="margin:0;padding:0;background-color:#f5f5f7;font-family:-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
  <div style="max-width:600px;margin:40px auto;background:#ffffff;border-radius:18px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.04);">
    <div style="padding:40px;text-align:center;background:#fbfbfd;border-bottom:1px solid #f5f5f7;">
      <h1 style="margin:0;color:#1d1d1f;font-size:28px;font-weight:600;letter-spacing:-0.5px;">Timo Store</h1>
      <h2 style="margin:12px 0 0;color:#1d1d1f;font-size:22px;font-weight:600;">🧾 Order Confirmation</h2>
    </div>
    <div style="padding:40px;">
      <p style="color:#1d1d1f;font-size:16px;line-height:1.5;">Hello <strong>${userName}</strong>,</p>
      <p style="color:#515154;font-size:16px;line-height:1.5;">Thank you for shopping with Timo Store. Your order has been received and is being processed.</p>
      
      <h3 style="margin:32px 0 16px;color:#1d1d1f;font-size:14px;text-transform:uppercase;letter-spacing:1px;border-bottom:2px solid #1d1d1f;padding-bottom:8px;">Order Details</h3>
      <table style="width:100%;border-collapse:collapse;margin:0 0 24px;">
        <tbody>${itemsRows}</tbody>
      </table>
      
      <div style="text-align:right;padding-top:16px;">
        <span style="color:#86868b;font-size:16px;margin-right:12px;">Total</span>
        <span style="color:#1d1d1f;font-weight:600;font-size:24px;">$${order.totalPrice.toFixed(2)}</span>
      </div>
      
      <p style="margin-top:40px;color:#515154;font-size:15px;text-align:center;">We’ll notify you when your order ships 🚚</p>
    </div>
    <div style="padding:24px 40px;background:#fbfbfd;border-top:1px solid #f5f5f7;text-align:center;">
      <p style="margin:0;color:#86868b;font-size:12px;">© ${getYear()} Timo Store. All rights reserved.</p>
    </div>
  </div>
</body>
</html>`;
};

/**
 * Premium Order Status Update Template
 */
const orderStatusUpdateTemplate = (userName, order, status) => {
  let statusMessage = "Your order status has been updated.";
  
  if (status === "shipped") {
    statusMessage = "Your order is on the way 🚚";
  } else if (status === "delivered") {
    statusMessage = "Your order has been delivered ✅";
  } else if (status === "pending") {
    statusMessage = "Your order is currently pending and awaiting processing.";
  }

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Order Update — Timo Store</title>
</head>
<body style="margin:0;padding:0;background-color:#f5f5f7;font-family:-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
  <div style="max-width:600px;margin:40px auto;background:#ffffff;border-radius:18px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.04);">
    <div style="padding:40px;text-align:center;background:#fbfbfd;border-bottom:1px solid #f5f5f7;">
      <h1 style="margin:0;color:#1d1d1f;font-size:28px;font-weight:600;letter-spacing:-0.5px;">Timo Store</h1>
      <h2 style="margin:12px 0 0;color:#1d1d1f;font-size:22px;font-weight:600;">📦 Order Update</h2>
    </div>
    <div style="padding:40px;text-align:center;">
      <p style="color:#1d1d1f;font-size:18px;line-height:1.5;">Hi <strong>${userName}</strong>,</p>
      <div style="margin:32px 0;padding:24px;background:#f5f5f7;border-radius:12px;">
        <p style="margin:0;color:#1d1d1f;font-size:20px;font-weight:500;">${statusMessage}</p>
      </div>
      <p style="color:#86868b;font-size:15px;">Order #${String(order._id).slice(-8).toUpperCase()}</p>
    </div>
    <div style="padding:24px 40px;background:#fbfbfd;border-top:1px solid #f5f5f7;text-align:center;">
      <p style="margin:0;color:#86868b;font-size:12px;">© ${getYear()} Timo Store. All rights reserved.</p>
    </div>
  </div>
</body>
</html>`;
};

module.exports = {
  orderConfirmationTemplate,
  orderStatusUpdateTemplate
};
