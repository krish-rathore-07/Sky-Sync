import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
} from 'react-router-dom'

import Login from './pages/auth/Login.jsx'
import Register from './pages/auth/Register.jsx'

import Dashboard from './pages/dashboard/Dashboard.jsx'
import MyFiles from './pages/dashboard/MyFiles.jsx'
import SharedFiles from './pages/dashboard/SharedFiles.jsx'
import Settings from './pages/dashboard/Settings.jsx'

import SharePage from './pages/share/SharePage.jsx'

import ProtectedRoute from './components/common/ProtectedRoute.jsx'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Default */}
        <Route
          path="/"
          element={<Navigate to="/login" replace />}
        />

        {/* Authentication */}
        <Route
          path="/login"
          element={<Login />}
        />

        <Route
          path="/register"
          element={<Register />}
        />

        {/* Public Share Page */}
        <Route
          path="/share/:token"
          element={<SharePage />}
        />

        {/* Protected Dashboard Routes */}
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

        {/* Unknown Routes */}
        <Route
          path="*"
          element={<Navigate to="/login" replace />}
        />
      </Routes>
    </BrowserRouter>
  )
}

export default App