const questionBank = require("../model/questionBankSchema")
const Bundle = require("../model/BundleShcema")
const Access = require("../model/accessSchema")
const User = require("../model/userSchema")
const asynchandler = require("express-async-handler")

exports.createQuestionBank = asynchandler(async (req, res) => {
    try {
        const { title, description, semesterID, subjectID } = req.body;
        
        // Validate required fields
        if (!title || !description || !semesterID || !subjectID) {
            return res.status(400).json({ 
                message: 'Missing required fields: title, description, semesterID, subjectID' 
            });
        }

        // Ensure a file was uploaded by the parser middleware
        if (!req.file) {
            return res.status(400).json({ 
                message: 'File upload failed or missing. Please upload a PDF.' 
            });
        }

        // Construct a public URL path for the uploaded file (served from /uploads)
        const filename = req.file.filename || req.file.path.split(/[\\/]/).pop();
        const fileUrl = `/uploads/${filename}`;

        const postCreated = await questionBank.create({
            title,
            description,
            semesterID,
            subjectID,
            fileUrl,
        });

        if (!postCreated) {
            return res.status(400).json({ message: 'Error while creating the question bank' });
        }

        console.log('Uploaded file:', {
            originalName: req.file.originalname,
            filename: req.file.filename,
            size: req.file.size,
            mimetype: req.file.mimetype,
            fileUrl: fileUrl
        });
        
        res.status(201).json(postCreated);
    } catch (error) {
        console.error('Create question bank error:', error);
        res.status(500).json({ 
            message: 'Internal server error during question bank creation',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
})

exports.getAllQuestionBank = asynchandler(async (req, res) => {
    const user = await User.findById(req.user._id);
    if (user.role === 'admin') {
        const response = await questionBank.find({});
        return res.status(200).json(response);
    }
    
    const userID = req.user._id;
    // Get user's accessible bundles through admin-granted access
    const accessibleBundles = await Access.find({ 
        userId: userID, 
        isActive: true,
        $or: [
            { expiresAt: null },
            { expiresAt: { $gt: new Date() } }
        ]
    }).select('bundleId');
    
    const bundleIds = accessibleBundles.map(access => access.bundleId);
    const bundles = await Bundle.find({ _id: { $in: bundleIds } }).select('products');
    const questionBankIds = bundles.flatMap(b => b.products);
    const response = await questionBank.find({ _id: { $in: questionBankIds } });
    res.status(200).json(response);
})

exports.getQuestionBankBySubjects = asynchandler(async (req, res) => {
    const { subjectID } = req.body;
    const userID = req.user._id;
    
    // Get user's accessible bundles through admin-granted access
    const accessibleBundles = await Access.find({ 
        userId: userID, 
        isActive: true,
        $or: [
            { expiresAt: null },
            { expiresAt: { $gt: new Date() } }
        ]
    }).select('bundleId');
    
    const bundleIds = accessibleBundles.map(access => access.bundleId);
    const bundles = await Bundle.find({ _id: { $in: bundleIds }, products: { $exists: true } });
    const questionBankIds = bundles.flatMap(b => b.products);
    const response = await questionBank.findOne({ subjectID, _id: { $in: questionBankIds } });
    if (!response) return res.status(403).json({ message: 'Access denied: no access granted' });
    res.json(response);
});

exports.getQuestionBankById = asynchandler(async (req, res) => {
    const { id } = req.params;
    const user = await User.findById(req.user._id);

    if (user.role === 'admin') {
        const response = await questionBank.findById(id);
        if (!response) return res.status(404).json({ message: 'Question bank not found' });
        return res.status(200).json(response);
    }

    const userID = req.user._id;
    // Get user's accessible bundles through admin-granted access
    const accessibleBundles = await Access.find({ 
        userId: userID, 
        isActive: true,
        $or: [
            { expiresAt: null },
            { expiresAt: { $gt: new Date() } }
        ]
    }).select('bundleId');
    
    const bundleIds = accessibleBundles.map(access => access.bundleId);
    const bundles = await Bundle.find({ _id: { $in: bundleIds } }).select('products');
    const questionBankIds = bundles.flatMap(b => b.products);

    if (!questionBankIds.some(qbId => qbId.toString() === id)) {
        return res.status(403).json({ message: 'Access denied: no access granted' });
    }

    const response = await questionBank.findById(id);
    if (!response) return res.status(404).json({ message: 'Question bank not found' });
    res.json(response);
});

exports.updateQuestionBank = asynchandler(async (req, res) => {
    const { id } = req.params;
    const { title, description, semesterID, subjectID } = req.body;

    const updateData = { title, description, semesterID, subjectID };
    if (req.file) {
        // Construct proper file URL for local storage (same as create method)
        const filename = req.file.filename || req.file.path.split(/[\\/]/).pop();
        updateData.fileUrl = `/uploads/${filename}`;
        console.log('Updated file:', req.file);
    }

    const updatedQuestionBank = await questionBank.findByIdAndUpdate(id, updateData, { new: true });
    if (!updatedQuestionBank) return res.status(404).json({ message: 'Question bank not found' });

    res.status(200).json(updatedQuestionBank);
});

exports.deleteQuestionBank = asynchandler(async (req, res) => {
    const { id } = req.params;
    const deletedQuestionBank = await questionBank.findByIdAndDelete(id);
    if (!deletedQuestionBank) return res.status(404).json({ message: 'Question bank not found' });

    res.status(200).json({ message: 'Question bank deleted successfully' });
});

exports.getPdfByDeparment = asynchandler(async (req, res) => {
    const { departmentID } = req.body;

    // Find bundles that belong to the specified department
    const bundles = await Bundle.find({
        departmentID: departmentID,
        products: { $exists: true, $ne: [] }
    }).select('products');

    if (!bundles || bundles.length === 0) {
        return res.status(404).json({ message: 'No bundles found for this department' });
    }

    // Get all question bank IDs from the bundles
    const questionBankIds = bundles.flatMap(b => b.products);

    // Fetch the question banks (public access for samples)
    const response = await questionBank.find({ _id: { $in: questionBankIds } }).limit(5); // Limit to 5 samples

    if (!response || response.length === 0) {
        return res.status(404).json({ message: 'No question banks found for this department' });
    }

    res.json(response);
});
