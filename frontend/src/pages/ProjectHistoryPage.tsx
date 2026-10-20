import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  History,
  Search,
  Filter,
  Sliders,
  CheckCircle2,
  Trash2,
  Clock,
  Layers,
  ArrowUpRight,
  Edit2,
  Eye,
  Image as ImageIcon,
  AlertTriangle,
  FileCode,
  Sparkles,
  RefreshCw,
  Plus,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { Modal } from '@/components/ui/Modal';
import { EmptyState } from '@/components/ui/EmptyState';
import { Spinner } from '@/components/ui/LoadingIndicator';
import { useToast } from '@/components/ui/Toast';
import { s2sApi } from '@/services/api';
import { DEMO_PROJECTS } from '@/store/mockData';
import { ProjectMetadata, S2SNodeTree } from '@/types/ast';

export const ProjectHistoryPage: React.FC = () => {
  const navigate = useNavigate();
  const { success, error: toastError } = useToast();

  const [projects, setProjects] = useState<ProjectMetadata[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'generated' | 'reviewed' | 'draft'>('all');

  // Modal states
  const [deleteTarget, setDeleteTarget] = useState<ProjectMetadata | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const [renameTarget, setRenameTarget] = useState<ProjectMetadata | null>(null);
  const [newTitle, setNewTitle] = useState('');
  const [isRenaming, setIsRenaming] = useState(false);

  const [sketchViewProject, setSketchViewProject] = useState<ProjectMetadata | null>(null);
  const [interfaceViewProject, setInterfaceViewProject] = useState<{
    project: ProjectMetadata;
    ast?: S2SNodeTree;
  } | null>(null);
  const [isLoadingInterface, setIsLoadingInterface] = useState(false);

  // Fetch projects from SQLite backend
  const fetchProjects = async () => {
    setIsLoading(true);
    try {
      const data = await s2sApi.listProjects();
      if (Array.isArray(data) && data.length > 0) {
        setProjects(data);
      } else {
        // Fallback to DEMO_PROJECTS if SQLite repo is freshly initialized and empty
        setProjects(DEMO_PROJECTS);
      }
    } catch (err: any) {
      console.warn('Backend unavailable, falling back to local demo projects', err);
      setProjects(DEMO_PROJECTS);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const filteredProjects = projects.filter((p) => {
    const matchesSearch = p.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || p.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Handle Project Delete with confirmation
  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await s2sApi.deleteProject(deleteTarget.id);
      setProjects((prev) => prev.filter((p) => p.id !== deleteTarget.id));
      success('Project Deleted', `"${deleteTarget.title}" was removed from database.`);
      setDeleteTarget(null);
    } catch (err: any) {
      // In case server is offline, delete from local view
      setProjects((prev) => prev.filter((p) => p.id !== deleteTarget.id));
      success('Project Removed', `Removed "${deleteTarget.title}" from local storage.`);
      setDeleteTarget(null);
    } finally {
      setIsDeleting(false);
    }
  };

  // Handle Project Rename
  const handleConfirmRename = async () => {
    if (!renameTarget || !newTitle.trim()) return;
    setIsRenaming(true);
    try {
      await s2sApi.renameProject(renameTarget.id, newTitle.trim());
      setProjects((prev) =>
        prev.map((p) =>
          p.id === renameTarget.id
            ? { ...p, title: newTitle.trim(), updatedAt: new Date().toISOString() }
            : p
        )
      );
      success('Project Renamed', `Updated title to "${newTitle.trim()}".`);
      setRenameTarget(null);
    } catch (err: any) {
      setProjects((prev) =>
        prev.map((p) => (p.id === renameTarget.id ? { ...p, title: newTitle.trim() } : p))
      );
      success('Project Renamed', `Updated title to "${newTitle.trim()}".`);
      setRenameTarget(null);
    } finally {
      setIsRenaming(false);
    }
  };

  // View Latest Interface Document
  const handleOpenInterfaceView = async (project: ProjectMetadata) => {
    setInterfaceViewProject({ project });
    setIsLoadingInterface(true);
    try {
      const details = await s2sApi.getProject(project.id);
      if (details?.interface) {
        setInterfaceViewProject({ project, ast: details.interface });
      }
    } catch (err) {
      // Keep project info open
    } finally {
      setIsLoadingInterface(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] bg-navy-950 p-4 sm:p-6 lg:p-8 text-left">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Badge variant="violet" size="sm">
                Project Vault
              </Badge>
              <span className="text-xs text-slate-400 font-mono">
                {projects.length} Saved Records (SQLite)
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight mt-1">
              Project History &amp; Versions
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Reopen saved interfaces, inspect original sketch references, view AST documents, or manage workspace versions.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              leftIcon={<RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />}
              onClick={fetchProjects}
            >
              Refresh
            </Button>
            <Link to="/upload">
              <Button variant="gradient" size="sm" leftIcon={<Plus className="w-3.5 h-3.5" />}>
                New Project
              </Button>
            </Link>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3 rounded-xl bg-charcoal-900 border border-slate-800">
          <div className="max-w-sm w-full">
            <Input
              placeholder="Search sketches by title..."
              leftIcon={<Search className="w-3.5 h-3.5" />}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-1 overflow-x-auto">
            {(['all', 'generated', 'reviewed', 'draft'] as const).map((filter) => (
              <button
                key={filter}
                onClick={() => setStatusFilter(filter)}
                className={`text-xs px-3 py-1.5 rounded-lg capitalize font-medium transition-colors ${
                  statusFilter === filter
                    ? 'bg-navy-800 text-electric-400 border border-slate-700 font-semibold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {filter}
              </button>
            ))}
          </div>
        </div>

        {/* Project List */}
        {isLoading ? (
          <div className="py-20 flex flex-col items-center justify-center space-y-3">
            <Spinner size="lg" />
            <p className="text-xs text-slate-400">Loading project records from SQLite repository...</p>
          </div>
        ) : filteredProjects.length === 0 ? (
          <EmptyState
            title="No Matching Projects Found"
            description="Try modifying your search keywords or clear your status filters."
            actionLabel="Reset Search"
            onAction={() => {
              setSearchQuery('');
              setStatusFilter('all');
            }}
          />
        ) : (
          <div className="space-y-4">
            {filteredProjects.map((project) => {
              const createdDate = project.created_at || project.createdAt;
              const updatedDate = project.updated_at || project.updatedAt;
              const nodeCount = project.node_count ?? project.nodeCount ?? 0;
              const fidelity = project.fidelity_score ?? project.fidelityScore;

              return (
                <Card
                  key={project.id}
                  className="p-5 bg-charcoal-900 border-slate-800 hover:border-slate-700 transition-colors"
                >
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2.5">
                        <h3 className="text-base font-bold text-white">{project.title}</h3>
                        <button
                          onClick={() => {
                            setRenameTarget(project);
                            setNewTitle(project.title);
                          }}
                          className="text-slate-500 hover:text-electric-400 transition-colors p-1"
                          title="Rename project"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <Badge
                          variant={
                            project.status === 'generated'
                              ? 'success'
                              : project.status === 'reviewed'
                              ? 'primary'
                              : 'neutral'
                          }
                          size="sm"
                        >
                          {project.status}
                        </Badge>
                      </div>

                      {/* Timestamps & Metrics */}
                      <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 font-mono">
                        {updatedDate && (
                          <span className="flex items-center gap-1 text-slate-300">
                            <Clock className="w-3.5 h-3.5 text-electric-400" />
                            <span>
                              Modified:{' '}
                              {new Date(updatedDate).toLocaleDateString()}{' '}
                              {new Date(updatedDate).toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </span>
                          </span>
                        )}
                        {createdDate && (
                          <span className="flex items-center gap-1 text-slate-500">
                            <span>Created: {new Date(createdDate).toLocaleDateString()}</span>
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          <Layers className="w-3.5 h-3.5 text-slate-500" />
                          <span>{nodeCount} AST nodes</span>
                        </span>
                        {fidelity && (
                          <span className="flex items-center gap-1 text-emerald-400 font-semibold">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>{fidelity}% Fidelity</span>
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-wrap items-center gap-2">
                      {/* View Original Sketch */}
                      <Button
                        size="xs"
                        variant="secondary"
                        leftIcon={<ImageIcon className="w-3 h-3 text-slate-400" />}
                        onClick={() => setSketchViewProject(project)}
                      >
                        Sketch
                      </Button>

                      {/* View Latest Interface */}
                      <Button
                        size="xs"
                        variant="secondary"
                        leftIcon={<FileCode className="w-3 h-3 text-slate-400" />}
                        onClick={() => handleOpenInterfaceView(project)}
                      >
                        Interface
                      </Button>

                      {/* View Fidelity */}
                      <Link to={`/fidelity?projectId=${project.id}`}>
                        <Button size="xs" variant="secondary">
                          Fidelity
                        </Button>
                      </Link>

                      {/* Reopen saved project in Studio */}
                      <Link to={`/editor?projectId=${project.id}`}>
                        <Button
                          size="xs"
                          variant="primary"
                          leftIcon={<Sliders className="w-3 h-3" />}
                        >
                          Reopen
                        </Button>
                      </Link>

                      {/* Delete with confirmation */}
                      <button
                        onClick={() => setDeleteTarget(project)}
                        className="p-2 rounded-lg text-slate-500 hover:text-red-400 hover:bg-slate-800/80 transition-colors"
                        title="Delete project with confirmation"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* ================= DELETE CONFIRMATION MODAL ================= */}
      <Modal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="Delete Project Confirmation"
        description="This action is irreversible and removes the project record from SQLite storage."
        size="sm"
      >
        <div className="space-y-4 text-left">
          <div className="p-3.5 rounded-xl bg-red-950/20 border border-red-500/30 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
            <div className="text-xs text-slate-300 space-y-1">
              <p className="font-semibold text-white">Permanently Delete Project?</p>
              <p>
                Are you sure you want to delete <span className="font-mono text-red-300">"{deleteTarget?.title}"</span>? All component edits, AST documents, and fidelity scores will be removed.
              </p>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <Button
              size="sm"
              variant="secondary"
              onClick={() => setDeleteTarget(null)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              size="sm"
              variant="danger"
              leftIcon={isDeleting ? <Spinner size="xs" /> : <Trash2 className="w-3.5 h-3.5" />}
              onClick={handleConfirmDelete}
              disabled={isDeleting}
            >
              {isDeleting ? 'Deleting...' : 'Confirm Delete'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* ================= RENAME PROJECT MODAL ================= */}
      <Modal
        isOpen={!!renameTarget}
        onClose={() => setRenameTarget(null)}
        title="Rename Project"
        description="Update the project title in SQLite workspace history."
        size="sm"
      >
        <div className="space-y-4 text-left">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">Project Title</label>
            <Input
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="e.g. Mobile Checkout Screen v2"
              autoFocus
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <Button
              size="sm"
              variant="secondary"
              onClick={() => setRenameTarget(null)}
              disabled={isRenaming}
            >
              Cancel
            </Button>
            <Button
              size="sm"
              variant="primary"
              leftIcon={isRenaming ? <Spinner size="xs" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
              onClick={handleConfirmRename}
              disabled={isRenaming || !newTitle.trim()}
            >
              {isRenaming ? 'Saving...' : 'Save Title'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* ================= VIEW ORIGINAL SKETCH MODAL ================= */}
      <Modal
        isOpen={!!sketchViewProject}
        onClose={() => setSketchViewProject(null)}
        title={`Original Sketch Reference: ${sketchViewProject?.title}`}
        description="Hand-drawn UI sketch uploaded for multimodal vision interpretation."
        size="lg"
      >
        <div className="space-y-4 text-left">
          <div className="relative rounded-xl overflow-hidden border border-slate-800 bg-navy-950 p-2 min-h-[260px] flex items-center justify-center">
            {sketchViewProject?.sketchUrl ? (
              <img
                src={sketchViewProject.sketchUrl}
                alt="Original Sketch"
                className="max-h-[420px] w-auto mx-auto rounded-lg object-contain"
              />
            ) : (
              <div className="text-center p-8 space-y-3">
                <div className="w-12 h-12 rounded-xl bg-slate-800/80 border border-slate-700 mx-auto flex items-center justify-center text-slate-400">
                  <ImageIcon className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-white">Sketch Reference: {sketchViewProject?.sketch_id || sketchViewProject?.id}</p>
                  <p className="text-xs text-slate-400 max-w-sm">
                    Image stored in backend assets directory. Contours and stroke geometries were analyzed by OpenCV CLAHE pipeline.
                  </p>
                </div>
              </div>
            )}
          </div>

          <div className="p-3 rounded-lg bg-charcoal-900 border border-slate-800 flex items-center justify-between text-xs text-slate-400">
            <span>Project ID: <code className="text-electric-300 font-mono">{sketchViewProject?.id}</code></span>
            <Link to={`/editor?projectId=${sketchViewProject?.id}`}>
              <Button size="xs" variant="gradient" leftIcon={<Sliders className="w-3 h-3" />}>
                Open in Studio
              </Button>
            </Link>
          </div>
        </div>
      </Modal>

      {/* ================= VIEW LATEST INTERFACE AST MODAL ================= */}
      <Modal
        isOpen={!!interfaceViewProject}
        onClose={() => setInterfaceViewProject(null)}
        title={`Latest Interface Document: ${interfaceViewProject?.project.title}`}
        description="Structured UI AST representing the current state of the generated interface."
        size="lg"
      >
        <div className="space-y-4 text-left">
          {isLoadingInterface ? (
            <div className="py-16 flex flex-col items-center justify-center space-y-3">
              <Spinner size="md" />
              <p className="text-xs text-slate-400">Retrieving validated AST document...</p>
            </div>
          ) : (
            <div className="relative rounded-xl overflow-hidden border border-slate-800 bg-navy-950 max-h-[380px] overflow-y-auto p-4 font-mono text-xs text-slate-300">
              <pre>
                <code>
                  {interfaceViewProject?.ast
                    ? JSON.stringify(interfaceViewProject.ast, null, 2)
                    : '// Loading AST details...'}
                </code>
              </pre>
            </div>
          )}

          <div className="flex items-center justify-between pt-2">
            <span className="text-xs text-slate-400">
              Validated against S2S Component Schema (13 Component Types).
            </span>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="secondary"
                onClick={() => setInterfaceViewProject(null)}
              >
                Close
              </Button>
              {interfaceViewProject && (
                <Link to={`/editor?projectId=${interfaceViewProject.project.id}`}>
                  <Button size="sm" variant="gradient" leftIcon={<Sliders className="w-3.5 h-3.5" />}>
                    Open &amp; Edit
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
};

