import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Landing from './pages/Landing'
import Dashboard from './pages/Dashboard'
import Results from './pages/Results'
import History from './pages/History'
import SavedReports from './pages/SavedReports'
import SourceInsights from './pages/SourceInsights'
import HowItWorks from './pages/HowItWorks'
import Settings from './pages/Settings'
import DashboardLayout from './components/layout/DashboardLayout'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Landing Page */}
        <Route path="/" element={<Landing />} />

        {/* Dashboard and App Shell Routes */}
        <Route element={<DashboardLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/results" element={<Results />} />
          <Route path="/history" element={<History />} />
          <Route path="/saved-reports" element={<SavedReports />} />
          <Route path="/source-insights" element={<SourceInsights />} />
          <Route path="/how-it-works" element={<HowItWorks />} />
          <Route path="/settings" element={<Settings />} />
        </Route>

        {/* Fallback to Landing */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
