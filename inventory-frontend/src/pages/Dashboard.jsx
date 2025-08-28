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
import { productsAPI } from '../services/api'
import { formatCurrency } from '../lib/utils'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'

const stats = [
  {
    name: 'Total Products',
    value: '0',
    icon: Package,
    color: 'bg-blue-500',
    change: '+12%',
    changeType: 'positive'
  },
  {
    name: 'Categories',
    value: '0',
    icon: FolderOpen,
    color: 'bg-green-500',
    change: '+8%',
    changeType: 'positive'
  },
  {
    name: 'Total Value',
    value: '$0',
    icon: DollarSign,
    color: 'bg-yellow-500',
    change: '+15%',
    changeType: 'positive'
  },
  {
    name: 'Low Stock Items',
    value: '0',
    icon: AlertTriangle,
    color: 'bg-red-500',
    change: '-3%',
    changeType: 'negative'
  },
]

const recentActivity = [
  {
    id: 1,
    type: 'product_added',
    message: 'New product "Laptop Pro" added to inventory',
    time: '2 minutes ago',
    status: 'success'
  },
  {
    id: 2,
    type: 'low_stock',
    message: 'Low stock alert for "Wireless Mouse"',
    time: '5 minutes ago',
    status: 'warning'
  },
  {
    id: 3,
    type: 'category_updated',
    message: 'Category "Electronics" updated',
    time: '10 minutes ago',
    status: 'info'
  },
  {
    id: 4,
    type: 'user_login',
    message: 'User "admin" logged in',
    time: '15 minutes ago',
    status: 'info'
  }
]

const quickActions = [
  {
    name: 'Add Product',
    description: 'Create a new product entry',
    icon: Plus,
    href: '/products',
    color: 'bg-blue-500 hover:bg-blue-600'
  },
  {
    name: 'Manage Categories',
    description: 'Organize your product categories',
    icon: FolderOpen,
    href: '/categories',
    color: 'bg-green-500 hover:bg-green-600'
  },
  {
    name: 'View Reports',
    description: 'Analyze inventory data',
    icon: BarChart3,
    href: '/reports',
    color: 'bg-purple-500 hover:bg-purple-600'
  },
  {
    name: 'Manage Users',
    description: 'Control user access and permissions',
    icon: Users,
    href: '/users',
    color: 'bg-orange-500 hover:bg-orange-600'
  }
]

// Sample chart data
const chartData = [
  { name: 'Jan', products: 65, value: 12000 },
  { name: 'Feb', products: 78, value: 15000 },
  { name: 'Mar', products: 90, value: 18000 },
  { name: 'Apr', products: 81, value: 16000 },
  { name: 'May', products: 95, value: 20000 },
  { name: 'Jun', products: 88, value: 17500 },
]

const pieData = [
  { name: 'Electronics', value: 35, color: '#3b82f6' },
  { name: 'Clothing', value: 25, color: '#10b981' },
  { name: 'Books', value: 20, color: '#f59e0b' },
  { name: 'Home & Garden', value: 20, color: '#ef4444' },
]

export function Dashboard() {
  const [summary, setSummary] = useState(null)
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()

  useEffect(() => {
    fetchSummary()
  }, [])

  const fetchSummary = async () => {
    try {
      const response = await productsAPI.getInventorySummary()
      setSummary(response.data.summary)
    } catch (error) {
      console.error('Failed to fetch summary:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'success':
        return 'bg-green-500'
      case 'warning':
        return 'bg-yellow-500'
      case 'error':
        return 'bg-red-500'
      default:
        return 'bg-blue-500'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back, {user?.name}. Here's what's happening with your inventory.
          </p>
        </div>
        {user?.role === 'admin' && (
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Product
          </Button>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <Card key={stat.name}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {stat.name}
                </CardTitle>
                <div className={`p-2 rounded-lg ${stat.color}`}>
                  <Icon className="h-4 w-4 text-white" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {loading ? '...' : stat.value}
                </div>
                <div className="flex items-center text-xs text-muted-foreground">
                  {stat.changeType === 'positive' ? (
                    <ArrowUpRight className="mr-1 h-3 w-3 text-green-500" />
                  ) : (
                    <ArrowDownRight className="mr-1 h-3 w-3 text-red-500" />
                  )}
                  {stat.change} from last month
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Charts and Activity */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        {/* Inventory Trends Chart */}
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Inventory Trends</CardTitle>
            <CardDescription>
              Product count and value over the last 6 months
            </CardDescription>
          </CardHeader>
          <CardContent className="pl-2">
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip />
                <Bar yAxisId="left" dataKey="products" fill="#3b82f6" />
                <Bar yAxisId="right" dataKey="value" fill="#10b981" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Category Distribution */}
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Category Distribution</CardTitle>
            <CardDescription>
              Products by category
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={350}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions and Recent Activity */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        {/* Quick Actions */}
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>
              Common tasks to manage your inventory
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2">
              {quickActions.map((action) => {
                const Icon = action.icon
                return (
                  <Button
                    key={action.name}
                    variant="outline"
                    className="h-auto p-4 flex-col items-start space-y-2"
                    onClick={() => window.location.href = action.href}
                  >
                    <div className={`p-2 rounded-lg ${action.color} text-white`}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="text-left">
                      <div className="font-medium">{action.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {action.description}
                      </div>
                    </div>
                  </Button>
                )
              })}
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>
              Latest updates and notifications
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-start space-x-3">
                  <div className={`mt-1 h-2 w-2 rounded-full ${getStatusColor(activity.status)}`} />
                  <div className="flex-1 space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {activity.message}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {activity.time}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* System Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            System Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="flex items-center space-x-2">
              <div className="h-2 w-2 rounded-full bg-green-500" />
              <span className="text-sm">Database Connected</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="h-2 w-2 rounded-full bg-green-500" />
              <span className="text-sm">API Running</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="h-2 w-2 rounded-full bg-green-500" />
              <span className="text-sm">Authentication Active</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="h-2 w-2 rounded-full bg-green-500" />
              <span className="text-sm">All Systems Operational</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
