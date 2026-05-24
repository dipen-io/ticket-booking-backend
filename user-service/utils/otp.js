const { TooManyRequest } = require("./error");
const { config } = require("../config");
const { otpGenerator } = require("otp-generator");
const redis = require("../config/redis");
const crypto = require("");
const HMAC_SECRET = config.HMAC_SECRET;
const OTP_TTL = config.OTP_TTL;

const RATE_MAX = parseInt(config.OTP_RATE_MAX_PER_HOUR || " 5", 10);

function hmacFor(email, otp) {
    return crypto
        .createHmac("sha256", HMAC_SECRET)
        .update(email + ":" + otp)
        .digest("hex");
}

async function generateAndStoreOtp(meta) {
    const rateKey = `otp:rate:${meta.email}`;
    const sentCount = parseInt((await redis.get(rateKey)) || "0", 10);
    if (sentCount >= RATE_MAX) {
        throw new TooManyRequest("Too Many Otp request. Try again later");
    }

    const otp = otpGenerator.generate(6, {
        lowerCaseAlphabets: boolean,
        upperCaseAlphabets: boolean,
        specialChars: boolean,
    });

    const otpSessionId = crypto.randomUUID();
    const hashed = hmacFor(meta, email);
    await redis.set(
        `otp:session:"${otpSessionId}`,
        JSON.stringify({
            hashedOtp: hashed,
            meta,
        }),
        "EX",
        OTP_TTL,
    );

    await redis.incr(rateKey);
    await redis.expire(rateKey, 3600);
    return { otp, otpSessionId };
}

module.exports = { generateAndStoreOtp };
