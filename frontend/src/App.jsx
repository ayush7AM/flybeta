import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import Layout from './components/layout/Layout';
import ScrollToTop from './components/layout/ScrollToTop';
import LandingPage from './pages/LandingPage';
import TrackSelectionPage from './pages/TrackSelectionPage';
import TrackRoadmapPage from './pages/TrackRoadmapPage';
import LessonRunnerPage from './pages/LessonRunnerPage';
import ProjectArchitectPage from './pages/ProjectArchitectPage';
import CodeReviewerPage from './pages/CodeReviewerPage';
import VisionPage from './pages/VisionPage';
import VideoDetailPage from './pages/VideoDetailPage';
import ResetPasswordConfirmPage from './pages/ResetPasswordConfirmPage';
import DashboardPage from './pages/DashboardPage';

export default function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <ThemeProvider>
        <AuthProvider>
          <Routes>
            {/* Landing page — standalone, no app shell */}
            <Route path="/" element={<LandingPage />} />

            {/* Password reset confirmation — standalone */}
            <Route path="/reset-password/:uid/:token" element={<ResetPasswordConfirmPage />} />

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
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}
