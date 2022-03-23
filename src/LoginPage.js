import React, { Component } from 'react';
import { Image, ActivityIndicator, PermissionsAndroid, ImageBackground } from 'react-native';
import { Container, Content, Text, Card, Header, Body, Button, Title, 
  CardItem, Left, View, Item, Input, Form, Label } from 'native-base';
import { Actions } from 'react-native-router-flux';

import Config from './config.json';
import HttpClient from './util/HttpClient';
import GlobalSession from './GlobalSession';

import * as SQLite from "expo-sqlite";
import Sequelize from "rn-sequelize";

import UploadedFile from './model/UploadedFile';
import FilePackageItem from './model/FilePackageItem';
import FilePackageSubItem from './model/FilePackageSubItem';
import StoreFrontItem from './model/StoreFrontItem';
import EtalaseItem from './model/EtalaseItem';
import TotalSales from './model/TotalSales';

import * as RNFS from 'react-native-fs';

import Logging from './util/Logging';
import BackupRestoreLogic from './actions/BackupRestoreLogic';
import { TouchableOpacity } from 'react-native';
import WebView from 'react-native-webview';
import Style from './style';
import Util from './util/Util';



const Op = Sequelize.Op;
const Model = Sequelize.Model;


const FILE_STORAGE_PATH = RNFS.DownloadDirectoryPath;

var sequelize = Util.getSequelize();


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

    console.log("updateData")
    try {
      await UploadedFile.initialize(sequelize, false);
      await FilePackageItem.initialize(sequelize, false);
      await FilePackageSubItem.initialize(sequelize, false);
      await StoreFrontItem.initialize(sequelize, false);
      await EtalaseItem.initialize(sequelize, false);
      await TotalSales.initialize(sequelize, false);

      await sequelize.sync();

      let result = await BackupRestoreLogic.backupExists();

      if(result == false)
        await BackupRestoreLogic.backup();

        
      await UploadedFile.drop();
      await FilePackageItem.drop();
      await FilePackageSubItem.drop();
      await StoreFrontItem.drop();
      await EtalaseItem.drop();
      await TotalSales.drop();

      await UploadedFile.initialize(sequelize, true);
      await FilePackageItem.initialize(sequelize, true);
      await FilePackageSubItem.initialize(sequelize, true);
      await StoreFrontItem.initialize(sequelize, true);
      await EtalaseItem.initialize(sequelize, true);
      await TotalSales.initialize(sequelize, true);

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
    //await this.setUsernamePassword();
    
    try {
      this.getConfig().then(async ()=>{
        await this.setUsernamePassword();
      }).catch(async (err)=>{
        await this.setUsernamePassword();
      })
      
    } catch (error) {
      console.log(error)
      this.setState({
        showIndicator: false
      })
    }
    
    
    /*
    try {
      this.checkUpdate();
    } catch (error) {
      
    }
    */
    
    await this.updateData();
    console.log(granted);
  }


  async openMenu()
  {

    try {
      Actions.homePage();
      //Actions.menuPage();
    }
    catch(err)
    {
      let ss = JSON.stringify(err);
      alert("Error.sequelize :  "  + ss);   
    }
    
    
  }

  async getConfig()
  {
    var me = this;
    let promise = new Promise((resolve, reject)=>{
      let url = Config.API_HOST + "/application/get-by-version/" + Config.VERSION;
      me.setState({
        showIndicator: true
      })
      try
      {

        console.log("url")
        console.log(url)
        HttpClient.get(url, function(response){
          
          console.log("getConfig()")
          console.log(response)
  
          if(response.success == true && response.payload != null)
          {
            GlobalSession.Config = JSON.parse( response.payload.appConfig);
            //console.log(GlobalSession.Config.API_HOST)
            //console.log(GlobalSession.Config)
            resolve();
          }
          else
          {
            alert("Konfigurasi aplikasi gagal. Hubungi support.")
            reject();
          }

          me.setState({
            showIndicator: false
          })
          
        }, function(err){
          me.setState({
            showIndicator: false
          })
          reject(err)
        })
      }
      catch(err)
      {
        this.setState({
          showIndicator: false
        })
        reject(err)
      }

    })

    return promise;
  }

  async login() {

    this.getConfig().then(()=>{
      let url = GlobalSession.Config.API_HOST_AUTH + "/user/login";
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
          me.setState({ 
            showIndicator: false
          })
  
          let sUser = { email: me.state.email, password: me.state.password};
          let sJson = JSON.stringify(sUser);
  
  
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
    }).catch((err)=>{
      console.log("getConfig() failed")
      console.log(err)
      alert("Jaringan internet sepertinya bermasalah. Pastikan anda bisa menjalin koneksi ke internet.")
    })
    

  }

  setUsernamePassword()
  {
    var me = this;
    RNFS.readFile(FILE_STORAGE_PATH + "/retail-intelligence/login.txt").then(function (response){

      let data = JSON.parse(response);
      console.log("Data")
      console.log(data);

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
        <Header style={{backgroundColor: '#FFF', borderWidth: 0}}>
          <Body>
            <Title style={ { width: '100%', textAlign: 'left', color: '#000' }}>Masuk Aplikasi</Title>
          </Body>
        </Header>
        <Content padder >
          
            <View style={{width: '100%', marginTop: '25%', alignSelf: 'center'}}>
              <Image source={require('./images/logo.png')} style={{width: '60%', alignSelf: 'center'}} resizeMode='contain'></Image>
              <Text style={{alignSelf: 'center'}}>{Config.VERSION} {Config.ENVIRONMENT}</Text>
            </View>
            <Form style={{ marginTop: '10%', padding: 20 }}>
              <View>
                <Label style={{color: '#000'}}>Nama pengguna</Label>
                <View style={{height: 5}}></View>
                <Input style={{ borderWidth: 1, borderRadius: 10, borderColor: '#ccc', color: '#666', paddingLeft: 10}} value={this.state.email} onChangeText={value => { console.log(value); this.setState({ email: value } ) }}/>
              </View>
              <View style={{height: 10}} ></View>
              <View style={{ flex:1, flexDirection: 'column', justifyContent: 'flex-start'}}>
                
                <Label style={{color: '#000'}}>Kata sandi</Label>
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
            
            <View style={{height: 30}}>
            {
              (this.state.showIndicator == true) ? <ActivityIndicator size="large" color="#ff0000"></ActivityIndicator> : <></>
            }
             
            </View>

            <Button style = {Style.buttonRed}
              onPress= {() => { this.login(); }}>

                <View style={Style.buttonContentDark}>
                  <Text style={Style.textWhite}>Masuk</Text>
                </View>
              
            </Button>
            <View style={{height: 150}}></View>

          
         </Content>
      </Container>
    );
  }
}
