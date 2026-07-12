const dotenv = require('dotenv').config();
const express = require('express');
const app = express();
const cors = require('cors');

const dbConnect = require('./config/dbConnect');
// routes imports
const authRoutes = require('./routes/authRoutes');
const userTest = require('./routes/userRoutes');
const categoryRoutes =require('./routes/categoryRoutes')

//middlewares
app.use(cors())
app.use(express.json());

//routes
app.use("/api/auth", authRoutes);
app.use("/api/test", userTest);
app.use("/api/category", categoryRoutes);

// starting app
const PORT = process.env.PORT || 5000

const startApp = async ()=>{
    try {
        await dbConnect()
    
        app.listen(PORT, ()=>{
            console.log(`Server is running on http://localhost:${PORT}`)
        }) 
    } catch (err) {
        console.error(err.message);
        process.exit(1);
    }
}


startApp();

module.exports=app;