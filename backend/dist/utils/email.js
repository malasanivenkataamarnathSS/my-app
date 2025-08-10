"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendOTPEmail = exports.generateOTP = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
const transporter = nodemailer_1.default.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.EMAIL_PORT || '587'),
    secure: false,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});
const generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};
exports.generateOTP = generateOTP;
const sendOTPEmail = async (email, otp, name = 'User') => {
    const mailOptions = {
        from: process.env.EMAIL_FROM || 'noreply@myapp.com',
        to: email,
        subject: 'Your Login OTP - MyApp',
        html: `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #22c55e; color: white; padding: 20px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background-color: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .otp-code { font-size: 24px; font-weight: bold; color: #22c55e; text-align: center; margin: 20px 0; padding: 15px; background: white; border-radius: 8px; letter-spacing: 3px; }
            .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #666; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🛒 MyApp</h1>
              <p>Your trusted organic food delivery service</p>
            </div>
            <div class="content">
              <h2>Hello ${name}!</h2>
              <p>Welcome back! To complete your login, please use the OTP code below:</p>
              
              <div class="otp-code">${otp}</div>
              
              <p>This code will expire in 10 minutes for security reasons.</p>
              
              <p><strong>Important:</strong> Never share this code with anyone. Our team will never ask for your OTP.</p>
              
              <p>If you didn't request this code, please ignore this email or contact our support team.</p>
              
              <p>Happy shopping!<br>The MyApp Team</p>
            </div>
            <div class="footer">
              <p>© 2024 MyApp. All rights reserved.</p>
              <p>This is an automated message, please do not reply to this email.</p>
            </div>
          </div>
        </body>
      </html>
    `,
    };
    try {
        await transporter.sendMail(mailOptions);
        return true;
    }
    catch (error) {
        console.error('Email sending error:', error);
        return false;
    }
};
exports.sendOTPEmail = sendOTPEmail;
