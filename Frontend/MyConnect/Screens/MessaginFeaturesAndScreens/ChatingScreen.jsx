import {useState, React, useEffect} from 'react';
import {useIsFocused} from '@react-navigation/native';
import {
  TextInput,
  Text,
  View,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  FlatList,
  Button
} from 'react-native';
import socket from '../Socket';
import {useFocusEffect} from '@react-navigation/native';
import serverURL from '../MessaginFeaturesAndScreens/ServerUrl';
import InCommingCall from './InCommingCall';
import LinearGradient from 'react-native-linear-gradient';

export default function ChatingScreen({navigation, route}) {
  const {Name, RecipientEmail, currentUserEmail} = route.params;
  const [showMoreOptions, setShowMoreOptions] = useState(false);
  const [messagetoSend, setSetMessageToSend] = useState('');
  const [userOnline, setUserOnline] = useState();
  const [myConvo, setConvo] = useState([]);
  const [noMessages, setNoMessages] = useState(true);
  const [iAmCalling,setIamCalling]=useState(false)
  const [showInComingCall,setShowInComingCall]=useState(false)
  const [roomToJoinForVideoCall,setRoomToJoin]=useState('')
  const [whoIsCalling,setWhoIsCalling]=useState('')
  const showingMoreOptionsFunction = () => {
    if (!showMoreOptions) {
      setShowMoreOptions(true);
    }
  };
  /*this function emits is user online to the server sending the  email of the 
  person you are talking to and your email which will check your  socket id 
  from the database  send you the details using it and  listens for the  
  yesOnline from the server */
  const chechOnlineState=()=>{
    socket.emit("is user online",{
      TheOtherEmail:RecipientEmail,
    })
    socket.on("user online status",(data)=>{
      console.log(data.state)
      setUserOnline(data.state)
    })
  }

  const sendBtnPressed = () => {
    try {
      socket.emit('sendingMessage', {
        sender: currentUserEmail,
        receiver: RecipientEmail,
        content: messagetoSend,
        createdAt:new Date()
      });
      const messageToPushLocaly={
        sender: currentUserEmail,
        receiver: RecipientEmail,
        content: messagetoSend,
        createdAt:new Date()+Math.floor(Math.random()*20)
      }
      setConvo((prevConvo) => [...prevConvo, messageToPushLocaly])
    } catch (error) {
      console.log('this happened when sending the message ->' + error);
    }
  };
///function for handling when the Call but is pressed by the caller 
const callPersonFunction=()=>{
  socket.emit("Calling",{
    calle:currentUserEmail,
    receiver:RecipientEmail
  })
  setIamCalling(true)
  navigation.navigate("VideoCallScreen",{
    whoIsJoining:currentUserEmail,
    Room:currentUserEmail+RecipientEmail
  })
}

///when the reciver of the call accepts the Call
const AcceptCallFunction=()=>{
  socket.emit("Call Accepted",{calle:RecipientEmail});
  setShowInComingCall(false)
  navigation.navigate("VideoCallScreen",{
    whoIsJoining:currentUserEmail,
    Room:roomToJoinForVideoCall
  })
}
const RejectCallFunction=()=>{
  socket.emit("Call Rejected")
  setShowInComingCall(false)
}
//////////////////////////////

 
  //this function is to retrive the messages from the server
  const getPrivateMessages = async people => {
    const res = await fetch(`${serverURL}privateMessages`, {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify(people),
    });
    const data = await res.json();
    setConvo(data.Messages);
    if (data.Messages.length > 0) {
      setNoMessages(false);
    } else {
      const botMessage={
        sender: "Connect",
        receiver: "Connect",
        content: "Hey "+ RecipientEmail+" i am Ummi from Connect Start A new Convo to create a connection",
        createdAt:new Date()+Math.floor(Math.random()*20)
      }
      setConvo(prevConvo => prevConvo.concat(botMessage))    }
    console.log("New messages updated ");
  };

  
  //this check if the user is on this page
  const isFocused = useIsFocused();
if(isFocused){
  
}
  const fetchMessages = () => {
    getPrivateMessages({sender: currentUserEmail, receiver: RecipientEmail});
  };
  useEffect(() => {
    ///////////this are sockes function for the Video Calling
    //listening for any one who wants to call them
    socket.on("Incoming Call",(data)=>{
      const{ calle,RoomToJoin}=data
      setShowInComingCall(true)
      setWhoIsCalling(calle)
      setRoomToJoin(RoomToJoin)
      console.log("Socket for listening to incing calls fired")
    }
    
    )
    ///this listens if the call they have made has been accepted
socket.on("Has Accepted",(data)=>{
  const {RoomToJoin}=data
console.log('Reciver has accepted')
})
 //this listen if the call has been rejected
 socket.on("Your Call Has been rejected",()=>{
  console.log('Call rejected')
  setIamCalling(false)
 })
    ///////////////////////////////////////////////

    fetchMessages();
    ///Sockets For online Detection And new messages
    chechOnlineState()
    socket.on("newMessage",(newMessage)=>{
      console.log(newMessage)
      setConvo((prevConvo) => [...prevConvo, newMessage]);
    })
    socket.on("this user is offline",()=>{
      setUserOnline(false)
    })
    const checkItheOtherPersonIsonlineConstantly=setInterval(chechOnlineState,5000)
    return () => {
      socket.off("newMessage")
      socket.off("Incoming Call")
      clearInterval(checkItheOtherPersonIsonlineConstantly)
    };

  }, [isFocused]);

  return (
    <View style={styles.MainChatContainer}>
      <View style={styles.NavBar}>
        <View style={styles.ProfileContainer}>
          <Text style={{color: '#475FFC', fontSize: 25}}>{Name.charAt(0)}</Text>
        </View>
        <View style={styles.userInfo}>
          <Text style={{color: 'black', fontWeight: 'bold'}}>{Name}</Text>
          {
            userOnline &&
            <Text style={{color: 'limegreen'}}>Online</Text>
          }
          {
            !userOnline &&
            <Text style={{color: 'red'}}>offline</Text>
          }
          
        </View>
        {!showMoreOptions && (
          <TouchableOpacity onPress={showingMoreOptionsFunction}>
            <Text style={{color:'white',padding:5,backgroundColor:'#8A9A5B',marginLeft:5,borderRadius:20,borderTopLeftRadius:0,marginRight:5}}>More</Text>
          </TouchableOpacity>
        )}
        {showMoreOptions && (
          <View style={styles.CallContainer}>
          <TouchableOpacity onPress={callPersonFunction}>
            <Text  style={{backgroundColor:'#29AB87',padding:5,borderRadius:20,color:'white'}}>Video Call</Text>
          </TouchableOpacity>
            
          </View>
        )}
      </View>
      {showInComingCall && <View>
        <LinearGradient
      colors={['#00CED1', '#0076CE',"#1E90FF"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 0 }}
      style={styles.MainCallContainer}
    >
      <View style={styles.ProfieCallContainer}>
        <Text style={{ color: 'white', fontWeight: 'bold' }}> New Call</Text>
      </View>
      <View style={styles.CallerInfo}>
        <Text style={{ color: 'white' }}>{whoIsCalling}</Text>
        <Text style={{ color: 'white', fontStyle: 'italic' }}>Is Calling you</Text>
      </View>
      <View style={styles.callBtnContainer}>
        <TouchableOpacity onPress={RejectCallFunction}>
          <View style={styles.RejectBtn}>
            <Text>No</Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity onPress={AcceptCallFunction}>
          <View style={styles.AcceptBtn}>
            <Text>Yes</Text>
          </View>
        </TouchableOpacity>
      </View>
    </LinearGradient>
      </View>}
      <View style={styles.messagingDisplayContainer}>
        {myConvo.length>0 && (
          <FlatList
            style={{height: '100%',padding:5}}
            data={myConvo}
            keyExtractor={item => item.createdAt}
            renderItem={({item}) => {
              if (currentUserEmail === item.sender) {
                return (
                  <View style={{borderBottomLeftRadius: 20, borderTopRightRadius: 20, borderBottomRightRadius: 20,borderWidth:2,borderColor:'#000f89', padding: 5, marginBottom: 5}}>
                    <Text style={{color: 'grey' ,marginBottom:5}}>You🫵</Text>
                    <Text style={{color: 'black'}}>{item.content}</Text>
                  </View>
                );
              } else {
                return (
                  <View style={{borderBottomLeftRadius: 20, borderTopRightRadius: 20, borderBottomRightRadius: 20,borderWidth:2,borderColor:'#0B6623', padding: 5, marginBottom: 5}}>
                    <Text style={{color: 'grey'}}>{Name}</Text>
                    <Text style={{color: 'black',fontWeight:'bold'}}>{item.content}</Text>
                  </View>
                );
              }
            }}
          />
        )}

      </View>
      <View style={styles.customBackButton}>
        <Text style={{color: 'white'}} onPress={() => navigation.goBack()}>
          Back
        </Text>
      </View>

      <View style={styles.MessagingAreaAndFUnctions}>
        <View style={styles.messageInputAreaAndSendingButton}>
          <TextInput
            placeholder={'Messaging ' + Name}
            placeholderTextColor={'grey'}
            style={styles.messageInputField}
            onChangeText={message => setSetMessageToSend(message)}
          />
          <View style={styles.sendMessageBtn}>
            <TouchableOpacity onPress={sendBtnPressed}>
              <Text style={{color:'white',fontWeight:'bold'}}>Send</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  MainChatContainer: {
    flex: 1,
    height: StatusBar.currentHeight,
    backgroundColor: '#F1F1F5',
  },
  messagingDisplayContainer: {
    flex: 1,
    backgroundColor: '#F4F7F1',
  },
  MessagingAreaAndFUnctions: {
    height: 50,
    flexDirection: 'row',
    margin: 5,
    borderRadius: 20,
  },
  messageInputAreaAndSendingButton: {
    height: '100%',
    flexDirection: 'row',
    width: '100%',
    borderRadius: 20,
  },
  messageInputField: {
    flex: 1,
    borderRadius: 20,
    borderWidth: 1,
    borderRightWidth: 0,
    color: 'black',
  },
  sendMessageBtn: {
    backgroundColor: 'black',
    width: 60,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
  },
  customBackButton: {
    position: 'absolute',
    top: 30,
    left: 10,
    borderWidth: 1,
    padding: 5,
    backgroundColor: 'black',
    borderRadius: 10,
  },
  NavBar: {
    flexDirection: 'row',
    backgroundColor: '#F1F1F5',
    height: 50,
    justifyContent: 'flex-end',
    marginTop: StatusBar.currentHeight,
  },
  ProfileContainer: {
    backgroundColor: 'white',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: 40,
    borderRadius: 100,
    width: 40,
    margin: 2,
    borderWidth: 1,
    borderColor: 'black',
  },
  CallContainer: {
    marginLeft: 5,
  },
  leftSideDisplay: {
    backgroundColor: 'blue',
    padding: 5,
  },
  MainCallContainer: {
    height: 75,

    flexDirection: 'row',
    padding: 5,
    borderRadius: 15,
  },
  ProfieCallContainer: {
    padding: 10,
    borderRadius: 20,
    borderWidth: 1,
    height: 65,
    width: 65,
    justifyContent: 'center',
    alignItems: 'center',
  },
  CallerInfo: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 3,
    borderRadius: 20,
    marginRight: 3,
    marginLeft: 3,
  },
  callBtnContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },

  RejectBtn: {
    backgroundColor: 'red',
    height: 50,
    width: 50,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  AcceptBtn: {
    backgroundColor: 'limegreen',
    height: 50,
    width: 50,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 3,
  },
});
