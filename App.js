import React, { Component } from 'react';
import { AppRegistry } from 'react-native';
import App from './src/App.js';
import BackupRestoreLogic from './src/actions/BackupRestoreLogic';

import PushNotification from 'react-native-push-notification'
import BackgroundTimer from 'react-native-background-timer';
import Uploader from './src/util/Uploader.js';
import Util from './src/util/Util.js';
import GlobalSession from './src/GlobalSession.js'

export default class RnrfExample extends Component {
  render() {
    return (
      <App />
    );
  }
}
AppRegistry.registerComponent('RnrfExample', () => RnrfExample);


PushNotification.createChannel(
  {
    channelId: "hudabeybi", // (required)
    channelName: "My channel", // (required)
    channelDescription: "A channel to categorise your notifications", // (optional) default: undefined.
    playSound: false, // (optional) default: true
    soundName: "default", // (optional) See `soundName` parameter of `localNotification` function
    importance: 4, // (optional) default: 4. Int value of the Android notification importance
    vibrate: true, // (optional) default: true. Creates the default vibration patten if true.
  },
  (created) => console.log(`createChannel returned '${created}'`) // (optional) callback returns whether the channel was created, false means it already existed.
);

PushNotification.configure({
  // (required) Called when a remote or local notification is opened or received
  onNotification: function(notification) {
    console.log('LOCAL NOTIFICATION ==>', notification)
  },
  popInitialNotification: true,
  requestPermissions: Platform.OS === 'ios'
});

var backUpCounter = 0;

BackgroundTimer.runBackgroundTimer(async () => { 
    //code that will be called every 3 seconds 
    //console.log("Background timer")
    try {

      if(GlobalSession.currentUser != null)
      {
        if(backUpCounter ==  10)
        {
          //console.log("Schedule Backup...")
          await BackupRestoreLogic.backup();
          //console.log("Schedule Backup Done...")
          backUpCounter = 0;
        }

        backUpCounter++;

        //console.log("Schedule run upload...")
        Uploader.runUpload();
      }
      
    }
    catch (e)
    {
      console.log("Scheduled Backup Restore Gagal! : " + JSON.stringify(e));
    }

  }, 1000);

/*
setInterval(async function(){
  try {

    if(GlobalSession.currentUser != null)
    {
      console.log("Schedule Backup...")
      await BackupRestoreLogic.backup();
      //console.log("Schedule Backup Done...")
    }
  }
  catch (e)
  {
    console.log("Scheduled Backup Restore Gagal! : " + JSON.stringify(e));
  }
}, 10000)
*/