const dns = require("dns");
dns.setServers(["1.1.1.1", "8.8.8.8"]);

const mongoose = require('mongoose');

const dbConnect = async ()=>{
    try {
        const connect = await mongoose.connect(process.env.MONGODB_URI);
        console.log("Mongodb connected successfully");
    } catch (err) {
        console.log(err.message);
        process.exit(1);
    }
}

module.exports=dbConnect;