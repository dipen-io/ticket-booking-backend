const { TooManyRequest } = require("./error");
const { config } = require("../config");
const { generate } = require("otp-generator");
const RedisClient = require("../config/redis");
const crypto = require("crypto");
const HMAC_SECRET = config.HMAC_SECRET;
const OTP_TTL = config.OTP_TTL;

const RATE_MAX = parseInt(config.OTP_RATE_MAX_PER_HOUR || " 5", 10);
const redis = RedisClient.getInstance();
const ATTEMPT_MAX = parseInt(config.OTP_MAX_VERIFY_ATTEMPTS|| '5', 10)

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

    const otp = generate(6, {
        digits: true,
        lowerCaseAlphabets: false,
        upperCaseAlphabets: false,
        specialChars: false,
    });

    const otpSessionId = crypto.randomUUID();
    const hashed = hmacFor( meta.email, otp);
    await redis.set(
        `otp:session:${otpSessionId}`,
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

async function verifyOtp(otp, otpSessionId) {
    const rawData = await redis.get(`otp:session:${otpSessionId}`);
    if (!rawData) return null;

    const { hashedOtp: storedOtp, meta } = JSON.parse(rawData); 
    const attemptKey = `otp:attempts:${meta.email}`;

    // 1. Increment first to block concurrent brute-force attacks
    const attemptCount = await redis.incr(attemptKey);

    // 2. Set TTL only on the first attempt so the window doesn't keep extending
    if (attemptCount === 1) {
        await redis.expire(attemptKey, config.OTP_TTL);
    }

    // 3. Block if they have exceeded the max allowance
    // (Note: since we incremented first, use > instead of >=)
    if (attemptCount > ATTEMPT_MAX) {
        throw new TooManyRequest("Too many attempts to verify OTP");
    }

    // 4. Hash and securely compare
    const hashedOtp = hmacFor(meta.email, otp);
    const isValid = crypto.timingSafeEqual(
        Buffer.from(hashedOtp, 'hex'),
        Buffer.from(storedOtp, 'hex')
    );

    if (isValid) {
        // Fix: Use an array to delete multiple keys properly in Redis
        await redis.del([`otp:session:${otpSessionId}`, attemptKey, `otp:rate:${meta.email}`]);
        
        // Return something truthy or user meta indicating success
        return meta; 
    } else {
        // No need to increment here anymore! It's already tracked safely at the top.
        return null;
    }
}

module.exports = { generateAndStoreOtp, verifyOtp };
