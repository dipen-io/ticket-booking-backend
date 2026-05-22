const cors = require("cors");
const { config } = require("../config");

const corsMiddleware = cors({
  origin: config.ALLOWED_ORIGINS.split(","),
  credentials: true,
  methods: ["GET", "PUT", "POST", "DELETE", "OPTIONS"],
  allowedHeaders: ["Origin", "X-Requested-With", "Accept", "Authorization"],
});

module.exports = { corsMiddleware };
