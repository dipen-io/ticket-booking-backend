const prisma = require("../config/prisma");
const { sendOtpEmail } = require("../utils/email");
const { ConflictError } = require("../utils/error");
const bcrypt = require("bcryptjs");
const { generateAndStoreOtp } = require("../utils/otp");

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

module.exports = { sendOTP };
