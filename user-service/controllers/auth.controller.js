const asyncHandlers = require("../utils/asyncHandlers");
const { AppError, BadRequestError } = require("../utils/error");
const { config } = require("../config");
const authService = require("../services/auth.service");

exports.sendOTP = asyncHandlers(async (req, res) => {
    const { firstName, lastName, email, password, confirmPassword } = req.body;
    if (!firstName || !lastName || !email || !password || !confirmPassword) {
        throw new BadRequestError("All fields are mandatory");
    }
    if (password !== confirmPassword) {
        throw new BadRequestError("Password mismatch");
    }

    const { otpSessionId } = await authService.sendOTP(
        firstName,
        lastName,
        email,
        password,
        confirmPassword,
    );
    res.cookie("otp_session", otpSessionId, {
        httonly: true,
        secure: true,
        samesite: "strict",
        maxAge: config.OTP_TTL * 1000,
    })
        .status(200)
        .json({
            success: true,
            message: "Otp Send Successfully",
        });
});
