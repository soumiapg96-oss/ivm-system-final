import { useState, useEffect } from 'react'
import { 
  BarChart3, 
  TrendingUp, 
  AlertTriangle, 
  Package, 
  DollarSign,
  Download,
  RefreshCw,
  Filter,
  Calendar
} from 'lucide-react'
import { useToast } from '../contexts/ToastContext'
import { reportsAPI, categoriesAPI, productsAPI } from '../services/api'
import { formatCurrency } from '../lib/utils'

export function Reports() {
  const [stockLevels, setStockLevels] = useState([])
  const [inventoryValue, setInventoryValue] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('stock-levels')
  const [summary, setSummary] = useState({
    totalProducts: 0,
    inStock: 0,
    lowStock: 0,
    outOfStock: 0
  })
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    categoryId: '',
    productId: ''
  })
  const [categories, setCategories] = useState([])
  const [showFilters, setShowFilters] = useState(false)

  const { success, error } = useToast()

  useEffect(() => {
    fetchReports()
    fetchCategories()
  }, [filters])

  const fetchCategories = async () => {
    try {
      const response = await categoriesAPI.getAll()
      setCategories(response.data.data || [])
    } catch (err) {
      console.error('Failed to fetch categories:', err)
    }
  }

  const fetchReports = async () => {
    try {
      setLoading(true)
      
      // Fetch reports summary with filters
      const summaryResponse = await reportsAPI.getReportsSummary(filters)
      const summaryData = summaryResponse.data.summary
      
      // Fetch detailed reports
      const [stockResponse, valueResponse] = await Promise.all([
        reportsAPI.getStockLevels(),
        reportsAPI.getInventoryValue()
      ])
      
      setSummary({
        totalProducts: summaryData.totalProducts || 0,
        inStock: summaryData.inStock || 0,
        lowStock: summaryData.lowStock || 0,
        outOfStock: summaryData.outOfStock || 0
      })
      
      setStockLevels(stockResponse.data.products || [])
      setInventoryValue(valueResponse.data.categories || [])
    } catch (err) {
      error('Failed to fetch reports')
    } finally {
      setLoading(false)
    }
  }

  const getStockStatus = (product) => {
    if (product.quantity === 0) return { status: 'out', color: 'text-red-600', bg: 'bg-red-100', border: 'border-red-200' }
    if (product.quantity <= (product.minStockLevel || 5)) return { status: 'low', color: 'text-yellow-600', bg: 'bg-yellow-100', border: 'border-yellow-200' }
    return { status: 'good', color: 'text-green-600', bg: 'bg-green-100', border: 'border-green-200' }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'out':
        return <AlertTriangle className="w-4 h-4 text-red-600" />
      case 'low':
        return <AlertTriangle className="w-4 h-4 text-yellow-600" />
      default:
        return <Package className="w-4 h-4 text-green-600" />
    }
  }

  const exportToCSV = (data, filename) => {
    if (!data || data.length === 0) {
      error('No data to export')
      return
    }

    // Get headers from first object
    const headers = Object.keys(data[0])
    
    // Create CSV content
    const csvContent = [
      headers.join(','),
      ...data.map(row => 
        headers.map(header => {
          const value = row[header]
          // Handle values that need quotes (contain commas, quotes, or newlines)
          if (typeof value === 'string' && (value.includes(',') || value.includes('"') || value.includes('\n'))) {
            return `"${value.replace(/"/g, '""')}"`
          }
          return value
        }).join(',')
      )
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `${filename}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
    
    success('Report exported successfully')
  }

  const exportToExcel = (data, filename) => {
    if (!data || data.length === 0) {
      error('No data to export')
      return
    }

    // Create Excel-like format with proper headers and styling
    const headers = Object.keys(data[0])
    
    // Create Excel content with BOM for proper encoding
    const excelContent = [
      '\ufeff', // BOM for UTF-8
      headers.join('\t'),
      ...data.map(row => 
        headers.map(header => {
          const value = row[header]
          // Handle values that need quotes (contain tabs, quotes, or newlines)
          if (typeof value === 'string' && (value.includes('\t') || value.includes('"') || value.includes('\n'))) {
            return `"${value.replace(/"/g, '""')}"`
          }
          return value
        }).join('\t')
      )
    ].join('\n')

    const blob = new Blob([excelContent], { type: 'application/vnd.ms-excel;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `${filename}.xls`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
    
    success('Excel report exported successfully')
  }

  const exportToPDF = (data, filename) => {
    if (!data || data.length === 0) {
      error('No data to export')
      return
    }

    // For now, we'll show a message
    // In a real app, you'd use a library like jsPDF
    success('PDF export feature coming soon')
  }

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }))
  }

  const clearFilters = () => {
    setFilters({
      startDate: '',
      endDate: '',
      categoryId: '',
      productId: ''
    })
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                Reports & Analytics
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                View inventory reports and analytics
              </p>
            </div>
            <div className="flex space-x-2 mt-4 sm:mt-0">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="inline-flex items-center px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white font-medium rounded-lg transition-colors duration-200"
              >
                <Filter className="w-4 h-4 mr-2" />
                Filters
              </button>
              <button
                onClick={fetchReports}
                disabled={loading}
                className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors duration-200 disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </button>
            </div>
          </div>
        </div>

        {/* Filters */}
        {showFilters && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 mb-6 p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Start Date
                </label>
                <input
                  type="date"
                  value={filters.startDate}
                  onChange={(e) => handleFilterChange('startDate', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  End Date
                </label>
                <input
                  type="date"
                  value={filters.endDate}
                  onChange={(e) => handleFilterChange('endDate', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Category
                </label>
                <select
                  value={filters.categoryId}
                  onChange={(e) => handleFilterChange('categoryId', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                >
                  <option value="">All Categories</option>
                  {categories.map(category => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex items-end">
                <button
                  onClick={clearFilters}
                  className="w-full px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white font-medium rounded-lg transition-colors duration-200"
                >
                  Clear Filters
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-lg">
            <div className="flex items-center">
              <div className="flex-shrink-0 p-3 rounded-xl bg-blue-500 shadow-lg">
                <Package className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Products</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{summary.totalProducts}</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-lg">
            <div className="flex items-center">
              <div className="flex-shrink-0 p-3 rounded-xl bg-green-500 shadow-lg">
                <Package className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">In Stock</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{summary.inStock}</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-lg">
            <div className="flex items-center">
              <div className="flex-shrink-0 p-3 rounded-xl bg-yellow-500 shadow-lg">
                <AlertTriangle className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Low Stock</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{summary.lowStock}</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-lg">
            <div className="flex items-center">
              <div className="flex-shrink-0 p-3 rounded-xl bg-red-500 shadow-lg">
                <AlertTriangle className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Out of Stock</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{summary.outOfStock}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 mb-6">
          <div className="border-b border-gray-200 dark:border-gray-700">
            <nav className="flex space-x-8 px-6">
              <button
                onClick={() => setActiveTab('stock-levels')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'stock-levels'
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                Stock Levels
              </button>
              <button
                onClick={() => setActiveTab('inventory-value')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'inventory-value'
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                Inventory Valuation
              </button>
            </nav>
          </div>

          <div className="p-6">
            {loading ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              </div>
            ) : activeTab === 'stock-levels' ? (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Stock Levels Report
                  </h3>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => exportToCSV(stockLevels, 'stock-levels-report')}
                      className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-600"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Export CSV
                    </button>
                    <button
                      onClick={() => exportToExcel(stockLevels, 'stock-levels-report.xlsx')}
                      className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-600"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Export Excel
                    </button>
                  </div>
                </div>
                
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-800">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Product
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Category
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Quantity
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Min Stock
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Value
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                      {stockLevels.map((product) => {
                        const status = getStockStatus(product)
                        return (
                          <tr key={product.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                              {product.name}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                              {product.category_name}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                              {product.quantity}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                              {product.low_stock_threshold || 5}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${status.bg} ${status.color} ${status.border}`}>
                                {getStatusIcon(status.status)}
                                <span className="ml-1">{status.status === 'out' ? 'Out of Stock' : status.status === 'low' ? 'Low Stock' : 'In Stock'}</span>
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                              {formatCurrency(product.total_value || 0)}
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Inventory Valuation Report
                  </h3>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => exportToCSV(inventoryValue, 'inventory-value-report')}
                      className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-600"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Export CSV
                    </button>
                    <button
                      onClick={() => exportToExcel(inventoryValue, 'inventory-value-report.xlsx')}
                      className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-600"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Export Excel
                    </button>
                  </div>
                </div>
                
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-800">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Category
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Products
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Total Quantity
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Total Value
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Average Price
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                      {inventoryValue.map((category) => (
                        <tr key={category.category_id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                            {category.category_name}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                            {category.product_count}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                            {category.total_quantity}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                            {formatCurrency(category.total_value || 0)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                            {formatCurrency(category.average_price || 0)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
