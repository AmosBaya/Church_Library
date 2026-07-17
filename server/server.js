const dotenv = require('dotenv').config();
const express = require('express');
const app = express();
const cors = require('cors');

const dbConnect = require('./config/dbConnect');
// routes imports
const authRoutes = require('./routes/authRoutes');
const userTest = require('./routes/userRoutes');
const categoryRoutes =require('./routes/categoryRoutes');
const bookRoutes = require('./routes/bookRoutes');
const borrowRoutes = require('./routes/borrowRoutes');
const renewalRoutes = require('./routes/renewRoutes');
const returnRoutes = require('./routes/returnRoutes');

//middlewares
app.use(cors())
app.use(express.json());

//routes
app.use("/api/auth", authRoutes);
app.use("/api/test", userTest);
app.use("/api/categories", categoryRoutes);
app.use("/api/books", bookRoutes);
app.use("/api/borrow", borrowRoutes);
app.use("/api/borrow/renew", renewalRoutes);
app.use("/borrow/return", returnRoutes)

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