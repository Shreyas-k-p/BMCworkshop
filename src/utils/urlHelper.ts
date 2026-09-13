/**
 * Resolves the LAN-accessible or production URL for QR code and student joining.
 * - In production (e.g. Vercel / Netlify / custom domain): uses window.location.origin.
 * - In local development:
 *   - If opened via LAN IP (e.g. http://192.168.1.4:3001): uses window.location.origin.
 *   - If opened via localhost or 127.0.0.1: replaces 'localhost' with LAN IP so phone scan succeeds.
 */
export function getJoinUrl(sessionCode: string): string {
  const origin = window.location.origin;
  const hostname = window.location.hostname;
  const port = window.location.port ? `:${window.location.port}` : '';
  const protocol = window.location.protocol;

  const lanIp = import.meta.env.VITE_LAN_IP || '192.168.1.4';

  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return `${protocol}//${lanIp}${port}/join/${sessionCode}`;
  }

  return `${origin}/join/${sessionCode}`;
}
