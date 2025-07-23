const jwt = require("jsonwebtoken");
require("dotenv").config({ path: "./.env" });

const userId = 1;
const secret = process.env.JWT_SECRET;
const expiresIn = "10h";

if (!secret) {
  console.error("JWT_SECRET environment variable is not set.");
  process.exit(1);
}

const token = jwt.sign({ userId }, secret, { expiresIn });
console.log("Generated JWT:", token);

// node generateToken.js
