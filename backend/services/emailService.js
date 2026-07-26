const { Resend } = require('resend');
const logger = require('../utils/logger');
const {
  welcomeEmailTemplate,
  orderConfirmationTemplate,
  abandonedCartTemplate
} = require('../utils/emailTemplates');

const resend = new Resend(process.env.RESEND_API_KEY || 're_dummy_key');
const FROM_EMAIL = 'Timo Store <onboarding@resend.dev>'; // Resend testing email

/**
 * Send Welcome Email
 */
const sendWelcomeEmail = async (user) => {
  try {
    if (!process.env.RESEND_API_KEY) {
      logger.warn('RESEND_API_KEY not found. Skipping Welcome Email.');
      return;
    }
    
    await resend.emails.send({
      from: FROM_EMAIL,
      to: user.email,
      subject: 'Welcome to Timo Store - Exclusive 15% Off Inside',
      html: welcomeEmailTemplate(user.name),
    });
    logger.info(`Welcome email sent to ${user.email}`);
  } catch (error) {
    logger.error(`Failed to send welcome email to ${user.email}: ${error.message}`);
  }
};

/**
 * Send Order Confirmation Email
 */
const sendOrderConfirmationEmail = async (user, order) => {
  try {
    if (!process.env.RESEND_API_KEY) {
      logger.warn('RESEND_API_KEY not found. Skipping Order Confirmation Email.');
      return;
    }

    await resend.emails.send({
      from: FROM_EMAIL,
      to: user.email,
      subject: `Order Confirmation #${order._id}`,
      html: orderConfirmationTemplate(user.name, order),
    });
    logger.info(`Order confirmation email sent to ${user.email} for order ${order._id}`);
  } catch (error) {
    logger.error(`Failed to send order confirmation to ${user.email}: ${error.message}`);
  }
};

/**
 * Send Abandoned Cart Email
 */
const sendAbandonedCartEmail = async (user, cart) => {
  try {
    if (!process.env.RESEND_API_KEY) {
      logger.warn('RESEND_API_KEY not found. Skipping Abandoned Cart Email.');
      return;
    }

    await resend.emails.send({
      from: FROM_EMAIL,
      to: user.email,
      subject: 'You left something behind in your cart...',
      html: abandonedCartTemplate(user.name, cart),
    });
    logger.info(`Abandoned cart email sent to ${user.email}`);
  } catch (error) {
    logger.error(`Failed to send abandoned cart email to ${user.email}: ${error.message}`);
  }
};

module.exports = {
  sendWelcomeEmail,
  sendOrderConfirmationEmail,
  sendAbandonedCartEmail,
};
