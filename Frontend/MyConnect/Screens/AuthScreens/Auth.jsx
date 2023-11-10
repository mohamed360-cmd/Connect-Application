import { StyleSheet,View,Text,Button } from "react-native"
import { useState } from "react"
import Register from "./Register"
import Login from "./Login"
import MessagingArea from "../MessaginFeaturesAndScreens/MessagingArea"
export default function Auth({navigation,route: { params: { setCurrentUserEmail } }}) {
    const [showSignupForm,setShowSignup] = useState(false)
    const [showLoginForm,setShowLogin] = useState(true)
    const [UserAuthState,setUSerAuthState]=useState(false)
    const [userEmail,setUserEmail]=useState('')
    if(!UserAuthState){
        return (

       
            <View style={styles.MainAuthConatiner}>
                <Text style={styles.WelcomeText}>Welcome to Connect </Text>
                {showLoginForm && <Login setShowSignup={setShowSignup} setShowLogin={setShowLogin} setUSerAuthState={setUSerAuthState} setUserEmail={setUserEmail}/>}
                {showSignupForm && <Register setShowSignup={setShowSignup}  setShowLogin={setShowLogin}/>}

            </View>            
        

    )
    }else{
        setCurrentUserEmail(userEmail)
        
        return <MessagingArea setUSerAuthState={setUSerAuthState} userEmail={userEmail} navigation={navigation}/>
    }



}
const styles = StyleSheet.create({
    MainAuthConatiner: {
        flex: 1,
        flexGrow : 1,
        backgroundColor: 'white',
        padding: 10,
    },
    WelcomeText:{
        fontSize: 30,
        color:'black',
        margin: 10,
        borderColor: 'black',
        padding:10,
        borderRadius: 20,
        borderWidth: 2,
        borderBottomLeftRadius:0,
        fontWeight: 'bold',
    }
})
