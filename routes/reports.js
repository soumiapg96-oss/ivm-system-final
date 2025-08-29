const express = require('express');
const router = express.Router();

// Import real controllers
const {
  getStockLevelsReport,
  getInventoryValueReport,
  getQuantityHistory,
  getRecentActivity,
  getDashboardCharts,
  getReportsSummary
} = require('../controllers/reportsController');

// Import middleware
const { authenticateToken, requireRole } = require('../middleware/auth');

// Apply authentication middleware to all routes
router.use(authenticateToken);

// Apply admin role requirement to all reports routes
router.use(requireRole('admin'));

/**
 * @swagger
 * /api/reports/stock-levels:
 *   get:
 *     summary: Get stock levels report
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Stock levels report retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 report:
 *                   type: object
 *                   properties:
 *                     totalProducts:
 *                       type: integer
 *                     inStock:
 *                       type: integer
 *                     lowStock:
 *                       type: integer
 *                     outOfStock:
 *                       type: integer
 *                     products:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Product'
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.get('/stock-levels', getStockLevelsReport);

/**
 * @swagger
 * /api/reports/inventory-value:
 *   get:
 *     summary: Get inventory value report
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Inventory value report retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 report:
 *                   type: object
 *                   properties:
 *                     totalValue:
 *                       type: number
 *                     averageValue:
 *                       type: number
 *                     highestValue:
 *                       type: number
 *                     lowestValue:
 *                       type: number
 *                     products:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Product'
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.get('/inventory-value', getInventoryValueReport);

/**
 * @swagger
 * /api/reports/products/{id}/quantity-history:
 *   get:
 *     summary: Get product quantity history
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Product ID
 *     responses:
 *       200:
 *         description: Product quantity history retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 history:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                       change:
 *                         type: integer
 *                       reason:
 *                         type: string
 *                       previousQuantity:
 *                         type: integer
 *                       newQuantity:
 *                         type: integer
 *                       timestamp:
 *                         type: string
 *                         format: date-time
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Product not found
 *       500:
 *         description: Internal server error
 */
router.get('/products/:id/quantity-history', getQuantityHistory);

/**
 * @swagger
 * /api/reports/recent-activity:
 *   get:
 *     summary: Get recent activity
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *         description: Number of activities to return
 *     responses:
 *       200:
 *         description: Recent activity retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 count:
 *                   type: integer
 *                 activities:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                       type:
 *                         type: string
 *                       message:
 *                         type: string
 *                       timestamp:
 *                         type: string
 *                         format: date-time
 *                       user:
 *                         type: string
 *                       status:
 *                         type: string
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.get('/recent-activity', getRecentActivity);

/**
 * @swagger
 * /api/reports/dashboard/charts:
 *   get:
 *     summary: Get dashboard charts data
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard charts data retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 trends:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       date:
 *                         type: string
 *                       totalProducts:
 *                         type: integer
 *                       totalValue:
 *                         type: number
 *                       lowStockItems:
 *                         type: integer
 *                       newProducts:
 *                         type: integer
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.get('/dashboard/charts', getDashboardCharts);

/**
 * @swagger
 * /api/reports/summary:
 *   get:
 *     summary: Get reports summary with filtering
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *         description: Start date for filtering (YYYY-MM-DD)
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *         description: End date for filtering (YYYY-MM-DD)
 *       - in: query
 *         name: categoryId
 *         schema:
 *           type: string
 *         description: Category ID for filtering
 *       - in: query
 *         name: productId
 *         schema:
 *           type: string
 *         description: Product ID for filtering
 *     responses:
 *       200:
 *         description: Reports summary retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 summary:
 *                   type: object
 *                   properties:
 *                     totalProducts:
 *                       type: integer
 *                     inStock:
 *                       type: integer
 *                     lowStock:
 *                       type: integer
 *                     outOfStock:
 *                       type: integer
 *                     totalValue:
 *                       type: number
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.get('/summary', getReportsSummary);

module.exports = router;
