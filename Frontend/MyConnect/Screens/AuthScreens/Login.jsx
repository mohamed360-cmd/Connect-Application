import {View ,TextInput,Text,StyleSheet,TouchableHighlight,ActivityIndicator,TouchableOpacity} from "react-native"
import { useState } from "react"
import socket from "../Socket"
import serverURL from '../MessaginFeaturesAndScreens/ServerUrl';
export default function Login({setShowSignup,setShowLogin,setUSerAuthState,setUserEmail}) {
    
    const [email,setEmail] = useState("")
    const [password,setPassword] = useState("")
    const [formError,setFormError] = useState(false)
    const [serverResponse,setServerResponse]=useState()
    const [serverReachError,setServerReachError]=useState(false)
    const [showLoading,setshowLoading]=useState(false)
    const showSignupPageFunction = ()=>{
        setShowSignup(true)
        setShowLogin(false)
    }
    const emailCheckingRules =  /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    const sendLoginDetailsTotheServer=async(detailsTobeSent)=>{
        try {
            const res=await fetch(`${serverURL}login`,{
                method:"POST",
                headers:{"Content-Type" :"application/json"},
                body: JSON.stringify(detailsTobeSent)
            })
            const data=await res.json()
            console.log(data.status)
            setUSerAuthState(data.status)
            if( data.status){
             console.log("My socket id is->"+socket.id)
             sendSocketIdToTheServer({socketID:socket.id})
             setUserEmail(email)
             setServerReachError(false)
            }
            else{
                setServerResponse(data)
                setServerReachError(false)
            }
        } catch (error) {
            console.log("This Happended when sendin login details to the server ->"+error)
            setServerReachError(true)
        }

    }
    const sendSocketIdToTheServer=async(socketID)=>{
        try {
            const res=await fetch(`${serverURL}userSocketId`,{
                method:'POST',
                headers:{'Content-Type':'application/json'},
                body:JSON.stringify(socketID)
            })
            const data=await res.json();
            console.log(data.message)
        } catch (error) {
            console.log("This Happened when sending the socket id To the Server->"+error)
        }
    }
    const loginFunction = ()=>{
        setshowLoading(true)
        if(emailCheckingRules.test(email) && password.length >2){
            setFormError(false)
            const userLoginDetailsHoldingContainer={Email:email ,Password:password}
            
                sendLoginDetailsTotheServer(userLoginDetailsHoldingContainer)
 
        }
        else{
            setFormError(true)
            console.log("Login Failed")
            setshowLoading(false)
        }
    }

    return(
        <View style={styles.LoginForm}>
            <Text style={{color:'black',fontSize:35,fontWeight:'bold'}}> 👋Login </Text>
            <Text style={styles.TextLabel}>Email:</Text>
            <TextInput style={styles.Textinput} placeholder="Enter Email"  placeholderTextColor={'grey'} onChangeText={textValue=>setEmail(textValue.trim())} />
            <Text style={styles.TextLabel}>Password:</Text>
            <TextInput style={styles.Textinput} placeholder="Enter Password" placeholderTextColor={'grey'} onChangeText={passwordValue=>setPassword(passwordValue.trim())}  secureTextEntry={true}/>
            {formError && <View>
                <Text style={{color:'black'}}>Error -_-  check the form Details not filled properly</Text>
            </View>}
            {serverReachError && <Text style={{color:'red',fontWeight:'bold',fontStyle:'italic'}}>Siwezani kufikia server Check Kama Tuko kwa network moja ama server iko on</Text>}
            {serverResponse && <Text style={{color:'black'}}>{serverResponse.message}</Text>}
            {showLoading &&<ActivityIndicator/>}
            <TouchableOpacity onPress={loginFunction} style={{backgroundColor:'white'}}>
                <View style={styles.LoginButton}><Text style={styles.buttonText}>Login</Text></View>
            </TouchableOpacity>
            <View style={{flexDirection:'row',marginTop:10,borderTopWidth:1,borderColor:'black',padding:5,borderStyle:'dashed'}}>
                <Text style={{color:'black',fontStyle:'italic' ,marginRight:2}}>Dont have An account yet ?</Text>
                <TouchableOpacity onPress={showSignupPageFunction}>
                    <View style={styles.SignupButton}><Text style={styles.buttonText}>SignUp</Text></View>  
                </TouchableOpacity>
            </View>

        </View>
    )
}
const styles = StyleSheet.create({
    LoginForm:{
        flex: 1,
        backgroundColor: 'white',
        padding: 5,
        height: 500,
    },
    TextLabel:{
        color: 'black',
        fontWeight: 'bold',
    },
    Textinput:{
        borderWidth: 1,
        borderColor: 'black',
        borderRadius: 10,
        padding: 5,
        color: 'black',
    },
    LoginButton:{
        backgroundColor: 'black',
        padding:5,
        borderRadius: 10,
        width: 70,
        alignSelf: 'center',
        marginTop:5
    },
    SignupButton:{
        backgroundColor: 'grey',
        padding:5,
        borderRadius: 10,
        width: 70,
    },
    buttonText:{
        color: 'white',
        margin: 5,
        fontWeight: 'bold',
    }

})