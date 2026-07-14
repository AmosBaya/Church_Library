const jwt = require('jsonwebtoken');
const User = require('../models/User');

const verifyToken = async (req, res, next)=>{
    let token;
    let authHeader = req.headers.Authorization || req.headers.authorization;

    if(authHeader && authHeader.startsWith("Bearer ")){
        token=authHeader.split(" ")[1];

        if(!token){
            return res.status(401).json({
                message:"No token provided"
            })
        }

        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            
            // Verify the user still exists in the databas
            const user = await User.findById(decoded.id).select('-password');

            if (!user) {
                return res.status(401).json({
                    message: "User no longer exists"
                });
            }

            req.user = user;

            console.log({
                message:"USER TOKEN SUCCESS",
                user:req.user,
            })
            
            next();
        } catch (err) {
            res.status(403).json({
                message:"Invalid or expired token",
                error:err.message
            })
        }
    }else{
        return res.status(401).json({
            message:"No authorization header. Please log in."
        })
    }

    
}

module.exports=verifyToken;