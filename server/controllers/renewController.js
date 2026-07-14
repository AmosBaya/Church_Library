const Borrow = require('../models/Borrow');
const Book = require('../models/Books');
const mongoose= require('mongoose')

// renew book request
exports.renewBookRequest= async (req,res)=>{}

// approve renew book request
exports.approveRenewBookRequest= async (req,res)=>{}

// cancelle renew book request - the user
exports.cancelleRenewBookRequest= async (req,res)=>{}

// reject renew book request - admin
exports.rejectRenewBookRequest= async (req,res)=>{}