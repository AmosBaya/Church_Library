const Borrow = require('../models/Borrow');
const Book = require('../models/Books');
const mongoose= require('mongoose')

// borrow book request
exports.borrowRequest= async (req,res)=>{
    try {

        const userId = req.user._id; // userId  from req.user._id (attached by the auth verify middleware)

        const { bookId } = req.body; // const cartItems = req.body.cartItems;

        const requestGroupId = new mongoose.Types.ObjectId();

        const book = await Book.findOneAndUpdate(
            { _id: bookId, availableCopies: { $gt:0 }},
            { $inc: { availableCopies:-1 }},
            { new:true, runValidators: true }
        );

        if(!book){
            return res.status(409).json({ message: "Sorry, all copies are currently reserved." });
        }

        const borrow = await Borrow.create({
            user: userId,
            book: bookId,
            status: 'pending',
            requestGroupId: requestGroupId, //if borrowing multiple books all will have one id
            borrowRequestedAt: new Date()
        });

        res.status(201).json({
            message:"Borrow created successfully",
            data: borrow
        });

    } catch (err) {
        res.status(500).json({
            message:"Internal server error",
            error:err.message
        });
    }
}
/*

// controllers/borrowController.js 
// Taking cart items directly from frontend cart
const mongoose = require('mongoose');
const Book = require('../models/Book');
const Borrow = require('../models/Borrow');
const AppError = require('../utils/AppError');

const borrowBooks = async (req, res, next) => {
  try {
    // userId  from req.user._id (attached by the middleware!)
    const userId = req.user._id;
    
    const requestGroupId = new mongoose.Types.ObjectId();
    const cartItems = req.body.cartItems; // Array of { bookId: '...' }

    // Start a session for atomicity
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      for (const item of cartItems) {
        const bookId = item.bookId;

        // Atomic stock check and decrement
        const book = await Book.findOneAndUpdate(
          { _id: bookId, availableCopies: { $gt: 0 } },
          { $inc: { availableCopies: -1 } },
          { new: true, session, runValidators: true }
        );

        if (!book) {
          throw new AppError(`Book ${bookId} is out of stock`, 409);
        }

        // Create the Borrow document with the SAME group ID
        await Borrow.create([{
          user: userId,      
          book: bookId,
          status: 'pending',
          requestGroupId: requestGroupId,
        }], { session });
      }

      // If we got here, everything succeeded
      await session.commitTransaction();
      session.endSession();

      res.status(201).json({
        message: 'Borrow request submitted successfully!',
        requestGroupId: requestGroupId
      });

    } catch (error) {
      // Rollback everything on failure
      await session.abortTransaction();
      session.endSession();
      throw error;
    }

  } catch (error) {
    next(error);
  }
};

module.exports = { borrowBooks };
 
*/
// approve borrow book request
exports.approveBorrow= async (req,res)=>{
    try {
        const admin = req.user._id;

        const borrowId = req.params.id

        if (req.user.role !== 'admin') {
            return res.status(403).json({
                message: "Admin privileges required"
            });
        }

        const borrow = await Borrow.findById({id: borrowId, status: 'pending'});

        if(!borrow){
            return res.status(404).json({
                message:"Borrow request not found"
            });
        }

        // 3. Check status
        if (borrow.status !== 'pending') {
            return res.status(400).json({
                message: `Cannot approve a request with status: ${borrow.status}. Only pending requests can be approved.`
            });
        }
         
        borrow.status="approved"
        borrow.borrowApprovedAt= new Date()
        borrow.dueDate= new Date(Date.now() + 14 * 24 * 60 * 60 * 1000)
        borrow.statusChangedBy= admin

        const approved = await borrow.save();

        res.status(200).json({
            message:"Borrow approved successfully",
            status:approved.status
        });

    } catch (err) {
        res.status(500).json({
            message:"Internal server error",
            error:err.message
        });
    }
}

// cancell borrow book request - for the user
exports.cancelBorrow= async (req,res)=>{
    try {
        const user =req.user._id;

        const borrowId = req.params.id;

        const borrow = await Borrow.findById(borrowId);

        if(!borrow){
            return res.status(404).json({
                message:"Borrow not found!"
            });
        }

        // Ensure the user owns this borrow request
        if (borrow.user.toString() !== user.toString()) {
            return res.status(403).json({
                message: "You are not authorized to cancel this request"
            });
        }

        // 3. Check status
        if (borrow.status !== 'pending') {
            return res.status(400).json({
                message: `Cannot cancel a request with status: ${borrow.status}. Only pending requests can be cancelled.`
            });
        }

        // change status
        borrow.status="cancelled"
        borrow.statusChangedBy=user
        
        await borrow.save();

        // update the number of copies of a book
        const updateBook = await Book.findOneAndUpdate(
            { _id:borrow.book },
            { $inc: { availableCopies: 1 } },
            { new: true, runValidators: true }
        );

        res.status(200).json({
            message: "Borrow request cancelled successfully",
            data: { borrowId: borrow._id, bookId: borrow.book }
        });

    } catch (err) {
        res.status(500).json({
            message:"Internal server error",
            error:err.message
        });
    }
}

// reject borrow book request- for the admin
exports.rejectBorrow= async (req,res)=>{
    try {

        const admin =req.user._id;

        const borrowId = req.params.id;

        const borrow = await Borrow.findById(borrowId);

        if(!borrow){
            return res.status(404).json({
                message:"Borrow request not found!"
            });
        }

        // 3. Check status before changing it
        if (borrow.status !== 'pending') {
            return res.status(400).json({
                message: `Cannot rejected a request with status: ${borrow.status}. Only pending requests can be rejected.`
            });
        }

        borrow.status="rejected"
        borrow.statusChangedBy=admin
        
        await borrow.save();

        // update the number of copies of a book
        const updateBook = await Book.findOneAndUpdate(
            { _id:borrow.book },
            { $inc: { availableCopies: 1 } },
            { new: true, runValidators: true }
        );

        res.status(200).json({
            message: "Borrow request rejected successfully",
            data: { borrowId: borrow._id, bookId: borrow.book }
        });

    } catch (err) {
        res.status(500).json({
            message:"Internal server error",
            error:err.message
        });
    }
}

// get all borrow requests
exports.getAllBorrowRequests = async (req,res)=>{
    try {

        const borrowRequests = await Borrow.find({ status: 'pending' })
            .populate('user', 'name email')  // Get user details
            .populate('book', 'title author coverImages')  // Get book details
            .sort({ createdAt: -1});

        if(borrowRequests.length === 0){
            return res.status(404).json({
                message:"No borrow requests found"
            });
        }

        res.status(200).json({
            message:"Requests fetch success",
            data: borrowRequests
        });

    } catch (err) {
        res.status(500).json({
            message:"Internal server error",
            error:err.message
        });
    }
}

exports.getAllBorrowRequests = async (req,res)=>{
    try {

        const borrowRequests = await Borrow.find({ status: 'pending' })
            .populate('user', 'name email')  // Get user details
            .populate('book', 'title author coverImages')  // Get book details
            .sort({ createdAt: -1});

        if(borrowRequests.length === 0){
            return res.status(404).json({
                message:"No borrow requests found"
            });
        }

        res.status(200).json({
            message:"Requests fetch success",
            data: borrowRequests
        });

    } catch (err) {
        res.status(500).json({
            message:"Internal server error",
            error:err.message
        });
    }
}
