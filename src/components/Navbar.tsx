import React from 'react';
import { useAuth } from '../context/AuthContext';
import {
  Shield, LogOut, User, Search, GitCompare, BookOpen, History,
  Activity, Sparkles
} from 'lucide-react';

export type TabType = 'scan' | 'compare' | 'glossary' | 'history';

interface NavbarProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
}

export default function Navbar({ activeTab, setActiveTab }: NavbarProps) {
  const { user, logout } = useAuth();

  const navItems = [
    { id: 'scan' as TabType, label: 'Scan a site', icon: Search },
    { id: 'compare' as TabType, label: 'Compare sites', icon: GitCompare },
    { id: 'glossary' as TabType, label: 'Glossary', icon: BookOpen },
    { id: 'history' as TabType, label: 'History', icon: History },
  ];

  return (
    <header className="sticky top-0 z-50 bg-[#0b1120]/95 backdrop-blur-md border-b border-slate-800 shadow-lg shadow-black/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between min-h-16 py-2 gap-3">
          {/* Brand Logo */}
          <div
            className="flex items-center gap-3 cursor-pointer group"
            onClick={() => setActiveTab('scan')}
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-500 via-indigo-500 to-purple-600 p-0.5 shadow-md shadow-sky-500/20 group-hover:shadow-sky-500/40 transition-all">
              <div className="w-full h-full bg-[#0b1120] rounded-[10px] flex items-center justify-center">
                <Shield className="w-5 h-5 text-sky-400 group-hover:scale-110 transition-transform" />
              </div>
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-lg font-extrabold text-white tracking-tight">SafeWeb</span>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-sky-500/10 text-sky-400 border border-sky-500/20 uppercase tracking-wider">
                  v2.4
                </span>
              </div>
              <p className="hidden sm:block text-[10px] font-medium text-slate-400 tracking-wider uppercase -mt-0.5 truncate">
                A clearer way to check a website
              </p>
            </div>
          </div>

          {/* Center Navigation Tabs */}
          <nav className="hidden md:flex items-center gap-1.5 p-1 bg-slate-900/90 rounded-xl border border-slate-800">
            {navItems.map((item) => {
              const isActive = activeTab === item.id;
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all duration-200 ${
                    isActive
                      ? 'bg-gradient-to-r from-sky-500 to-indigo-600 text-white shadow-md shadow-sky-500/20'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Right Actions & User Profile */}
          <div className="flex items-center gap-3">
            {/* Live Engine Indicator */}
            <div className="hidden lg:flex items-center gap-2 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[11px] font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>Engine Active</span>
            </div>

            {/* User Pill */}
            <div className="hidden sm:flex items-center gap-2 pl-2 pr-3 py-1 bg-slate-850 rounded-full border border-slate-750">
              <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-sky-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold shadow-inner">
                {user?.username?.charAt(0).toUpperCase() || 'U'}
              </div>
              <span className="text-xs font-bold text-slate-200 max-w-[90px] truncate">
                {user?.username || 'User'}
              </span>
            </div>

            {/* Logout Button */}
            <button
              onClick={logout}
              title="Sign out"
              aria-label="Sign out"
              className="p-2 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 border border-transparent hover:border-rose-500/20 transition-all duration-200"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Mobile Navigation Bar */}
        <div className="flex md:hidden items-center justify-around py-2 border-t border-slate-800">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex min-w-0 items-center justify-center gap-1.5 px-2.5 py-2 rounded-lg text-[11px] font-semibold ${
                  isActive ? 'bg-sky-500/20 text-sky-400 border border-sky-500/30' : 'text-slate-400'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
}
