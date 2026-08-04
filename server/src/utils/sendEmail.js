const nodemailer = require("nodemailer");

// Uses Resend API if RESEND_API_KEY is set (recommended for production / Render free tier,
// since Render blocks outbound SMTP). Falls back to nodemailer + Gmail SMTP for local dev.
let transporter = null;

function getTransporter() {
  if (transporter) return transporter;

  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || "smtp.gmail.com",
    port: Number(process.env.SMTP_PORT) || 587,
    secure: false, // STARTTLS (works where port 465/SSL is blocked)
    requireTLS: true,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
    tls: {
      rejectUnauthorized: false,
    },
  });

  return transporter;
}

async function sendOtpEmail(toEmail, code) {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 420px; margin: auto;">
      <h2 style="color:#2F5233;">StayInture</h2>
      <p>Your verification code is:</p>
      <p style="font-size: 28px; font-weight: bold; letter-spacing: 4px; color:#2F5233;">${code}</p>
      <p style="color:#666; font-size: 13px;">This code expires in 5 minutes. If you didn't request this, you can ignore this email.</p>
    </div>
  `;

  // --- Resend (preferred: works on Render free tier) ---
  if (process.env.RESEND_API_KEY) {
    const { Resend } = require("resend");
    const resend = new Resend(process.env.RESEND_API_KEY);

    const { error } = await resend.emails.send({
      from: process.env.EMAIL_FROM || "StayInture <onboarding@resend.dev>",
      to: toEmail,
      subject: `${code} is your StayInture verification code`,
      html,
    });

    if (error) throw new Error(error.message);
    return;
  }

  // --- Nodemailer / Gmail SMTP fallback (local dev) ---
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    throw new Error("No email provider configured. Set RESEND_API_KEY or EMAIL_USER/EMAIL_PASS.");
  }

  await getTransporter().sendMail({
    from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
    to: toEmail,
    subject: `${code} is your StayInture verification code`,
    html,
  });
}

module.exports = { sendOtpEmail };