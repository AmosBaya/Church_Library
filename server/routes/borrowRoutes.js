const express = require('express');
const router = express.Router();
const { borrowRequest, approveBorrow }= require('../controllers/borrowController');
const verifyUser = require('../middlewares/authMiddleware');
const authorizeRoles = require('../middlewares/roleMiddleware');

// borrow request - post
router.post("/", verifyUser, borrowRequest);

router.patch("/approve/:id", verifyUser, authorizeRoles("admin", "manager"), approveBorrow);

module.exports=router;