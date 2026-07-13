const mongoose = require('mongoose');


const borrowSchema = new mongoose.Schema({
    user:{
        type:mongoose.Types.ObjectId,
        ref:'User',
        required:true,
    },

    books:{
        type:mongoose.Types.ObjectId,
        ref:'Book',
        required:true
    },

    status:{
        type:String,
        enum:["pending","approved","overdue","return-requested","completed","cancelled","rejected"],
        default:"pending",
        index:true
    },

    borrowRequestedAt: { 
        type: Date, 
        default: Date.now 
    },

    dateBorrowed:{
        type:Date,
        default:null
    },

    dueDate:{
        type:Date,
        default:null
    },

    actualReturnDate: { 
        type: Date, 
        default: null 
    },

    // Top-level for FAST queries
    renewalStatus: { 
        type: String, 
        enum: ['none', 'requested', 'approved', 'cancelled', 'rejected'], 
        default: 'none' 
    },

    // Count for quick display & DB-level cap
    renewalCount: { 
        type: Number, 
        default: 0, 
        max: 2 
    }, 

    // Nested array for AUDIT TRAIL (append-only)
    renewalHistory: [
        {
            requestedAt: { type: Date, default: Date.now },
            approvedAt: { type: Date },
            previousDueDate: Date,
            newDueDate: Date,
            adminNotes: String
        }
    ],

    statusChangedBy: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User' 
    },
},
{
    timestamps:true
}
);

// 1. For the User Dashboard (Find all pending/approved books for ONE user)
BorrowSchema.index({ user: 1, status: 1 });

// 2. For the Admin Dashboard (Find all pending approvals, sorted by newest first)
BorrowSchema.index({ status: 1, createdAt: -1 });

// 3. For the Nightly Cron Job (Find overdue approved books)
BorrowSchema.index({ status: 1, dueDate: 1 });

module.exports=mongoose.model('Borrow', borrowSchema);
