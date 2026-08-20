"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.encryptData = encryptData;
exports.decryptData = decryptData;
const crypto = require("crypto");
const ALGORITHM = 'aes-256-gcm';
const SECRET_KEY = process.env.ENCRYPTION_KEY || 'followloop_secret_encryption_key_32b!';
const KEY = crypto.scryptSync(SECRET_KEY, 'salt_followloop_2026', 32);
function encryptData(plainText) {
    if (!plainText)
        return '';
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(ALGORITHM, KEY, iv);
    let encrypted = cipher.update(plainText, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    const authTag = cipher.getAuthTag().toString('hex');
    return `enc:${iv.toString('hex')}:${authTag}:${encrypted}`;
}
function decryptData(encryptedText) {
    if (!encryptedText)
        return '';
    if (!encryptedText.startsWith('enc:')) {
        if (encryptedText.startsWith('enc_')) {
            try {
                return Buffer.from(encryptedText.replace('enc_', ''), 'base64').toString('utf8');
            }
            catch {
                return encryptedText;
            }
        }
        return encryptedText;
    }
    try {
        const parts = encryptedText.split(':');
        if (parts.length !== 4)
            return encryptedText;
        const iv = Buffer.from(parts[1], 'hex');
        const authTag = Buffer.from(parts[2], 'hex');
        const encrypted = parts[3];
        const decipher = crypto.createDecipheriv(ALGORITHM, KEY, iv);
        decipher.setAuthTag(authTag);
        let decrypted = decipher.update(encrypted, 'hex', 'utf8');
        decrypted += decipher.final('utf8');
        return decrypted;
    }
    catch (err) {
        return encryptedText;
    }
}
//# sourceMappingURL=crypto.util.js.map