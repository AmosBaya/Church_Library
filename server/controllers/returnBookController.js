const Borrow = require('../models/Borrow');
const Book = require('../models/Books');
const mongoose= require('mongoose');


// return book request 
exports.returnBookRequest= async (req,res)=>{
    try {
        const user = req.user._id

        const borrowId = req.params.id

        const exists = await Borrow.findOne(
            {
                _id:borrowId,
                user:user,
                status:{$in:['overdue','approved']},
                renewalStatus:{$in:['approved','cancelled','none','rejected']}
            }
        );

        if(!exists){

            const check = await Borrow.findById(borrowId);

            if(!check){
                return res.status(404).json({
                    message:"Borrow not found"
                });
            }

            if(check.user.toString() !== user.toString()){
                return res.status(403).json({
                    message:"Not allowed to return this book"
                });
            }

            return res.status(409).json({
                message:`Not allowed to return a book with status:${check.status} and or or renewal status:${check.renewalStatus}`
            });
        }

        const borrow = await Borrow.findOneAndUpdate(
            {
                _id:borrowId,
                user:user,
                status:{$in:['overdue','approved']},
                renewalStatus:{$in:['approved','cancelled','none','rejected']}
            },
            {
                $set:{status:"return-requested"}
            },
            { new:true }
        );

        if(!borrow){
            return res.status(409).json({
                message:"Status of this borrow has changed, try again later"
            });
        }

        res.status(200).json({
            message:"Return request sent successfully",
            status:borrow.status
        });

    } catch (err) {
        res.status(500).json({
            message:"Internal server error",
            error:err.message
        });
    }
}

// cancel return book request 
exports.cancelReturnBookRequest= async (req,res)=>{
    try {
        
    } catch (err) {
        
    }
}

// complete return book request 
exports.completeReturnBookRequest= async (req,res)=>{}