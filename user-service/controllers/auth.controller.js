const asyncHandlers = require("../utils/asyncHandlers");
const { BadRequestError } = require("../utils/error");
const { config } = require("../config");
const authService = require("../services/auth.service");
const { getDeviceFignerPrint } = require("../utils/getDeviceInfo");

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

exports.verifyOtpAndSaveUser = asyncHandlers(async (req, res) => {
    const { otp } = req.body;
    const otpSessionId = req.cookies.otp_session;

    if (!otp || !otpSessionId) {
        throw new BadRequestError("OTP or OTPSession is missing");
    }

    const user = await authService.verifyOTP(otp, otpSessionId);
    res.clearCookie("otp_session")
    return res.status(201).json({
        success: true,
        message: "user account created Successfully",
        data: user
    })
});

exports.login = asyncHandlers(async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        throw new BadRequestError("Eamil and Password are required")
    }

    const deviceId = getDeviceFignerPrint(req);

    const { accessToken, refreshToken, loggedInUser } = await authService.login(email, password, deviceId);

    res.cookie('accessToken', accessToken, {
        httonly: true,
        secure: true,
        sameSite: "strict" ,
        maxAge: config.JWT_ACCESS_SECRET_EXPIRY * 1000
    })

    // I don't think it is great to send this in client
    res.cookie('refreshToken', refreshToken, {
        httonly: true,
        secure: true,
        sameSite: "strict" ,
        maxAge: config.JWT_REFRESH_SECRET_EXPIRY * 1000
    }).status(200).json({
        success: true,
        message: "Logged in successfully",
        loggedInUser
    })

})

