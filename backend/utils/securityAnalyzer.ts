import dns from 'node:dns/promises';
import tls from 'node:tls';

export interface DetailedAnalysis {
  url: string; isHttps: boolean; hostname: string; safetyScore: number;
  grade: 'A+' | 'A' | 'B' | 'C' | 'D' | 'F';
  verdict: 'SAFE' | 'LOW_RISK' | 'SUSPICIOUS' | 'DANGEROUS';
  scores: { encryption: number; headers: number; reputation: number; infrastructure: number };
  positives: string[]; warnings: string[];
  certificates: { issuer: string | null; protocol: string; cipher: string; validFrom: string | null; validTo: string | null; daysRemaining: number };
  headersAnalysis: {
    xFrameOptions: { status: boolean; value: string; description: string };
    contentSecurityPolicy: { status: boolean; value: string; description: string };
    strictTransportSecurity: { status: boolean; value: string | null; description: string };
    xContentTypeOptions: { status: boolean; value: string; description: string };
    referrerPolicy: { status: boolean; value: string; description: string };
  };
  dnsInfo: { resolvedIp: string; asn: string; country: string; records: string[]; nameservers: string[] };
}

const REQUEST_TIMEOUT_MS = 8000;
const suspiciousKeywords = ['login', 'verify', 'update', 'secure', 'account', 'banking', 'wallet', 'free', 'airdrop', 'claim'];
const suspiciousTlds = ['.top', '.xyz', '.work', '.click', '.loan', '.gq', '.cf', '.tk', '.ml'];
const trustedDomains = ['google.com', 'github.com', 'microsoft.com', 'wikipedia.org', 'paypal.com', 'stripe.com', 'amazon.com', 'apple.com', 'cloudflare.com'];

function normalizeUrl(input: string): URL {
  const value = input.trim();
  const url = new URL(/^https?:\/\//i.test(value) ? value : `https://${value}`);
  if (!['http:', 'https:'].includes(url.protocol) || !url.hostname) throw new Error('Only valid HTTP and HTTPS website URLs are supported.');
  url.hash = '';
  return url;
}

function requestHeaders(url: URL): Promise<{ status: number; headers: Headers }> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  return fetch(url, { method: 'GET', redirect: 'follow', signal: controller.signal, headers: { 'user-agent': 'SafeWeb-Inspector/1.0' } })
    .then(response => ({ status: response.status, headers: response.headers }))
    .finally(() => clearTimeout(timer));
}

function readCertificate(url: URL): Promise<DetailedAnalysis['certificates']> {
  if (url.protocol !== 'https:') return Promise.resolve({ issuer: null, protocol: 'None (Insecure)', cipher: 'None', validFrom: null, validTo: null, daysRemaining: 0 });
  return new Promise(resolve => {
    const socket = tls.connect({ host: url.hostname, port: Number(url.port) || 443, servername: url.hostname, rejectUnauthorized: false, timeout: REQUEST_TIMEOUT_MS }, () => {
      const certificate = socket.getPeerCertificate();
      const validTo = certificate.valid_to ? new Date(certificate.valid_to) : null;
      const daysRemaining = validTo ? Math.max(0, Math.ceil((validTo.getTime() - Date.now()) / 86400000)) : 0;
      const issuerValue = certificate.issuer?.O || certificate.issuer?.CN || null;
      resolve({ issuer: Array.isArray(issuerValue) ? issuerValue.join(', ') : issuerValue, protocol: socket.getProtocol() || 'Unknown TLS', cipher: socket.getCipher()?.name || 'Unknown', validFrom: certificate.valid_from ? new Date(certificate.valid_from).toISOString() : null, validTo: validTo?.toISOString() || null, daysRemaining });
      socket.destroy();
    });
    const failed = (message: string) => { resolve({ issuer: null, protocol: message, cipher: 'Unknown', validFrom: null, validTo: null, daysRemaining: 0 }); socket.destroy(); };
    socket.on('error', () => failed('TLS negotiation failed'));
    socket.on('timeout', () => failed('TLS negotiation timed out'));
  });
}

function gradeFor(score: number): { grade: DetailedAnalysis['grade']; verdict: DetailedAnalysis['verdict'] } {
  if (score >= 95) return { grade: 'A+', verdict: 'SAFE' };
  if (score >= 85) return { grade: 'A', verdict: 'SAFE' };
  if (score >= 70) return { grade: 'B', verdict: 'LOW_RISK' };
  if (score >= 50) return { grade: 'C', verdict: 'SUSPICIOUS' };
  if (score >= 35) return { grade: 'D', verdict: 'DANGEROUS' };
  return { grade: 'F', verdict: 'DANGEROUS' };
}

export async function analyzeSite(urlInput: string): Promise<DetailedAnalysis> {
  const url = normalizeUrl(urlInput);
  const hostname = url.hostname.toLowerCase();
  const isHttps = url.protocol === 'https:';
  const trusted = trustedDomains.some(domain => hostname === domain || hostname.endsWith(`.${domain}`));
  let response: { status: number; headers: Headers };
  try { response = await requestHeaders(url); } catch { throw new Error(`Could not reach ${hostname}. Check the domain and try again.`); }
  const certificate = await readCertificate(url);
  const resolved = await dns.lookup(hostname).catch(() => null);
  const header = (name: string) => response.headers.get(name);
  const xFrame = header('x-frame-options'); const csp = header('content-security-policy'); const hsts = header('strict-transport-security'); const contentType = header('x-content-type-options'); const referrer = header('referrer-policy');
  const encryption = isHttps && certificate.protocol !== 'TLS negotiation failed' && certificate.protocol !== 'TLS negotiation timed out' ? (certificate.daysRemaining > 0 ? 100 : 45) : 10;
  const headerChecks = [xFrame, csp, hsts, contentType, referrer];
  const headersScore = Math.round((headerChecks.filter(Boolean).length / headerChecks.length) * 100);
  const keywordMatches = suspiciousKeywords.filter(keyword => hostname.includes(keyword));
  const suspiciousTld = suspiciousTlds.some(tld => hostname.endsWith(tld));
  const reputation = Math.max(5, Math.min(100, trusted ? 100 : 90 - keywordMatches.length * 12 - (suspiciousTld ? 20 : 0)));
  let infrastructure = resolved ? 90 : 25;
  const warnings: string[] = []; const positives: string[] = [];
  if (isHttps) positives.push(`HTTPS enabled (${certificate.protocol}, ${certificate.cipher})`); else warnings.push('CRITICAL: Plain HTTP sends data without transport encryption.');
  if (response.status >= 400) warnings.push(`The site returned HTTP ${response.status}.`); else positives.push(`Reachable with HTTP ${response.status}.`);
  if (certificate.validTo && certificate.daysRemaining > 0) positives.push(`Certificate is valid for ${certificate.daysRemaining} more days.`);
  if (certificate.validTo && certificate.daysRemaining === 0) warnings.push('TLS certificate is expired or expires today.');
  if (keywordMatches.length) warnings.push(`Suspicious domain keywords detected: ${keywordMatches.join(', ')}.`);
  if (suspiciousTld) warnings.push('Domain uses a TLD frequently associated with phishing or spam.');
  if (hostname.split('.').length > 3) { infrastructure -= 15; warnings.push('Deep subdomain nesting can conceal impersonation domains.'); }
  if (!resolved) warnings.push('DNS lookup failed.');
  if (headersScore < 60) warnings.push(`Only ${headerChecks.filter(Boolean).length} of 5 recommended security headers were observed.`); else positives.push(`${headerChecks.filter(Boolean).length} of 5 recommended security headers detected.`);
  if (trusted) positives.push('Hostname matches a commonly trusted service domain.');
  infrastructure = Math.max(5, Math.min(100, infrastructure));
  const scores = { encryption, headers: headersScore, reputation, infrastructure };
  const safetyScore = Math.round(encryption * 0.35 + headersScore * 0.25 + reputation * 0.25 + infrastructure * 0.15);
  const { grade, verdict } = gradeFor(safetyScore);
  return {
    url: url.toString(), isHttps, hostname, safetyScore, grade, verdict, scores, positives, warnings, certificates: certificate,
    headersAnalysis: {
      xFrameOptions: { status: !!xFrame, value: xFrame || 'Missing', description: 'Protects against clickjacking.' },
      contentSecurityPolicy: { status: !!csp, value: csp || 'Missing', description: 'Restricts untrusted scripts.' },
      strictTransportSecurity: { status: !!hsts, value: hsts, description: 'Forces HTTPS connections.' },
      xContentTypeOptions: { status: !!contentType, value: contentType || 'Missing', description: 'Prevents MIME sniffing.' },
      referrerPolicy: { status: !!referrer, value: referrer || 'Missing', description: 'Controls referrer data exposure.' },
    },
    dnsInfo: { resolvedIp: resolved?.address || 'Unavailable', asn: 'Unavailable without an ASN provider', country: 'Unavailable', records: resolved ? [resolved.family === 6 ? 'AAAA (IPv6)' : 'A (IPv4)'] : [], nameservers: [] },
  };
}