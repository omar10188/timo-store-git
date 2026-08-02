const resend = require("../config/resend");
const { orderConfirmationTemplate, orderStatusUpdateTemplate } = require("../utils/emailTemplates");

const FROM_EMAIL = process.env.EMAIL_FROM || "onboarding@resend.dev";
const fs = require("fs");
const EmailSettings = require("../models/EmailSettings");

let cachedSettings = null;
let lastCacheTime = null;
const CACHE_TTL = 60 * 1000; // 60 seconds

const clearSettingsCache = () => {
  cachedSettings = null;
  lastCacheTime = null;
};

/**
 * Helper to fetch settings safely with 60-second in-memory cache
 */
const getSettings = async () => {
  const now = Date.now();
  if (cachedSettings && lastCacheTime && now - lastCacheTime < CACHE_TTL) {
    return cachedSettings;
  }

  try {
    let settings = await EmailSettings.findOne();
    if (!settings) {
      settings = await EmailSettings.create({});
    }
    
    cachedSettings = settings;
    lastCacheTime = now;
    
    return settings;
  } catch (error) {
    console.error("⚠️ DB Error - Failed to fetch EmailSettings, defaulting to disabled:", error);
    return { enabled: false, orderConfirmation: false, statusUpdates: false };
  }
};

/**
 * Send order confirmation to customer
 */
const sendOrderConfirmationEmail = async (customerName, customerEmail, order, invoicePath = null) => {
  if (!customerEmail) return;

  const settings = await getSettings();
  if (!settings.enabled || !settings.orderConfirmation) {
    console.log("Email skipped بسبب settings (Order Confirmation)");
    return;
  }

  try {
    const payload = {
      from: `Timo Store <${FROM_EMAIL}>`,
      to: customerEmail,
      subject: `Order Confirmed #${String(order._id).slice(-8).toUpperCase()} - TIMO STORE`,
      html: orderConfirmationTemplate(customerName, order),
    };

    if (invoicePath && fs.existsSync(invoicePath)) {
      const invoiceBuffer = fs.readFileSync(invoicePath);
      payload.attachments = [
        {
          filename: `Invoice_${String(order._id).slice(-8).toUpperCase()}.pdf`,
          content: invoiceBuffer,
        },
      ];
    }

    const data = await resend.emails.send(payload);
    console.log(`✅ Confirmation email sent to ${customerEmail}`);
    return data;
  } catch (error) {
    console.error(`❌ Failed to send confirmation email to ${customerEmail}:`, error.message);
    // Silent fail to not break the order flow
  }
};

/**
 * Send order status update to customer
 */
const sendOrderStatusUpdateEmail = async (customerName, customerEmail, order, status) => {
  if (!customerEmail) return;

  const settings = await getSettings();
  if (!settings.enabled || !settings.statusUpdates) {
    console.log("Email skipped بسبب settings (Status Updates)");
    return;
  }

  try {
    const data = await resend.emails.send({
      from: `Timo Store <${FROM_EMAIL}>`,
      to: customerEmail,
      subject: `Order Status Update: ${status.toUpperCase()} - TIMO STORE`,
      html: orderStatusUpdateTemplate(customerName, order, status),
    });
    console.log(`✅ Status update email sent to ${customerEmail}`);
    return data;
  } catch (error) {
    console.error(`❌ Failed to send status update email to ${customerEmail}:`, error.message);
    // Silent fail
  }
};

module.exports = {
  sendOrderConfirmationEmail,
  sendOrderStatusUpdateEmail,
  clearSettingsCache,
};
