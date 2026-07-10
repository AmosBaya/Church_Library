const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

exports.register = async (req, res)=>{
    try {
        const {name, email, password, role} = req.body;

        const hashedPass = await bcrypt.hash(password, 10);

        const newUser = new User({name, email, password:hashedPass, role});
        
        await newUser.save();

        res.status(201).json({
            data:newUser,
            message:`User ${newUser.name} created successfully`
        })
    } catch (err) {

        res.status(500).json({
            error: err.message,
            message:"user not created"
        })
    }
}

exports.login = async (req, res)=>{
    try {
        const {email, password}=req.body;

        const user = await User.findOne({email});

        if(!user){
            return res.status(404).json({message:"User not found"});
        }

        const isMatch = await bcrypt.compare(password, user.password)
        
        if(!isMatch){
            return res.status(400).json({message:"Invalid credentails"})
        }

        const token = jwt.sign(
            {
                id:user._id, 
                role:user.role
            }, 
            process.env.JWT_SECRET,
            {expiresIn:"1h"}
        );

        res.status(200).json({
            token,
            message:"Login success!"
        })

    } catch (err) {
        res.status(500).json({
            message:"Login failed",
            error:err.message,
        })
    }
}