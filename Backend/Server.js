const express=require('express')
const {lookUpTable,User,UserMessage}=require('./DataBase Schema/DbSchema')
const app=express()
const server=require("http").Server(app)
const cors=require('cors')
const io = require('socket.io')(server);
const mongoose=require('mongoose')
const { get } = require('http')
mongoose.connect("mongodb://127.0.0.1:27017/MyConnect",{useNewUrlParser:true,useUnifiedTopology:true})
const db=mongoose.connection
db.on('error',(error)=>{
    console.log('This Error Happened in the Database'+error)
})
db.once("open",()=>{
    console.log('Succesfully Connected to the Database')
    console.log("backend opened go to frontend ")
})


app.use(express.json())
app.use(cors())
let userConnectedEmail;
let userSocketFromTheFrontEnd;
// function to chech if the recipient email/or the person you are talking to has an active soccekt in the database or an association 
const checkIfEmailHasAnAssociation=async(email)=>{
    try {
        const findResult=await lookUpTable.findOne({userEmail:{$eq:email}})
        if(findResult){
            console.log('This'+email+" Is online")
            return {state:true,theSocket:findResult.socket}
        }else{
            console.log("This "+email+" is offline")
            return {state:false, theSocket:null}
        }
    } catch (error) {
        
    }
}
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//this is the socket Area dealing with realtime comunication
io.on("connection",(socket)=>{
    socket.on("is user online",async(data)=>{
        let theRecipientResultFromOnlineCheck;
        const theOtherUSersEmail=data.TheOtherEmail
        console.log("Searching if this user has an active socket->"+theOtherUSersEmail+"this is your socket"+userSocketFromTheFrontEnd)
        const result = await checkIfEmailHasAnAssociation(theOtherUSersEmail);
        theRecipientResultFromOnlineCheck=result
        socket.emit("user online status", result);
    })
    socket.on("sendingMessage",async(messageObject)=>{
        const {sender ,receiver,content,createdAt}=messageObject;
        const result=await checkIfEmailHasAnAssociation(receiver)
        const {state,theSocket}=result
        if(state){
            socket.to(theSocket).emit("newMessage",messageObject)
            console.log("Sending to user with scoket id "+theSocket)
            storeMessage(sender,receiver,content,createdAt)
            console.log("user is online and has received the message")
        }else{
            storeMessage(sender,receiver,content,createdAt)
            console.log("user is Offline and  the message jas been Saved ")
            socket.to()
        }
    })
    //////////////////////////////////////
    //Video Calling Feature
    let roomToJoin;
    let isUserRecipientOnline;
    socket.on("Calling",async(CallData)=>{
        const {calle,receiver}=CallData
        roomToJoin=calle+receiver
        
        isUserRecipientOnline=await checkIfEmailHasAnAssociation(receiver)
        console.log("Scokect for Calling calls Fired")
        if(isUserRecipientOnline.state){
            
            socket.to(isUserRecipientOnline.theSocket).emit("Incoming Call",{calle:calle,RoomToJoin:roomToJoin})
            console.log("Socket for Incoming call fired ")
        }
    }) 
    socket.on("Call Accepted",async(data)=>{
        const {calle}=data
        console.log(calle)
        const gettingCallerId=await checkIfEmailHasAnAssociation(calle)
        if(gettingCallerId.state){
            socket.to(gettingCallerId.theSocket).emit("Has Accepted",{RoomToJoin:roomToJoin})
            console.log("socket for Call Accepted fired")
        }
    })
    //this will be emited by the reciver of the call
    socket.on("Call Rejected",async()=>{
        
        const gettingCallerId=await checkIfEmailHasAnAssociation(userConnectedEmail)
        socket.to(gettingCallerId.theSocket).emit("Your Call Has been rejected")
    })
    ///////////////////////////////////////
      
io.on("disconnect",()=>{
    console.log("User has disconnected")
})
})

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//this function checks the email and username sent from the registration form is it exists in the data base 
const checkIfEmailAndUserExist = async (email, username) => {
    try {
      const emailExist = await User.findOne({ Email: email });
      const usernameExist = await User.findOne({ userName: username });
  
      if (emailExist || usernameExist) {
        console.log("The user exists");
        return true;
      } else {
        console.log("The user does not exist");
        return false;
      }
    } catch (error) {
      console.log("An error occurred when checking email or username:", error);
      return false;
    }
  };
  
const checkPasswordIsCorrectAndEmail=async(email,password)=>{
    try{
        const results=await User.findOne({Email:{$eq:email},Password:{$eq:password}})
        if (results){
            //if the user  found it will return true to the function
            return {status:true,email:results.Email}
        }
        else{
            //if it matches it will return false to the function
            console.log("User Login state true->"+results)
            return {status:false,_id:""}
        }
    }catch(error){
        console.log('This error occured when going to validate loginn details->'+error)
    }
}

//this function store the message btn the sender and the receiver in the database
const storeMessage=async(sender,receiver,message,timeStamp)=>{
    try{
        const storeMessage=await UserMessage.create({
            sender:sender,
            receiver:receiver,
            content:message,
            createdAt:timeStamp
        })
    }catch(error){
        
        console.log('error in storing the message->'+error)
    }
}




//this is route that handles the login form 
app.post("/login",async(req,res)=>{
    const loginData=req.body
    const validatingLoginInfo=await checkPasswordIsCorrectAndEmail(loginData.Email,loginData.Password)
    if(validatingLoginInfo.status){
        res.json({message:`Welcome ${loginData.Email}`,status:true})  
        USerEmail=validatingLoginInfo.email
    }else{
        res.json({message:`No such  Account Found😒 `,status:false})
    }
})
//this function store the userEmail and the socketID for that user in a LookUpDataBase
const storeSocketAndEmailAssos=async(email,socketID)=>{
    try{
        //this first chech if their is any record of that Email with that email in the look up table and their is delete all before creatin a new one 
        const check= await lookUpTable.find({userEmail:{$eq:email}});
        console.log(check)
        if(check.length>0){
             await lookUpTable.deleteMany({userEmail:{$eq:email}})
            const associate= await lookUpTable.create({
                userEmail:email,
                socket:socketID
            })
        }else{
            const associate= await lookUpTable.create({
                userEmail:email,
                socket:socketID
            })
        }
    }catch(error){
    console.log('This error happended in trying to store the email and socketID in the lookup database->'+error)
}
}

//this Route  will take the socketid from the user and store in in a veribale called userScoketId
app.post('/userSocketId',(req,res)=>{
    const socketDataFrontUser=req.body
    res.json({message:"Socketid received and stored id is ->"+socketDataFrontUser.socketID})
    storeSocketAndEmailAssos(USerEmail,socketDataFrontUser.socketID,)
    userSocketFromTheFrontEnd=socketDataFrontUser.socketID
    console.log(socketDataFrontUser.socketID)
    console.log(userSocketFromTheFrontEnd)
})
//the function to remove the logout email from the lookup table 
const removeEmailFromLookUpTable=async(email)=>{
    try{
        const removeEmail=await lookUpTable.deleteMany({userEmail:{$eq:email}})
        console.log("Association deleted in the lookup table")
    }catch(error){
        console.log("This happened when try to disAsscoiate the Email form the socketID")
    }
}
//this route should handle the user loginout
app.post("/logout",(req,res)=>{
    const theEmailToDisAssociate=req.body.EmailTo
    removeEmailFromLookUpTable(theEmailToDisAssociate)
    userConnectedEmail=theEmailToDisAssociate
    console.log("user"+userConnectedEmail+" has disconnected")
})
//this route handles the registraion form 
app.post("/registartion",async(req,res)=>{
    const registartionData=req.body
    console.log(registartionData)
    const validationCheck=await checkIfEmailAndUserExist(registartionData.Email,registartionData.userName)
    if(!validationCheck){
        const createNewUser=new User({
            userName:registartionData.userName,
            Email:registartionData.Email,
            Password:registartionData.Password
        })
        createNewUser.save()
        res.json({message:"🎉Successfully Created Account Now Login"})
    }else{
        res.json({message:'This Email And password already Exist😒 be original'})
    }
})
app.post("/search", async(req,res)=>{
    const userNameTosearchFor=req.body
    const searchResult=await User.find({userName:userNameTosearchFor.userName})
    if(searchResult.length==0){
         res.json({userList:searchResult,states:false,msg:'User Not Found!'})
    }else{
        res.json({userList:searchResult ,states:true, msg:""})
    }
})
//function to get the messages from the database 
const getMessages=async(personEmail)=>{
    try{
        const messages= await UserMessage.find({$or:[{sender:{$eq:personEmail}},{receiver:{$eq:personEmail}}]})
        if(messages.length>0){
            return {status:true,Messages:messages}
        }else{
            return {status:false,Messages:messages}
        }
    }catch(error){
        console.log("This Happended when getting the messages from the database=->"+error)
    }
}
//route to send the user messages to the screen 
app.post('/myMessages',async(req,res)=>{
    const personEmail=req.body.Email;
    const doesUserHaveMessages =await getMessages(personEmail)
    if(doesUserHaveMessages.status){
        res.json({state:true, UserMessges:doesUserHaveMessages.Messages})
    }else{
        res.json({state:false, UserMessges:doesUserHaveMessages.Messages})
    }
})
//this function get messages from the private chat of two users
app.post('/privateMessages', async (req, res) => {
    const senderEmail = req.body.sender;
    const receiverEmail = req.body.receiver;
    console.log("getting messages btwn "+senderEmail +"and "+receiverEmail);
    const messages = await UserMessage.find({
      $or: [
        { $and: [{ sender: senderEmail }, { receiver: receiverEmail }] },
        { $and: [{ sender: receiverEmail }, { receiver: senderEmail }] },
      ],
    });
    if (messages.length > 0) {
      res.json({ state: true, Messages: messages, message: 'Messages found' });
    } else {
      console.log("No Messages Found between the two users");
      res.json({ state: false, Messages: messages, message: 'No messages found' });
    }
  });
//this function  pings every socket in the lookupdatabase to check if they are active or remove them if they dont reply 
const checkSocketsAreActive = async () => {
    const getAllSockets = await lookUpTable.find({});
    if (getAllSockets.length > 0) {
      for (const Socket of getAllSockets) {
        const theSocketId = Socket.socket;
        io.to(theSocketId).emit('hey are you active');
        let isClientActive = false;
  
        const timeout = setTimeout(async () => {
          if (!isClientActive) {
            console.log('Client is inactive', theSocketId);
            await lookUpTable.deleteOne({ socket: theSocketId });
          }
        }, 1000);
        io.setMaxListeners(io.getMaxListeners() + 1);
        io.on('yes i am active', () => {
          isClientActive = true;
          console.log('Client is active');
          clearTimeout(timeout);
          io.setMaxListeners(io.getMaxListeners() - 1);
        });
      }
    }
  };
app.get("/test",(req,res)=>{
res.send('This route is working ')
})
  
 // setInterval(checkSocketsAreActive,5000)
server.listen(8083,()=>{
    console.log("Server running on Port 5000")
})