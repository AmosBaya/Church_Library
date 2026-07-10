const authorizeRoles = (...allowedRoles)=>{
    return (req,res,next)=>{
       /* console.log('allowedRoles:', allowedRoles);
        console.log('req.user:', req.user);
        console.log('req.user.role:', req.user?.role);*/


        const userRoles = Array.isArray(req.user.role) ? req.user.role : [req.user.role];
        const hasAccess = userRoles.some(role => allowedRoles.includes(role));

        if (!hasAccess) {
            return res.status(403).json({ message: "Access Denied" });
        }
        next();

       /* if(!allowedRoles.includes(req.user.role)){
            return res.status(403).json({
                message:"Access Denied"
            })
        }
        next()*/
    }
    
}

module.exports=authorizeRoles;