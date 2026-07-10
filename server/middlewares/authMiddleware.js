const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next)=>{
    let token;
    let authHeader = req.headers.Authorization || req.headers.authorization;

    if(authHeader && authHeader.startsWith("Bearer ")){
        token=authHeader.split(" ")[1];

        if(!token){
            return res.status(400).json({
                message:"No token"
            })
        }

        try {
            const decode = jwt.verify(token, process.env.JWT_SECRET);
            req.user=decode;
            console.log({
                message:"USER TOKEN SUCCESS",
                user:req.user,
            })
            next();
        } catch (err) {
            res.status(400).json({
                message:"Invalid token",
                error:err.message
            })
        }
    }else{
        return res.status(400).json({
            message:"Invalid headers, Not authorized"
        })
    }

    
}

module.exports=verifyToken;