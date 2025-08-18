// Security utility functions

/**
 * Mask sensitive data for display purposes
 */
export const maskSensitiveData = (value: string, type: 'phone' | 'email' | 'amount'): string => {
  if (!value) return '';
  
  switch (type) {
    case 'phone':
      return value.length > 4 ? 
        '*'.repeat(value.length - 4) + value.slice(-4) : 
        value;
    
    case 'email':
      const atIndex = value.indexOf('@');
      if (atIndex > 2) {
        return value.slice(0, 2) + '*'.repeat(atIndex - 2) + value.slice(atIndex);
      }
      return value;
    
    case 'amount':
      return '***.**';
    
    default:
      return value;
  }
};

/**
 * Clean up authentication state from storage
 */
export const cleanupAuthState = (): void => {
  // Remove standard auth tokens
  try {
    // Clear localStorage
    Object.keys(localStorage).forEach((key) => {
      if (key.startsWith('supabase.auth.') || key.includes('sb-')) {
        localStorage.removeItem(key);
      }
    });
    
    // Clear sessionStorage if it exists
    if (typeof sessionStorage !== 'undefined') {
      Object.keys(sessionStorage).forEach((key) => {
        if (key.startsWith('supabase.auth.') || key.includes('sb-')) {
          sessionStorage.removeItem(key);
        }
      });
    }
  } catch (error) {
    // Silently handle any storage access errors
  }
};

/**
 * Validate file upload security
 */
export const validateFileUpload = (file: File): { valid: boolean; error?: string } => {
  const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
  const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  
  if (file.size > MAX_FILE_SIZE) {
    return { valid: false, error: 'File size must be less than 5MB' };
  }
  
  if (!ALLOWED_TYPES.includes(file.type)) {
    return { valid: false, error: 'Only JPEG, PNG, and WebP images are allowed' };
  }
  
  return { valid: true };
};

/**
 * Rate limiting utility for sensitive operations
 */
class RateLimiter {
  private attempts: Map<string, number[]> = new Map();
  
  isAllowed(key: string, maxAttempts: number, windowMs: number): boolean {
    const now = Date.now();
    const windowStart = now - windowMs;
    
    if (!this.attempts.has(key)) {
      this.attempts.set(key, []);
    }
    
    const keyAttempts = this.attempts.get(key)!;
    
    // Remove old attempts outside the window
    while (keyAttempts.length > 0 && keyAttempts[0] < windowStart) {
      keyAttempts.shift();
    }
    
    if (keyAttempts.length >= maxAttempts) {
      return false;
    }
    
    keyAttempts.push(now);
    return true;
  }
  
  reset(key: string): void {
    this.attempts.delete(key);
  }
}

export const rateLimiter = new RateLimiter();

/**
 * Sanitize user input to prevent XSS
 */
export const sanitizeInput = (input: string): string => {
  return input
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
};

/**
 * Generate secure random string for IDs
 */
export const generateSecureId = (length: number = 16): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  const values = new Uint8Array(length);
  crypto.getRandomValues(values);
  
  for (let i = 0; i < length; i++) {
    result += chars[values[i] % chars.length];
  }
  
  return result;
};