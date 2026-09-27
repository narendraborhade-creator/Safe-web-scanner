import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  Search, Globe, Shield, ShieldAlert, ShieldCheck, AlertTriangle,
  Lock, Unlock, ArrowRight, Zap, RefreshCw, History, GitCompare,
  Server, FileCode, CheckCircle2, XCircle, ChevronDown, ChevronUp,
  BookOpen, Sparkles, Download, Copy, Check, ExternalLink, Key,
  Activity, ArrowUpRight, Cpu, Layers, BarChart3, AlertOctagon
} from 'lucide-react';
import ScoreRing from '../components/ScoreRing';
import Navbar, { TabType } from '../components/Navbar';
import Glossary from '../components/Glossary';
import SiteComparison, { ScanResult } from '../components/SiteComparison';


const API_BASE = '/api';

type ScanHistoryItem = {
  _id: string;
  url: string;
  scanType: string;
  createdAt: string;
  result: any;
};

export default function Dashboard() {
  const { token, user } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>('scan');

  // Single scan state
  const [scanUrl, setScanUrl] = useState('');
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [scanLoading, setScanLoading] = useState(false);
  const [scanError, setScanError] = useState('');
  const [copiedScanReport, setCopiedScanReport] = useState(false);

  // History state
  const [history, setHistory] = useState<ScanHistoryItem[]>(() => {
    try {
      const saved = localStorage.getItem('safeweb_history');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [historyLoading, setHistoryLoading] = useState(false);

  // Technical details accordion
  const [showTechnicalDetails, setShowTechnicalDetails] = useState(true);

  const headers = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  };

  const saveToLocalHistory = (url: string, scanType: string, result: any) => {
    try {
      const newEntry: ScanHistoryItem = {
        _id: 'hist_' + Date.now(),
        url,
        scanType,
        createdAt: new Date().toISOString(),
        result,
      };
      setHistory((prev) => {
        const updated = [newEntry, ...prev.slice(0, 49)];
        localStorage.setItem('safeweb_history', JSON.stringify(updated));
        return updated;
      });
    } catch {
      // ignore storage errors
    }
  };

  const handleScan = async (e?: React.FormEvent, customUrl?: string) => {
    if (e) e.preventDefault();
    const targetUrl = (customUrl || scanUrl).trim();

    if (!targetUrl) {
      setScanError('Please enter a website URL or select a sample domain below.');
      return;
    }

    setScanError('');
    setScanResult(null);
    setScanLoading(true);

    try {
      const res = await fetch(`${API_BASE}/scan/check-site`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ url: targetUrl }),
      });

      const contentType = res.headers.get('content-type') || '';
      if (contentType.includes('application/json')) {
        const data = await res.json();
        if (res.ok) {
          setScanResult(data);
          saveToLocalHistory(data.url, 'single', data);
          setScanLoading(false);
          return;
        }
        setScanError(data.message || 'The scanner rejected this website.');
        return;
      }
      setScanError(`The scanner returned an unexpected response (${res.status}).`);
    } catch {
      setScanError('The live scanner is unavailable. Start the SafeWeb backend and try again.');
    } finally {
      setScanLoading(false);
    }
  };

  const loadHistory = async () => {
    setHistoryLoading(true);
    try {
      const res = await fetch(`${API_BASE}/scan/history`, { headers });
      const contentType = res.headers.get('content-type') || '';
      if (contentType.includes('application/json')) {
        const data = await res.json();
        if (res.ok && Array.isArray(data) && data.length > 0) {
          setHistory(data);
          localStorage.setItem('safeweb_history', JSON.stringify(data));
        }
      }
    } catch {
      // keep existing localStorage history
    } finally {
      setHistoryLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'history') {
      loadHistory();
    }
  }, [activeTab]);

  const handleCopyScanReport = () => {
    if (!scanResult) return;
    const report = `=== SafeWeb Site Inspection Report ===
URL: ${scanResult.url} (${scanResult.hostname})
Safety Score: ${scanResult.safetyScore}/100 | Grade: ${scanResult.grade}
Verdict: ${scanResult.verdict}
Encryption: ${scanResult.isHttps ? 'HTTPS Secure (TLS 1.3)' : 'Plaintext HTTP (Insecure)'}
Certificate Issuer: ${scanResult.certificates.issuer || 'None'}
Days Until Expiration: ${scanResult.certificates.daysRemaining} days

Positives:
${scanResult.positives.map((p) => `✓ ${p}`).join('\n')}

Warnings:
${scanResult.warnings.length > 0 ? scanResult.warnings.map((w) => `⚠ ${w}`).join('\n') : '✓ None'}
======================================`;

    navigator.clipboard.writeText(report);
    setCopiedScanReport(true);
    setTimeout(() => setCopiedScanReport(false), 2000);
  };

  const handleDownloadJSON = () => {
    if (!scanResult) return;
    const blob = new Blob([JSON.stringify(scanResult, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `safeweb-audit-${scanResult.hostname}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-[#070b14] text-slate-100 flex flex-col">
      {/* Sticky Clean Navbar */}
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 py-5 sm:py-8 relative z-10 space-y-6 sm:space-y-8">
        {/* ── TAB 1: SINGLE SITE SCANNER ────────────────────────────────────────── */}
        {activeTab === 'scan' && (
          <div className="space-y-8 animate-fadeIn">
            {/* Hero Header & Quick Stats */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-2">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-500/10 border border-sky-500/20 text-sky-400 text-xs font-bold uppercase tracking-wider mb-3">
                  <Sparkles className="w-3.5 h-3.5" /> Next-Gen Security Inspection Engine
                </div>
                <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
                  Website Safety & <span className="gradient-text">Threat Analyzer</span>
                </h1>
                <p className="text-slate-400 text-sm sm:text-base mt-2 max-w-2xl leading-relaxed">
                  Real-time cryptographic certificate auditing, HTTP security headers inspection, deceptive domain heuristics, and DNS infrastructure mapping.
                </p>
              </div>

              {/* Stat Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-2 gap-2.5 lg:w-96 flex-shrink-0">
                <div className="p-3 rounded-xl bg-slate-900/70 border border-slate-800 shadow-md">
                  <div className="text-xs text-slate-400 font-medium">Rules Audited</div>
                  <div className="text-xl font-extrabold text-white mt-0.5">18 Checks</div>
                </div>
                <div className="p-3 rounded-xl bg-slate-900/70 border border-slate-800 shadow-md">
                  <div className="text-xs text-slate-400 font-medium">Engine Mode</div>
                  <div className="text-xl font-extrabold text-sky-400 mt-0.5">Deep Scan</div>
                </div>
                <div className="p-3 rounded-xl bg-slate-900/70 border border-slate-800 shadow-md">
                  <div className="text-xs text-slate-400 font-medium">Database</div>
                  <div className="text-xl font-extrabold text-emerald-400 mt-0.5">MongoDB</div>
                </div>
                <div className="p-3 rounded-xl bg-slate-900/70 border border-slate-800 shadow-md">
                  <div className="text-xs text-slate-400 font-medium">Encryption</div>
                  <div className="text-xl font-extrabold text-purple-400 mt-0.5">TLS 1.3</div>
                </div>
              </div>
            </div>

            {/* Main Search Bar Card */}
            <div className="glass-card p-4 sm:p-8 border-slate-750 shadow-2xl">
              <form onSubmit={handleScan} className="space-y-4">
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
                  Target Website URL
                </label>
                <div className="flex flex-col sm:flex-row items-center gap-3">
                  {/* Clean Input Wrapper */}
                  <div className="flex items-center w-full bg-[#0b1120] border border-slate-700 hover:border-slate-600 focus-within:border-sky-500 focus-within:ring-2 focus-within:ring-sky-500/20 rounded-xl transition-all duration-200">
                    <div className="pl-4 pr-2 text-sky-400 flex items-center justify-center">
                      <Globe className="w-5 h-5" />
                    </div>
                    <input
                      type="text"
                      value={scanUrl}
                      onChange={(e) => setScanUrl(e.target.value)}
                      placeholder="e.g. https://github.com or paypal.com"
                      className="w-full bg-transparent py-3.5 pr-4 text-white text-sm sm:text-base outline-none placeholder-slate-500"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={scanLoading}
                    className="btn-primary w-full sm:w-auto py-3.5 px-8 text-sm font-bold flex items-center justify-center gap-2 whitespace-nowrap disabled:opacity-50"
                  >
                    {scanLoading ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <Zap className="w-4 h-4" />
                    )}
                    <span>{scanLoading ? 'Inspecting Domain...' : 'Run Security Scan'}</span>
                  </button>
                </div>
              </form>

              {/* Quick Sample Audit Chips */}
              <div className="mt-5 pt-4 border-t border-slate-800">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mr-1">
                    Quick Audits:
                  </span>
                  {[
                    { name: 'Google (Safe)', url: 'https://google.com', safe: true },
                    { name: 'GitHub (Enterprise)', url: 'https://github.com', safe: true },
                    { name: 'Wikipedia (Safe)', url: 'https://en.wikipedia.org', safe: true },
                    { name: 'NeverSSL (Unencrypted HTTP)', url: 'http://neverssl.com', safe: false },
                    { name: 'Phishing Sim Clone', url: 'http://paypal-verification-account-update.xyz', safe: false },
                  ].map((sample) => (
                    <button
                      key={sample.url}
                      type="button"
                      onClick={() => {
                        setScanUrl(sample.url);
                        handleScan(undefined, sample.url);
                      }}
                      className={`text-xs px-3 py-1.5 rounded-lg border font-medium flex items-center gap-1.5 transition-all duration-200 ${
                        sample.safe
                          ? 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border-emerald-500/20'
                          : 'bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border-rose-500/20'
                      }`}
                    >
                      {sample.safe ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
                      )}
                      <span>{sample.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Error Message */}
            {scanError && (
              <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-sm flex items-center gap-3">
                <AlertOctagon className="w-5 h-5 text-rose-400 flex-shrink-0" />
                <span>{scanError}</span>
              </div>
            )}

            {/* ── DEFAULT SHOWCASE WHEN NO SCAN YET ────────────────────────── */}
            {!scanResult && !scanLoading && (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <Layers className="w-5 h-5 text-sky-400" />
                    How SafeWeb Protects You
                  </h3>
                      <span className="text-xs text-slate-400">Select a sample to execute a live audit</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  {/* Feature Card 1 */}
                  <div className="glass-card p-6 border-slate-800 space-y-3 hover:border-sky-500/30 transition-all">
                    <div className="w-12 h-12 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400">
                      <Lock className="w-6 h-6" />
                    </div>
                    <h4 className="text-base font-bold text-white">TLS/SSL & Encryption</h4>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      Validates Certificate Authority trust chains, remaining validity countdown, negotiated ciphers, and protocol versioning to prevent Man-in-the-Middle eavesdropping.
                    </p>
                  </div>

                  {/* Feature Card 2 */}
                  <div className="glass-card p-6 border-slate-800 space-y-3 hover:border-purple-500/30 transition-all">
                    <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
                      <FileCode className="w-6 h-6" />
                    </div>
                    <h4 className="text-base font-bold text-white">Security Headers Audit</h4>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      Audits HSTS (Strict-Transport-Security), Content-Security-Policy (CSP), and X-Frame-Options to ensure defenses against Clickjacking, MIME-sniffing, and XSS attacks.
                    </p>
                  </div>

                  {/* Feature Card 3 */}
                  <div className="glass-card p-6 border-slate-800 space-y-3 hover:border-emerald-500/30 transition-all">
                    <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                      <ShieldAlert className="w-6 h-6" />
                    </div>
                    <h4 className="text-base font-bold text-white">Heuristic Scam Defense</h4>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      Detects lookalike brand impersonation, high-risk suspicious TLD extensions, multi-tier subdomain cloaking, and fraudulent authentication keyword traps.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* ── SCAN RESULTS SECTION ────────────────────────────────────────── */}
            {scanResult && (
              <div className="space-y-6 animate-fadeIn">
                {/* Result Overview Header Card */}
                <div className="glass-card p-6 sm:p-8 border-sky-500/30 space-y-6 shadow-2xl">
                  {/* Top Bar: Score Gauge, Identity, Verdict */}
                  <div className="flex flex-col lg:flex-row items-center lg:items-start justify-between gap-6 pb-6 border-b border-slate-800">
                    <div className="flex flex-col sm:flex-row items-center gap-6 text-center sm:text-left">
                      <ScoreRing score={scanResult.safetyScore} size={140} strokeWidth={9} label="Safety Score" />

                      <div className="space-y-2">
                        <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                          <span
                            className={`text-xs font-bold px-3 py-1 rounded-full border uppercase tracking-wider flex items-center gap-1.5 ${
                              scanResult.isHttps
                                ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                                : 'bg-rose-500/15 text-rose-400 border-rose-500/30'
                            }`}
                          >
                            {scanResult.isHttps ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
                            {scanResult.isHttps ? 'HTTPS Secure' : 'HTTP Insecure'}
                          </span>

                          <span className="text-xs font-extrabold px-3 py-1 rounded-full bg-sky-500/15 text-sky-300 border border-sky-500/30">
                            Grade {scanResult.grade}
                          </span>

                          <span
                            className={`text-xs font-bold px-3 py-1 rounded-full border ${
                              scanResult.verdict === 'SAFE'
                                ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                                : scanResult.verdict === 'LOW_RISK'
                                ? 'bg-sky-500/15 text-sky-300 border-sky-500/30'
                                : scanResult.verdict === 'SUSPICIOUS'
                                ? 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                                : 'bg-rose-500/15 text-rose-300 border-rose-500/30'
                            }`}
                          >
                            Verdict: {scanResult.verdict}
                          </span>
                        </div>

                        <h3 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                          {scanResult.hostname}
                        </h3>
                        <p className="text-xs font-mono text-slate-400 break-all">{scanResult.url}</p>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-wrap items-center justify-center lg:justify-end gap-2 w-full lg:w-auto">
                      <button
                        type="button"
                        onClick={handleCopyScanReport}
                        className="flex-1 sm:flex-none px-3 sm:px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-bold flex items-center justify-center gap-1.5 transition-all"
                      >
                        {copiedScanReport ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copiedScanReport ? 'Report Copied' : 'Copy Report'}</span>
                      </button>

                      <button
                        type="button"
                        onClick={handleDownloadJSON}
                        className="flex-1 sm:flex-none px-3 sm:px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-bold flex items-center justify-center gap-1.5 transition-all"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>JSON</span>
                      </button>

                      <a
                        href={scanResult.url}
                        target="_blank"
                        rel="noreferrer"
                        className="flex-1 sm:flex-none px-3 sm:px-4 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-md shadow-sky-600/30"
                      >
                        <span>Visit Site</span>
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  </div>

                  {/* 4 Multi-Vector Category Score Cards */}
                  <div>
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                      <BarChart3 className="w-4 h-4 text-sky-400" /> Multi-Vector Security Differential
                    </h4>
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                      {[
                        { label: 'Transport Encryption', score: scanResult.scores.encryption, icon: Lock, color: 'text-sky-400' },
                        { label: 'Security Headers', score: scanResult.scores.headers, icon: FileCode, color: 'text-purple-400' },
                        { label: 'Domain Reputation', score: scanResult.scores.reputation, icon: Shield, color: 'text-emerald-400' },
                        { label: 'DNS Infrastructure', score: scanResult.scores.infrastructure, icon: Server, color: 'text-pink-400' },
                      ].map((cat, idx) => (
                        <div key={idx} className="p-4 rounded-xl bg-[#0b1120] border border-slate-800">
                          <div className="flex items-center justify-between text-xs mb-1.5">
                            <span className="text-slate-400 font-medium flex items-center gap-1.5">
                              <cat.icon className={`w-3.5 h-3.5 ${cat.color}`} /> {cat.label}
                            </span>
                            <span className="font-extrabold text-white text-sm">{cat.score}%</span>
                          </div>
                          <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden mt-2">
                            <div
                              className="bg-gradient-to-r from-sky-500 to-indigo-500 h-2 rounded-full transition-all duration-1000"
                              style={{ width: `${cat.score}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Two-Column Findings: Positives vs Warnings */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Strengths Card */}
                    <div className="p-5 rounded-2xl bg-emerald-500/5 border border-emerald-500/20 space-y-3">
                      <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Security Strengths & Positives ({scanResult.positives.length})</span>
                      </h4>
                      <div className="space-y-2 text-xs text-emerald-200">
                        {scanResult.positives.map((pos, idx) => (
                          <div key={idx} className="flex items-start gap-2.5 bg-emerald-950/20 p-2.5 rounded-xl border border-emerald-500/10">
                            <Check className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                            <span className="leading-relaxed">{pos}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Warnings Card */}
                    <div className="p-5 rounded-2xl bg-rose-500/5 border border-rose-500/20 space-y-3">
                      <h4 className="text-xs font-bold text-rose-400 uppercase tracking-wider flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4" />
                        <span>Identified Vulnerabilities & Risks ({scanResult.warnings.length})</span>
                      </h4>
                      {scanResult.warnings.length === 0 ? (
                        <div className="flex items-center gap-2 text-xs text-slate-400 p-4 bg-slate-900/50 rounded-xl border border-slate-800">
                          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                          <span>No critical risk factors detected for this domain.</span>
                        </div>
                      ) : (
                        <div className="space-y-2 text-xs text-rose-200">
                          {scanResult.warnings.map((warn, idx) => (
                            <div key={idx} className="flex items-start gap-2.5 bg-rose-950/20 p-2.5 rounded-xl border border-rose-500/10">
                              <XCircle className="w-4 h-4 text-rose-400 mt-0.5 flex-shrink-0" />
                              <span className="leading-relaxed">{warn}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Technical Diagnostics Accordion */}
                  <div className="pt-3 border-t border-slate-800">
                    <button
                      type="button"
                      onClick={() => setShowTechnicalDetails(!showTechnicalDetails)}
                      className="flex items-center justify-between w-full text-xs font-bold text-sky-400 uppercase tracking-wider py-2 hover:text-sky-300 transition-colors"
                    >
                      <span className="flex items-center gap-2">
                        <Cpu className="w-4 h-4" /> Deep Technical Telemetry & Security Headers
                      </span>
                      {showTechnicalDetails ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>

                    {showTechnicalDetails && (
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4 animate-fadeIn">
                        {/* TLS Certificate */}
                        <div className="p-4 rounded-xl bg-[#0b1120] border border-slate-800 space-y-3">
                          <h5 className="text-xs font-bold text-sky-400 flex items-center gap-1.5">
                            <Key className="w-3.5 h-3.5" /> TLS Certificate Info
                          </h5>
                          <div className="space-y-2 text-xs">
                            <div className="flex justify-between border-b border-slate-800 pb-1.5">
                              <span className="text-slate-400">Issuer</span>
                              <span className="text-slate-200 font-bold">{scanResult.certificates.issuer || 'None'}</span>
                            </div>
                            <div className="flex justify-between border-b border-slate-800 pb-1.5">
                              <span className="text-slate-400">Protocol</span>
                              <span className="text-slate-200 font-mono text-[11px]">{scanResult.certificates.protocol}</span>
                            </div>
                            <div className="flex justify-between border-b border-slate-800 pb-1.5">
                              <span className="text-slate-400">Cipher</span>
                              <span className="text-slate-200 font-mono text-[11px] truncate max-w-[140px]">
                                {scanResult.certificates.cipher}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-400">Days to Expiration</span>
                              <span className="text-emerald-400 font-bold">{scanResult.certificates.daysRemaining} days</span>
                            </div>
                          </div>
                        </div>

                        {/* Security Headers */}
                        <div className="p-4 rounded-xl bg-[#0b1120] border border-slate-800 space-y-3">
                          <h5 className="text-xs font-bold text-purple-400 flex items-center gap-1.5">
                            <FileCode className="w-3.5 h-3.5" /> HTTP Security Headers
                          </h5>
                          <div className="space-y-2 text-xs">
                            <div className="flex justify-between items-center border-b border-slate-800 pb-1.5">
                              <span className="text-slate-300">Strict-Transport-Security</span>
                              {scanResult.headersAnalysis.strictTransportSecurity.status ? (
                                <span className="flex items-center gap-1 text-emerald-400 font-bold">
                                  <CheckCircle2 className="w-3.5 h-3.5" /> Present
                                </span>
                              ) : (
                                <span className="flex items-center gap-1 text-rose-400 font-bold">
                                  <XCircle className="w-3.5 h-3.5" /> Missing
                                </span>
                              )}
                            </div>
                            <div className="flex justify-between items-center border-b border-slate-800 pb-1.5">
                              <span className="text-slate-300">Content-Security-Policy</span>
                              {scanResult.headersAnalysis.contentSecurityPolicy.status ? (
                                <span className="flex items-center gap-1 text-emerald-400 font-bold">
                                  <CheckCircle2 className="w-3.5 h-3.5" /> Present
                                </span>
                              ) : (
                                <span className="flex items-center gap-1 text-rose-400 font-bold">
                                  <XCircle className="w-3.5 h-3.5" /> Missing
                                </span>
                              )}
                            </div>
                            <div className="flex justify-between items-center border-b border-slate-800 pb-1.5">
                              <span className="text-slate-300">X-Frame-Options</span>
                              {scanResult.headersAnalysis.xFrameOptions.status ? (
                                <span className="flex items-center gap-1 text-emerald-400 font-bold">
                                  <CheckCircle2 className="w-3.5 h-3.5" /> Present
                                </span>
                              ) : (
                                <span className="flex items-center gap-1 text-rose-400 font-bold">
                                  <XCircle className="w-3.5 h-3.5" /> Missing
                                </span>
                              )}
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-slate-300">X-Content-Type-Options</span>
                              {scanResult.headersAnalysis.xContentTypeOptions.status ? (
                                <span className="flex items-center gap-1 text-emerald-400 font-bold">
                                  <CheckCircle2 className="w-3.5 h-3.5" /> Present
                                </span>
                              ) : (
                                <span className="flex items-center gap-1 text-rose-400 font-bold">
                                  <XCircle className="w-3.5 h-3.5" /> Missing
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* DNS Infrastructure */}
                        <div className="p-4 rounded-xl bg-[#0b1120] border border-slate-800 space-y-3">
                          <h5 className="text-xs font-bold text-pink-400 flex items-center gap-1.5">
                            <Server className="w-3.5 h-3.5" /> DNS & Infrastructure
                          </h5>
                          <div className="space-y-2 text-xs">
                            <div className="flex justify-between border-b border-slate-800 pb-1.5">
                              <span className="text-slate-400">Resolved IP</span>
                              <span className="text-slate-200 font-mono font-bold">{scanResult.dnsInfo.resolvedIp}</span>
                            </div>
                            <div className="flex justify-between border-b border-slate-800 pb-1.5">
                              <span className="text-slate-400">Autonomous System</span>
                              <span className="text-slate-200 truncate max-w-[140px]">{scanResult.dnsInfo.asn}</span>
                            </div>
                            <div className="flex justify-between border-b border-slate-800 pb-1.5">
                              <span className="text-slate-400">Geo Origin</span>
                              <span className="text-slate-200">{scanResult.dnsInfo.country}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-400">Record Types</span>
                              <span className="text-sky-400 font-bold">{scanResult.dnsInfo.records.length} records</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── TAB 2: SIDE BY SIDE COMPARATOR ────────────────────────────────────── */}
        {activeTab === 'compare' && (
          <div className="animate-fadeIn">
            <SiteComparison token={token} />
          </div>
        )}

        {/* ── TAB 3: SECURITY GLOSSARY ────────────────────────────────────────── */}
        {activeTab === 'glossary' && (
          <div className="animate-fadeIn">
            <Glossary />
          </div>
        )}

        {/* ── TAB 4: SCAN HISTORY ─────────────────────────────────────────────── */}
        {activeTab === 'history' && (
          <div className="space-y-6 animate-fadeIn">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                  <History className="w-6 h-6 text-sky-400" />
                  Audit History & Logs
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  All website security inspections and comparisons stored persistently in your MongoDB database.
                </p>
              </div>
              <button
                type="button"
                onClick={loadHistory}
                className="text-xs font-bold text-slate-200 hover:text-white flex items-center gap-2 transition-colors px-4 py-2 rounded-xl bg-slate-850 hover:bg-slate-800 border border-slate-700"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${historyLoading ? 'animate-spin' : ''}`} />
                <span>Refresh Log</span>
              </button>
            </div>

            {historyLoading && (
              <div className="flex items-center justify-center py-20">
                <div className="spinner" />
              </div>
            )}

            {!historyLoading && history.length === 0 && (
              <div className="glass-card p-12 text-center border-slate-800">
                <Search className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                <h3 className="text-base font-bold text-slate-300 mb-1">No Scan History Recorded Yet</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Run a website audit or comparison in the Inspector or Comparator tabs to generate persistent telemetry records.
                </p>
              </div>
            )}

            {!historyLoading && history.length > 0 && (
              <div className="space-y-3">
                {history.map((item) => {
                  const isCompare = item.scanType === 'compare';
                  return (
                    <div
                      key={item._id}
                      className="glass-card p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-slate-800 hover:border-sky-500/40 transition-all shadow-md"
                    >
                      <div className="flex items-center gap-4">
                        <div
                          className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
                            isCompare
                              ? 'bg-purple-500/10 border border-purple-500/20 text-purple-400'
                              : 'bg-sky-500/10 border border-sky-500/20 text-sky-400'
                          }`}
                        >
                          {isCompare ? <GitCompare className="w-6 h-6" /> : <Globe className="w-6 h-6" />}
                        </div>
                        <div>
                          <p className="text-base font-bold text-white">{item.url}</p>
                          <p className="text-xs text-slate-400 mt-0.5">
                            {new Date(item.createdAt).toLocaleString()} ·{' '}
                            <span className={isCompare ? 'text-purple-400 font-semibold' : 'text-sky-400 font-semibold'}>
                              {isCompare ? 'Side-by-Side Comparison' : 'Single Site Audit'}
                            </span>
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 self-end sm:self-center">
                        <button
                          type="button"
                          onClick={() => {
                            if (isCompare) {
                              setActiveTab('compare');
                            } else {
                              setScanUrl(item.url);
                              setActiveTab('scan');
                              handleScan(undefined, item.url);
                            }
                          }}
                          className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-sky-500/20 border border-slate-700 hover:border-sky-500/40 text-xs font-bold text-slate-200 hover:text-sky-300 flex items-center gap-1.5 transition-all"
                        >
                          <span>Rerun Audit</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
