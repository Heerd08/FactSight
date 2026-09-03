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

// Simple frontend auth wrapper
const ProtectedRoute = ({ children }) => {
  const session = localStorage.getItem('factsight_session');
  if (!session) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Route */}
        <Route path="/login" element={<Login />} />

        {/* Dashboard and App Shell Routes */}
        <Route element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/verify" element={<Verify />} />
          <Route path="/investigations" element={<History />} />
          <Route path="/insights" element={<SourceInsights />} />
          
          {/* Kept existing routes to prevent broken links */}
          <Route path="/results" element={<Results />} />
          <Route path="/history" element={<History />} />
          <Route path="/saved-reports" element={<SavedReports />} />
          <Route path="/source-insights" element={<SourceInsights />} />
          <Route path="/how-it-works" element={<HowItWorks />} />
          <Route path="/settings" element={<Settings />} />
        </Route>

        {/* Fallback to Login */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
