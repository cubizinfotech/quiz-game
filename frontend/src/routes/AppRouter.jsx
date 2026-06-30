import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from '../components/Layout';
import AdminRoute from './AdminRoute';

import HomePage from '../pages/HomePage';
import CategoryPage from '../pages/CategoryPage';
import QuizPage from '../pages/QuizPage';
import QuizLobbyPage from '../pages/QuizLobbyPage';
import ResultPage from '../pages/ResultPage';
import LoginPage from '../pages/LoginPage';
import SignupPage from '../pages/SignupPage';
import ContestRulesPage from '../pages/ContestRulesPage';
import CoinHistoryPage from '../pages/CoinHistoryPage';
import BlogPage from '../pages/BlogPage';
import ContactPage from '../pages/ContactPage';
import ReportPage from '../pages/ReportPage';
import PrivacyPolicyPage from '../pages/PrivacyPolicyPage';
import AboutUsPage from '../pages/AboutUsPage';

import AdminLogin from '../pages/admin/AdminLogin';
import Dashboard from '../pages/admin/Dashboard';
import ManageQuizzes from '../pages/admin/ManageQuizzes';
import QuizEditor from '../pages/admin/QuizEditor';
import ManageCategories from '../pages/admin/ManageCategories';
import ManageAds from '../pages/admin/ManageAds';
import ManageFunFacts from '../pages/admin/ManageFunFacts';
import ManageSettings from '../pages/admin/ManageSettings';
import ManageQuickStart from '../pages/admin/ManageQuickStart';

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes with layout (navbar) */}
        <Route element={<Layout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/category/:slug" element={<CategoryPage />} />
          <Route path="/quiz/:slug" element={<QuizLobbyPage />} />
          <Route path="/quiz/:slug/play" element={<QuizPage />} />
          <Route path="/result" element={<ResultPage />} />
          <Route path="/contest-rules" element={<ContestRulesPage />} />
          <Route path="/coin-history" element={<CoinHistoryPage />} />
          <Route path="/blog" element={<BlogPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/report" element={<ReportPage />} />
          <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
          <Route path="/about" element={<AboutUsPage />} />
        </Route>

        {/* User auth — standalone pages (no navbar) */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />

        {/* Admin auth */}
        <Route path="/admin/login" element={<AdminLogin />} />

        {/* Protected admin routes */}
        <Route
          path="/admin"
          element={<AdminRoute><Navigate to="/admin/dashboard" replace /></AdminRoute>}
        />
        <Route
          path="/admin/dashboard"
          element={<AdminRoute><Dashboard /></AdminRoute>}
        />
        <Route
          path="/admin/quizzes"
          element={<AdminRoute><ManageQuizzes /></AdminRoute>}
        />
        <Route
          path="/admin/quizzes/new"
          element={<AdminRoute><QuizEditor /></AdminRoute>}
        />
        <Route
          path="/admin/quizzes/:id/edit"
          element={<AdminRoute><QuizEditor /></AdminRoute>}
        />
        <Route
          path="/admin/categories"
          element={<AdminRoute><ManageCategories /></AdminRoute>}
        />
        <Route
          path="/admin/ads"
          element={<AdminRoute><ManageAds /></AdminRoute>}
        />
        <Route
          path="/admin/fun-facts"
          element={<AdminRoute><ManageFunFacts /></AdminRoute>}
        />
        <Route
          path="/admin/settings"
          element={<AdminRoute><ManageSettings /></AdminRoute>}
        />
        <Route
          path="/admin/quick-start"
          element={<AdminRoute><ManageQuickStart /></AdminRoute>}
        />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
