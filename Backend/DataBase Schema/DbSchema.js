const mongoose  = require("mongoose");
//this is the USer login and registraion schema for the database 
const UserSchema=new mongoose.Schema({
    userName:String,
    Email:String,
    Password:String
})
//this is the socket schema btween the loged in email and the socket created when they are loged in to enamble real time communication
const socketIdLookUpSchema=new mongoose.Schema({
    userEmail:String,
    socket:String
})
//this is the schema for steoring messages between two communication users
const UserMessagesSchema=new mongoose.Schema({
    sender: String,
      receiver:String,
      content:  String,
      createdAt: String
})
module.exports= {
    lookUpTable:mongoose.model('SockerLookUpTable',socketIdLookUpSchema),
    User:mongoose.model("User",UserSchema),
    UserMessage:mongoose.model("MessageStore",UserMessagesSchema)
}
