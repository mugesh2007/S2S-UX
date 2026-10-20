import React, { useState, useEffect } from 'react';
import { NavLink, Link, useLocation } from 'react-router-dom';
import {
  Layers,
  LayoutDashboard,
  UploadCloud,
  Cpu,
  Sliders,
  CheckCircle2,
  History,
  Settings as SettingsIcon,
  Sparkles,
  Menu,
  X,
} from 'lucide-react';
import { cn } from '@/utils/cn';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';

export const AppNavbar: React.FC = () => {
  const location = useLocation();
  const isLanding = location.pathname === '/';
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const navItems = [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/upload', label: 'Upload Sketch', icon: UploadCloud },
    { to: '/generate', label: 'Generation', icon: Cpu },
    { to: '/editor', label: 'Studio Editor', icon: Sliders },
    { to: '/fidelity', label: 'Fidelity Report', icon: CheckCircle2 },
    { to: '/history', label: 'History', icon: History },
    { to: '/settings', label: 'Settings', icon: SettingsIcon },
  ];

  return (
    <header className="sticky top-0 z-40 w-full bg-navy-950/90 backdrop-blur-xl border-b border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand */}
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-electric-600 to-violet-600 flex items-center justify-center text-white shadow-glow-sm group-hover:shadow-glow-md transition-all">
            <Layers className="w-5 h-5 transition-transform group-hover:scale-105" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm tracking-tight text-white group-hover:text-electric-400 transition-colors">
                Sketch2Screen AI
              </span>
              <Badge variant="violet" size="sm">
                v1.0
              </Badge>
            </div>
            <p className="text-[10px] text-slate-400 font-mono hidden sm:block">
              S2S ux • Hand-Drawn to React
            </p>
          </div>
        </Link>

        {/* Navigation Items (Desktop) */}
        {!isLanding && (
          <nav className="hidden md:flex items-center gap-1 bg-charcoal-900/90 border border-slate-800/80 rounded-xl p-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    cn(
                      'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all',
                      isActive
                        ? 'bg-navy-800 text-electric-400 font-semibold shadow-sm border border-slate-700/60'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-navy-850/50'
                    )
                  }
                >
                  <Icon className="w-3.5 h-3.5 shrink-0" />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </nav>
        )}

        {/* Right CTA & Mobile Toggle */}
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="hidden lg:flex items-center gap-2 px-2.5 py-1 rounded-full bg-navy-900 border border-slate-800 text-[11px] font-mono text-slate-300">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Ready</span>
          </div>

          {isLanding ? (
            <Link to="/upload">
              <Button
                size="sm"
                variant="gradient"
                rightIcon={<Sparkles className="w-3.5 h-3.5" />}
              >
                Start Creating
              </Button>
            </Link>
          ) : (
            <Link to="/editor">
              <Button
                size="sm"
                variant="primary"
                leftIcon={<Sliders className="w-3.5 h-3.5" />}
              >
                <span className="hidden sm:inline">Open Studio</span>
                <span className="sm:hidden">Studio</span>
              </Button>
            </Link>
          )}

          {/* Mobile Menu Hamburger Button */}
          {!isLanding && (
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg bg-charcoal-900 border border-slate-800 text-slate-400 hover:text-white transition-colors"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>
          )}
        </div>
      </div>

      {/* Mobile Dropdown Menu Drawer */}
      {!isLanding && mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-800 bg-charcoal-900/95 backdrop-blur-xl px-4 py-3 space-y-1 text-left animate-fade-in shadow-2xl">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={() => setMobileMenuOpen(false)}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-all',
                    isActive
                      ? 'bg-navy-800 text-electric-400 font-semibold border border-slate-700/60'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-navy-850/60'
                  )
                }
              >
                <Icon className="w-4 h-4 shrink-0 text-slate-400" />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </div>
      )}
    </header>
  );
};
