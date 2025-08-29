import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { ToastProvider } from './contexts/ToastContext'
import { ThemeProvider } from './contexts/ThemeContext'
import { PrivateRoute } from './components/auth/PrivateRoute'
import { RoleBasedRedirect } from './components/auth/RoleBasedRedirect'
import { Layout } from './components/layout/Layout'
import { Login } from './pages/Login'
import { Register } from './pages/Register'
import { Dashboard } from './pages/Dashboard'
import { Products } from './pages/Products'
import { Categories } from './pages/Categories'
import { Reports } from './pages/Reports'
import { Users } from './pages/Users'
import { Profile } from './pages/Profile'
import { Unauthorized } from './pages/Unauthorized'

function AppRoutes() {
  return (
    <Router>
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/unauthorized" element={<Unauthorized />} />
        
        {/* Protected routes - accessible to all authenticated users */}
        <Route path="/" element={
          <PrivateRoute>
            <RoleBasedRedirect>
              <Layout><Dashboard /></Layout>
            </RoleBasedRedirect>
          </PrivateRoute>
        } />
        <Route path="/products" element={<PrivateRoute><Layout><Products /></Layout></PrivateRoute>} />
        <Route path="/reports" element={<PrivateRoute requiredRole="admin"><Layout><Reports /></Layout></PrivateRoute>} />
        <Route path="/profile" element={<PrivateRoute><Layout><Profile /></Layout></PrivateRoute>} />
        
        {/* Admin-only routes */}
        <Route path="/categories" element={<PrivateRoute requiredRole="admin"><Layout><Categories /></Layout></PrivateRoute>} />
        <Route path="/users" element={<PrivateRoute requiredRole="admin"><Layout><Users /></Layout></PrivateRoute>} />
        
        {/* Catch all route */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  )
}

function App() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <ThemeProvider>
        <AuthProvider>
          <ToastProvider>
            <AppRoutes />
          </ToastProvider>
        </AuthProvider>
      </ThemeProvider>
    </div>
  )
}

export default App
