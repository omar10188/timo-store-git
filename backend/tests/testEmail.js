require("dotenv").config();
const sendEmail = require("../utils/sendEmail");

async function testGmailDelivery() {
  console.log("==================================================");
  console.log("🔍 GMAIL NODEMAILER DELIVERY DIAGNOSTIC TEST");
  console.log("==================================================\n");

  try {
    const recipient = process.env.SMTP_EMAIL || "omar0122462356i@gmail.com";
    console.log(`🎯 Sending test email to: ${recipient}`);

    const result = await sendEmail({
      email: recipient,
      subject: "🧪 Timo Store - Live Gmail Diagnostic Test",
      message: "This is a test email sent to verify Nodemailer SMTP delivery.",
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #d4af37; border-radius: 8px;">
          <h2 style="color: #d4af37;">Timo Store Email Verification</h2>
          <p>Gmail SMTP sending is working 100% via Nodemailer!</p>
          <p>Time sent: ${new Date().toISOString()}</p>
        </div>
      `,
    });

    console.log("\n==================================================");
    console.log("✅ RESULT: SMTP CONNECTION & EMAIL SENT SUCCESSFULLY!");
    console.log("Message ID:", result.messageId);
    console.log("==================================================");
  } catch (error) {
    console.log("\n==================================================");
    console.log("❌ RESULT: EMAIL SENDING FAILED");
    console.error("Error Detail:", error.message);
    console.log("==================================================");
    process.exitCode = 1;
  }
}

testGmailDelivery();
