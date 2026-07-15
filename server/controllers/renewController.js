const Borrow = require('../models/Borrow');
const Book = require('../models/Books');
const mongoose= require('mongoose')


// renew book request
exports.renewBookRequest= async (req,res)=>{
    try {
        const user = req.user._id

        const borrowId = req.params.id

        const borrow = await Borrow.findOneAndUpdate(
            {
                _id:borrowId,
                user:user,
                status:{$in:['approved', 'overdue']},
                renewalStatus:{$in:['none','approved']},
                renewalCount:{ $lt:2 }
            },
            {
                $set:{ renewalStatus:'requested' },
                $push:{ renewalHistory:{ requestedAt: new Date() }}
            },
            { new:true }
        );

        if(!borrow){

            const check = await Borrow.findById(borrowId);
            if(!check){
                return res.status(404).json({
                    message:"Borrow not found"
                });
            }
            
            if(check.user.toString() !== userId.toString()){
                return res.status(403).json({
                    message:"Not allowed to renew this book"
                });
            }

            // checking renewal limit
            if(check.renewalCount >= 2){
                return res.status(403).json({
                    message:"Renew limit reached! Contact admin"
                });
            }

            return res.status(403).json({
                message: `Cannot request renewal — status: ${check.status}, renewal: ${check.renewalStatus}`
            });
        }

        res.status(200).json({
            message:"Renew request sent successfully"
        });

    } catch (err) {
        return res.status(500).json({ 
            message: "Something went wrong", 
            error: err.message 
        });
    }
}


// approve renew book request
exports.approveRenewBookRequest= async (req,res)=>{
    try {
        const admin = req.user._id

        const borrowId = req.params.id

        const borrow = await Borrow.findOneAndUpdate(
            {
                _id:borrowId,
                status:{$in:['approved', 'overdue']},
                renewalStatus:'requested',
                renewalCount:{ $lt:2 }
            },
            {
                $set:{ renewalStatus:'approved' },
                $inc:{ renewalCount:1 },
                $push:{ renewalHistory:{ 
                    approvedAt:new Date(), 
                    previousDueDate:newDueDate, 
                    newDueDate:new Date(Date.now() + 14 * 24 * 60 * 60 * 1000)  
                }},
                $push:{ }
            }
        );
    } catch (err) {
        
    }
}

// cancelle renew book request - the user
exports.cancelleRenewBookRequest= async (req,res)=>{}

// reject renew book request - admin
exports.rejectRenewBookRequest= async (req,res)=>{}