import mongoose from "mongoose";
 const userschema=mongoose.Schema({
    name:{type:String,required:true},
    email:{type:String,required:true},
    password:{type:String,required:true},
    about:{type:String},
    tags:{type:[String]},
    joinedon:{type:Date,default:Date.now},
    friends: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    lastPostDate: { type: Date, default: Date.now }
 })

 userschema.methods.canPostToday = function() {
   const today = new Date().toISOString().split('T')[0];  // Only compare date part
   const lastPostDate = this.lastPostDate.toISOString().split('T')[0];
   
   if (lastPostDate === today) {
     return false;  // Cannot post again today
   }
   return true;
 };

export default mongoose.model("User",userschema)