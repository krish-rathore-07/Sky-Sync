import { useEffect } from 'react'

import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
  useLocation,
} from 'react-router-dom'

import { Toaster } from 'react-hot-toast'

// Authentication
import Login from './pages/auth/Login.jsx'
import Register from './pages/auth/Register.jsx'

// Dashboard
import Dashboard from './pages/dashboard/Dashboard.jsx'
import MyFiles from './pages/dashboard/MyFiles.jsx'
import SharedFiles from './pages/dashboard/SharedFiles.jsx'
import Settings from './pages/dashboard/Settings.jsx'

// Public pages
import SharePage from './pages/share/SharePage.jsx'

// Components
import ProtectedRoute from './components/common/ProtectedRoute.jsx'


// ---------------------------------------------
// Scroll to top on route change
// ---------------------------------------------

function ScrollToTop() {
  const { pathname } = useLocation()

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])

  return null
}


// ---------------------------------------------
// Application Routes
// ---------------------------------------------

function AppRoutes() {
  return (
    <Routes>

      {/* Default route */}
      <Route
        path="/"
        element={<Navigate to="/login" replace />}
      />

      {/* Authentication routes */}
      <Route
        path="/login"
        element={<Login />}
      />

      <Route
        path="/register"
        element={<Register />}
      />

      {/* Public share page */}
      <Route
        path="/share/:token"
        element={<SharePage />}
      />

      {/* Protected routes */}
      <Route element={<ProtectedRoute />}>

        <Route
          path="/dashboard"
          element={<Dashboard />}
        />

        <Route
          path="/dashboard/files"
          element={<MyFiles />}
        />

        <Route
          path="/dashboard/shared"
          element={<SharedFiles />}
        />

        <Route
          path="/dashboard/settings"
          element={<Settings />}
        />

      </Route>

      {/* Unknown routes */}
      <Route
        path="*"
        element={<Navigate to="/login" replace />}
      />

    </Routes>
  )
}


// ---------------------------------------------
// Main Application
// ---------------------------------------------

function App() {
  return (
    <BrowserRouter>

      <ScrollToTop />

      {/* Application routes */}
      <AppRoutes />

      {/* Global Toast Notifications */}
      <Toaster
        position="top-right"
        reverseOrder={false}
        gutter={8}
        containerStyle={{
          top: 16,
          right: 16,
        }}
        toastOptions={{
          duration: 3500,

          className: `
            !bg-white
            !text-slate-800
            !border
            !border-slate-200
            dark:!bg-slate-900
            dark:!text-slate-100
            dark:!border-slate-700
            shadow-lg
            text-sm
          `,

          style: {
            width: '360px',
            maxWidth: 'calc(100vw - 32px)',
            padding: '12px 14px',
            borderRadius: '14px',
            boxSizing: 'border-box',
          },

          success: {
            duration: 3000,
            iconTheme: {
              primary: '#059669',
              secondary: '#ffffff',
            },
          },

          error: {
            duration: 4500,
            iconTheme: {
              primary: '#dc2626',
              secondary: '#ffffff',
            },
          },
        }}
      />

    </BrowserRouter>
  )
}

export default App