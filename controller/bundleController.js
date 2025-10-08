const Bundle = require("../model/BundleShcema")
const QuestionBank = require('../model/questionBankSchema')
const asynchandler = require("express-async-handler")

// Create a new bundle
exports.createBundle = asynchandler(async (req, res) => {
    const { title, departmentID, price = 0, products = [] } = req.body;

    if (!departmentID) {
        return res.status(400).json({ message: 'departmentID is required' });
    }

    // Validate product IDs (question banks) and keep only existing ones
    let validProducts = [];
    if (Array.isArray(products) && products.length > 0) {
        const found = await QuestionBank.find({ _id: { $in: products } }).select('_id');
        validProducts = found.map(p => p._id);
    }

    // Create and return the full created bundle
    const bundleCreated = await Bundle.create({ title, departmentID, price, products: validProducts });
    const populated = await Bundle.findById(bundleCreated._id).populate('departmentID').populate('products');
    res.status(201).json(populated);
});

// Get all bundles
exports.getAllBundle = asynchandler(async (req, res) => {
    const response = await Bundle.find().populate('departmentID').populate('products');
    res.status(200).json(response);
});

// Get bundle by id
exports.getBundleById = asynchandler(async (req, res) => {
    const { id } = req.params;
    const bundle = await Bundle.findById(id).populate('departmentID').populate('products');
    if (!bundle) return res.status(404).json({ message: 'Bundle not found' });
    res.status(200).json(bundle);
});

// Get a bundle for a department (single bundle per department – legacy behavior)
exports.getBundleByDepartment = asynchandler(async (req, res) => {
    const { departmentID } = req.body;
    const response = await Bundle.findOne({ departmentID }).populate('departmentID', 'department');
    res.status(200).json(response);
});

// Get products (question banks) by department from bundle
exports.getPdfByDepartment = asynchandler(async (req, res) => {
    const { departmentID } = req.body;
    const productListByDepartment = await Bundle.findOne({ departmentID }).populate('products').populate('departmentID', 'department').select('products departmentID');
    if (!productListByDepartment) {
        return res.status(404).json({ message: 'No bundles found for this department', products: [] });
    }
    res.status(200).json(productListByDepartment);
});

// Get subjects (from products) by department
exports.getSubjectByDepartment = asynchandler(async (req, res) => {
    const { departmentID } = req.body;
    const bundleSchemaToObject = await Bundle.findOne({ departmentID }).select('products').populate({
        path: 'products',
        populate: 'subjectID'
    });
    if (!bundleSchemaToObject || !bundleSchemaToObject.products) {
        return res.status(404).json({ message: 'No bundles or products found for this department', subjects: [] });
    }
    const subjects = [...new Set(bundleSchemaToObject.products.map(x => x.subjectID))];
    res.status(200).send(subjects);
});

// Update bundle by id
exports.updateBundle = asynchandler(async (req, res) => {
    const { id } = req.params;
    const { title, departmentID, price, products } = req.body;

    // Validate product IDs if provided
    let validProducts = undefined;
    if (products) {
        if (!Array.isArray(products)) return res.status(400).json({ message: 'products must be an array of question bank ids' });
        const found = await QuestionBank.find({ _id: { $in: products } }).select('_id');
        validProducts = found.map(p => p._id);
    }

    const updatePayload = { title, departmentID, price };
    if (validProducts !== undefined) updatePayload.products = validProducts;

    const updated = await Bundle.findByIdAndUpdate(id, updatePayload, { new: true }).populate('departmentID').populate('products');
    if (!updated) return res.status(404).json({ message: 'Bundle not found' });
    res.status(200).json(updated);
});

// Delete bundle by id
exports.deleteBundle = asynchandler(async (req, res) => {
    const { id } = req.params;
    const deleted = await Bundle.findByIdAndDelete(id);
    if (!deleted) return res.status(404).json({ message: 'Bundle not found' });
    res.status(200).json({ message: 'Bundle deleted', id: deleted._id });
});