import React, { useState } from 'react';
import {
  GitCompare, Globe, Shield, ShieldCheck, ShieldAlert, AlertTriangle,
  ArrowRight, ArrowLeftRight, CheckCircle2, XCircle, Lock, Unlock,
  Download, Copy, Check, RefreshCw, Zap, Sparkles, Server, FileCode,
  Layers, ExternalLink, ArrowUpRight, BarChart3
} from 'lucide-react';
import ScoreRing from './ScoreRing';

export interface ScanResult {
  url: string;
  isHttps: boolean;
  hostname: string;
  safetyScore: number;
  grade: 'A+' | 'A' | 'B' | 'C' | 'D' | 'F';
  verdict: 'SAFE' | 'LOW_RISK' | 'SUSPICIOUS' | 'DANGEROUS';
  scores: {
    encryption: number;
    headers: number;
    reputation: number;
    infrastructure: number;
  };
  positives: string[];
  warnings: string[];
  certificates: {
    issuer: string | null;
    protocol: string;
    cipher: string;
    validFrom: string | null;
    validTo: string | null;
    daysRemaining: number;
  };
  headersAnalysis: {
    xFrameOptions: { status: boolean; value: string; description: string };
    contentSecurityPolicy: { status: boolean; value: string; description: string };
    strictTransportSecurity: { status: boolean; value: string | null; description: string };
    xContentTypeOptions: { status: boolean; value: string; description: string };
    referrerPolicy: { status: boolean; value: string; description: string };
  };
  dnsInfo: {
    resolvedIp: string;
    asn: string;
    country: string;
    records: string[];
    nameservers: string[];
  };
}

export interface MetricComparisonItem {
  name: string;
  site1Score: number;
  site2Score: number;
  leader: string;
}

export interface CompareResult {
  site1: ScanResult;
  site2: ScanResult;
  comparison: {
    winner: string;
    winnerUrl: string;
    scoreDifference: number;
    summary: string;
    metricComparison: MetricComparisonItem[];
  };
}

interface SiteComparisonProps {
  token: string | null;
}

const API_BASE = '/api';

const PRESET_COMPARISONS = [
  {
    title: 'Official Bank vs Phishing Clone',
    site1: 'https://paypal.com',
    site2: 'http://paypal-verification-account-update.xyz',
    badge: 'Phishing Detection',
    badgeColor: 'bg-rose-500/15 text-rose-300 border-rose-500/30',
    description: 'Compare legitimate TLS certificates and trusted reputation against a deceptive scam clone.',
  },
  {
    title: 'Payment Gateway Security',
    site1: 'https://stripe.com',
    site2: 'https://paypal.com',
    badge: 'Fintech Comparison',
    badgeColor: 'bg-sky-500/15 text-sky-300 border-sky-500/30',
    description: 'Compare enterprise security headers, HSTS preloading, and CSP implementations side-by-side.',
  },
  {
    title: 'HTTPS vs Plaintext HTTP',
    site1: 'https://en.wikipedia.org',
    site2: 'http://neverssl.com',
    badge: 'Protocol Contrast',
    badgeColor: 'bg-purple-500/15 text-purple-300 border-purple-500/30',
    description: 'See the severe vulnerability differential when network data is transmitted without encryption.',
  },
];

export default function SiteComparison({ token }: SiteComparisonProps) {
  const [url1, setUrl1] = useState('https://paypal.com');
  const [url2, setUrl2] = useState('http://paypal-verification-account-update.xyz');
  const [result, setResult] = useState<CompareResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [copiedReport, setCopiedReport] = useState(false);

  const handleCompare = async (e?: React.FormEvent, customUrl1?: string, customUrl2?: string) => {
    if (e) e.preventDefault();
    const target1 = (customUrl1 || url1).trim();
    const target2 = (customUrl2 || url2).trim();

    if (!target1 || !target2) {
      setError('Please provide two valid website URLs to compare.');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const res = await fetch(`${API_BASE}/scan/compare-sites`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ url1: target1, url2: target2 }),
      });

      const contentType = res.headers.get('content-type') || '';
      if (contentType.includes('application/json')) {
        const data = await res.json();
        if (res.ok) {
          setResult(data);
          setLoading(false);
          return;
        }
        setError(data.message || 'The scanner rejected one of these websites.');
        return;
      }
      setError(`The scanner returned an unexpected response (${res.status}).`);
    } catch {
      setError('The live scanner is unavailable. Start the SafeWeb backend and try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSwap = () => {
    const temp = url1;
    setUrl1(url2);
    setUrl2(temp);
    if (result) {
      handleCompare(undefined, url2, temp);
    }
  };

  const handleApplyPreset = (preset: typeof PRESET_COMPARISONS[0]) => {
    setUrl1(preset.site1);
    setUrl2(preset.site2);
    handleCompare(undefined, preset.site1, preset.site2);
  };

  const handleCopyReport = () => {
    if (!result) return;
    const reportText = `=== SafeWeb Inspector Comparison Report ===
Generated: ${new Date().toLocaleString()}

Site 1: ${result.site1.hostname} (${result.site1.url})
Score: ${result.site1.safetyScore}/100 (Grade: ${result.site1.grade})
Status: ${result.site1.isHttps ? 'HTTPS Secure' : 'HTTP Insecure'}

Site 2: ${result.site2.hostname} (${result.site2.url})
Score: ${result.site2.safetyScore}/100 (Grade: ${result.site2.grade})
Status: ${result.site2.isHttps ? 'HTTPS Secure' : 'HTTP Insecure'}

VERDICT:
Winner: ${result.comparison.winner}
Differential: +${result.comparison.scoreDifference} Points
Summary: ${result.comparison.summary}

Category Breakdown:
- Encryption: ${result.site1.scores.encryption}% vs ${result.site2.scores.encryption}%
- Security Headers: ${result.site1.scores.headers}% vs ${result.site2.scores.headers}%
- Domain Reputation: ${result.site1.scores.reputation}% vs ${result.site2.scores.reputation}%
- DNS Infrastructure: ${result.site1.scores.infrastructure}% vs ${result.site2.scores.infrastructure}%
==========================================`;

    navigator.clipboard.writeText(reportText);
    setCopiedReport(true);
    setTimeout(() => setCopiedReport(false), 2000);
  };

  const handleDownloadJSON = () => {
    if (!result) return;
    const blob = new Blob([JSON.stringify(result, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `safeweb-comparison-${result.site1.hostname}-vs-${result.site2.hostname}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header Banner */}
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-xs font-bold uppercase tracking-wider mb-2">
          <GitCompare className="w-3.5 h-3.5" /> Head-to-Head Evaluation
        </div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">
          Side-by-Side <span className="gradient-text">Website Comparator</span>
        </h1>
        <p className="text-slate-400 text-sm mt-1 max-w-2xl">
          Evaluate two domains simultaneously to spot impersonation, security header deficiencies, and protocol disparities.
        </p>
      </div>

      {/* Main Input Form Card */}
      <div className="card p-4 sm:p-8 space-y-6">
        <form onSubmit={handleCompare} className="space-y-5">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 sm:gap-4 items-center">
            {/* Target 1 */}
            <div className="lg:col-span-5 space-y-1.5">
              <label className="block text-xs font-bold text-sky-400 uppercase tracking-wider">
                Primary Target A
              </label>
              <div className="flex items-center bg-[#070b14] border border-sky-500/30 focus-within:border-sky-400 focus-within:ring-2 focus-within:ring-sky-500/20 rounded-xl px-3.5 py-3 gap-3 transition-all">
                <Globe className="w-5 h-5 text-sky-400 flex-shrink-0" />
                <input
                  type="text"
                  value={url1}
                  onChange={(e) => setUrl1(e.target.value)}
                  placeholder="https://paypal.com"
                  className="bg-transparent text-white text-sm w-full outline-none placeholder-slate-500"
                />
              </div>
            </div>

            {/* Swap Button */}
            <div className="lg:col-span-2 flex justify-center lg:pt-5">
              <button
                type="button"
                onClick={handleSwap}
                title="Swap websites"
                className="p-3.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 hover:text-white transition-all transform hover:rotate-180 duration-300 shadow-md"
              >
                <ArrowLeftRight className="w-4 h-4" />
              </button>
            </div>

            {/* Target 2 */}
            <div className="lg:col-span-5 space-y-1.5">
              <label className="block text-xs font-bold text-purple-400 uppercase tracking-wider">
                Comparison Target B
              </label>
              <div className="flex items-center bg-[#070b14] border border-purple-500/30 focus-within:border-purple-400 focus-within:ring-2 focus-within:ring-purple-500/20 rounded-xl px-3.5 py-3 gap-3 transition-all">
                <Globe className="w-5 h-5 text-purple-400 flex-shrink-0" />
                <input
                  type="text"
                  value={url2}
                  onChange={(e) => setUrl2(e.target.value)}
                  placeholder="http://paypal-verification.xyz"
                  className="bg-transparent text-white text-sm w-full outline-none placeholder-slate-500"
                />
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
            <button
              type="submit"
              disabled={loading}
              className="btn-primary py-3.5 px-8 text-sm font-bold flex items-center justify-center gap-2 disabled:opacity-50 w-full sm:w-auto"
            >
              {loading ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <GitCompare className="w-4 h-4" />
              )}
              <span>{loading ? 'Evaluating Security...' : 'Execute Side-by-Side Comparison'}</span>
            </button>

            {result && (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleCopyReport}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-bold flex items-center gap-1.5 transition-all"
                >
                  {copiedReport ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedReport ? 'Report Copied' : 'Copy Report'}</span>
                </button>
                <button
                  type="button"
                  onClick={handleDownloadJSON}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-bold flex items-center gap-1.5 transition-all"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>JSON</span>
                </button>
              </div>
            )}
          </div>
        </form>

        {/* Preset Showcase Cards */}
        <div className="pt-6 border-t border-slate-800 space-y-3">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-400 uppercase tracking-wider">
            <Sparkles className="w-4 h-4 text-purple-400" />
            <span>Recommended Head-to-Head Presets</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {PRESET_COMPARISONS.map((preset, idx) => (
              <div
                key={idx}
                onClick={() => handleApplyPreset(preset)}
                className="p-4 rounded-xl bg-[#070b14] border border-slate-800 hover:border-purple-500/40 hover:bg-[#0c1322] cursor-pointer transition-all duration-200 space-y-2 group flex flex-col justify-between shadow-sm"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <h4 className="text-xs font-bold text-white group-hover:text-purple-300 transition-colors">
                      {preset.title}
                    </h4>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${preset.badgeColor}`}>
                      {preset.badge}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    {preset.description}
                  </p>
                </div>
                <div className="flex items-center gap-1 text-[11px] font-bold text-purple-400 group-hover:text-purple-300 pt-1">
                  <span>Run Comparison</span>
                  <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-sm flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 text-rose-400 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Comparison Results */}
      {result && (
        <div className="space-y-6 animate-fadeIn">
          {/* Winner Banner */}
          <div className="card p-6 bg-gradient-to-r from-emerald-500/10 via-sky-500/10 to-purple-500/10 border-emerald-500/40 shadow-xl">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center flex-shrink-0 text-emerald-400">
                  <ShieldCheck className="w-8 h-8" />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-extrabold text-emerald-400 uppercase tracking-wider">
                      Comparison Verdict
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-500/30">
                      Winner: {result.comparison.winner}
                    </span>
                  </div>
                  <h3 className="text-lg font-extrabold text-white">
                    {result.comparison.summary}
                  </h3>
                </div>
              </div>

              <div className="flex items-center gap-3 bg-[#070b14] px-5 py-3 rounded-2xl border border-slate-700 self-stretch sm:self-auto justify-center">
                <div className="text-center">
                  <div className="text-2xl font-extrabold text-emerald-400">
                    +{result.comparison.scoreDifference}
                  </div>
                  <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                    Score Delta
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Multi-Vector Comparison Score Bars */}
          <div className="card p-6 space-y-4">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-sky-400" /> Multi-Vector Security Differential
            </h3>

            <div className="space-y-3">
              {result.comparison.metricComparison.map((metric, idx) => {
                const s1 = metric.site1Score;
                const s2 = metric.site2Score;
                return (
                  <div key={idx} className="p-4 rounded-xl bg-[#070b14] border border-slate-800 space-y-2.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-200 text-sm">{metric.name}</span>
                      <span className="text-xs font-semibold text-slate-400">
                        Top Performer: <strong className="text-sky-400">{metric.leader}</strong>
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
                      {/* Site 1 Bar */}
                      <div>
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-sky-400 font-semibold truncate max-w-[200px]">{result.site1.hostname}</span>
                          <span className="font-bold text-white">{s1}%</span>
                        </div>
                        <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                          <div
                            className="bg-gradient-to-r from-sky-500 to-indigo-500 h-2 rounded-full transition-all duration-1000"
                            style={{ width: `${s1}%` }}
                          />
                        </div>
                      </div>

                      {/* Site 2 Bar */}
                      <div>
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-purple-400 font-semibold truncate max-w-[200px]">{result.site2.hostname}</span>
                          <span className="font-bold text-white">{s2}%</span>
                        </div>
                        <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                          <div
                            className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all duration-1000"
                            style={{ width: `${s2}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Side by Side Detailed Comparison Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Site 1 Card */}
            <div className="card p-6 border-sky-500/30 space-y-5 shadow-xl">
              <div className="flex items-start justify-between gap-4 border-b border-slate-800 pb-4">
                <div>
                  <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded bg-sky-500/10 text-sky-400 border border-sky-500/20 uppercase tracking-widest">
                    Target A
                  </span>
                  <h3 className="text-xl font-extrabold text-white mt-2 truncate">
                    {result.site1.hostname}
                  </h3>
                  <p className="text-xs text-slate-400 font-mono truncate mt-0.5">{result.site1.url}</p>
                </div>
                <ScoreRing score={result.site1.safetyScore} size={90} strokeWidth={6} label="Safety Score" />
              </div>

              {/* Status & Grade */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-[#070b14] border border-slate-800">
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Encryption</span>
                  <span className={`font-extrabold text-sm ${result.site1.isHttps ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {result.site1.isHttps ? 'HTTPS Active' : 'Plaintext HTTP'}
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-[#070b14] border border-slate-800">
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Security Grade</span>
                  <span className="font-extrabold text-sm text-sky-400">
                    Grade {result.site1.grade} ({result.site1.verdict})
                  </span>
                </div>
              </div>

              {/* Positives & Warnings */}
              <div className="space-y-3 text-xs">
                <span className="font-bold text-emerald-400 uppercase tracking-wider block text-[10px]">
                  Positives ({result.site1.positives.length})
                </span>
                <div className="space-y-1.5">
                  {result.site1.positives.map((pos, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-emerald-200 bg-emerald-950/20 p-2 rounded-lg border border-emerald-500/10">
                      <CheckCircle2 className="w-3.5 h-3.5 mt-0.5 flex-shrink-0 text-emerald-400" />
                      <span>{pos}</span>
                    </div>
                  ))}
                </div>

                {result.site1.warnings.length > 0 && (
                  <>
                    <span className="font-bold text-rose-400 uppercase tracking-wider block text-[10px] pt-2">
                      Warnings ({result.site1.warnings.length})
                    </span>
                    <div className="space-y-1.5">
                      {result.site1.warnings.map((warn, idx) => (
                        <div key={idx} className="flex items-start gap-2 text-rose-200 bg-rose-950/20 p-2 rounded-lg border border-rose-500/10">
                          <XCircle className="w-3.5 h-3.5 mt-0.5 flex-shrink-0 text-rose-400" />
                          <span>{warn}</span>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Site 2 Card */}
            <div className="card p-6 border-purple-500/30 space-y-5 shadow-xl">
              <div className="flex items-start justify-between gap-4 border-b border-slate-800 pb-4">
                <div>
                  <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded bg-purple-500/10 text-purple-400 border border-purple-500/20 uppercase tracking-widest">
                    Target B
                  </span>
                  <h3 className="text-xl font-extrabold text-white mt-2 truncate">
                    {result.site2.hostname}
                  </h3>
                  <p className="text-xs text-slate-400 font-mono truncate mt-0.5">{result.site2.url}</p>
                </div>
                <ScoreRing score={result.site2.safetyScore} size={90} strokeWidth={6} label="Safety Score" />
              </div>

              {/* Status & Grade */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-[#070b14] border border-slate-800">
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Encryption</span>
                  <span className={`font-extrabold text-sm ${result.site2.isHttps ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {result.site2.isHttps ? 'HTTPS Active' : 'Plaintext HTTP'}
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-[#070b14] border border-slate-800">
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Security Grade</span>
                  <span className="font-extrabold text-sm text-purple-400">
                    Grade {result.site2.grade} ({result.site2.verdict})
                  </span>
                </div>
              </div>

              {/* Positives & Warnings */}
              <div className="space-y-3 text-xs">
                <span className="font-bold text-emerald-400 uppercase tracking-wider block text-[10px]">
                  Positives ({result.site2.positives.length})
                </span>
                <div className="space-y-1.5">
                  {result.site2.positives.map((pos, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-emerald-200 bg-emerald-950/20 p-2 rounded-lg border border-emerald-500/10">
                      <CheckCircle2 className="w-3.5 h-3.5 mt-0.5 flex-shrink-0 text-emerald-400" />
                      <span>{pos}</span>
                    </div>
                  ))}
                </div>

                {result.site2.warnings.length > 0 && (
                  <>
                    <span className="font-bold text-rose-400 uppercase tracking-wider block text-[10px] pt-2">
                      Warnings ({result.site2.warnings.length})
                    </span>
                    <div className="space-y-1.5">
                      {result.site2.warnings.map((warn, idx) => (
                        <div key={idx} className="flex items-start gap-2 text-rose-200 bg-rose-950/20 p-2 rounded-lg border border-rose-500/10">
                          <XCircle className="w-3.5 h-3.5 mt-0.5 flex-shrink-0 text-rose-400" />
                          <span>{warn}</span>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
