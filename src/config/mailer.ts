import dotenv from 'dotenv';
import nodemailer from 'nodemailer';
dotenv.config();


// For development: use ethereal.email (auto-generated test account)
// In production, replace with real SMTP credentials
const transporter = nodemailer.createTransport({
  host: 'mail.smtp2go.com',
  port: 465,
  secure: true,
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS
  },
});

transporter.verify(function (error, success) {
  if (error) {
    console.error('Mailer connection error:', error);
  } else {
    console.log('Mailer is ready to send messages');
  }
});

export default transporter;
