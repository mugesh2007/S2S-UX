import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Sparkles,
  ArrowRight,
  UploadCloud,
  Layers,
  Cpu,
  Code2,
  CheckCircle2,
  ShieldCheck,
  Zap,
  Terminal,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';

export const LandingPage: React.FC = () => {
  return (
    <div className="relative min-h-screen bg-navy-950 text-slate-100 overflow-hidden">
      {/* Background Glows */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[550px] bg-electric-gradient pointer-events-none" />
      <div className="absolute top-1/3 left-10 w-72 h-72 rounded-full bg-violet-600/10 blur-[100px] pointer-events-none" />
      <div className="absolute top-1/4 right-10 w-80 h-80 rounded-full bg-electric-500/10 blur-[120px] pointer-events-none" />

      {/* Hero Section */}
      <section className="relative pt-20 pb-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-navy-900 border border-slate-700/60 mb-6 shadow-sm"
        >
          <Sparkles className="w-3.5 h-3.5 text-electric-400" />
          <span className="text-xs font-medium text-slate-300">
            Next-Gen Vision-Language Multimodal Engine
          </span>
          <Badge variant="violet" size="sm">
            v1.0 Ready
          </Badge>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white max-w-4xl mx-auto leading-[1.1]"
        >
          From Hand-Drawn Ideas to{' '}
          <span className="text-gradient-electric">Editable Interfaces</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mt-6 text-lg sm:text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed"
        >
          Transform wireframes, whiteboard napkin sketches, and annotated mockups into
          clean, production-ready React components with Tailwind CSS. Safe, sandbox-rendered, and mathematically verified.
        </motion.p>

        {/* Hero CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mt-10 flex flex-wrap items-center justify-center gap-4"
        >
          <Link to="/upload">
            <Button
              size="lg"
              variant="gradient"
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Start Creating
            </Button>
          </Link>
          <a href="#workflow">
            <Button size="lg" variant="secondary">
              Explore the Workflow
            </Button>
          </a>
        </motion.div>

        {/* Product Preview Card */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.4 }}
          className="mt-16 relative max-w-5xl mx-auto rounded-2xl p-2 bg-gradient-to-b from-slate-700/40 via-slate-800/20 to-transparent border border-slate-700/50 shadow-2xl"
        >
          <div className="rounded-xl overflow-hidden bg-charcoal-900 border border-slate-800 shadow-2xl">
            {/* Studio Header Mockup */}
            <div className="flex items-center justify-between px-4 py-3 bg-navy-900/90 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-red-500/80 inline-block" />
                <span className="w-3 h-3 rounded-full bg-amber-500/80 inline-block" />
                <span className="w-3 h-3 rounded-full bg-emerald-500/80 inline-block" />
                <span className="ml-3 text-xs font-mono text-slate-400">
                  sketch-to-screen-studio.tsx
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="success" size="sm" dot>
                  Fidelity: 88.5%
                </Badge>
                <Badge variant="primary" size="sm">
                  14 React Nodes
                </Badge>
              </div>
            </div>

            {/* Side-by-side interactive demo split */}
            <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-slate-800">
              {/* Left: Original Sketch Simulation */}
              <div className="p-6 bg-navy-950/60 bg-blueprint-pattern flex flex-col justify-between min-h-[360px] text-left">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-mono text-blue-400 font-semibold uppercase tracking-wider">
                      [1] Hand-Drawn Sketch Input
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono">1280x800 px</span>
                  </div>

                  {/* Wireframe representation */}
                  <div className="border-2 border-dashed border-blue-500/40 rounded-xl p-4 bg-navy-900/50 space-y-4 font-mono text-xs text-slate-400">
                    <div className="border border-blue-400/30 rounded p-2 flex justify-between items-center text-blue-300">
                      <span>[NAVBAR: Brand + 4 Links + Profile]</span>
                      <span className="text-[10px] bg-blue-500/20 px-1.5 py-0.5 rounded">
                        Note: Sticky
                      </span>
                    </div>
                    <div className="flex justify-between items-center border border-dashed border-slate-700 p-2">
                      <span className="text-slate-300 font-bold">&quot;System Metrics &amp; Health&quot;</span>
                      <span className="border border-blue-400/50 px-2 py-1 text-blue-300 rounded">
                        [BTN: Run Health Audit]
                      </span>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <div className="border border-slate-700 p-2 rounded text-center">
                        <span className="text-[11px] block">Latency</span>
                        <span className="font-bold text-slate-200">24.8ms</span>
                      </div>
                      <div className="border border-slate-700 p-2 rounded text-center">
                        <span className="text-[11px] block">CPU Pool</span>
                        <span className="font-bold text-slate-200">42.6%</span>
                      </div>
                      <div className="border border-slate-700 p-2 rounded text-center">
                        <span className="text-[11px] block">Defenses</span>
                        <span className="font-bold text-slate-200">1,429</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
                  <span>Annotation Parser: 4 notes detected</span>
                  <span className="text-emerald-400 font-medium">Contour Pass: OK</span>
                </div>
              </div>

              {/* Right: Rendered React UI Simulation */}
              <div className="p-6 bg-slate-950 flex flex-col justify-between min-h-[360px] text-left">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-mono text-emerald-400 font-semibold uppercase tracking-wider">
                      [2] Generated Live React UI
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono">Tailwind CSS</span>
                  </div>

                  {/* Clean rendered mini component */}
                  <div className="rounded-xl border border-slate-800 bg-slate-900/90 p-4 space-y-4">
                    <div className="flex items-center justify-between px-3 py-2 rounded-lg bg-slate-800/80 border border-slate-700/60">
                      <span className="font-bold text-xs text-white">CloudOps AI</span>
                      <div className="flex items-center gap-2 text-[10px] text-slate-300">
                        <span>Overview</span>
                        <span>Clusters</span>
                        <div className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-[9px]">
                          U
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-bold text-white">System Metrics &amp; Health</h4>
                      <button className="px-2.5 py-1 text-xs rounded-md bg-blue-600 text-white font-medium shadow-sm">
                        Run Health Audit
                      </button>
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                      <div className="bg-slate-950 p-2 rounded-lg border border-slate-800 text-left">
                        <span className="text-[10px] text-slate-400">Latency</span>
                        <span className="text-sm font-bold text-blue-400 font-mono block">24.8 ms</span>
                        <span className="text-[9px] text-emerald-400">Optimal</span>
                      </div>
                      <div className="bg-slate-950 p-2 rounded-lg border border-slate-800 text-left">
                        <span className="text-[10px] text-slate-400">CPU Pool</span>
                        <span className="text-sm font-bold text-violet-400 font-mono block">42.6%</span>
                        <span className="text-[9px] text-blue-400">Normal</span>
                      </div>
                      <div className="bg-slate-950 p-2 rounded-lg border border-slate-800 text-left">
                        <span className="text-[10px] text-slate-400">Defenses</span>
                        <span className="text-sm font-bold text-amber-400 font-mono block">1,429</span>
                        <span className="text-[9px] text-amber-400">Mitigated</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
                  <span>Export: Modular TSX + Tailwind</span>
                  <Link to="/editor" className="text-electric-400 hover:underline flex items-center gap-1">
                    <span>Open in Studio</span>
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Feature Sections */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <Badge variant="primary" size="md">
            Architectural Highlights
          </Badge>
          <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight mt-3">
            Engineered for Precision, Safety, and Developers
          </h2>
          <p className="text-sm sm:text-base text-slate-400 max-w-xl mx-auto mt-2">
            No dynamic code execution. No hallucinated fidelity ratings. Real computer vision and strict AST guarantees.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Feature 1 */}
          <Card className="glass-card-hover text-left flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400 mb-5">
                <Cpu className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white tracking-tight">
                Sketch-to-UI Generation
              </h3>
              <p className="text-xs sm:text-sm text-slate-400 mt-2.5 leading-relaxed">
                Powered by a configurable Vision-Language Model provider. Extracts layout grids, recognizes handwritten notes, arrow references, and custom badges without hallucinating.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center gap-2 text-xs text-blue-400 font-mono">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Annotation-aware parsing</span>
            </div>
          </Card>

          {/* Feature 2 */}
          <Card className="glass-card-hover text-left flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-xl bg-violet-500/10 border border-violet-500/30 flex items-center justify-center text-violet-400 mb-5">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white tracking-tight">
                Sketch Fidelity Checker
              </h3>
              <p className="text-xs sm:text-sm text-slate-400 mt-2.5 leading-relaxed">
                Employs OpenCV contour analysis, Hungarian bipartite bounding box IoU alignment, and Canny edge SSIM. Clearly distinguishes measured CV scores from heuristic bounds.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center gap-2 text-xs text-violet-400 font-mono">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>3-Tier mathematical metric</span>
            </div>
          </Card>

          {/* Feature 3 */}
          <Card className="glass-card-hover text-left flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mb-5">
                <Code2 className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white tracking-tight">
                Editable React Export
              </h3>
              <p className="text-xs sm:text-sm text-slate-400 mt-2.5 leading-relaxed">
                Zero arbitrary JavaScript execution. Rendered through an allowlisted component registry, and compiled into clean, idiomatic React TypeScript files or complete Vite ZIP projects.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center gap-2 text-xs text-emerald-400 font-mono">
              <Zap className="w-4 h-4 text-emerald-400" />
              <span>Tailwind CSS + ZIP ready</span>
            </div>
          </Card>
        </div>
      </section>

      {/* Workflow Section */}
      <section id="workflow" className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-slate-800/80">
        <div className="text-center mb-16">
          <Badge variant="violet" size="md">
            Streamlined Pipeline
          </Badge>
          <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight mt-3">
            The 4-Step Engineering Workflow
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 text-left">
          {[
            {
              step: '01',
              title: 'Upload & Annotate',
              desc: 'Drop in your sketch, photograph, or tablet drawing. Pin optional guidance notes or style rules.',
              icon: UploadCloud,
            },
            {
              step: '02',
              title: 'CV & VLM Analysis',
              desc: 'OpenCV filters strokes and contours. The VLM maps visual blocks into a strict AST schema.',
              icon: Cpu,
            },
            {
              step: '03',
              title: 'Inspect & Tweak',
              desc: 'Review the Fidelity Report, click components to edit props or styles, and reorder with undo/redo.',
              icon: Layers,
            },
            {
              step: '04',
              title: 'Export Production Code',
              desc: 'Download a complete Vite+React project ZIP or copy standalone TSX with Tailwind CSS classes.',
              icon: Terminal,
            },
          ].map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="relative p-6 rounded-2xl bg-charcoal-900 border border-slate-800 shadow-sm"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 rounded-xl bg-navy-800 border border-slate-700 flex items-center justify-center text-electric-400">
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="text-2xl font-extrabold font-mono text-slate-700">
                    {item.step}
                  </span>
                </div>
                <h4 className="text-base font-semibold text-slate-100">{item.title}</h4>
                <p className="text-xs text-slate-400 mt-2 leading-relaxed">{item.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6 text-xs text-slate-500">
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 rounded-lg bg-electric-600 flex items-center justify-center text-white font-bold text-xs">
            S
          </div>
          <span className="font-semibold text-slate-300">Sketch2Screen AI</span>
          <span>© 2026 S2S ux Platform. All rights reserved.</span>
        </div>
        <div className="flex items-center gap-6">
          <Link to="/dashboard" className="hover:text-slate-300 transition-colors">
            Dashboard
          </Link>
          <Link to="/editor" className="hover:text-slate-300 transition-colors">
            Studio
          </Link>
          <Link to="/fidelity" className="hover:text-slate-300 transition-colors">
            Fidelity
          </Link>
          <Link to="/settings" className="hover:text-slate-300 transition-colors">
            Settings
          </Link>
        </div>
      </footer>
    </div>
  );
};
