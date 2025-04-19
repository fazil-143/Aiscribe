import nodemailer from 'nodemailer';
import { randomBytes } from 'crypto';
import { storage } from './storage';
import dotenv from 'dotenv';
dotenv.config();

// Create a transporter using environment variables
const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE || 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

// Generate a secure random token
function generateToken(): string {
  return randomBytes(32).toString('hex');
}

// Send password reset email
export async function sendPasswordResetEmail(email: string, username: string): Promise<{ success: boolean; message: string }> {
  try {
    // Generate reset token
    const resetToken = generateToken();
    const resetExpiry = new Date(Date.now() + 3600000); // 1 hour from now

    // Store the reset token in the database
    await storage.storeResetToken(username, resetToken, resetExpiry);

    // Create reset URL
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;

    // Email content
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Password Reset Request',
      html: `
        <h1>Password Reset Request</h1>
        <p>Hello ${username},</p>
        <p>You have requested to reset your password. Click the link below to proceed:</p>
        <a href="${resetUrl}">Reset Password</a>
        <p>This link will expire in 1 hour.</p>
        <p>If you did not request this password reset, please ignore this email.</p>
      `,
    };

    // Send email
    await transporter.sendMail(mailOptions);
    return { success: true, message: 'Password reset email sent successfully' };
  } catch (error) {
    console.error('Error sending password reset email:', error);
    return { success: false, message: 'Failed to send password reset email' };
  }
}

// Verify reset token
export async function verifyResetToken(token: string): Promise<{ valid: boolean; username?: string }> {
  try {
    const result = await storage.verifyResetToken(token);
    return result;
  } catch (error) {
    console.error('Error verifying reset token:', error);
    return { valid: false };
  }
}

// Reset password
export async function resetPassword(token: string, newPassword: string): Promise<{ success: boolean; message: string }> {
  try {
    const result = await storage.resetPassword(token, newPassword);
    return result;
  } catch (error) {
    console.error('Error resetting password:', error);
    return { success: false, message: 'Failed to reset password' };
  }
} 