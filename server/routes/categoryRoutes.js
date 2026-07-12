const {createCategory, getCategories, deleteCategory}=require('../controllers/categoriesController');
const express = require('express');
const router = express.Router();

// create category route
router.post('/create', createCategory);

//get categories route
router.get('/all', getCategories);

// delete catefory
router.delete('/:id', deleteCategory);

module.exports=router;
