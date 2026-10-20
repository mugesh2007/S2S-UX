import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ToastProvider } from '@/components/ui/Toast';
import { AppNavbar } from '@/components/layout/AppNavbar';
import { LandingPage } from '@/pages/LandingPage';
import { DashboardPage } from '@/pages/DashboardPage';
import { UploadWorkspacePage } from '@/pages/UploadWorkspacePage';
import { GenerationWorkspacePage } from '@/pages/GenerationWorkspacePage';
import { EditorPage } from '@/pages/EditorPage';
import { FidelityReportPage } from '@/pages/FidelityReportPage';
import { ProjectHistoryPage } from '@/pages/ProjectHistoryPage';
import { SettingsPage } from '@/pages/SettingsPage';

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <ToastProvider>
        <div className="min-h-screen bg-navy-950 text-slate-100 flex flex-col font-sans selection:bg-electric-500/30 selection:text-white">
          <AppNavbar />
          <div className="flex-1">
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/upload" element={<UploadWorkspacePage />} />
              <Route path="/generate" element={<GenerationWorkspacePage />} />
              <Route path="/editor" element={<EditorPage />} />
              <Route path="/editor/:projectId" element={<EditorPage />} />
              <Route path="/fidelity" element={<FidelityReportPage />} />
              <Route path="/fidelity/:projectId" element={<FidelityReportPage />} />
              <Route path="/history" element={<ProjectHistoryPage />} />
              <Route path="/projects" element={<ProjectHistoryPage />} />
              <Route path="/settings" element={<SettingsPage />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </div>
        </div>
      </ToastProvider>
    </BrowserRouter>
  );
};

export default App;
