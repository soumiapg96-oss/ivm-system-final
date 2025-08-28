const express = require('express');
const router = express.Router();

// Import real controllers
const {
  getStockLevelsReport,
  getInventoryValueReport,
  getQuantityHistory
} = require('../controllers/reportsController');

// Import middleware
const { authenticateToken } = require('../middleware/auth');

// Apply authentication middleware to all routes
router.use(authenticateToken);

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

module.exports = router;
