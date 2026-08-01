const nodemailer = require("nodemailer");

const sendEmail = async (options) => {
  const emailUser = (process.env.SMTP_EMAIL || "").replace(/^<|>$/g, "").trim();
  const emailPass = (process.env.SMTP_PASSWORD || "").replace(/^<|>$/g, "").trim();
  const host = process.env.SMTP_HOST || "smtp.gmail.com";
  const port = parseInt(process.env.SMTP_PORT || "587", 10);

  console.log("📧 Attempting to send email to:", options.email);
  console.log("⚙️ SMTP Config:", { host, port, user: emailUser, passLength: emailPass.length });

  const transporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: {
      user: emailUser,
      pass: emailPass,
    },
    tls: {
      rejectUnauthorized: false,
    },
  });

  try {
    await transporter.verify();
    console.log("✅ SMTP Transporter Connection Verified");
  } catch (verifyErr) {
    console.error("❌ SMTP Connection Verification Failed:", verifyErr.message);
    throw new Error(`SMTP Connection Failed: ${verifyErr.message}`);
  }

  const message = {
    from: `Timo Store <${emailUser}>`,
    to: options.email,
    subject: options.subject,
    text: options.message || options.text,
    html: options.html || options.message,
  };

  console.log("📨 Sending email via Nodemailer...");
  try {
    const info = await transporter.sendMail(message);
    console.log("✅ Email sent successfully! MessageID:", info.messageId);
    return info;
  } catch (sendErr) {
    console.error("❌ Email sendMail error:", sendErr.message);
    throw sendErr;
  }
};

module.exports = sendEmail;
