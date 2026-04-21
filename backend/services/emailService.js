import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

export const sendEmail = async ({ to, subject, html, text }) => {
  try {
    await transporter.sendMail({
      from: '"FlexFit" <noreply@flexfit.com>',
      to,
      subject,
      text,
      html
    });
    console.log(`Email sent to ${to}`);
  } catch (error) {
    console.error('Email sending failed:', error);
  }
};

export const sendWelcomeEmail = async (user) => {
  await sendEmail({
    to: user.email,
    subject: 'Welcome to FlexFit!',
    html: `
      <h1>Welcome to FlexFit, ${user.first_name}!</h1>
      <p>We're excited to have you on board. Start your fitness journey today!</p>
      <a href="${process.env.FRONTEND_URL}/dashboard">Go to Dashboard</a>
    `
  });
};

export const sendVerificationApprovedEmail = async (trainer) => {
  await sendEmail({
    to: trainer.User.email,
    subject: 'Your FlexFit Verification is Approved!',
    html: `
      <h1>Congratulations, ${trainer.User.first_name}!</h1>
      <p>Your trainer verification has been approved. You can now start accepting clients.</p>
      <a href="${process.env.FRONTEND_URL}/trainer/dashboard">View Dashboard</a>
    `
  });
};

export const sendNewClientNotification = async (trainer, client) => {
  await sendEmail({
    to: trainer.User.email,
    subject: 'New Coaching Request',
    html: `
      <h1>New Coaching Request</h1>
      <p>${client.User.first_name} ${client.User.last_name} has requested coaching with you.</p>
      <a href="${process.env.FRONTEND_URL}/trainer/clients">Review Request</a>
    `
  });
};