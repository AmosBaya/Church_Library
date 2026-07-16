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
exports.approveRenewalRequest= async (req,res)=>{
    try {
        const admin = req.user._id

        const borrowId = req.params.id

        // checks if a specific borrow with the specific conditions exist
        const existing = await Borrow.findOne(
            {
                _id:borrowId,
                status:{$in:['approved', 'overdue']},
                renewalStatus:'requested',
                renewalCount:{ $lt:2 }
            }
        );

        // if the search returns false, then there must be a problem, 
        if (!existing) {

            // checks the specific borrow
            const check = await Borrow.findById(borrowId);

            // if it does not find it, then itdoes not exist in the db
            if (!check) {
                return res.status(404).json({ 
                    message: "Borrow not found"
                });
            }

            // if renewal count is 2 or greater than 2 then limit has reached
            if (check.renewalCount >= 2) {
                return res.status(409).json({ 
                    message: "Cannot approve — renewal limit reached" 
                });
            }

            // checks the renewal status 
            if (check.renewalStatus !== "requested") {
                return res.status(409).json({
                    message: `Cannot approve renewal with renewal status: ${check.renewalStatus}. Only "requested" can be approved.`
                });
            }

            // the overal status of the borrow
            return res.status(409).json({
                message: `Cannot approve renewal with status: ${check.status}, 
                renewal: ${check.renewalStatus}`
            });

        }

        // if the borrow exists
        const previousDueDate = existing.dueDate; // the existingduedate becomes the prevduedate
        const newDueDate = new Date(existing.dueDate.getTime() + 14 * 24 * 60 * 60 * 1000); // counts the new due date from the overal due date of the book
        const lastHistoryIndex = existing.renewalHistory.length - 1; // gets the position of the last renewal history e.g, when renewal history has a list of 2, db index alwasy satrt at 0, so the position of the last ihistory will be 2-1 , position 1

        /**
         * If due date still falls in the past, then use this code here
         * 
         *  const previousDueDate = existing.dueDate;
            const proposedDueDate = new Date(existing.dueDate.getTime() + 14 * 24 * 60 * 60 * 1000);
            const newDueDate = proposedDueDate > new Date() ? proposedDueDate : new Date(Date.now() + 14 * 24 * 60 * 60 * 1000);
         */

        // checks again the borrow with the specific conditions and update immedietly -- atomicity tick tick
        const borrow = await Borrow.findOneAndUpdate(
            {
                _id:borrowId,
                status:{$in:['approved', 'overdue']},
                renewalStatus:'requested',
                renewalCount:{ $lt:2 }
            },
            {
                $set: {
                    status: 'approved',           // pulls it back to approved if it was overdue
                    renewalStatus: 'approved',    // renwal status changed to approved    
                    dueDate: newDueDate,          // <-- the actual renewal due date
                    statusChangedBy: admin,
                    [`renewalHistory.${lastHistoryIndex}.approvedAt`]: new Date(),
                    [`renewalHistory.${lastHistoryIndex}.previousDueDate`]: previousDueDate,
                    [`renewalHistory.${lastHistoryIndex}.newDueDate`]: newDueDate
                },

                $inc: { renewalCount: 1 }
            },
            { new: true }
        );

        if (!borrow) {
            // lost the race between read and write - someone else approved/changed it first
            return res.status(409).json({ 
                message: "Renewal request state changed — please retry" 
            });
        }

        return res.status(200).json({
            message: "Renewal approved successfully",
            dueDate: borrow.dueDate
        });

    } catch (err) {
        return res.status(500).json({ 
            message: "Something went wrong", 
            error: err.message 
        });
    }
}

// cancelle renew book request - the user
exports.cancelleRenewBookRequest= async (req,res)=>{}

// reject renew book request - admin
exports.rejectRenewBookRequest= async (req,res)=>{}