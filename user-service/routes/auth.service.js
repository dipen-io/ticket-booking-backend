const express = require("express");
const { sendOTP, verifyOtpAndSaveUser, login } = require("../controllers/auth.controller");
const router = express.Router();

router.post("/send-otp", sendOTP);
router.post("/verify-otp", verifyOtpAndSaveUser);
router.post("/login", login);

module.exports = router;
