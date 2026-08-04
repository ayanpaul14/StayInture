const nodemailer = require("nodemailer");

// Priority order:
// 1. Brevo HTTP API  (BREVO_API_KEY) – works on Render free tier, no domain needed
// 2. Resend HTTP API (RESEND_API_KEY) – works on Render free tier, needs verified domain
// 3. Nodemailer/SMTP (EMAIL_USER + EMAIL_PASS) – local dev only (Render blocks SMTP ports)

async function sendOtpEmail(toEmail, code) {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 420px; margin: auto;">
      <h2 style="color:#2F5233;">StayInture</h2>
      <p>Your verification code is:</p>
      <p style="font-size: 28px; font-weight: bold; letter-spacing: 4px; color:#2F5233;">${code}</p>
      <p style="color:#666; font-size: 13px;">This code expires in 5 minutes. If you didn't request this, you can ignore this email.</p>
    </div>
  `;

  // ── 1. Brevo (recommended for Render free tier) ──────────────────────────
  if (process.env.BREVO_API_KEY) {
    const response = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        "accept": "application/json",
        "api-key": process.env.BREVO_API_KEY,
        "content-type": "application/json",
      },
      body: JSON.stringify({
        sender: {
          name: "StayInture",
          email: process.env.EMAIL_FROM || process.env.EMAIL_USER,
        },
        to: [{ email: toEmail }],
        subject: `${code} is your StayInture verification code`,
        htmlContent: html,
      }),
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.message || `Brevo error ${response.status}`);
    }
    return;
  }

  // ── 2. Resend (needs verified sending domain) ────────────────────────────
  if (process.env.RESEND_API_KEY) {
    const { Resend } = require("resend");
    const resend = new Resend(process.env.RESEND_API_KEY);
    const { error } = await resend.emails.send({
      from: "StayInture <onboarding@resend.dev>",
      to: toEmail,
      subject: `${code} is your StayInture verification code`,
      html,
    });
    if (error) throw new Error(error.message);
    return;
  }

  // ── 3. Nodemailer / Gmail SMTP (local dev fallback) ──────────────────────
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    throw new Error("No email provider configured. Set BREVO_API_KEY, RESEND_API_KEY, or EMAIL_USER/EMAIL_PASS.");
  }

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || "smtp.gmail.com",
    port: Number(process.env.SMTP_PORT) || 587,
    secure: false,
    requireTLS: true,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
    tls: { rejectUnauthorized: false },
  });

  await transporter.sendMail({
    from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
    to: toEmail,
    subject: `${code} is your StayInture verification code`,
    html,
  });
}

module.exports = { sendOtpEmail };