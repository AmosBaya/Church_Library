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
            requestGroupId: requestGroupId, //if borrowing multiple books
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

        const borrow = await Borrow.findById(borrowId);

        if(!borrow){
            return res.status(404).json({
                message:"Borrow not found"
            });
        }

         
        borrow.status="approved"
        borrow.borrowApprovedAt= new Date()
        borrow.dueDate= new Date(Date.now() + 14 * 24 * 60 * 60 * 1000)
        borrow.statusChangedBy= admin

        const approved = await borrow.save();

        res.status(200).json({
            message:`Borrow ${approved.book.title} approved successfully`,
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
exports.cancelleBorrow= async (req,res)=>{
    try {
        const user =req.user._id;

        const borrowId = req.params.id;

        const borrow = await Borrow.findById(borrowId);

        if(!borrow){
            return res.status(404).json({
                message:"Borrow not found!"
            });
        }

        borrow.status="cancelled"
        borrow.statusChangedBy=user
        
        // update the number of copies of a book
        const updateBook = await Book.findOneAndUpdate(
            { _id:borrow.book },
            { $inc: { availableCopies: 1 } },
            { new:true }
        );

        await borrow.save();

        res.status(200).json({
            message:"Cancelled success"
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
    
}

// renew book request
exports.renewBookRequest= async (req,res)=>{}

// approve renew book request
exports.approveRenewBookRequest= async (req,res)=>{}

// cancelle renew book request - the user
exports.cancelleRenewBookRequest= async (req,res)=>{}

// reject renew book request - admin
exports.rejectRenewBookRequest= async (req,res)=>{}

// return book request 
exports.returnBookRequest= async (req,res)=>{}

// cancelle return book request 
exports.cancelleReturnBookRequest= async (req,res)=>{}

// complete return book request 
exports.completeReturnBookRequest= async (req,res)=>{}