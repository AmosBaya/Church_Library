const express = require('express');
const router = express.Router();

const { renewBookRequest,approveRenewalRequest,cancelRenewalRequest,rejectRenewalRequest }= require('../controllers/renewController');
const verifyUser = require('../middlewares/authMiddleware');
const authorizeRoles = require('../middlewares/roleMiddleware');


// send book renew request
router.patch("/", verifyUser, renewBookRequest);

// approve renewal request
router.patch("/approve", verifyUser, authorizeRoles("admin"), approveRenewalRequest);

// cancell renewal request
router.patch("/cancel", verifyUser, cancelRenewalRequest);

// reject renewal request
router.patch("/reject", verifyUser, authorizeRoles("admin"), rejectRenewalRequest);

module.exports=router;

// evening --> test the routes, fix issues, finish retturncontrollers