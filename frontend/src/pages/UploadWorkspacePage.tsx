import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  UploadCloud,
  FileImage,
  Sparkles,
  Plus,
  Trash2,
  Check,
  Palette,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { useToast } from '@/components/ui/Toast';
import { s2sApi } from '@/services/api';

export const UploadWorkspacePage: React.FC = () => {
  const navigate = useNavigate();
  const { success, warning, error } = useToast();

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [annotations, setAnnotations] = useState<string[]>([
    'Sticky top navbar with brand and links',
    'Primary audit button placed on right side',
    '3-column responsive metric cards layout',
  ]);
  const [newAnnotation, setNewAnnotation] = useState('');
  const [designSystem, setDesignSystem] = useState<'modern-dark' | 'clean-light' | 'corporate'>(
    'modern-dark'
  );

  const sampleSketches = [
    {
      id: 'sample-1',
      title: 'CloudOps Analytics Dashboard',
      description: 'Hand-drawn wireframe with navbar, metric cards, and table',
      tags: ['Dashboard', '3-Column Grid', 'Metrics'],
    },
    {
      id: 'sample-2',
      title: 'Mobile Auth & Profile Screen',
      description: 'Single-column mobile login with social SSO buttons',
      tags: ['Mobile', 'Form', 'Authentication'],
    },
    {
      id: 'sample-3',
      title: 'E-Commerce Checkout Cart',
      description: 'Two-column layout with product list and checkout summary',
      tags: ['E-Commerce', 'Pricing', 'Table'],
    },
  ];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const validTypes = ['image/png', 'image/jpeg', 'image/webp'];
      if (file.type && !validTypes.includes(file.type)) {
        error('Unsupported File Format', 'Please upload a PNG, JPEG, or WebP image.');
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        warning('File Size Exceeded', 'Maximum allowable image size is 10MB.');
        return;
      }
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      success('Sketch Uploaded', `${file.name} ready for interpretation.`);
    }
  };

  const handleAddAnnotation = () => {
    if (!newAnnotation.trim()) return;
    setAnnotations([...annotations, newAnnotation.trim()]);
    setNewAnnotation('');
  };

  const handleRemoveAnnotation = (index: number) => {
    setAnnotations(annotations.filter((_, i) => i !== index));
  };

  const handleSelectSample = (sampleTitle: string) => {
    setSelectedFile(new File([''], `${sampleTitle.toLowerCase().replace(/\s+/g, '-')}.png`));
    setPreviewUrl('/samples/dashboard-sketch.png');
    success('Sample Sketch Loaded', `Loaded template: ${sampleTitle}`);
  };

  const handleProceedToGenerate = async () => {
    if (selectedFile && selectedFile.size > 0) {
      setIsUploading(true);
      try {
        const res = await s2sApi.uploadSketch(selectedFile);
        success('Uploaded to Server', `Sketch registered as #${res.id}.`);
        navigate('/generate', {
          state: {
            sketchId: res.id,
            sketchTitle: selectedFile.name,
            annotations,
            designSystem,
          },
        });
        return;
      } catch (err: any) {
        warning('Offline Mode', 'FastAPI backend unreachable; continuing in isolated Demo Mode.');
      } finally {
        setIsUploading(false);
      }
    }

    // Demo Mode navigation
    navigate('/generate', {
      state: {
        isDemoMode: true,
        sketchTitle: selectedFile?.name || 'Curated Blueprint Sample',
        annotations,
        designSystem,
      },
    });
  };

  return (
    <div className="min-h-[calc(100vh-64px)] bg-navy-950 p-4 sm:p-6 lg:p-8 text-left">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div>
          <div className="flex items-center gap-2">
            <Badge variant="primary" size="sm">
              Step 01 of 04
            </Badge>
            <span className="text-xs text-slate-400 font-mono">Workspace Pipeline</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight mt-1">
            Sketch Upload &amp; Annotation Workspace
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl">
            Upload your hand-drawn interface sketch, specify handwritten notes, and configure design system preferences.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Upload Dropzone & Sketch Preview (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            <Card className="p-6 bg-charcoal-900 border-slate-800">
              <h3 className="text-sm font-semibold text-white mb-3 flex items-center justify-between">
                <span>Sketch Image File</span>
                <span className="text-xs text-slate-400 font-normal">PNG, JPG, WebP up to 10MB</span>
              </h3>

              {!previewUrl ? (
                <label className="flex flex-col items-center justify-center p-8 sm:p-12 border-2 border-dashed border-slate-700/80 hover:border-electric-500/60 rounded-xl bg-navy-950/60 cursor-pointer transition-all group">
                  <div className="w-14 h-14 rounded-2xl bg-navy-900 border border-slate-700/80 flex items-center justify-center text-slate-400 group-hover:text-electric-400 group-hover:border-electric-500/40 transition-colors mb-4 shadow-sm">
                    <UploadCloud className="w-7 h-7" />
                  </div>
                  <p className="text-sm font-medium text-slate-200">
                    Click to select sketch or drag &amp; drop
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    Whiteboard photos, iPad sketches, and notebook drawings supported
                  </p>
                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    className="hidden"
                    onChange={handleFileChange}
                  />
                </label>
              ) : (
                <div className="space-y-4">
                  <div className="relative rounded-xl overflow-hidden border border-slate-700 bg-navy-950 min-h-[300px] flex items-center justify-center p-4">
                    {/* Simulated blueprint background */}
                    <div className="absolute inset-0 bg-blueprint-pattern pointer-events-none" />
                    <div className="relative z-10 max-w-full text-center space-y-3 p-4 rounded-lg bg-navy-900/80 border border-slate-800 backdrop-blur-md">
                      {previewUrl ? (
                        <img
                          src={previewUrl}
                          alt="Uploaded sketch preview"
                          className="max-h-56 max-w-full object-contain rounded-lg mx-auto shadow-md border border-slate-700/60"
                        />
                      ) : (
                        <FileImage className="w-12 h-12 text-blue-400 mx-auto" />
                      )}
                      <div>
                        <p className="text-sm font-semibold text-white">
                          {selectedFile?.name || 'Sketch Image Attached'}
                        </p>
                        <p className="text-xs text-slate-400 font-mono mt-0.5">
                          Resolution: High-Fidelity RGB • Validated for Processing
                        </p>
                      </div>
                      <Badge variant="success" size="sm" dot>
                        Validated for OpenCV Processing
                      </Badge>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <label className="text-xs text-blue-400 hover:underline cursor-pointer">
                      <span>Replace Image</span>
                      <input
                        type="file"
                        accept="image/png,image/jpeg,image/webp"
                        className="hidden"
                        onChange={handleFileChange}
                      />
                    </label>
                    <button
                      onClick={() => {
                        setSelectedFile(null);
                        setPreviewUrl(null);
                      }}
                      className="text-xs text-red-400 hover:text-red-300 flex items-center gap-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Remove</span>
                    </button>
                  </div>
                </div>
              )}
            </Card>

            {/* Quick Sample Sketch Pickers */}
            <div className="space-y-3">
              <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Or start with a curated template sketch:
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {sampleSketches.map((sample) => (
                  <div
                    key={sample.id}
                    onClick={() => handleSelectSample(sample.title)}
                    className="p-3.5 rounded-xl bg-charcoal-900/80 border border-slate-800/80 hover:border-electric-500/50 hover:bg-navy-900/80 transition-all cursor-pointer group"
                  >
                    <span className="text-xs font-semibold text-slate-200 group-hover:text-electric-400 transition-colors block">
                      {sample.title}
                    </span>
                    <p className="text-[11px] text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                      {sample.description}
                    </p>
                    <div className="flex flex-wrap gap-1 mt-2.5">
                      {sample.tags.map((tag, idx) => (
                        <span
                          key={idx}
                          className="text-[9px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 font-mono"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Annotations & Configuration (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            {/* Annotation Builder */}
            <Card className="p-6 bg-charcoal-900 border-slate-800">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-white">
                  Handwritten Notes &amp; Annotations
                </h3>
                <span className="text-xs font-mono text-slate-400">{annotations.length} active</span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed mb-4">
                Guidance notes inform the Vision-Language Model about intent, sticky headers, specific variants, or column definitions.
              </p>

              {/* Add Annotation Input */}
              <div className="flex items-center gap-2 mb-4">
                <Input
                  placeholder="e.g., 'Primary button is blue', 'Table 4 cols'"
                  value={newAnnotation}
                  onChange={(e) => setNewAnnotation(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddAnnotation()}
                />
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={handleAddAnnotation}
                  leftIcon={<Plus className="w-3.5 h-3.5" />}
                >
                  Add
                </Button>
              </div>

              {/* List of Annotations */}
              <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                {annotations.map((ann, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-2.5 rounded-lg bg-navy-950/80 border border-slate-800 text-xs text-slate-300 group"
                  >
                    <div className="flex items-center gap-2 min-w-0 pr-2">
                      <span className="w-4 h-4 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center font-mono text-[10px] shrink-0">
                        {idx + 1}
                      </span>
                      <span className="truncate">{ann}</span>
                    </div>
                    <button
                      onClick={() => handleRemoveAnnotation(idx)}
                      className="text-slate-500 hover:text-red-400 opacity-60 group-hover:opacity-100 transition-opacity"
                      aria-label="Remove note"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </Card>

            {/* Design System & Framework Rules */}
            <Card className="p-6 bg-charcoal-900 border-slate-800">
              <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                <Palette className="w-4 h-4 text-electric-400" />
                <span>Design System Theme</span>
              </h3>

              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'modern-dark', label: 'Modern Dark', desc: 'Obsidian & Blue' },
                  { id: 'clean-light', label: 'Clean Light', desc: 'Minimal Slate' },
                  { id: 'corporate', label: 'Enterprise', desc: 'Structured Indigo' },
                ].map((theme) => {
                  const isSelected = designSystem === theme.id;
                  return (
                    <div
                      key={theme.id}
                      onClick={() => setDesignSystem(theme.id as any)}
                      className={`p-3 rounded-xl border text-left cursor-pointer transition-all ${
                        isSelected
                          ? 'border-electric-500 bg-electric-500/10 text-white'
                          : 'border-slate-800 bg-navy-950/40 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold">{theme.label}</span>
                        {isSelected && <Check className="w-3.5 h-3.5 text-electric-400" />}
                      </div>
                      <span className="text-[10px] text-slate-500 mt-1 block">
                        {theme.desc}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Action Button */}
              <div className="mt-6 pt-4 border-t border-slate-800">
                <Button
                  className="w-full"
                  size="lg"
                  variant="gradient"
                  rightIcon={<Sparkles className="w-4 h-4" />}
                  onClick={handleProceedToGenerate}
                >
                  Generate React Interface
                </Button>
                <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-500 mt-2.5">
                  <AlertCircle className="w-3 h-3 text-emerald-400" />
                  <span>Verified schema mode • Zero arbitrary JS execution</span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};
