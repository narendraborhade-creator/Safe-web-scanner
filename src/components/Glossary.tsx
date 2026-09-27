import React, { useState, useMemo } from 'react';
import {
  BookOpen, Search, Filter, Shield, AlertTriangle, CheckCircle2,
  ChevronDown, ChevronUp, Copy, Check, Info, Sparkles, ExternalLink
} from 'lucide-react';
import { GLOSSARY_ITEMS, GLOSSARY_CATEGORIES, GlossaryItem } from '../data/glossaryData';

export default function Glossary() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedLevel, setSelectedLevel] = useState<string>('All');
  const [expandedId, setExpandedId] = useState<string | null>('https');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const filteredItems = useMemo(() => {
    return GLOSSARY_ITEMS.filter((item) => {
      const matchesSearch =
        item.term.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.shortDef.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.detailedExplanation.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.acronym && item.acronym.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesCategory =
        selectedCategory === 'All' || item.category === selectedCategory;

      const matchesLevel =
        selectedLevel === 'All' || item.level === selectedLevel;

      return matchesSearch && matchesCategory && matchesLevel;
    });
  }, [searchTerm, selectedCategory, selectedLevel]);

  const handleCopy = (item: GlossaryItem) => {
    const text = `${item.term}\n\nDefinition: ${item.shortDef}\n\nWhy it matters: ${item.whyItMatters}\n\nExample: ${item.example}`;
    navigator.clipboard.writeText(text);
    setCopiedId(item.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const getRiskBadge = (risk?: string) => {
    switch (risk) {
      case 'Critical':
        return 'bg-rose-500/15 border-rose-500/30 text-rose-400 font-bold';
      case 'High':
        return 'bg-orange-500/15 border-orange-500/30 text-orange-400 font-bold';
      case 'Medium':
        return 'bg-amber-500/15 border-amber-500/30 text-amber-400 font-bold';
      case 'Low':
        return 'bg-sky-500/15 border-sky-500/30 text-sky-400 font-bold';
      default:
        return 'bg-slate-700/50 border-slate-600 text-slate-400 font-bold';
    }
  };

  const getLevelBadge = (level: string) => {
    switch (level) {
      case 'Beginner':
        return 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400 font-bold';
      case 'Intermediate':
        return 'bg-sky-500/15 border-sky-500/30 text-sky-400 font-bold';
      case 'Advanced':
        return 'bg-purple-500/15 border-purple-500/30 text-purple-400 font-bold';
      default:
        return 'bg-slate-700 text-slate-400 font-bold';
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header Banner */}
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-500/10 border border-sky-500/20 text-sky-400 text-xs font-bold uppercase tracking-wider mb-2">
          <BookOpen className="w-3.5 h-3.5" /> Educational Knowledge Base
        </div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">
          Web Security & Threat <span className="gradient-text">Glossary</span>
        </h1>
        <p className="text-slate-400 text-sm mt-1 max-w-2xl">
          Learn essential cybersecurity concepts, transport protocols, defensive headers, and scam attack vectors in plain language.
        </p>
      </div>

      {/* Search & Filter Control Bar */}
      <div className="card p-6 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
          {/* Clean Search Input with Flexbox Wrapper (Zero Collisions) */}
          <div className="md:col-span-6 flex items-center bg-[#070b14] border border-slate-700 focus-within:border-sky-500 focus-within:ring-2 focus-within:ring-sky-500/20 rounded-xl px-4 py-3 gap-3 transition-all">
            <Search className="w-5 h-5 text-sky-400 flex-shrink-0" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search concepts, acronyms (e.g. HSTS, CSP, MITM, Phishing)..."
              className="bg-transparent text-white text-sm w-full outline-none placeholder-slate-500"
            />
          </div>

          {/* Category Dropdown */}
          <div className="md:col-span-3">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full bg-[#070b14] border border-slate-700 focus:border-sky-500 text-slate-200 text-sm rounded-xl px-4 py-3 outline-none cursor-pointer"
            >
              {GLOSSARY_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  Category: {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Level Dropdown */}
          <div className="md:col-span-3">
            <select
              value={selectedLevel}
              onChange={(e) => setSelectedLevel(e.target.value)}
              className="w-full bg-[#070b14] border border-slate-700 focus:border-sky-500 text-slate-200 text-sm rounded-xl px-4 py-3 outline-none cursor-pointer"
            >
              <option value="All">Level: All Complexity</option>
              <option value="Beginner">Level: Beginner Friendly</option>
              <option value="Intermediate">Level: Intermediate</option>
              <option value="Advanced">Level: Advanced Concepts</option>
            </select>
          </div>
        </div>

        {/* Quick Category Filter Pills */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-800">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mr-1">
            Filter Topics:
          </span>
          {GLOSSARY_CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`text-xs px-3 py-1.5 rounded-lg border font-semibold transition-all duration-200 ${
                selectedCategory === cat
                  ? 'bg-sky-500/20 text-sky-300 border-sky-500/40 shadow-sm'
                  : 'bg-slate-800/60 text-slate-400 border-slate-700 hover:text-white hover:bg-slate-800'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Glossary Items List */}
      {filteredItems.length === 0 ? (
        <div className="card p-12 text-center border-slate-800">
          <Search className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-300 mb-1">No Glossary Terms Found</h3>
          <p className="text-xs text-slate-500">
            Try adjusting your search keyword or selecting "Category: All".
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredItems.map((item) => {
            const isExpanded = expandedId === item.id;
            return (
              <div
                key={item.id}
                className={`card p-6 transition-all duration-200 border ${
                  isExpanded
                    ? 'border-sky-500/40 bg-[#151e33] shadow-lg shadow-sky-500/5'
                    : 'hover:border-slate-700'
                }`}
              >
                {/* Header Row */}
                <div
                  className="flex items-start justify-between gap-4 cursor-pointer select-none"
                  onClick={() => setExpandedId(isExpanded ? null : item.id)}
                >
                  <div className="space-y-2 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-lg font-extrabold text-white">
                        {item.term}
                      </h3>
                      <span className={`text-[11px] px-2.5 py-0.5 rounded-md border ${getLevelBadge(item.level)}`}>
                        {item.level}
                      </span>
                      <span className="text-[11px] px-2.5 py-0.5 rounded-md bg-slate-800 text-slate-300 border border-slate-700 font-semibold">
                        {item.category}
                      </span>
                      {item.riskIfMissing && (
                        <span className={`text-[11px] px-2.5 py-0.5 rounded-md border ${getRiskBadge(item.riskIfMissing)}`}>
                          Risk: {item.riskIfMissing}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-slate-300 leading-relaxed font-medium">
                      {item.shortDef}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 mt-0.5 flex-shrink-0">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCopy(item);
                      }}
                      title="Copy explanation"
                      className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                    >
                      {copiedId === item.id ? (
                        <Check className="w-4 h-4 text-emerald-400" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </button>
                    <div className="p-2 text-sky-400">
                      {isExpanded ? (
                        <ChevronUp className="w-5 h-5" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-slate-400" />
                      )}
                    </div>
                  </div>
                </div>

                {/* Expanded Detailed Breakdown */}
                {isExpanded && (
                  <div className="mt-5 pt-5 border-t border-slate-800 space-y-4 animate-fadeIn">
                    <div>
                      <h4 className="text-xs font-bold text-sky-400 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                        <Info className="w-4 h-4" /> How it Works & Technical Details
                      </h4>
                      <p className="text-slate-300 text-sm leading-relaxed bg-[#070b14] p-4 rounded-xl border border-slate-800">
                        {item.detailedExplanation}
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Why it Matters */}
                      <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/20 space-y-1">
                        <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                          <AlertTriangle className="w-4 h-4" /> Why It Matters to You
                        </h4>
                        <p className="text-slate-300 text-xs leading-relaxed">
                          {item.whyItMatters}
                        </p>
                      </div>

                      {/* Real-World Example */}
                      <div className="p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/20 space-y-1">
                        <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                          <CheckCircle2 className="w-4 h-4" /> Real-World Example
                        </h4>
                        <p className="text-slate-300 text-xs font-mono leading-relaxed break-all">
                          {item.example}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
