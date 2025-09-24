const questionBank = require("../model/questionBankSchema")
const Bundle = require("../model/BundleShcema")
const purchase = require("../model/purchaseSchema")
const asynchandler = require("express-async-handler")

exports.createQuestionBank=asynchandler(async (req,res)=>{


    const {title,description,semesterID,subjectID}=req.body
    const postCreated = await questionBank.create({title, description,semesterID,subjectID,fileUrl:req.file.path})
    if(!postCreated)res.status(400).send("error while creating the documents")
    console.log(req.file,);

    res.status(200).json(postCreated)

})

exports.getAllQuestionBank = asynchandler(async (req, res) => {
    const userID = req.user._id;
    const purchasedBundles = await purchase.find({ userID, paymentDone: true }).select('BundleId');
    const bundleIds = purchasedBundles.map(p => p.BundleId);
    const bundles = await Bundle.find({ _id: { $in: bundleIds } }).select('products');
    const questionBankIds = bundles.flatMap(b => b.products);
    const response = await questionBank.find({ _id: { $in: questionBankIds } });
    res.status(200).json(response);
})

exports.getQuestionBankBySubjects = asynchandler(async (req, res) => {
    const { subjectID } = req.body;
    const userID = req.user._id;
    const purchasedBundles = await purchase.find({ userID, paymentDone: true }).select('BundleId');
    const bundleIds = purchasedBundles.map(p => p.BundleId);
    const bundles = await Bundle.find({ _id: { $in: bundleIds }, products: { $exists: true } });
    const questionBankIds = bundles.flatMap(b => b.products);
    const response = await questionBank.findOne({ subjectID, _id: { $in: questionBankIds } });
    if (!response) return res.status(403).json({ message: 'Access denied: not purchased' });
    res.json(response);
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
