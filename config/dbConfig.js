const mongoose = require("mongoose")

exports.dbCONNECT = async () =>{
    try{
        await mongoose.connect(process.env.mongoURI||"mongodb+srv://midhunfullstack:Midhun@cluster0.ns0oiio.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0")
        console.log("database connected succesfully ")
    }
    catch(err){
        console.error("database connection failed ",err)
        process.exit(1)
    }
}