import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';

export default function ({ rejectFunction, AcceptFunction, CallerName }) {
  return (
    <LinearGradient
      colors={['#00CED1', '#0076CE',"#1E90FF"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 0 }}
      style={styles.MainCallContainer}
    >
      <View style={styles.ProfieContainer}>
        <Text style={{ color: 'white', fontWeight: 'bold' }}> New Call</Text>
      </View>
      <View style={styles.CallerInfo}>
        <Text style={{ color: 'white' }}>{CallerName}</Text>
        <Text style={{ color: 'white', fontStyle: 'italic' }}>Is Calling you</Text>
      </View>
      <View style={styles.callBtnContainer}>
        <TouchableOpacity onPress={rejectFunction}>
          <View style={styles.RejectBtn}>
            <Text>No</Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity onPress={AcceptFunction}>
          <View style={styles.AcceptBtn}>
            <Text>Yes</Text>
          </View>
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  MainCallContainer: {
    height: 75,
    position: 'absolute',
    top: 100,
    display: 'flex',
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
