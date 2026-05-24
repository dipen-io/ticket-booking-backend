const asyncHandlers = require("../utils/asyncHandlers");
const { AppError, BadRequestError } = require("../utils/error");

exports.sendOTP = asyncHandlers(async (req, res) => {
    const { firstName, lastName, email, password, confirmPassword } = req.body;
    if (!firstName || !lastName || !email || !password || !confirmPassword) {
        throw new BadRequestError("All fields are mandatory");
    }
    if (password !== confirmPassword) {
        throw new BadRequestError("Password mismatch");
    }
});
