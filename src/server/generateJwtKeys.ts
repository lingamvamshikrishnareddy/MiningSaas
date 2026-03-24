import crypto from "crypto";

function generateSecret(length: number = 64): string {
  return crypto.randomBytes(length).toString("hex");
}

const jwtSecret = generateSecret();
const jwtRefreshSecret = generateSecret();

console.log("JWT_SECRET=" + jwtSecret);
console.log("JWT_REFRESH_SECRET=" + jwtRefreshSecret);
console.log("JWT_EXPIRES_IN=15m");
console.log("JWT_REFRESH_EXPIRES_IN=7d");