import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { LanguageProvider } from './context/LanguageContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';

// Pages
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { CitizenDashboardPage } from './pages/CitizenDashboardPage';
import { ExploreFacilitiesPage } from './pages/ExploreFacilitiesPage';
import { FacilityDetailsPage } from './pages/FacilityDetailsPage';
import { CivicAiChatPage } from './pages/CivicAiChatPage';
import { CitizenReportingPage } from './pages/CitizenReportingPage';
import { MyReportsPage } from './pages/MyReportsPage';
import { ComplaintTrackingPage } from './pages/ComplaintTrackingPage';
import { SavedFacilitiesPage } from './pages/SavedFacilitiesPage';
import { SmartNavigationPage } from './pages/SmartNavigationPage';
import { GovernmentInformationPage } from './pages/GovernmentInformationPage';
import { CivicIntelligenceDashboardPage } from './pages/CivicIntelligenceDashboardPage';
import { AdminDashboardPage } from './pages/AdminDashboardPage';
import { ProfileSettingsPage } from './pages/ProfileSettingsPage';
import { NotFoundPage } from './pages/NotFoundPage';

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <LanguageProvider>
        <Router>
          <div className="min-h-screen flex flex-col civic-ambient-bg text-civic-textSecondary font-sans selection:bg-civic-violet/40 selection:text-white">
            <Navbar />
            <main className="flex-1">
              <Routes>
                <Route path="/" element={<LandingPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/dashboard" element={<CitizenDashboardPage />} />
                <Route path="/explore" element={<ExploreFacilitiesPage />} />
                <Route path="/facility/:id" element={<FacilityDetailsPage />} />
                <Route path="/ai-chat" element={<CivicAiChatPage />} />
                <Route path="/report" element={<CitizenReportingPage />} />
                <Route path="/my-reports" element={<MyReportsPage />} />
                <Route path="/complaints" element={<ComplaintTrackingPage />} />
                <Route path="/saved" element={<SavedFacilitiesPage />} />
                <Route path="/navigation" element={<SmartNavigationPage />} />
                <Route path="/schemes" element={<GovernmentInformationPage />} />
                <Route path="/analytics" element={<CivicIntelligenceDashboardPage />} />
                <Route path="/admin" element={<AdminDashboardPage />} />
                <Route path="/profile" element={<ProfileSettingsPage />} />
                <Route path="*" element={<NotFoundPage />} />
              </Routes>
            </main>
            <Footer />
          </div>
        </Router>
      </LanguageProvider>
    </AuthProvider>
  );
};

export default App;
