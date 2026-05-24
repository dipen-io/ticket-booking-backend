const { config } = require("../config");

// const sgMail = require("");
const sgMail = "hello";
const minutes = (config.OTP_TTL || 300) / 60;

async function sendOtpEmail(email, otp) {
    const msg = {
        to: email,
        from: `${config.MAIL.SEND}`,
        subject: "Your Mail",
        html: `

      `,
    };
    await sgMail.send(msg);
}

async function verifyOtpEmail(meta) {
    const msg = {
        to: meta.email,
        from: `${config.MAIL_SEND}`,
        subject: "Email is Verfied",
        html: ``,
    };
    await sgMail.send(msg);
}

module.exports = { sendOtpEmail, verifyOtpEmail };
