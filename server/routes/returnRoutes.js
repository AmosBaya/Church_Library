const express = require('express');
const router = express.Router();

const {returnBookRequest,cancelReturnRequest,completeReturnRequest} = require('../controllers/returnBookController');

const verifyUser = require('../middlewares/authMiddleware');
const authorizeRoles = require('../middlewares/roleMiddleware');


// send book return request
router.patch("/", verifyUser, returnBookRequest);

// approve return request
router.patch("/complete", verifyUser, authorizeRoles("admin"), completeReturnRequest);

// cancell return request
router.patch("/cancel", verifyUser, cancelReturnRequest);

// reject return request
router.patch("/reject", verifyUser, authorizeRoles("admin"), cancelReturnRequest);

module.exports=router;

// evening --> test the routes, fix issues, finish retturncontrollers