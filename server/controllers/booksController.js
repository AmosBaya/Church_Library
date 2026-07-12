const { default: mongoose } = require('mongoose');
const Book = require('../models/Books');

// creating/adding a book
exports.createBook = async (req,res)=>{
    try {
        const { title,author,category,summary,totalCopies,availableCopies,status,coverImages } = req.body;

        if(!title || !author || !category || !summary || !coverImages){
            return res.status(400).json({
                message:"missing important book information"
            });
        }

        const newBook = new Book({ title,author,category,summary,totalCopies,availableCopies,status,coverImages });
        await newBook.save();

        res.status(201).json({
            message:`Book ${newBook.title} created successfully`,
            data:newBook
        })
    } catch (err) {
        res.status(500).json({
            message:"Server error",
            error:err.message
        })
    }
}

//updating a book
exports.updateBook = async (req,res)=>{
    try {
        const bookId = req.params.id;

        const updates = req.body;

        const updatedBook = await Book.findByIdAndUpdate(bookId, updates, { new:true });

        if(!updatedBook){
            return res.status(404).json({
                message:"Book not found"
            });
        }


        res.status(200).json({
            message: `Book ${updatedBook.title} updated successfully`,
            data:updatedBook
        });

    } catch (err) {
        res.status(500).json({
            message:"Internal server error",
            error:err.message
        });
    }
}

// fetching all books
exports.getAllBooks = async (req,res)=>{
    try {
        const books = await Book.find().sort({ title:1 });

        if(!books){
            return res.status(404).json({
                message:"Books not found"
            });
        }

        res.status(200).json({
            message:"Books Fetching success",
            data:books
        });

    } catch (err) {
        res.status(500).json({
            message:"Internal server error",
            error:err.message
        })
    }
}

// fetching one book by id
exports.getOneBook = async (req,res)=>{
    try {
        const bookId = req.params.id;

        const book = await Book.findById(bookId);

        if(!book){
            return res.status(404).json({
                message:"Book not found"
            });
        }

        res.status(200).json({
            data:book
        });

    } catch (err) {
        res.status(500).json({
            message:"Internal server error",
            error:err.message
        });
    }
}

//fetching available books only
exports.getAvailableBooks = async (req,res)=>{
    try {
        const books = await Book.find({ status:'available' }).sort({ title:1 });
        
        if (books.length === 0) {
            return res.status(404).json({ 
                message: "No available books found" 
            });
        }

        res.status(200).json({
            message:"Books Fetching success",
            data:books
        });

    } catch (err) {
        res.status(500).json({
            message:"Internal server error",
            error:err.message
        })
    }
}

// fetching books by category
exports.getBooksByCategory = async (req,res)=>{
    try {
        const { categoryId } = req.params;

        if(!mongoose.Types.ObjectId.isValid(categoryId)){
            return res.status(400).json({
                message:"Invalid category id"
            });
        }

        const books = await Book.find({ category:categoryId })
        .populate('category', 'name description')
        .sort({ title:1 });
        
        if(books===0){
            return res.status(404).json({
                message:"Books not found"
            });
        } 

        res.status(200).json({
            message:"Books Fetching success",
            data:books
        });

    } catch (err) {
        res.status(500).json({
            message:"Internal server error",
            error:err.message
        })
    }
}


// fetching available books by category
exports.getAvailableBooksByCategory = async (req,res)=>{
    try {
        const { categoryId } = req.params;

        if(!mongoose.Types.ObjectId.isValid(categoryId)){
            return res.status(400).json({
                message:"Invalid category id"
            });
        }

        const books = await Book.find({ category:categoryId, status:"available" })
        .populate('category', 'name description')
        .sort({ title:1 });
        
        if(books===0){
            return res.status(404).json({
                message:"Books not found"
            });
        } 

        res.status(200).json({
            message:"Books Fetching success",
            data:books
        });

    } catch (err) {
        res.status(500).json({
            message:"Internal server error",
            error:err.message
        });
    }
}

// search books
exports.searchBooks = async (req,res)=>{
    try {
        const q = req.body;

        const books = await Book.find({
            title:{$regex:q, $options:"i"}
        }).sort({ title:1 });

        if(books===0){
            return res.status(404).json({
                message:"No books found"
            });
        }

        res.status(200).json({
            data:books
        });

    } catch (err) {
        res.status(500).json({
            message:"Internal server error",
            error:err.message
        });
    }
}

// delete a book
exports.deleteBook = async (req,res)=>{
    try {
        const bookId = req.params.id;

        const deletedBook = await Book.findByIdAndDelete(bookId);

        if(!deletedBook){
            return res.status(404).json({
                message:"Book not found"
            });
        }

        res.status(200).json({
            message:`Book ${deletedBook.title} deleted successfully`
        });

    } catch (err) {
        res.status(500).json({
            message:"Internal server error",
            error:err.message
        });
    }
}