import { useState } from "react"
import serverURL from "../MessaginFeaturesAndScreens/ServerUrl"
import {View,TextInput,Text,StyleSheet,TouchableHighlight} from "react-native"
export default function Register({setShowSignup,setShowLogin}) {
    const [email,setEmail]=useState('')
    const [userName,setUserName]=useState('')
    const [password,setPassword]=useState('')
    const [RepeatPassword,setRepeatPassword]=useState('')
    const [samePasswordCheck,setPasswordState]=useState()
    const [serverResponse,setServerResponse]=useState()
    const emailCheckingRules =  /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    const showLoginScreenFunction = ()=>{
        setShowSignup(false)
        setShowLogin(true)
    }
    const checkPasswordFunction=(takesApassword)=>{
        if(takesApassword===password){
            setPasswordState(true)
            console.log("Equal")
        }else{
            setPasswordState(false)
            console.log("Not equal")
        }
    }
    const functionForSendingToTheServer=async(dataTobeSent)=>{
        try {
            const res=await fetch(`${serverURL}registartion`,{
                method:"POST",
                headers:{
                    "Content-Type":"application/json"
                },
                body:JSON.stringify(dataTobeSent)
            })
            const data= await res.json()
            setServerResponse(data)

        } catch (error) {
            console.log('😔 This Error Happend while going to the server->'+error)
        }
    }
    const registerUSerFunction =()=>{
        if(emailCheckingRules.test(email)&&password.length>3&&samePasswordCheck&&userName.length>=3){
            console.log('Registartion Form is Oky')
            const dataTobeSentToSever={Email:email,Password:password,userName:userName}
            functionForSendingToTheServer(dataTobeSentToSever)
        }
        else{
            console.log('Registartion Form is not oky')
        }
    }
    return(
        <View style={styles.RegisterForm}>
        <Text style={{color:'black',fontSize:35,fontWeight:'bold'}}>Register </Text>
            <Text style={styles.TextLabel}>Username:</Text>
            <TextInput style={styles.Textinput} placeholder="Enter Username"  placeholderTextColor={'grey'} onChangeText={userValue=>setUserName(userValue)}/>
            <Text style={styles.TextLabel}>Email:</Text>
            <TextInput style={styles.Textinput} placeholder="Enter Email"  placeholderTextColor={'grey'}onChangeText={userValue=>setEmail(userValue)}/>
            <Text style={styles.TextLabel}>Password:</Text>
            <TextInput style={styles.Textinput} placeholder="Enter Password" placeholderTextColor={'grey'} secureTextEntry={true}onChangeText={userValue=>setPassword(userValue)}/>
            <Text style={styles.TextLabel}>Confirm Password:</Text>
            <TextInput style={styles.Textinput} placeholder="Confirm Password" placeholderTextColor={'grey'} secureTextEntry={true} onChangeText={theValue=>checkPasswordFunction(theValue)}/>
            {!samePasswordCheck &&<Text style={{color:'black',fontStyle:'italic'}}>Password not the Same</Text>}
            {serverResponse&&<Text style={{color:"lime"}}>{serverResponse.message}</Text>}
            <TouchableHighlight onPress={registerUSerFunction}>
                <View style={styles.RegisterButton}><Text style={styles.buttonText}>Register</Text></View>
            </TouchableHighlight>
            <View style={{flexDirection:'row',marginTop:10,borderTopWidth:1,borderColor:'black',padding:5,borderStyle:'dashed'}}>
                <Text style={{color:'black',fontStyle:'italic' ,marginRight:2}}>Already have an account ?</Text>
                <TouchableHighlight onPress={showLoginScreenFunction}>
                    <View style={styles.LoginButton}><Text style={styles.buttonText}>Login</Text></View>
                </TouchableHighlight>
            </View>
        </View>
    )
}
const styles = StyleSheet.create({
    RegisterForm:{
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
        backgroundColor: 'grey',
        padding:5,
        borderRadius: 10,
        width: 70,
        alignSelf: 'center',
        marginTop:5
    },
    RegisterButton:{
        backgroundColor: 'black',
        padding:5,
        borderRadius: 10,
        width: 80,
        alignSelf:'center'
    },
    buttonText:{
        color: 'white',
        margin: 5,
        fontWeight: 'bold',
    }

})