const { createBook,updateBook,getAllBooks,getOneBook,getAvailableBooks,getAvailableBooksByCategory, searchBooks ,getBooksByCategory,deleteBook } = require('../controllers/booksController');
const express = require('express');
const router = express.Router();


// create book route
router.post("/create", createBook);

// updtate book route
router.put("/:id", updateBook);

// fetching all books route
router.get("/", getAllBooks);

// fetching available books
router.get("/available", getAvailableBooks);

// search api
router.get("/search", searchBooks)

// fetching available books by category
router.get("/category/:categoryId/available", getAvailableBooksByCategory);

// fetching all books by category
router.get("/category/:categoryId", getBooksByCategory);

// fetching one book by id
router.get("/:id", getOneBook);

// delete book
router.delete("/:id", deleteBook);

module.exports=router;
