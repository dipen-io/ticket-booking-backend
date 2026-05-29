const prisma = require("../config/prisma");
const { sendOtpEmail, verifyOtpEmail } = require("../utils/email");
const { ConflictError, BadRequestError } = require("../utils/error");
const bcrypt = require("bcryptjs");
const { generateAndStoreOtp, verifyOtp } = require("../utils/otp");
const { generateRefreshToken, generateAccessToken } = require("../utils/auth");
const jwt = require("jsonwebtoken");
const RedisClient = require("../config/redis")
const { config } = require("../config")


const redis = RedisClient.getInstance();

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

const login = async(email, password, deviceId) => {
    const existingUser = await prisma.user.findUnique({
        where: {email}
    })

    if (!existingUser) {
        throw new BadRequestError("Email not found");
    }

    const isPassMatched = await bcrypt.compare(password, existingUser.password)
    if (!isPassMatched) {
        throw new BadRequestError("Incorrect Password");
    }

    const accessToken = generateAccessToken(existingUser.id);
    const refreshToken = generateRefreshToken(existingUser.id);
    const { jti } = jwt.decode(refreshToken);
    await redis.set(`refresh:${existingUser.id}:${deviceId}`, jti, 'EX', config.JWT_REFRESH_SECRET_EXPIRY)
    console.log("NOT>>>>>>>");
    const {password: _password, ...safeUser} = existingUser;
    await redis.set(`user:${existingUser.id}`, JSON.stringify(safeUser), 'EX', config.REDIS_USER_TTL)
    return { accessToken, refreshToken, loggedInUser: safeUser };

}

module.exports = { sendOTP, verifyOTP, login };
