const {createCategory, getCategories, deleteCategory}=require('../controllers/categoriesController');
const express = require('express');
const router = express.Router();

// create category route
router.post('/create', createCategory);

//get all categories route
router.get('/', getCategories);

// delete catefory
router.delete('/:id', deleteCategory);

module.exports=router;
