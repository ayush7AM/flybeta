import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import Layout from './components/layout/Layout';
import ScrollToTop from './components/layout/ScrollToTop';
import ErrorBoundary from './components/ErrorBoundary';
import PageLoader from './components/layout/PageLoader';
import LandingPage from './pages/LandingPage';

// Every other page loads on demand, so the landing page doesn't download them all
const TrackSelectionPage = lazy(() => import('./pages/TrackSelectionPage'));
const TrackRoadmapPage = lazy(() => import('./pages/TrackRoadmapPage'));
const LessonRunnerPage = lazy(() => import('./pages/LessonRunnerPage'));
const ProjectArchitectPage = lazy(() => import('./pages/ProjectArchitectPage'));
const CodeReviewerPage = lazy(() => import('./pages/CodeReviewerPage'));
const VisionPage = lazy(() => import('./pages/VisionPage'));
const VideoDetailPage = lazy(() => import('./pages/VideoDetailPage'));
const ResetPasswordConfirmPage = lazy(() => import('./pages/ResetPasswordConfirmPage'));
const DashboardPage = lazy(() => import('./pages/DashboardPage'));
const CertificatePage = lazy(() => import('./pages/CertificatePage'));

function AppRoutes() {
  const { pathname } = useLocation();

  return (
    <ErrorBoundary resetKey={pathname}>
      <Suspense fallback={<PageLoader fullScreen />}>
        <Routes>
          {/* Landing page — standalone, no app shell */}
          <Route path="/" element={<LandingPage />} />

          {/* Password reset confirmation — standalone */}
          <Route path="/reset-password/:uid/:token" element={<ResetPasswordConfirmPage />} />

          {/* Certificates — standalone, public, printable */}
          <Route path="/certificate/:certificateId" element={<CertificatePage />} />

          {/* App routes — inside Layout with Navbar */}
          <Route element={<Layout />}>
            <Route path="/tracks" element={<TrackSelectionPage />} />
            <Route path="/track/:name" element={<TrackRoadmapPage />} />
            <Route path="/track/:name/level/:num/lesson/:order" element={<LessonRunnerPage />} />
            <Route path="/labs" element={<Navigate to="/labs/architect" replace />} />
            <Route path="/labs/architect" element={<ProjectArchitectPage />} />
            <Route path="/labs/reviewer" element={<CodeReviewerPage />} />
            <Route path="/vision" element={<VisionPage />} />
            <Route path="/vision/video/:id" element={<VideoDetailPage />} />
            <Route path="/dashboard" element={<DashboardPage />} />
          </Route>
        </Routes>
      </Suspense>
    </ErrorBoundary>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <ThemeProvider>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}
