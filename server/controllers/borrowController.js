const Borrow = require('../models/Borrow');

// borrow book request
exports.borrowRequest= async (req,res)=>{}

// approve borrow book request
exports.approveBorrow= async (req,res)=>{}

// cancell borrow book request - for the user
exports.cancelleBorrow= async (req,res)=>{}

// reject borrow book request- for the admin
exports.rejectBorrow= async (req,res)=>{}

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