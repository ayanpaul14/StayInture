const nodemailer = require("nodemailer");

// Uses Gmail SMTP by default (free, works with an App Password - see
// .env.example for setup notes). Swap the transporter config below if you
// move to a different provider (Resend, Brevo, SES, etc.) later.
let transporter = null;

function getTransporter() {
  if (transporter) return transporter;

  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || "smtp.gmail.com",
    port: Number(process.env.SMTP_PORT) || 465,
    secure: true,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  return transporter;
}

async function sendOtpEmail(toEmail, code) {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    throw new Error("EMAIL_USER/EMAIL_PASS not configured in .env");
  }

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 420px; margin: auto;">
      <h2 style="color:#2F5233;">StayInture</h2>
      <p>Your verification code is:</p>
      <p style="font-size: 28px; font-weight: bold; letter-spacing: 4px; color:#2F5233;">${code}</p>
      <p style="color:#666; font-size: 13px;">This code expires in 5 minutes. If you didn't request this, you can ignore this email.</p>
    </div>
  `;

  await getTransporter().sendMail({
    from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
    to: toEmail,
    subject: `${code} is your StayInture verification code`,
    html,
  });
}

module.exports = { sendOtpEmail };