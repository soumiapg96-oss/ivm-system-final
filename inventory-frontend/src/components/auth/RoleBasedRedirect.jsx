import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'

export function RoleBasedRedirect({ children }) {
  const { user, isAuthenticated, loading } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (!loading && isAuthenticated && user) {
      // If user is not admin, redirect to products page
      if (user.role !== 'admin') {
        navigate('/products', { replace: true })
      }
    }
  }, [user, isAuthenticated, loading, navigate])

  // Show loading while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    )
  }

  // If not authenticated, don't render anything (PrivateRoute will handle redirect)
  if (!isAuthenticated) {
    return null
  }

  // If user is admin, show dashboard
  if (user?.role === 'admin') {
    return children
  }

  // If user is not admin, show loading while redirecting
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600 dark:text-gray-400">Redirecting to products...</p>
      </div>
    </div>
  )
}
