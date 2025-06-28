/**
 * Security utilities for input validation and sanitization
 */

// Input validation patterns
export const VALIDATION_PATTERNS = {
  email: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
  name: /^[a-zA-Z\s'-]{1,50}$/,
  message: /^[\w\s.,!?'"()-]{1,1000}$/,
  url: /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&//=]*)$/
};

// Dangerous patterns to block
export const DANGEROUS_PATTERNS = [
  // XSS patterns
  /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
  /javascript:/gi,
  /vbscript:/gi,
  /onload\s*=/gi,
  /onerror\s*=/gi,
  /onclick\s*=/gi,
  /onmouseover\s*=/gi,
  /eval\s*\(/gi,
  /expression\s*\(/gi,
  /alert\s*\(/gi,
  /confirm\s*\(/gi,
  /prompt\s*\(/gi,
  /document\.cookie/gi,
  /document\.write/gi,
  /window\.location/gi,
  
  // SQL injection patterns
  /union\s+select/gi,
  /insert\s+into/gi,
  /update\s+set/gi,
  /delete\s+from/gi,
  /drop\s+table/gi,
  /create\s+table/gi,
  /alter\s+table/gi,
  /exec\s*\(/gi,
  /execute\s*\(/gi,
  /sp_\w+/gi,
  /xp_\w+/gi,
  /--\s*$/gm,
  /;\s*--/gi,
  /'\s*or\s*'1'\s*=\s*'1/gi,
  /'\s*or\s*1\s*=\s*1/gi,
  /"\s*or\s*"1"\s*=\s*"1/gi,
  /"\s*or\s*1\s*=\s*1/gi,
  
  // Path traversal patterns
  /\.\.\//gi,
  /\.\.\\/gi,
  /%2e%2e%2f/gi,
  /%2e%2e%5c/gi,
  /%252e%252e%252f/gi,
  /%252e%252e%255c/gi,
  
  // File inclusion patterns
  /php:\/\/filter/gi,
  /php:\/\/input/gi,
  /data:\/\/text/gi,
  /file:\/\//gi,
  /ftp:\/\//gi,
  /gopher:\/\//gi,
  /dict:\/\//gi,
  /ldap:\/\//gi,
  /jar:\/\//gi,
  /netdoc:\/\//gi,
  
  // HTML injection patterns
  /<iframe/gi,
  /<object/gi,
  /<embed/gi,
  /<applet/gi,
  /<meta/gi,
  /<link/gi,
  /<style/gi,
  /<base/gi,
  /<form/gi,
  /<input/gi,
  /<textarea/gi,
  /<select/gi,
  /<option/gi,
  /<button/gi,
  
  // Command injection patterns
  /;\s*cat\s+/gi,
  /;\s*ls\s+/gi,
  /;\s*pwd/gi,
  /;\s*whoami/gi,
  /;\s*id/gi,
  /;\s*uname/gi,
  /;\s*ps\s+/gi,
  /;\s*netstat/gi,
  /;\s*ifconfig/gi,
  /;\s*ping\s+/gi,
  /;\s*wget\s+/gi,
  /;\s*curl\s+/gi,
  /;\s*nc\s+/gi,
  /;\s*telnet\s+/gi,
  /;\s*ssh\s+/gi,
  /;\s*ftp\s+/gi,
  /;\s*scp\s+/gi,
  /;\s*rsync\s+/gi,
  /;\s*tar\s+/gi,
  /;\s*gzip\s+/gi,
  /;\s*gunzip\s+/gi,
  /;\s*zip\s+/gi,
  /;\s*unzip\s+/gi,
  /;\s*chmod\s+/gi,
  /;\s*chown\s+/gi,
  /;\s*su\s+/gi,
  /;\s*sudo\s+/gi,
  /;\s*passwd/gi,
  /;\s*useradd\s+/gi,
  /;\s*userdel\s+/gi,
  /;\s*usermod\s+/gi,
  /;\s*groupadd\s+/gi,
  /;\s*groupdel\s+/gi,
  /;\s*mount\s+/gi,
  /;\s*umount\s+/gi,
  /;\s*fdisk\s+/gi,
  /;\s*mkfs\s+/gi,
  /;\s*fsck\s+/gi,
  /;\s*crontab\s+/gi,
  /;\s*at\s+/gi,
  /;\s*batch\s+/gi,
  /;\s*nohup\s+/gi,
  /;\s*screen\s+/gi,
  /;\s*tmux\s+/gi,
  /;\s*kill\s+/gi,
  /;\s*killall\s+/gi,
  /;\s*pkill\s+/gi,
  /;\s*pgrep\s+/gi,
  /;\s*top/gi,
  /;\s*htop/gi,
  /;\s*iotop/gi,
  /;\s*iftop/gi,
  /;\s*tcpdump\s+/gi,
  /;\s*wireshark\s+/gi,
  /;\s*nmap\s+/gi,
  /;\s*nikto\s+/gi,
  /;\s*sqlmap\s+/gi,
  /;\s*metasploit/gi,
  /;\s*msfconsole/gi,
  /;\s*msfvenom\s+/gi,
  /;\s*hydra\s+/gi,
  /;\s*john\s+/gi,
  /;\s*hashcat\s+/gi,
  /;\s*aircrack/gi,
  /;\s*burpsuite/gi,
  /;\s*owasp/gi,
  /;\s*w3af\s+/gi,
  /;\s*skipfish\s+/gi,
  /;\s*dirb\s+/gi,
  /;\s*dirbuster\s+/gi,
  /;\s*gobuster\s+/gi,
  /;\s*wfuzz\s+/gi,
  /;\s*ffuf\s+/gi
];

// Control characters to remove (avoiding ESLint control-regex warning)
const CONTROL_CHARS = [
  '\x00', '\x01', '\x02', '\x03', '\x04', '\x05', '\x06', '\x07',
  '\x08', '\x0B', '\x0C', '\x0E', '\x0F', '\x10', '\x11', '\x12',
  '\x13', '\x14', '\x15', '\x16', '\x17', '\x18', '\x19', '\x1A',
  '\x1B', '\x1C', '\x1D', '\x1E', '\x1F', '\x7F'
];

/**
 * Sanitize input by removing dangerous patterns
 */
export function sanitizeInput(input: string): string {
  if (!input || typeof input !== 'string') {
    return '';
  }
  
  let sanitized = input.trim();
  
  // Remove dangerous patterns
  DANGEROUS_PATTERNS.forEach(pattern => {
    sanitized = sanitized.replace(pattern, '');
  });
  
  // Remove control characters (preserving newlines and tabs)
  CONTROL_CHARS.forEach(char => {
    sanitized = sanitized.replace(new RegExp(char, 'g'), '');
  });
  
  // Limit length
  sanitized = sanitized.substring(0, 1000);
  
  return sanitized;
}

/**
 * Validate input against patterns and dangerous content
 */
export function validateInput(input: string, type: keyof typeof VALIDATION_PATTERNS): boolean {
  if (!input || typeof input !== 'string') {
    return false;
  }
  
  const sanitized = sanitizeInput(input);
  
  // Check if sanitization removed content (indicates malicious input)
  if (sanitized.length < input.trim().length * 0.8) {
    return false;
  }
  
  // Validate against pattern
  const pattern = VALIDATION_PATTERNS[type];
  if (pattern && !pattern.test(sanitized)) {
    return false;
  }
  
  // Check for dangerous patterns
  const hasDangerousContent = DANGEROUS_PATTERNS.some(pattern => 
    pattern.test(input)
  );
  
  return !hasDangerousContent;
}

/**
 * Escape HTML to prevent XSS
 */
export function escapeHtml(text: string): string {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

/**
 * Rate limiting helper (client-side)
 */
export class RateLimiter {
  private attempts: Map<string, number[]> = new Map();
  private readonly maxAttempts: number;
  private readonly windowMs: number;

  constructor(maxAttempts: number = 5, windowMs: number = 60000) {
    this.maxAttempts = maxAttempts;
    this.windowMs = windowMs;
  }

  isAllowed(identifier: string): boolean {
    const now = Date.now();
    const attempts = this.attempts.get(identifier) || [];
    
    // Remove old attempts outside the window
    const validAttempts = attempts.filter(time => now - time < this.windowMs);
    
    if (validAttempts.length >= this.maxAttempts) {
      return false;
    }
    
    // Add current attempt
    validAttempts.push(now);
    this.attempts.set(identifier, validAttempts);
    
    return true;
  }
}

/**
 * Generate a secure random token
 */
export function generateSecureToken(length: number = 32): string {
  const array = new Uint8Array(length);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}

/**
 * Check if URL is safe for redirection
 */
export function isSafeUrl(url: string): boolean {
  try {
    const parsed = new URL(url, window.location.origin);
    
    // Only allow same origin or specific trusted domains
    const trustedDomains = [
      window.location.hostname,
      'musefuze.com',
      'www.musefuze.com'
    ];
    
    return trustedDomains.includes(parsed.hostname) && 
           (parsed.protocol === 'https:' || parsed.protocol === 'http:');
  } catch {
    return false;
  }
}

/**
 * Content Security Policy violation reporter
 */
export function setupCSPReporting(): void {
  document.addEventListener('securitypolicyviolation', (event) => {
    console.warn('CSP Violation:', {
      blockedURI: event.blockedURI,
      violatedDirective: event.violatedDirective,
      originalPolicy: event.originalPolicy,
      sourceFile: event.sourceFile,
      lineNumber: event.lineNumber,
      columnNumber: event.columnNumber
    });
    
    // In production, you might want to send this to a logging service
    // fetch('/api/csp-violation', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({
    //     blockedURI: event.blockedURI,
    //     violatedDirective: event.violatedDirective,
    //     userAgent: navigator.userAgent,
    //     timestamp: new Date().toISOString()
    //   })
    // });
  });
}