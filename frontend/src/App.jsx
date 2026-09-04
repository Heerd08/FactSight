import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Verify from './pages/Verify'
import Results from './pages/Results'
import History from './pages/History'
import SavedReports from './pages/SavedReports'
import SourceInsights from './pages/SourceInsights'
import HowItWorks from './pages/HowItWorks'
import Settings from './pages/Settings'
import DashboardLayout from './components/layout/DashboardLayout'
import { ThemeProvider } from './context/ThemeContext'

// Simple frontend auth wrapper with auto-guest fallback
const ProtectedRoute = ({ children }) => {
  let session = localStorage.getItem('factsight_session');
  if (!session) {
    const defaultSession = { user: { name: 'Investigator', email: 'analyst@factsight.ai' }, token: 'factsight-jwt-token' };
    localStorage.setItem('factsight_session', JSON.stringify(defaultSession));
  }
  return children;
}

function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <Routes>
        {/* Public Route */}
        <Route path="/login" element={<Login />} />

        {/* Dashboard and App Shell Routes */}
        <Route element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/verify" element={<Verify />} />
          <Route path="/investigations" element={<History />} />
          <Route path="/insights" element={<SourceInsights />} />
          
          {/* Kept existing routes to prevent broken links */}
          <Route path="/results" element={<Results />} />
          <Route path="/heatmap" element={<Results />} />
          <Route path="/xai-heatmap" element={<Results />} />
          <Route path="/history" element={<History />} />
          <Route path="/saved-reports" element={<SavedReports />} />
          <Route path="/source-insights" element={<SourceInsights />} />
          <Route path="/how-it-works" element={<HowItWorks />} />
          <Route path="/settings" element={<Settings />} />
        </Route>

        {/* Fallback to Dashboard */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  </ThemeProvider>
  )
}

export default App
