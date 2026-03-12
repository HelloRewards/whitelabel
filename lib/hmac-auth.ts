import crypto from 'crypto';

export function generateHmacToken(
  url: URL,
  method: string,
  apiKey: string,
  apiSecretKey: string
): string {
  const timestamp = Date.now().toString();
  const payload = `${timestamp}\r\n${method}\r\n${url.pathname}${url.search}\r\n\r\n`;

  console.log('[HMAC DEBUG] Generating token:');
  console.log('  - Timestamp:', timestamp);
  console.log('  - Method:', method);
  console.log('  - Path:', url.pathname);
  console.log('  - Search:', url.search);
  console.log('  - Full URL:', url.toString());
  console.log('  - Payload (escaped):', JSON.stringify(payload));

  const signature = crypto
    .createHmac('sha256', apiSecretKey)
    .update(payload)
    .digest('hex')
    .toLowerCase();

  const token = `hmac ${apiKey}:${timestamp}:${signature}`;
  console.log('  - Token:', token.substring(0, 50) + '...');

  return token;
}
