import {
  View,
  StyleSheet,
  Text,
  FlatList,
  Dimensions,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  ActivityIndicator
} from 'react-native';
import { useState, useEffect } from 'react';
import SearchPeople from './SearchPeople';
import { useIsFocused } from '@react-navigation/native';
import InCommingCall from './InCommingCall';
import socket from '../Socket';
import LinearGradient from 'react-native-linear-gradient';
import serverURL from './ServerUrl';
export default function MessagingArea({ navigation, setUSerAuthState, userEmail }) {
  const [userMessageStore, setUserMessageStore] = useState([])
  const [loadingMessages, setLoadingMessages] = useState(false)
  const [showChatScreen, setShowChatScreen] = useState(true);
  const [showGroupsScreen, setshowGroupsScreen] = useState(false);
  const [addPeopleClicked, setAddPeopleClicked] = useState(false)
  const [myMessages, setMyMesseges] = useState([])
  const [doesUserHaveMessages, setDoesUserHaveMessages] = useState()
  const [showInComingCall,setShowInComingCall]=useState(false)
  const [roomToJoinForVideoCall,setRoomToJoin]=useState('')
  const [whoIsCalling,setWhoIsCalling]=useState('')
  //this funtion notifys the server that the user is logout and should deleted the lookUprecord of the user with the socket 
  const nofitySever = async (theEmail) => {
    try {
      setLoadingMessages(true)
      const res = await fetch(`${serverURL}logout`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(theEmail)
      })
      setLoadingMessages(false)
    } catch (error) {
      console.log('this Happened When tring to Logout->'+error)
    }
  }
  //this Function Featches the Messages tile from the Database with your Email either on the recipient or the sender 
  const fetchMessages = async (yourEmail) => {
    try {
      setLoadingMessages(true)
      const res = await fetch(`${serverURL}myMessages`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(yourEmail)
      });
      const data = await res.json();

      if (data.state) {
        const uniqueConversations = [];

        data.UserMessges.forEach((message) => {
          const conversationExists = uniqueConversations.some((conversation) => {
            return (
              (conversation.sender === message.sender && conversation.receiver === message.receiver) ||
              (conversation.sender === message.receiver && conversation.receiver === message.sender)
            );
          });

          if (!conversationExists) {
            uniqueConversations.push({
              sender: message.sender,
              receiver: message.receiver,
              id: Math.floor(Math.random() * 1000) + 1
            });
          }
        });

        setMyMesseges(uniqueConversations);
        setDoesUserHaveMessages(true);
      } else {
        setMyMesseges([]);
        setDoesUserHaveMessages(false);
      }

      setLoadingMessages(false);
    } catch (error) {
      setLoadingMessages(false);
      console.log(error);
    }
  };
////////////////////////functions for socket 
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
///////////////////////////////////////////////
const isFocused=useIsFocused()
  useEffect(() => {
    fetchMessages({ Email: userEmail });
    const unsubscribe = navigation.addListener('focus', () => {
      fetchMessages({ Email: userEmail });
    });
////////////////////////socket Area

///////////////////////////
    return unsubscribe;
  }, [navigation, userEmail]);
  const logOutFunction = () => {
    setUSerAuthState(false)
    const Email = { EmailTo: userEmail }
    nofitySever(Email)
  }
  return (
    <View style={styles.MainMessagingContainer}>
      <StatusBar translucent backgroundColor="transparent" />
      <View style={styles.navBar}>
        <Text
          style={{
            fontSize: 35,
            fontWeight: 'bold',
            color: 'white',
            alignSelf: 'baseline',
            marginTop: '15%',
            marginLeft: '3%',
          }}>
          Connect
        </Text>
      </View>

      {showInComingCall && <View>
        <LinearGradient
      colors={['#00CED1', '#0076CE',"#1E90FF"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 0 }}
      style={styles.MainCallContainer}
    >
      <View style={styles.ProfieCallContainer}>
        <Text style={{ color: 'white', fontWeight: 'bold' }}> New Ping</Text>
      </View>
      <View style={styles.CallerInfo}>
        <Text style={{ color: 'white' }}>{whoIsCalling}</Text>
        <Text style={{ color: 'white', fontStyle: 'italic' }}>Hey I wanted to call You</Text>
      </View>
      <View style={styles.callBtnContainer}>

        <TouchableOpacity onPress={()=>setShowInComingCall(false)}>
          <View style={styles.AcceptBtn}>
            <Text>Oky</Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity onPress={()=>setShowInComingCall(false)}>
          <View style={styles.RejectBtn}>
            <Text>Reject</Text>
          </View>
        </TouchableOpacity>
      </View>
    </LinearGradient>
      </View>}


      <TouchableOpacity onPress={logOutFunction}>
        <Text style={{ padding: 10, backgroundColor: 'black', borderRadius: 20, position: 'absolute', right: 10, top: 30, color: 'white' }}>Logout</Text>
      </TouchableOpacity>
      <View style={styles.ContentBody}>
        <View style={styles.OptionsContainer}>
          <View style={styles.FriendListContainer}>
            <TouchableOpacity onPress={() => navigation.push('SearchPage')}>
              <View style={styles.AddFriendButton}>
                <Text style={{ color: '#475FFC', fontSize: 25 }}>+</Text>
              </View>
            </TouchableOpacity>
            {
              myMessages.length>0 &&
              <ScrollView horizontal={true} style={styles.FriendScrollContainer}>
             {myMessages.map(message=>{
                return(
                      <View style={styles.FriendButton}key={message.createdAt}>
                        <Text style={{color: '#475FFC', fontSize: 25}}>
                            {message.receiver.charAt(0)}
                          </Text>
                        </View>
                )
              })}
              </ScrollView>
            }

          </View>

          <View style={styles.ChatGroupSwitchContainer}>
            <TouchableOpacity
              style={{ backgroundColor: '#475FFC', margin: 3,borderBottomLeftRadius:0,borderRadius:20 }}>
              <Text style={{ padding: 5, color: 'white' ,fontWeight:'bold'}}>My Chat</Text>
            </TouchableOpacity>

            {loadingMessages && <ActivityIndicator size={20} />}
          </View>
          
        </View>
        {showChatScreen && (
          <View style={styles.chatDisplayContainer}>
            
            {myMessages.length>0 &&
              <FlatList
                style={{ height: '70%' }}
                data={myMessages}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => {
                  return (
                    <TouchableOpacity
                      key={item.createdAt}
                      onPress={() =>
                        navigation.navigate('chatScreen', {
                          Name: item.sender === userEmail ? item.receiver : item.sender,
                          RecipientEmail:
                            item.receiver === userEmail ? item.sender : item.receiver,
                        })
                      }
                    >
                      <View style={styles.chatTile}>
                      {loadingMessages && <ActivityIndicator size={40} />}
                        <View style={styles.ProfileContainer}>
                          {item.receiver === userEmail && item.sender ? (
                            <Text style={{ color: '#475FFC', fontSize: 25 }}>
                              {item.sender.charAt(0)}
                            </Text>
                          ) : item.receiver && item.sender ? (
                            <Text style={{ color: '#475FFC', fontSize: 25 }}>
                              {item.receiver.charAt(0)}
                            </Text>
                          ) : null}
                        </View>
                        <View style={styles.userDetailsDisplay}>
                          {item.receiver === userEmail && item.sender ? (
                            <Text style={{ color: 'black', fontSize: 20, fontWeight: 'bold' }}>
                              {item.sender}
                            </Text>
                          ) : item.receiver && item.sender ? (
                            <Text style={{ color: 'black', fontSize: 20, fontWeight: 'bold' }}>
                              {item.receiver}
                            </Text>
                          ) : null}
                          <Text style={{ color: 'grey', fontSize: 10, fontStyle: 'italic' }}>
                            Tap to continue conversation
                          </Text>
                        </View>
                      </View>
                    </TouchableOpacity>


                  )
                }}
              />
            }
            {
              !doesUserHaveMessages && <Text style={{ color: 'black', height: 150 }}>wow it seems no wants to talk to you or you have just not Connected with anyone click the + to Connect</Text>
            }
          </View>
        )}
      </View>
    </View>
  );
}
const styles = StyleSheet.create({
  MainMessagingContainer: {
    flex: 1,
    flexGrow: 1,
    paddingTop: StatusBar.currentHeight,
    backgroundColor: 'black'
  },

  navBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '35%',
    width: '100%',
    backgroundColor: '#475FFC',
    paddingTop: StatusBar.currentHeight,
    borderTopRightRadius:20,
    borderTopLeftRadius:20,
  },
  ContentBody: {
    height: '100%',
    marginTop: '40%',
    backgroundColor: 'white',
    borderTopRightRadius: 30,
    borderTopLeftRadius: 30,
    backgroundColor: '#F4F6F0',
  },
  OptionsContainer: {
    borderRadius: 20,
    padding: 5,
    backgroundColor: '#FFFEFE',
    height: '15%',
    margin: 1,
  },
  chatDisplayContainer: {
    flexDirection: 'row',
    height: '100%',
  },
  ChatGroupSwitchContainer: {
    marginTop: 5,
    flexDirection: 'row',
    height: '40%',
  },

  FriendListContainer: {
    height: '60%',
    flexDirection: 'row',
  },
  AddFriendButton: {
    backgroundColor: 'white',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: 60,
    borderRadius: 100,
    width: 60,
    margin: 2,
    borderWidth: 1,
    borderColor: 'black',
    borderStyle: 'dashed',
    shadowColor: '#000',
    elevation: 5,
    shadowOpacity: 0.25,
  },
  FriendButton: {
    backgroundColor: 'white',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: 57,
    borderRadius: 100,
    width: 58,
    margin: 2,
    borderWidth: 1,
    borderColor: 'black',
    shadowColor: '#000',
    elevation: 5,
    shadowOpacity: 0.25,
  },
  FriendScrollContainer: {
    width: '100%',
  },
  chatTile: {
    height: 70,
    flexDirection: 'row',
    marginBottom: 20,
    borderRadius: 20,
    elevation: 5,
    shadowColor: 'grey',
    shadowOpacity: 1,
    backgroundColor: '#D7D2C6',
  },
  ProfileContainer: {
    backgroundColor: 'white',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: 58,
    borderRadius: 100,
    width: 58,
    margin: 2,
    borderWidth: 1,
    borderColor: 'black',
  },
  userDetailsDisplay: {
    width: '100%',
    marginLeft: 5,
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

/*                  <TouchableOpacity key={item.handle}>
                    <View style={styles.chatTile}>
                      <View style={styles.ProfileContainer}>
                        <Text style={{color: '#475FFC', fontSize: 25}}>
                          {item.name.charAt(0)}
                        </Text>
                      </View>
                      <View style={styles.userDetailsDisplay}>
                        <Text
                          style={{
                            color: 'black',
                            fontWeight: 'bold',
                            fontSize: 18,
                          }}>
                          {item.name}
                        </Text>
                        <Text style={{color: 'black'}}>Test Message❤️</Text>
                      </View>
                    </View>
                  </TouchableOpacity>*/

/*
<TouchableOpacity key={user.handle} id={user.handle} onPress={()=>navigation.push("chatScreen",{
    UserName:user.handle,
    Name:user.name,
  })}>
    <View style={styles.FriendButton}>
      <Text style={{color: '#475FFC', fontSize: 25}}>
        {user.name.charAt(0)}
      </Text>
    </View>
  </TouchableOpacity>
  */
 /*socket.on("Incoming Call",(data)=>{
  const{ calle,RoomToJoin}=data
  setShowInComingCall(true)
  setWhoIsCalling(calle)
  setRoomToJoin(RoomToJoin)
  console.log("Socket for listening to incing calls fired")
}
)*/