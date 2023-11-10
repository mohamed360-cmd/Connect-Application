// App.js
import React, { Component } from 'react'
import { View ,StyleSheet} from 'react-native';
import {ZegoUIKitPrebuiltCall, ONE_ON_ONE_VIDEO_CALL_CONFIG } from '@zegocloud/zego-uikit-prebuilt-call-rn'
export default function CallingScreen({navigation,route}) {
    const {whoIsJoining,Room}=route.params
    return (
        <View style={styles.container}>
            <ZegoUIKitPrebuiltCall
                appID={"Place your AppID here"}
                appSign={"Place your appSign here"}
                userID={whoIsJoining}  
                userName={whoIsJoining}
                callID={Room} 

                config={{
                    
                    ...ONE_ON_ONE_VIDEO_CALL_CONFIG,
                    onHangUp: () => { navigation.goBack() },
                }}
            />
        </View>
    );
}
const styles=StyleSheet.create({
    container:{
        flex:1,
        flexGrow:1
    }
})