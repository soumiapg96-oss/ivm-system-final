import { useState, useEffect } from 'react'
import { 
  Package, 
  FolderOpen, 
  TrendingUp, 
  AlertTriangle,
  DollarSign,
  Users,
  Plus,
  BarChart3,
  ArrowUpRight,
  ArrowDownRight,
  Activity
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Badge } from '../components/ui/badge'
import { useAuth } from '../contexts/AuthContext'
import { productsAPI, categoriesAPI, reportsAPI } from '../services/api'
import { formatCurrency } from '../lib/utils'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, AreaChart, Area, Legend } from 'recharts'

export function Dashboard() {
  const { user } = useAuth()
  const isAdmin = user?.role === 'admin'
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalCategories: 0,
    totalValue: 0,
    lowStockItems: 0
  })
  const [categoryData, setCategoryData] = useState([])
  const [trendsData, setTrendsData] = useState([])
  const [recentActivity, setRecentActivity] = useState([])

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      setError(null)
      
      // Only fetch admin data if user is admin
      if (isAdmin) {
        // Fetch inventory summary
        const summaryResponse = await productsAPI.getInventorySummary()
        const summary = summaryResponse.data.summary
        
        // Fetch categories count
        const categoriesResponse = await categoriesAPI.getAll()
        const categoriesCount = categoriesResponse.data.pagination?.total || 0
        
        // Fetch category distribution for charts
        const categoryDistributionResponse = await categoriesAPI.getAllWithCount()
        const categoryData = (categoryDistributionResponse.data.data || []).map(cat => ({
          name: cat.name,
          value: cat.productCount || 0,
          color: getRandomColor()
        }))
        
        // Fetch trends data
        const trendsResponse = await reportsAPI.getDashboardCharts()
        const trends = trendsResponse.data.trends || []
        
        setStats({
          totalProducts: summary.total_products || 0,
          totalCategories: categoriesCount,
          totalValue: summary.total_value || 0,
          lowStockItems: summary.low_stock || 0
        })
        
        setCategoryData(categoryData)
        setTrendsData(trends)
        
        // Fetch recent activity
        const activityResponse = await reportsAPI.getRecentActivity(5)
        const activities = activityResponse.data.activities || []
        
        setRecentActivity(activities.map(activity => ({
          id: activity.id,
          type: activity.type,
          message: activity.message,
          time: new Date(activity.timestamp).toLocaleString(),
          status: activity.status
        })))
      } else {
        // For non-admin users, just set basic stats
        setStats({
          totalProducts: 0,
          totalCategories: 0,
          totalValue: 0,
          lowStockItems: 0
        })
        setCategoryData([])
        setTrendsData([])
        setRecentActivity([])
      }
      
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
      setError('Failed to load dashboard data. Please try refreshing the page.')
    } finally {
      setLoading(false)
    }
  }

  const getRandomColor = () => {
    const colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4', '#84CC16', '#F97316']
    return colors[Math.floor(Math.random() * colors.length)]
  }

  const dashboardStats = [
    {
      name: 'Total Products',
      value: stats.totalProducts.toLocaleString(),
      icon: Package,
      color: 'bg-blue-500',
      change: '+12%',
      changeType: 'positive'
    },
    {
      name: 'Categories',
      value: stats.totalCategories.toLocaleString(),
      icon: FolderOpen,
      color: 'bg-green-500',
      change: '+8%',
      changeType: 'positive'
    },
    {
      name: 'Total Value',
      value: formatCurrency(stats.totalValue),
      icon: DollarSign,
      color: 'bg-yellow-500',
      change: '+15%',
      changeType: 'positive'
    },
    {
      name: 'Low Stock Items',
      value: stats.lowStockItems.toLocaleString(),
      icon: AlertTriangle,
      color: 'bg-red-500',
      change: '-3%',
      changeType: 'negative'
    },
  ]

  const quickActions = isAdmin ? [
    {
      name: 'Add Product',
      description: 'Create a new product entry',
      icon: Plus,
      color: 'bg-blue-500',
      href: '/products'
    },
    {
      name: 'Manage Categories',
      description: 'Organize your product categories',
      icon: FolderOpen,
      color: 'bg-green-500',
      href: '/categories'
    },
    {
      name: 'View Reports',
      description: 'Analyze inventory performance',
      icon: BarChart3,
      color: 'bg-yellow-500',
      href: '/reports'
    },
    {
      name: 'Manage Users',
      description: 'Control user access and permissions',
      icon: Users,
      color: 'bg-purple-500',
      href: '/users'
    }
  ] : [
    {
      name: 'View Products',
      description: 'Browse and search products',
      icon: Package,
      color: 'bg-blue-500',
      href: '/products'
    },
    {
      name: 'View Reports',
      description: 'Analyze inventory performance',
      icon: BarChart3,
      color: 'bg-yellow-500',
      href: '/reports'
    },
    {
      name: 'Profile Settings',
      description: 'Manage your account settings',
      icon: User,
      color: 'bg-green-500',
      href: '/profile'
    }
  ]

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4 py-8">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4 py-8">
          <div className="flex justify-center items-center h-64">
            <div className="text-center">
              <div className="text-red-500 text-6xl mb-4">⚠️</div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Dashboard Error
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                {error}
              </p>
              <button
                onClick={fetchDashboardData}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Welcome back, {user?.first_name || 'User'}!
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            {isAdmin ? 'Here\'s what\'s happening with your inventory today.' : 'You have access to view product information.'}
          </p>
        </div>

        {/* Admin Dashboard Content */}
        {isAdmin ? (
          <>
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {dashboardStats.map((stat, index) => (
                <Card key={index} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                          {stat.name}
                        </p>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">
                          {stat.value}
                        </p>
                        <div className="flex items-center mt-2">
                          {stat.changeType === 'positive' ? (
                            <ArrowUpRight className="h-4 w-4 text-green-500 mr-1" />
                          ) : (
                            <ArrowDownRight className="h-4 w-4 text-red-500 mr-1" />
                          )}
                          <span className={`text-sm font-medium ${
                            stat.changeType === 'positive' ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {stat.change}
                          </span>
                          <span className="text-sm text-gray-500 ml-1">from last month</span>
                        </div>
                      </div>
                      <div className={`p-3 rounded-full ${stat.color} bg-opacity-10`}>
                        <stat.icon className={`h-6 w-6 ${stat.color.replace('bg-', 'text-')}`} />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </>
        ) : (
          /* Non-Admin Dashboard Content */
          <div className="mb-8">
            <Card className="p-6">
              <div className="text-center">
                <div className="text-blue-500 text-6xl mb-4">📦</div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  Product Access
                </h2>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  You have access to view and manage product information. Use the navigation menu to access different sections.
                </p>
                <div className="flex justify-center space-x-4">
                  <a
                    href="/products"
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    View Products
                  </a>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* Charts Section - Admin Only */}
        {isAdmin && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Category Distribution */}
          <Card className="flex flex-col">
            <CardHeader>
              <CardTitle className="flex items-center">
                <BarChart3 className="h-5 w-5 mr-2" />
                Category Distribution
              </CardTitle>
              <CardDescription>
                Products distributed across categories
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-1 flex items-center justify-center">
              {categoryData.length > 0 ? (
                <div className="w-full h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={categoryData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        paddingAngle={2}
                      >
                        {categoryData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip 
                        formatter={(value, name) => [value, name]}
                        contentStyle={{
                          backgroundColor: 'white',
                          border: '1px solid #ccc',
                          borderRadius: '4px',
                          padding: '8px'
                        }}
                      />
                      <Legend 
                        verticalAlign="bottom" 
                        height={36}
                        formatter={(value, entry) => (
                          <span style={{ color: entry.color, fontSize: '12px' }}>
                            {value}
                          </span>
                        )}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="flex items-center justify-center h-64 text-gray-500">
                  <p>No category data available</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Inventory Trends */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <TrendingUp className="h-5 w-5 mr-2" />
                Inventory Trends
              </CardTitle>
              <CardDescription>
                Stock levels over time
              </CardDescription>
            </CardHeader>
            <CardContent>
              {trendsData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={trendsData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="date" 
                      tickFormatter={(value) => new Date(value).toLocaleDateString()}
                    />
                    <YAxis />
                    <Tooltip 
                      labelFormatter={(value) => new Date(value).toLocaleDateString()}
                      formatter={(value, name) => [
                        name === 'totalValue' ? formatCurrency(value) : value,
                        name === 'totalProducts' ? 'Products' : 
                        name === 'totalValue' ? 'Value' : 
                        name === 'lowStockItems' ? 'Low Stock' : 
                        name === 'newProducts' ? 'New Products' : name
                      ]}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="totalProducts" 
                      stackId="1"
                      stroke="#3B82F6" 
                      fill="#3B82F6" 
                      fillOpacity={0.6}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="lowStockItems" 
                      stackId="1"
                      stroke="#EF4444" 
                      fill="#EF4444" 
                      fillOpacity={0.6}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-64 text-gray-500">
                  <p>Chart data will be available soon</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
        )}

                {/* Quick Actions - Admin Only */}
        {isAdmin && (
          <Card className="mb-8">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>
              Common tasks to get you started
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {quickActions.map((action, index) => (
                <Button
                  key={index}
                  variant="outline"
                  className="h-auto p-4 flex flex-col items-center space-y-2 hover:shadow-md transition-shadow"
                  onClick={() => window.location.href = action.href}
                >
                  <action.icon className={`h-8 w-8 ${action.color.replace('bg-', 'text-').replace(' hover:bg-', '')}`} />
                  <div className="text-center">
                    <p className="font-medium">{action.name}</p>
                    <p className="text-sm text-gray-500">{action.description}</p>
                  </div>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
        )}

        {/* Recent Activity - Admin Only */}
        {isAdmin && (
          <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>
              Latest updates and notifications
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-center space-x-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
                  <div className={`p-2 rounded-full ${
                    activity.status === 'success' ? 'bg-green-100 text-green-600' :
                    activity.status === 'warning' ? 'bg-yellow-100 text-yellow-600' :
                    'bg-blue-100 text-blue-600'
                  }`}>
                    <Activity className="h-4 w-4" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {activity.message}
                    </p>
                    <p className="text-xs text-gray-500">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        )}
      </div>
    </div>
  )
}
