const Access = require("../model/accessSchema");
const User = require("../model/userSchema");
const Bundle = require("../model/BundleShcema");
const asynchandler = require("express-async-handler");

// Grant access to a bundle for a user
exports.grantAccess = asynchandler(async (req, res) => {
    const { userId, bundleId, expiresAt, notes } = req.body;
    const grantedBy = req.user._id;

    // Validate required fields
    if (!userId || !bundleId) {
        return res.status(400).json({ message: 'userId and bundleId are required' });
    }

    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
        return res.status(404).json({ message: 'User not found' });
    }

    // Check if bundle exists
    const bundle = await Bundle.findById(bundleId);
    if (!bundle) {
        return res.status(404).json({ message: 'Bundle not found' });
    }

    try {
        // Create or update access
        const access = await Access.findOneAndUpdate(
            { userId, bundleId },
            {
                userId,
                bundleId,
                grantedBy,
                grantedAt: new Date(),
                expiresAt: expiresAt ? new Date(expiresAt) : null,
                isActive: true,
                notes: notes || ""
            },
            { 
                upsert: true, 
                new: true,
                runValidators: true
            }
        ).populate('userId', 'username email')
         .populate('bundleId', 'title price')
         .populate('grantedBy', 'username');

        res.status(201).json({
            message: 'Access granted successfully',
            access: access
        });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({ message: 'Access already exists for this user and bundle' });
        }
        throw error;
    }
});

// Revoke access to a bundle for a user
exports.revokeAccess = asynchandler(async (req, res) => {
    const { userId, bundleId } = req.body;

    if (!userId || !bundleId) {
        return res.status(400).json({ message: 'userId and bundleId are required' });
    }

    const access = await Access.findOneAndUpdate(
        { userId, bundleId },
        { isActive: false },
        { new: true }
    ).populate('userId', 'username email')
     .populate('bundleId', 'title price');

    if (!access) {
        return res.status(404).json({ message: 'Access record not found' });
    }

    res.json({
        message: 'Access revoked successfully',
        access: access
    });
});

// Get all access records (for admin)
exports.getAllAccess = asynchandler(async (req, res) => {
    const { page = 1, limit = 20, userId, bundleId, isActive } = req.query;
    
    const filter = {};
    if (userId) filter.userId = userId;
    if (bundleId) filter.bundleId = bundleId;
    if (isActive !== undefined) filter.isActive = isActive === 'true';

    try {
        const options = {
            page: parseInt(page),
            limit: parseInt(limit),
            populate: [
                { path: 'userId', select: 'username email role' },
                { path: 'bundleId', select: 'title price' },
                { path: 'grantedBy', select: 'username' }
            ],
            sort: { createdAt: -1 }
        };

        const result = await Access.paginate(filter, options);
        res.json(result);
    } catch (error) {
        console.error('Get all access error:', error);
        // Fallback without pagination if paginate fails
        const accessRecords = await Access.find(filter)
            .populate('userId', 'username email role')
            .populate('bundleId', 'title price')
            .populate('grantedBy', 'username')
            .sort({ createdAt: -1 })
            .limit(parseInt(limit));
        
        res.json({
            docs: accessRecords,
            totalDocs: accessRecords.length,
            limit: parseInt(limit),
            page: parseInt(page),
            totalPages: 1,
            hasNextPage: false,
            hasPrevPage: false
        });
    }
});

// Get user's accessible bundles
exports.getUserAccess = asynchandler(async (req, res) => {
    const userId = req.user._id;
    
    const accessRecords = await Access.find({
        userId: userId,
        isActive: true,
        $or: [
            { expiresAt: null },
            { expiresAt: { $gt: new Date() } }
        ]
    }).populate('bundleId').populate('grantedBy', 'username');

    const accessibleBundles = accessRecords.map(access => ({
        ...access.bundleId.toObject(),
        accessInfo: {
            grantedAt: access.grantedAt,
            expiresAt: access.expiresAt,
            grantedBy: access.grantedBy,
            notes: access.notes
        }
    }));

    res.json(accessibleBundles);
});

// Get access details for a specific user and bundle
exports.getAccessDetails = asynchandler(async (req, res) => {
    const { userId, bundleId } = req.params;

    const access = await Access.findOne({
        userId,
        bundleId,
        isActive: true
    }).populate('userId', 'username email')
     .populate('bundleId', 'title price')
     .populate('grantedBy', 'username');

    if (!access) {
        return res.status(404).json({ message: 'Access not found or inactive' });
    }

    // Check if access has expired
    if (access.expiresAt && access.expiresAt < new Date()) {
        return res.status(403).json({ message: 'Access has expired' });
    }

    res.json(access);
});

// Bulk grant access to multiple users for a bundle
exports.bulkGrantAccess = asynchandler(async (req, res) => {
    const { userIds, bundleId, expiresAt, notes } = req.body;
    const grantedBy = req.user._id;

    if (!userIds || !Array.isArray(userIds) || !bundleId) {
        return res.status(400).json({ message: 'userIds (array) and bundleId are required' });
    }

    // Check if bundle exists
    const bundle = await Bundle.findById(bundleId);
    if (!bundle) {
        return res.status(404).json({ message: 'Bundle not found' });
    }

    const results = [];
    const errors = [];

    for (const userId of userIds) {
        try {
            const user = await User.findById(userId);
            if (!user) {
                errors.push({ userId, error: 'User not found' });
                continue;
            }

            const access = await Access.findOneAndUpdate(
                { userId, bundleId },
                {
                    userId,
                    bundleId,
                    grantedBy,
                    grantedAt: new Date(),
                    expiresAt: expiresAt ? new Date(expiresAt) : null,
                    isActive: true,
                    notes: notes || ""
                },
                { 
                    upsert: true, 
                    new: true,
                    runValidators: true
                }
            ).populate('userId', 'username email');

            results.push(access);
        } catch (error) {
            errors.push({ userId, error: error.message });
        }
    }

    res.json({
        message: `Bulk access grant completed. ${results.length} successful, ${errors.length} failed.`,
        successful: results,
        errors: errors
    });
});

// Get access statistics
exports.getAccessStats = asynchandler(async (req, res) => {
    const stats = await Promise.all([
        Access.countDocuments({ isActive: true }),
        Access.countDocuments({ isActive: false }),
        Access.countDocuments({ 
            isActive: true, 
            expiresAt: { $ne: null, $gt: new Date() } 
        }),
        Access.countDocuments({ 
            isActive: true, 
            expiresAt: { $ne: null, $lte: new Date() } 
        }),
        Access.aggregate([
            { $match: { isActive: true } },
            { $group: { _id: '$bundleId', count: { $sum: 1 } } },
            { $lookup: { from: 'bundles', localField: '_id', foreignField: '_id', as: 'bundle' } },
            { $unwind: '$bundle' },
            { $sort: { count: -1 } },
            { $limit: 5 }
        ])
    ]);

    res.json({
        totalActive: stats[0],
        totalRevoked: stats[1],
        activeWithExpiry: stats[2],
        expired: stats[3],
        topBundles: stats[4]
    });
});