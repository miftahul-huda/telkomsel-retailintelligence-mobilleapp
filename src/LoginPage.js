import React, { Component } from 'react';
import { Image, ActivityIndicator, PermissionsAndroid, ImageBackground } from 'react-native';
import { Container, Content, Text, Card, Header, Body, Button, Title, 
  CardItem, Left, View, Item, Input, Form, Label } from 'native-base';
import { Actions } from 'react-native-router-flux';

import Config from './config.json';
import HttpClient from './util/HttpClient';
GlobalSession = require( './GlobalSession');

import * as SQLite from "expo-sqlite";
import Sequelize from "rn-sequelize";

import UploadedFile from './model/UploadedFile';
import FilePackageItem from './model/FilePackageItem';
import FilePackageSubItem from './model/FilePackageSubItem';
import StoreFrontItem from './model/StoreFrontItem';

import * as RNFS from 'react-native-fs';

import Logging from './util/Logging';
import BackupRestoreLogic from './actions/BackupRestoreLogic';
import { TouchableOpacity } from 'react-native';
import WebView from 'react-native-webview';


const Op = Sequelize.Op;
const Model = Sequelize.Model;


const FILE_STORAGE_PATH = RNFS.DownloadDirectoryPath;

var sequelize = new Sequelize({
  dialectModule: SQLite,
  database: "retail-intelligence-v2",
  storage: './data/retail-intelligence-v2',
  logging: false,
  dialectOptions: {
    version: "1.0",
    description: "Retail Intelligence"
    //size: 2 * 1024 * 1024
  }
});

var sequelize2 = new Sequelize({
  dialectModule: SQLite,
  database: FILE_STORAGE_PATH + "/retail-intelligence/retail-intelligence-v2",
  dialectOptions: {
    version: "1.0",
    description: "Retail Intelligence"
    //size: 2 * 1024 * 1024
  } 
});




export default class LoginPage extends Component {

  constructor(props) {
    super(props);
    this.state = {
      email: '',
      password: '',
      showIndicator: false,
      secure: true,
      updateApp: false,
      message: ''
    }
  }

  changeSecure()
  {

    let secure = this.state.secure;
    secure = !secure;    
    this.setState({
      secure: secure
    })
  }

  async updateData()
  {
    try {
      await UploadedFile.initialize(sequelize, false);
      await FilePackageItem.initialize(sequelize, false);
      await FilePackageSubItem.initialize(sequelize, false);
      await StoreFrontItem.initialize(sequelize, false);

      await sequelize.sync();

      let result = await BackupRestoreLogic.backupExists();

      if(result == false)
        await BackupRestoreLogic.backup();

        
      await UploadedFile.drop();
      await FilePackageItem.drop();
      await FilePackageSubItem.drop();
      await StoreFrontItem.drop();

      await UploadedFile.initialize(sequelize, true);
      await FilePackageItem.initialize(sequelize, true);
      await FilePackageSubItem.initialize(sequelize, true);
      await StoreFrontItem.initialize(sequelize, true);

      await sequelize.sync();
      
      await BackupRestoreLogic.restore();
      
    }
    catch (e)
    {
      //throw e;
      console.log("Backup Restore Gagal! : " + JSON.stringify(e));
    }
  }

  checkUpdate()
  {
    var me = this;
    BackupRestoreLogic.checkUpdate(function(response) {

      if(response.success)
      {
          let urls = [];
          let message = response.payload.appdescription;

          me.setState({
            updateApp: true,
            message: message
          })
      }
      else
      {
        me.setState({
          updateApp: false,
          message: ""
        })
      }


    }, function(err){
      console.log("checkupdate")
      console.log(err)
      me.setState({
        updateApp: true,
        message: ''
      })
    })
  }

  async componentDidMount() {
    let granted = await this.askPermission();

    try {
      await this.setUsernamePassword();
    } catch (error) {
      
    }
    try {
      this.checkUpdate();
    } catch (error) {
      
    }
    
    await this.updateData();
    console.log(granted);
  }


  async openMenu()
  {

    try {
      
      Actions.menuPage();
    }
    catch(err)
    {
      let ss = JSON.stringify(err);
      alert("Error.sequelize :  "  + ss);   
    }
    
    
  }

  async login() {
    let url = Config.API_HOST_AUTH + "/user/login";
    console.log(url);
   
    let user = { email: this.state.email, password: this.state.password};
    var me = this;
    me.setState({ 
      showIndicator: true
    })
    HttpClient.post(url, user, async function(res){
      if(res.success)
      {
        GlobalSession.currentUser = res.payload;
        console.log("USER LOGGED IN")
        console.log(GlobalSession.currentUser)
        me.setState({ 
          showIndicator: false
        })

        let sUser = { email: me.state.email, password: me.state.password};
        let sJson = JSON.stringify(sUser);

        console.log("Write to file");
        console.log(sJson);

        try {
          await RNFS.unlink(FILE_STORAGE_PATH + "/retail-intelligence/login.txt");
        }
        catch(err)
        {

        }
        RNFS.writeFile(FILE_STORAGE_PATH + "/retail-intelligence/login.txt", sJson).then(function (){
          me.openMenu();

        }).catch(function (err){
          let ss = JSON.stringify(err);
          Logging.log(err, "error", "LoginPage.login().HttpClient.post().RNFS.writeFile(FILE_STORAGE_PATH = /retail-intelligence/login.txt, sJson)")
          me.openMenu();
          //alert("Error.RNFS.writeFile :  "  + ss);   
        })
        
      }
      else {
        let ss = JSON.stringify(res);
        me.setState({ 
          showIndicator: false
        });
        alert("Login invalid")
        //alert( res.message);
      }
      
    }, function(err){
      me.setState({ 
        showIndicator: false
      })
      let ss = JSON.stringify(err);
      alert("Error login.post : " + ss);
      Logging.log(ss, "error")
    });
  }

  setUsernamePassword()
  {
    var me = this;
    RNFS.readFile(FILE_STORAGE_PATH + "/retail-intelligence/login.txt").then(function (response){
      console.log("setUsernamePassword")
      console.log(response);
      let data = JSON.parse(response);
      me.setState({
        ...me.state,
        email: data.email,
        password: data.password
      })
    }).catch(err => {
      Logging.log(err, "error", "LoginPage.setUsernamePassword().RNFS.readFile(FILE_STORAGE_PATH + /retail-intelligence/login.txt)")
      console.log(err);
    })
  }

  async askPermission()
  {
    try {
      const granted = await PermissionsAndroid.requestMultiple(
        [
          PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
          PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
          PermissionsAndroid.PERMISSIONS.CAMERA,
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
        ],
        {
          title: "Retail Intelligence Permission",
          message:
            "Retail Intelligence App needs access to your storage and camera" +
            "so you can take and save pictures.",
          buttonNeutral: "Ask Me Later",
          buttonNegative: "Cancel",
          buttonPositive: "OK"
        }
      );



      return granted;
    } catch (err) {
      console.log(err);
      let ss = JSON.stringify(err);
      Logging.log(ss, "error");
      alert("Error askPermission : " + ss);
    }

    return  null;
  }

  render(){

    let secure = this.state.secure;
    return(
      <Container>
        <Header style={{backgroundColor: '#AA2025'}}>
          <Body>
            <Title style={ { width: '100%', textAlign: 'center' }}>Retail Intelligence</Title>
          </Body>
        </Header>
        <Content padder >
          <ImageBackground source={require('./images/background.png')} style={{ width: '100%', height: '100%' }}>
            <View>
              
            </View>

            <View  style={{ flex:1, flexDirection: 'column', width:'100%', justifyContent: 'center',alignItems: "center"  }}>
              <Image  source={require('./images/telkomsel-logo.png')} resizeMode="contain"
              style={{ width: '50%', marginTop: '0%' }}></Image>
              <Text style={{ marginTop: '-12%' }}>Version {Config.VERSION} {Config.ENVIRONMENT}</Text>
            </View>
            {
                (this.state.updateApp) ? <WebView style={{ width: '100%', height: 130 }} source={{ html: this.state.message}}></WebView> : null
            }
            { (this.state.showIndicator) ? 
            <ActivityIndicator size="large" color="#000"></ActivityIndicator> : <></>
            }
            <Form style={{ marginTop: '10%' }}>
              <View>
                <Label>Username</Label>
                <View style={{height: 5}}></View>
                <Input style={{ borderWidth: 1, borderRadius: 10, borderColor: '#ccc', color: '#666', paddingLeft: 10}} value={this.state.email} onChangeText={value => { console.log(value); this.setState({ email: value } ) }}/>
              </View>
              <View style={{height: 10}} ></View>
              <View style={{ flex:1, flexDirection: 'column', justifyContent: 'flex-start'}}>
                
                <Label>Password</Label>

                <View >
                  <Input  style={{ borderWidth: 1, borderRadius: 10, borderColor: '#ccc', color: '#666', paddingLeft: 10}} 
                  secureTextEntry={this.state.secure}  value={this.state.password} onChangeText={(value)=> this.setState({ password: value } )}/>
                  
                  <TouchableOpacity onPress={this.changeSecure.bind(this)} style={{ position: 'absolute', left: '90%', top: '25%'}} >
                    { (this.state.secure) ? 
                    <Image style={{ width: 30, height: 30}} 
                      source={require('./images/eye.png')} ></Image>
                      :
                      <Image style={{ width: 30, height: 30}} 
                      source={require('./images/eye-closed.png')} ></Image>
                    }
                  </TouchableOpacity>
                </View>
                
              </View>
            </Form>
            <View style={{height: 30}}></View>

            <Button style = {{alignSelf: 'center', margin: 5, 
            width: '100%', backgroundColor: '#AA2025', borderRadius: 10}}
              onPress= {() => { this.login(); }}>

                <View style={{flex: 1, flexDirection: 'row', width:'100%', alignSelf: 'center', alignItems:'center', justifyContent:'center',}}>
                  <Image source={require('./images/login_white.png')} />
                  <View style={{width: '2%'}}></View>
                  <Text style={{ color: '#ffffff'}}>Login</Text>
                </View>
              
            </Button>
            <View style={{height: 150}}></View>

          </ImageBackground>
         </Content>
      </Container>
    );
  }
}
