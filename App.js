import React, { Component } from 'react';
import { AppRegistry } from 'react-native';
import App from './src/App.js';
import BackupRestoreLogic from './src/actions/BackupRestoreLogic';
import GlobalSession from './src/GlobalSession.js';

export default class RnrfExample extends Component {
  render() {
    return (
      <App />
    );
  }
}
AppRegistry.registerComponent('RnrfExample', () => RnrfExample);



setInterval(async function(){
  try {

    if(GlobalSession.currentUser != null)
    {
      //console.log("Schedule Backup...")
      await BackupRestoreLogic.backup();
      //console.log("Schedule Backup Done...")
    }
  }
  catch (e)
  {
    console.log("Scheduled Backup Restore Gagal! : " + JSON.stringify(e));
  }
}, 10000)