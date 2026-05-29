const express = require("express");
const { sendOTP, verifyOtpAndSaveUser } = require("../controllers/auth.controller");
const router = express.Router();

router.post("/send-otp", sendOTP);
router.post("/verify-otp", verifyOtpAndSaveUser);

module.exports = router;
