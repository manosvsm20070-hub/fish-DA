import crypto from 'crypto';

export const ADMIN_PHONE_NUMBER = process.env.ADMIN_PHONE_NUMBER || '+917845637566';
export const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'bestfish';
const JWT_SECRET = process.env.JWT_SECRET || 'dolphin-aquarium-secure-jwt-key-2026-production';

// Normalizes Indian phone numbers to E.164 (+91XXXXXXXXXX)
export function normalizePhoneNumber(input: string): { valid: boolean; normalized: string; error?: string } {
  if (!input) return { valid: false, normalized: '', error: 'Phone number is required.' };

  // Remove spaces, dashes, parentheses
  let cleaned = input.replace(/[\s\-\(\)]/g, '');

  // Handle leading 0
  if (cleaned.startsWith('0') && cleaned.length === 11) {
    cleaned = cleaned.substring(1);
  }

  // Handle +91 or 91 prefix
  if (cleaned.startsWith('+91')) {
    cleaned = cleaned.substring(3);
  } else if (cleaned.startsWith('91') && cleaned.length === 12) {
    cleaned = cleaned.substring(2);
  }

  // Validate 10-digit Indian mobile number (starts with 6-9)
  const indianMobileRegex = /^[6-9]\d{9}$/;
  if (!indianMobileRegex.test(cleaned)) {
    return {
      valid: false,
      normalized: '',
      error: 'Please enter a valid 10-digit Indian mobile number.',
    };
  }

  return {
    valid: true,
    normalized: `+91${cleaned}`,
  };
}

interface OtpRecord {
  code: string;
  expiresAt: number;
  attempts: number;
  createdAt: number;
  role: 'ADMIN' | 'CUSTOMER';
}

interface RateLimitRecord {
  count: number;
  windowStart: number;
}

// In-memory stores for OTPs and rate limiting
const otpStore = new Map<string, OtpRecord>();
const rateLimitStore = new Map<string, RateLimitRecord>();

const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000; // 10 minutes
const MAX_REQUESTS_PER_WINDOW = 5;
const OTP_EXPIRY_MS = 5 * 60 * 1000; // 5 minutes
const MAX_VERIFY_ATTEMPTS = 5;

// Check rate limit
export function checkRateLimit(phone: string): { allowed: boolean; remainingWaitSec?: number } {
  const now = Date.now();
  const record = rateLimitStore.get(phone);

  if (!record || now - record.windowStart > RATE_LIMIT_WINDOW_MS) {
    rateLimitStore.set(phone, { count: 1, windowStart: now });
    return { allowed: true };
  }

  if (record.count >= MAX_REQUESTS_PER_WINDOW) {
    const remainingSec = Math.ceil((record.windowStart + RATE_LIMIT_WINDOW_MS - now) / 1000);
    return { allowed: false, remainingWaitSec: remainingSec };
  }

  record.count += 1;
  return { allowed: true };
}

// Generate OTP
export async function sendOtp(
  phone: string,
  role: 'ADMIN' | 'CUSTOMER'
): Promise<{ success: boolean; error?: string; devOtp?: string; countdownSec?: number }> {
  // Check rate limit
  const rateLimit = checkRateLimit(phone);
  if (!rateLimit.allowed) {
    return {
      success: false,
      error: `Too many requests. Please try again in ${rateLimit.remainingWaitSec} seconds.`,
    };
  }

  // If role is ADMIN, strictly enforce authorization check BEFORE sending OTP
  if (role === 'ADMIN' && phone !== ADMIN_PHONE_NUMBER) {
    return {
      success: false,
      error: 'Admin access is restricted.',
    };
  }

  // Generate 6-digit cryptographic OTP
  const otpNumber = crypto.randomInt(100000, 999999).toString();
  const now = Date.now();

  otpStore.set(phone, {
    code: otpNumber,
    expiresAt: now + OTP_EXPIRY_MS,
    attempts: 0,
    createdAt: now,
    role,
  });

  const otpMode = process.env.OTP_MODE || 'mock';

  if (otpMode === 'mock') {
    // In mock development mode, provide the code so local testing functions immediately
    return {
      success: true,
      countdownSec: 30,
      devOtp: otpNumber,
    };
  }

  // In production with Twilio / Firebase / SMS gateway:
  try {
    // If TWILIO / SMS provider configured, dispatch SMS here
    // e.g. twilioClient.verify.v2.services(serviceId).verifications.create({to: phone, channel: 'sms'})
    return {
      success: true,
      countdownSec: 30,
    };
  } catch (err: unknown) {
    console.error('Failed to dispatch SMS OTP:', err);
    return {
      success: false,
      error: 'Failed to send SMS OTP. Please try again.',
    };
  }
}

// Verify OTP
export function verifyOtp(
  phone: string,
  code: string,
  expectedRole: 'ADMIN' | 'CUSTOMER'
): { success: boolean; error?: string; token?: string } {
  const record = otpStore.get(phone);

  if (!record) {
    return { success: false, error: 'Please request a new OTP.' };
  }

  if (Date.now() > record.expiresAt) {
    otpStore.delete(phone);
    return { success: false, error: 'OTP has expired. Please request a new OTP.' };
  }

  if (record.attempts >= MAX_VERIFY_ATTEMPTS) {
    otpStore.delete(phone);
    return { success: false, error: 'Too many incorrect attempts. Please request a new OTP.' };
  }

  if (record.code !== code.trim()) {
    record.attempts += 1;
    return { success: false, error: 'OTP is incorrect.' };
  }

  if (record.role !== expectedRole) {
    return { success: false, error: 'Role mismatch.' };
  }

  // If verifying admin, ensure phone is authorized
  if (expectedRole === 'ADMIN' && phone !== ADMIN_PHONE_NUMBER) {
    otpStore.delete(phone);
    return { success: false, error: 'Admin access is restricted.' };
  }

  // Verified! Clean up OTP
  otpStore.delete(phone);

  // Generate Session Token
  const token = createSessionToken(phone, expectedRole);
  return { success: true, token };
}

// Verify Admin Password directly
export function verifyAdminPassword(password: string): { success: boolean; error?: string; token?: string } {
  if (!password || password.trim() !== ADMIN_PASSWORD) {
    return { success: false, error: 'Incorrect admin password. Please try again.' };
  }
  const token = createSessionToken(ADMIN_PHONE_NUMBER, 'ADMIN');
  return { success: true, token };
}

// Secure Token Creation & Verification using HMAC SHA-256
export function createSessionToken(phone: string, role: 'ADMIN' | 'CUSTOMER', hours: number = 8): string {
  const payload = {
    phone,
    role,
    exp: Date.now() + hours * 60 * 60 * 1000,
    iat: Date.now(),
  };

  const payloadBase64 = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const signature = crypto
    .createHmac('sha256', JWT_SECRET)
    .update(payloadBase64)
    .digest('base64url');

  return `${payloadBase64}.${signature}`;
}

export function verifySessionToken(token: string): { valid: boolean; phone?: string; role?: 'ADMIN' | 'CUSTOMER' } {
  if (!token || !token.includes('.')) return { valid: false };

  const [payloadBase64, signature] = token.split('.');
  const expectedSignature = crypto
    .createHmac('sha256', JWT_SECRET)
    .update(payloadBase64)
    .digest('base64url');

  if (signature !== expectedSignature) {
    return { valid: false };
  }

  try {
    const payload = JSON.parse(Buffer.from(payloadBase64, 'base64url').toString('utf-8'));
    if (Date.now() > payload.exp) {
      return { valid: false };
    }
    return { valid: true, phone: payload.phone, role: payload.role };
  } catch {
    return { valid: false };
  }
}
