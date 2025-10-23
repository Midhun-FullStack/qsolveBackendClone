const express = require('express')
const router = express.Router()

// Import all route modules
const bundleRoutes = require('./mainRoutes/bundleRoutes')
const departmentRoutes = require('./mainRoutes/departmentRoutes')
const paymentRoutes = require('./mainRoutes/paymentRoutes')
const productRoutes = require('./mainRoutes/productRoutes')
const questionBankRoutes = require('./mainRoutes/questionBankRouters')
const semesterRoutes = require('./mainRoutes/semesterRoutes')
const subjectRoutes = require('./mainRoutes/subjectRoutes')
const userRoutes = require('./mainRoutes/userRoutes')
const adminRoutes = require('./mainRoutes/adminRoutes')
const accessRoutes = require('./mainRoutes/accessRoutes')
const accessRequestRoutes = require('./mainRoutes/accessRequestRoutes')


router.use('/bundles', bundleRoutes)
router.use('/departments', departmentRoutes)
router.use('/payments', paymentRoutes)
router.use('/products', productRoutes)
router.use('/question-banks', questionBankRoutes)
router.use('/semesters', semesterRoutes)
router.use('/subjects', subjectRoutes)
router.use('/users', userRoutes)
router.use('/admin', adminRoutes)
router.use('/access', accessRoutes)
router.use('/access-requests', accessRequestRoutes)

module.exports = router
