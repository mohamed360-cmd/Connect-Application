import { useState } from "react";
import { TextInput ,View,Text,StyleSheet,TouchableOpacity,ScrollView,ActivityIndicator} from "react-native";
import serverURL from "./ServerUrl";
export default function SearchPeople({navigation}) {
    const [searchValue, setSearchvalue] = useState('');
    const [errorInLenghtOfSearch, setErroLenght] = useState(false);
    const [userList, setUserList] = useState([]);
    const [searchResult, setSearchResult] = useState();
    const [errorMessage, setErrorMessage] = useState('');
    const [loading ,setLoading]=useState(false)
    const searchFunction = async (username) => {
      try {
        setLoading(true)
        const res = await fetch(`${serverURL}search`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(username),
        });
        const data = await res.json();
        console.log(data.states);
        setSearchResult(data.states);
        setUserList(data.userList);
        setErrorMessage(data.msg);
        setLoading(false)
      } catch (error) {
        console.log('Error:', error);
      }
    };
  
    const searchHandlerFunction = () => {
      if (searchValue.length > 0) {
        console.log('Sending this To the server to search for ' + searchValue);
        const userNameTosearchFor = { userName: searchValue };
        searchFunction(userNameTosearchFor);
        setErroLenght(false);
      } else {
        setErroLenght(true);
      }
    };
  
    return (
      <View style={styles.MainSearchConatiner}>
        <View style={styles.SearchControlsContainer}>
          <TextInput
            style={{ color: 'black', borderRadius: 20, borderWidth: 1, width: '80%' }}
            placeholder="Search Friends"
            placeholderTextColor={'gold'}
            onChangeText={(e) => setSearchvalue(e.trim())}
          />
          <TouchableOpacity onPress={searchHandlerFunction}>
            <View style={styles.SearchBtn}>
              <Text style={{ color: 'white', fontWeight: 'bold' }}>Search</Text>
            </View>
          </TouchableOpacity>
        </View>
        {errorInLenghtOfSearch && (
          <Text style={{ color: 'black', fontStyle: 'italic' }}>Length of search is too short.</Text>
        )}
        {loading &&<ActivityIndicator size={50} color={'blue'}/>}
        {!searchResult && <Text style={{ color: 'black', fontStyle: 'italic' }}>{errorMessage}</Text>}
        {searchResult && (
          <ScrollView style={{  height: '100%',padding:10 }}>
            {userList.map((eachUser) => (
              <TouchableOpacity key={eachUser.userName}>
                <View style={styles.chatTile}>
                  <View style={styles.ProfileContainer}>
                    <Text style={{ color: '#475FFC', fontSize: 25 }}>{eachUser.userName.charAt(0)}</Text>
                  </View>
                  <View style={styles.userDetailsDisplay}>
                    <Text style={{ color: 'black', fontWeight: 'bold', fontSize: 18 }}>
                      {eachUser.userName}
                    </Text>
                    <TouchableOpacity onPress={()=>navigation.push('chatScreen',{
                        Name:eachUser.userName,
                        RecipientEmail:eachUser.Email
                    })}>
                        <Text style={styles.ConnectBtn}>Connect with {eachUser.userName}</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}
      </View>
    );
  }
  
const styles=StyleSheet.create({
    MainSearchConatiner:{
        flex:1,
        flexGrow:1,
        
    },
    SearchControlsContainer:{
        flexDirection:'row',
        borderBottomWidth:1,
        marginTop:5,
        padding:5,
        height:70
    },
    SearchBtn:{
        borderRadius:20,
        backgroundColor:'#475FFC',
        padding:5,
        justifyContent:'center',
        alignItems:'center',
        height:'100%',
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
      ConnectBtn:{
        backgroundColor:'blue',
        color:'white',
        padding:10,
        maxWidth:150,
        borderBottomLeftRadius:0,
        borderRadius:20,
      }
})