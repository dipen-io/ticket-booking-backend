const prisma = require("../config/prisma");
const { sendOtpEmail, verifyOtpEmail } = require("../utils/email");
const { ConflictError, BadRequestError } = require("../utils/error");
const bcrypt = require("bcryptjs");
const { generateAndStoreOtp, verifyOtp } = require("../utils/otp");

const sendOTP = async (
    firstName,
    lastName,
    email,
    password,
    confirmPassword,
) => {
    const existingUser = await prisma.user.findUnique({
        where: { email },
    });

    if (existingUser) {
        throw new ConflictError("User already exist!");
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const meta = { firstName, lastName, email, hashedPassword };
    const { otp, otpSessionId } = await generateAndStoreOtp(meta);
    await sendOtpEmail(email, otp);
    return { otpSessionId };
};

const verifyOTP = async (otp, otpSessionId) => {
    const meta = await verifyOtp(otp, otpSessionId);
    if (meta === null) {
        throw new BadRequestError("Invalid OTP or OTP expired")
    }

    const user = await prisma.user.create({
        data: {
            firstName: meta.firstName,
            lastName: meta.lastName,
            email: meta.email,
            password: meta.hashedPassword,
            emailVerified: true
        }
    })
    await verifyOtpEmail(meta)
    return user;
};

module.exports = { sendOTP, verifyOTP };
