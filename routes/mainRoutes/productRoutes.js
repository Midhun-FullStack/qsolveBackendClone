 const express = require('express')
const router = express.Router()

// In-memory storage for products (replace with database later)
let products = [
  {
    id: 1,
    name: 'Sample Product 1',
    price: 29.99,
    createdAt: new Date().toISOString()
  },
  {
    id: 2,
    name: 'Sample Product 2',
    price: 49.99,
    createdAt: new Date().toISOString()
  }
]

// GET /api/products - Get all products
router.get('/', (req, res) => {
  try {
    res.json(products)
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching products',
      error: error.message
    })
  }
})

// POST /api/products - Create a new product
router.post('/', (req, res) => {
  try {
    const { name, price } = req.body

    if (!name || !price) {
      return res.status(400).json({
        success: false,
        message: 'Name and price are required'
      })
    }

    const newProduct = {
      id: products.length + 1,
      name,
      price: parseFloat(price),
      createdAt: new Date().toISOString()
    }

    products.push(newProduct)

    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      product: newProduct
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating product',
      error: error.message
    })
  }
})

// DELETE /api/products/:id - Delete a product
router.delete('/:id', (req, res) => {
  try {
    const productId = parseInt(req.params.id)

    const productIndex = products.findIndex(p => p.id === productId)

    if (productIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      })
    }

    products.splice(productIndex, 1)

    res.json({
      success: true,
      message: 'Product deleted successfully'
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting product',
      error: error.message
    })
  }
})

module.exports = router
