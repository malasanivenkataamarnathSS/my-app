const nodemailer = require('nodemailer');

class EmailService {
    constructor() {
        this.transporter = nodemailer.createTransport({
            host: process.env.EMAIL_HOST,
            port: process.env.EMAIL_PORT,
            secure: process.env.EMAIL_SECURE === 'true',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });
    }

    async sendOTP(email, name, otp) {
        try {
            const htmlTemplate = `
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="utf-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>Your OTP for Organic Products</title>
                    <style>
                        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                        .header { background: linear-gradient(135deg, #10B981, #059669); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
                        .otp-box { background: white; border: 2px solid #10B981; border-radius: 8px; padding: 20px; text-align: center; margin: 20px 0; }
                        .otp-code { font-size: 36px; font-weight: bold; color: #10B981; letter-spacing: 8px; margin: 10px 0; }
                        .footer { text-align: center; margin-top: 20px; color: #666; font-size: 14px; }
                        .button { display: inline-block; background: #10B981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 10px 0; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <h1>🌱 Organic Products</h1>
                            <p>Fresh, Organic, Delivered</p>
                        </div>
                        <div class="content">
                            <h2>Hello ${name}!</h2>
                            <p>Thank you for choosing Organic Products. To complete your login, please use the OTP code below:</p>
                            
                            <div class="otp-box">
                                <p>Your One-Time Password (OTP)</p>
                                <div class="otp-code">${otp}</div>
                                <p style="color: #666; font-size: 14px;">This OTP will expire in ${process.env.OTP_EXPIRE_MINUTES || 10} minutes</p>
                            </div>
                            
                            <p>If you didn't request this OTP, please ignore this email. Your account security is important to us.</p>
                            
                            <div style="border-left: 4px solid #10B981; padding-left: 15px; margin: 20px 0;">
                                <h3>Why Choose Our Organic Products?</h3>
                                <ul>
                                    <li>🥛 Fresh milk delivered daily</li>
                                    <li>🥩 Premium quality meat and eggs</li>
                                    <li>🌿 100% organic oils and powders</li>
                                    <li>📍 Easy address management with maps</li>
                                    <li>🚚 Fast and reliable delivery</li>
                                </ul>
                            </div>
                        </div>
                        <div class="footer">
                            <p>© 2024 Organic Products. All rights reserved.</p>
                            <p>Bringing fresh, organic products to your doorstep.</p>
                        </div>
                    </div>
                </body>
                </html>
            `;

            const mailOptions = {
                from: {
                    name: 'Organic Products',
                    address: process.env.EMAIL_USER
                },
                to: email,
                subject: `Your OTP: ${otp} - Organic Products Login`,
                text: `Hello ${name},\n\nYour OTP for login is: ${otp}\n\nThis OTP will expire in ${process.env.OTP_EXPIRE_MINUTES || 10} minutes.\n\nIf you didn't request this OTP, please ignore this email.\n\nBest regards,\nOrganic Products Team`,
                html: htmlTemplate
            };

            const info = await this.transporter.sendMail(mailOptions);
            
            console.log('OTP email sent:', {
                messageId: info.messageId,
                email: email,
                timestamp: new Date().toISOString()
            });

            return {
                success: true,
                messageId: info.messageId
            };
        } catch (error) {
            console.error('Error sending OTP email:', error);
            throw new Error('Failed to send OTP email');
        }
    }

    async sendOrderConfirmation(email, name, orderDetails) {
        try {
            const itemsHtml = orderDetails.items.map(item => `
                <tr>
                    <td style="padding: 10px; border-bottom: 1px solid #eee;">${item.name}</td>
                    <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
                    <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: center;">${item.size}</td>
                    <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">₹${item.price}</td>
                </tr>
            `).join('');

            const htmlTemplate = `
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="utf-8">
                    <title>Order Confirmation - ${orderDetails.orderNumber}</title>
                    <style>
                        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                        .header { background: linear-gradient(135deg, #10B981, #059669); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
                        .order-summary { background: white; border-radius: 8px; padding: 20px; margin: 20px 0; }
                        table { width: 100%; border-collapse: collapse; margin: 15px 0; }
                        th { background: #f8f9fa; padding: 12px; text-align: left; border-bottom: 2px solid #10B981; }
                        .total-row { background: #f8f9fa; font-weight: bold; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <h1>🌱 Order Confirmed!</h1>
                            <p>Order #${orderDetails.orderNumber}</p>
                        </div>
                        <div class="content">
                            <h2>Hello ${name}!</h2>
                            <p>Thank you for your order! We're preparing your fresh organic products.</p>
                            
                            <div class="order-summary">
                                <h3>Order Details</h3>
                                <table>
                                    <thead>
                                        <tr>
                                            <th>Product</th>
                                            <th>Qty</th>
                                            <th>Size</th>
                                            <th>Price</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        ${itemsHtml}
                                        <tr class="total-row">
                                            <td colspan="3" style="padding: 15px;">Total</td>
                                            <td style="padding: 15px; text-align: right;">₹${orderDetails.total}</td>
                                        </tr>
                                    </tbody>
                                </table>
                                
                                <p><strong>Delivery Address:</strong><br>
                                ${orderDetails.deliveryAddress.street}<br>
                                ${orderDetails.deliveryAddress.city}, ${orderDetails.deliveryAddress.state} ${orderDetails.deliveryAddress.zipCode}</p>
                                
                                <p><strong>Estimated Delivery:</strong> ${orderDetails.deliveryDate} (${orderDetails.deliveryTimeSlot})</p>
                            </div>
                        </div>
                    </div>
                </body>
                </html>
            `;

            const mailOptions = {
                from: {
                    name: 'Organic Products',
                    address: process.env.EMAIL_USER
                },
                to: email,
                subject: `Order Confirmed - ${orderDetails.orderNumber}`,
                html: htmlTemplate
            };

            const info = await this.transporter.sendMail(mailOptions);
            return { success: true, messageId: info.messageId };
        } catch (error) {
            console.error('Error sending order confirmation:', error);
            throw new Error('Failed to send order confirmation email');
        }
    }

    async testConnection() {
        try {
            await this.transporter.verify();
            console.log('Email service is ready');
            return true;
        } catch (error) {
            console.error('Email service connection failed:', error);
            return false;
        }
    }
}

const emailService = new EmailService();

module.exports = emailService;