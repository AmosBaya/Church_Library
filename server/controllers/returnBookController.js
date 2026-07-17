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
exports.cancelReturnRequest= async (req,res)=>{
    try {
        const admin = req.user._id;

        const borrowId = req.params.id;

        const exists = await Borrow.findOne(
            {
                _id:borrowId,
                user:user,
                status:'return-requested',
            }
        );

        if (!existing) {

            const check = await Borrow.findById(borrowId);

            if (!check){ 
                return res.status(404).json({ 
                    message: "Borrow not found" 
                })
            };

            if (check.user.toString() !== user.toString()) {
                return res.status(403).json({ 
                    message: "Not allowed to cancel this return" 
                });
            }
            return res.status(409).json({
                message: `Cannot cancel return — current status: ${check.status}`
            });
        }

        // return to the status which borrow was before 'return-requested', by checking thr due date
        const revertedStatus = existing.dueDate && existing.dueDate < new Date()
        ? 'overdue'
        : 'approved';

        const borrow = await Borrow.findOneAndUpdate(
            {
                _id:borrowId,
                user:user,
                status:'return-requested',
            },
            {
                $set:{ 
                    status:revertedStatus,
                    statusChangedBy:admin
                }
            },
            { new:true }
        );

        if (!borrow) {
            return res.status(409).json({ message: "Return request state changed — please retry" });
        }

        return res.status(200).json({
            message: "Return request cancelled successfully",
            status: borrow.status
        });

    } catch (err) {
        res.status(500).json({
            message:"Internal server error",
            error:err.message
        });
    }
}



// complete return book request 
exports.completeReturnRequest= async (req,res)=>{
    try {
        const admin = req.user._id;

        const borrowId = req.params.id

        const exists = await Borrow.findOne(
            {
                _id:borrowId,
                status:'return-requested'
            }
        );

        if(!exists){

            const check = await Borrow.findById(borrowId);

            if(!check){
                return res.status(404).json({
                    message:"Borrow Not found"
                });
            }

            return res.status(409).json({
                message:`Cannot complete a return resquest with status: ${check.status}`
            });
        }

        let borrow;
        const session = await mongoose.startSession();
        try { 
            await session.withTransaction(async () => {
                borrow = await Borrow.findOneAndUpdate(
                    { 
                        _id: borrowId, 
                        status: 'return-requested' 
                    },
                    { 
                        $set: { 
                            status: 'completed', 
                            actualReturnDate: new Date(), 
                            statusChangedBy: admin 
                        } 
                    },
                    { new: true, session }
                );

                if (!borrow) {
                    return res.status(409).json({ message: "Return request state changed — please retry" });
                }
                await Book.findByIdAndUpdate(
                    borrow.book,
                    { $inc: { availableCopies: 1 } },
                    { session }
                );

                return borrow;
            });

        } finally {
            session.endSession();
        }

        return res.status(200).json({
            message: "Return completed successfully",
            status: borrow.status
        });

    } catch (err) {
        res.status(500).json({
            message:"Internal server error",
            error:err.message
        });
    }
}
