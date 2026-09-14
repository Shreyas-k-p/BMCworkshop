/**
 * Resolves the correct join URL for QR code generation.
 *
 * Local dev (localhost / 127.0.0.1):
 *   Replaces 'localhost' with the LAN IP so phone scans work.
 *   LAN IP is set via VITE_LAN_IP in .env (defaults to 192.168.1.4).
 *
 * Production:
 *   Always returns the PERMANENT Vercel domain — never a preview/deployment URL.
 *   This ensures the QR code works regardless of which Vercel URL the host
 *   opened the dashboard on.
 */
export function getJoinUrl(sessionCode: string): string {
  const hostname = window.location.hostname;
  const port = window.location.port;
  const protocol = window.location.protocol;

  // Local development — swap localhost for LAN IP so phones can scan
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    const lanIp = import.meta.env.VITE_LAN_IP || '192.168.1.4';
    return `${protocol}//${lanIp}${port ? `:${port}` : ''}/join/${sessionCode}`;
  }

  // Production — always use the permanent Vercel domain, never a preview URL
  return `https://bm-cworkshop.vercel.app/join/${sessionCode}`;
}
