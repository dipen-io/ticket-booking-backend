const nodemailer = require("nodemailer");
const { config } = require("../config");

// Calculate OTP expiration time dynamically in minutes
const minutes = (config.OTP_TTL || 300) / 60;

// 1. Create the reusable Nodemailer transporter instance
const transporter = nodemailer.createTransport({
    host: config.MAIL_HOST || "smtp.gmail.com",
    port: parseInt(config.MAIL_PORT || "587", 10),
    secure: config.MAIL_PORT === "465", // true for 465, false for other ports
    auth: {
        user: config.MAIL_USER, // Your SMTP email address from secrets
        pass: config.MAIL_PASSWORD, // Your SMTP app password from secrets
    },
});

/**
 * Sends an OTP email to the user
 * @param {string} email
 * @param {string|number} otp
 */
async function sendOtpEmail(email, otp) {
    const msg = {
        to: email,
        from: `"${config.SERVICE_NAME || "App Support"}" <${config.MAIL_SEND || config.MAIL_USER}>`,
        subject: "Your One-Time Password (OTP) Verification",
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
                <h2 style="color: #333333; text-align: center;">Verify Your Email</h2>
                <p style="font-size: 16px; color: #555555;">Hello,</p>
                <p style="font-size: 16px; color: #555555;">Use the following One-Time Password (OTP) to complete your verification process. This code is valid for <strong>${minutes} minutes</strong>.</p>
                <div style="text-align: center; margin: 30px 0;">
                    <span style="font-size: 32px; font-weight: bold; letter-spacing: 4px; color: #0076ff; padding: 10px 20px; background-color: #f0f7ff; border-radius: 4px; border: 1px dashed #0076ff;">
                        ${otp}
                    </span>
                </div>
                <p style="font-size: 12px; color: #999999; text-align: center; margin-top: 4px;">If you did not request this code, please disregard this email safely.</p>
            </div>
        `,
    };

    // Send the email using the transporter
    await transporter.sendMail(msg);
}

/**
 * Sends a confirmation email once the email is successfully verified
 * @param {object} meta - Object containing user metadata
 * @param {string} meta.email
 */
async function verifyOtpEmail(meta) {
    const msg = {
        to: meta.email,
        from: `"${config.SERVICE_NAME || "App Support"}" <${config.MAIL_SEND || config.MAIL_USER}>`,
        subject: "Email Address Verified Successfully",
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
                <h2 style="color: #27ae60; text-align: center;">🎉 Verification Successful!</h2>
                <p style="font-size: 16px; color: #555555;">Hello,</p>
                <p style="font-size: 16px; color: #555555;">Your email address (<strong>${meta.email}</strong>) has been successfully verified. You now have full access to your account profile features.</p>
                <p style="font-size: 16px; color: #555555;">Welcome onboard!</p>
                <hr style="border: 0; border-top: 1px solid #e0e0e0; margin: 20px 0;" />
                <p style="font-size: 12px; color: #999999; text-align: center;">This is an automated confirmation message. Please do not reply directly to this mail layout.</p>
            </div>
        `,
    };

    // Send the email using the transporter
    await transporter.sendMail(msg);
}

module.exports = { sendOtpEmail, verifyOtpEmail };
