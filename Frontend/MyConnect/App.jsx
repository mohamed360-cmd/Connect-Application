import {View , Text,StyleSheet, TouchableOpacity,LogBox} from 'react-native';
import Auth from './Screens/AuthScreens/Auth';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import ChatingScreen from './Screens/MessaginFeaturesAndScreens/ChatingScreen';
import MessagingArea from './Screens/MessaginFeaturesAndScreens/MessagingArea';
import SearchPeople from './Screens/MessaginFeaturesAndScreens/SearchPeople';
import { useState } from 'react';
import CallingScreen from './Screens/CallingScreen';
export default function App(){
  const Stack=createNativeStackNavigator();
  const [currentUserEmail,setCurrentUserEmail]=useState("")  
  LogBox.ignoreLogs([
    'Non-serializable values were found in the navigation state',
  ]);
  return(
    <NavigationContainer>

      <Stack.Navigator>
        <Stack.Screen name="AuthenticationScreen" component={Auth}  initialParams={{setCurrentUserEmail: setCurrentUserEmail}}
          options={
            {
              headerShown:false
            }
          }
        />
        <Stack.Screen name='chatScreen' component={ChatingScreen} initialParams={{currentUserEmail:currentUserEmail}}
        options={
          {
            headerShown:false
          }
        }/>
        <Stack.Screen name='MessaginDisplayScreen' component={MessagingArea} options={{
          headerShown:false
        }}/>
        <Stack.Screen name="SearchPage" component={SearchPeople} options={
          {
            title:'Search  to Connect '
          }
        }/>
        <Stack.Screen name="VideoCallScreen" component={CallingScreen} options={
          {
            headerShown:false
          }
        }/>
      </Stack.Navigator>
    </NavigationContainer>

  )
}
const styles = StyleSheet.create({
  MainConatiner:{
    flex:1,
    flexGrow:1,
  },
  headerBackButton: {
    fontSize: 18,
    color: 'black',
    marginLeft: 10,
  },
});
