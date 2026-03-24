import nodemailer, { Transporter } from 'nodemailer';
import logger from './logger.util';

/**
 * Email configuration
 */
const EMAIL_CONFIG = {
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
};

const FROM_EMAIL = process.env.FROM_EMAIL || 'noreply@mining-ops.com';
const FROM_NAME = process.env.FROM_NAME || 'Mining Ops Platform';

/**
 * Email transporter
 */
let transporter: Transporter | null = null;

/**
 * Initialize email transporter
 */
function getTransporter(): Transporter {
  if (!transporter) {
    transporter = nodemailer.createTransport(EMAIL_CONFIG);
  }
  return transporter as Transporter;
}

/**
 * Send email
 */
export async function sendEmail(
  to: string | string[],
  subject: string,
  html: string,
  text?: string
): Promise<boolean> {
  try {
    const mailOptions = {
      from: `"${FROM_NAME}" <${FROM_EMAIL}>`,
      to: Array.isArray(to) ? to.join(', ') : to,
      subject,
      html,
      text: text || html.replace(/<[^>]*>/g, ''), // Strip HTML tags for text version
    };

    const info = await getTransporter().sendMail(mailOptions);
    logger.info(`Email sent: ${info.messageId}`);
    return true;
  } catch (error) {
    logger.error('Failed to send email:', error);
    return false;
  }
}

/**
 * Send welcome email
 */
export async function sendWelcomeEmail(
  email: string,
  firstName: string,
  verificationToken: string
): Promise<boolean> {
  const verificationUrl = `${process.env.FRONTEND_URL}/verify-email?token=${verificationToken}`;

  const html = `
    <h2>Welcome to Mining Ops Platform, ${firstName}!</h2>
    <p>Thank you for registering. Please verify your email address by clicking the link below:</p>
    <p><a href="${verificationUrl}" style="background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Verify Email</a></p>
    <p>This link will expire in 24 hours.</p>
    <p>If you didn't create this account, please ignore this email.</p>
  `;

  return sendEmail(email, 'Welcome to Mining Ops Platform', html);
}

/**
 * Send password reset email
 */
export async function sendPasswordResetEmail(
  email: string,
  firstName: string,
  resetToken: string
): Promise<boolean> {
  const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;

  const html = `
    <h2>Password Reset Request</h2>
    <p>Hello ${firstName},</p>
    <p>You requested to reset your password. Click the link below to set a new password:</p>
    <p><a href="${resetUrl}" style="background-color: #2196F3; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Reset Password</a></p>
    <p>This link will expire in 1 hour.</p>
    <p>If you didn't request this, please ignore this email and your password will remain unchanged.</p>
  `;

  return sendEmail(email, 'Password Reset Request', html);
}

/**
 * Send email verification reminder
 */
export async function sendVerificationReminderEmail(
  email: string,
  firstName: string,
  verificationToken: string
): Promise<boolean> {
  const verificationUrl = `${process.env.FRONTEND_URL}/verify-email?token=${verificationToken}`;

  const html = `
    <h2>Email Verification Reminder</h2>
    <p>Hello ${firstName},</p>
    <p>This is a reminder to verify your email address. Click the link below:</p>
    <p><a href="${verificationUrl}" style="background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Verify Email</a></p>
    <p>This link will expire in 24 hours.</p>
  `;

  return sendEmail(email, 'Email Verification Reminder', html);
}

/**
 * Send password changed confirmation
 */
export async function sendPasswordChangedEmail(
  email: string,
  firstName: string
): Promise<boolean> {
  const html = `
    <h2>Password Changed Successfully</h2>
    <p>Hello ${firstName},</p>
    <p>This is a confirmation that your password has been changed successfully.</p>
    <p>If you didn't make this change, please contact support immediately.</p>
  `;

  return sendEmail(email, 'Password Changed Successfully', html);
}

/**
 * Send account activation email
 */
export async function sendAccountActivationEmail(
  email: string,
  firstName: string
): Promise<boolean> {
  const html = `
    <h2>Account Activated</h2>
    <p>Hello ${firstName},</p>
    <p>Your account has been activated successfully. You can now log in to the platform.</p>
    <p><a href="${process.env.FRONTEND_URL}/login">Login Now</a></p>
  `;

  return sendEmail(email, 'Account Activated', html);
}

/**
 * Send user invitation email
 */
export async function sendUserInvitationEmail(
  email: string,
  invitedByName: string,
  organizationName: string,
  invitationToken: string
): Promise<boolean> {
  const invitationUrl = `${process.env.FRONTEND_URL}/accept-invitation?token=${invitationToken}`;

  const html = `
    <h2>You've Been Invited!</h2>
    <p>${invitedByName} has invited you to join ${organizationName} on the Mining Ops Platform.</p>
    <p>Click the link below to accept the invitation and create your account:</p>
    <p><a href="${invitationUrl}" style="background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Accept Invitation</a></p>
    <p>This invitation will expire in 7 days.</p>
  `;

  return sendEmail(email, `Invitation to join ${organizationName}`, html);
}

/**
 * Verify email configuration
 */
export async function verifyEmailConfig(): Promise<boolean> {
  try {
    await getTransporter().verify();
    logger.info('Email configuration verified successfully');
    return true;
  } catch (error) {
    logger.error('Email configuration verification failed:', error);
    return false;
  }
}