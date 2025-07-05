import nodemailer from 'nodemailer';
import fs from 'fs/promises';
import path from 'path';
import handlebars from 'handlebars';
import dotenv from 'dotenv';
import { pool } from '../config/database.js';

dotenv.config();

const transporter = nodemailer.createTransport({
  host: 'smtp-relay.brevo.com',
  port: 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

export async function sendEmail(to: string, subject: string, html: string): Promise<void> {
  const mail: EmailOptions = {
    to,
    subject,
    html,
  };
  try {
    await transporter.sendMail({
      from: 'MuseFuze Studios <noreply@musefuzestudios.com>',
      to: mail.to,
      subject: mail.subject,
      html: mail.html,
      replyTo: 'support@musefuzestudios.com',
      headers: {
        'List-Unsubscribe': '<mailto:support@musefuzestudios.com?subject=unsubscribe>'
      }
    });
    await logEmailSend(to, subject, true);
  } catch (error) {
    console.error('Error sending email:', error);
    await logEmailSend(to, subject, false);
    throw error;
  }
}

async function logEmailSend(email: string, type: string, success: boolean) {
  try {
    if (!pool) return;
    await pool.execute(
      `INSERT INTO sent_emails (email, type, success) VALUES (?, ?, ?)`,
      [email, type, success]
    );
  } catch (err) {
    console.error('Failed to log sent email:', err);
  }
}

export async function sendWelcomeEmail(user: { email: string; firstName: string }): Promise<boolean> {
  try {
    const templatePath = path.join(process.cwd(), 'emails', 'welcome.html');
    const templateSource = await fs.readFile(templatePath, 'utf-8');
    const template = handlebars.compile(templateSource);
    const html = template({ firstName: user.firstName });
    await sendEmail(user.email, 'Welcome to MuseFuze Studios', html);
    return true;
  } catch (error) {
    console.error('Error sending welcome email:', error);
    return false;
  }
}
