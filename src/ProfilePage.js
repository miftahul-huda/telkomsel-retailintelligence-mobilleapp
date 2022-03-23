import React, { Component } from 'react';
import { Dimensions, ImageBackground } from 'react-native';
import { Container, Content, Text, Card, Header, Footer, Body, Title, 
  List,
  ListItem,
  Left,
  Item, CardItem, Icon, Button } from 'native-base';


import { Image, View, ScrollView, TouchableOpacity, Alert, Linking } from 'react-native';
import { Actions } from 'react-native-router-flux';
import UploadedFile from './model/UploadedFile';
import FilePackageItem from './model/FilePackageItem';
import StoreFrontItem from './model/StoreFrontItem';
import DropDownPicker from 'react-native-dropdown-picker';

import Config from './config.json';
import HttpClient from './util/HttpClient';
GlobalSession = require( './GlobalSession');

import * as RNFS from 'react-native-fs';

import Sequelize from "rn-sequelize";
const Op = Sequelize.Op;
const Model = Sequelize.Model;

import Logging from './util/Logging';

import BackupRestoreLogic from './actions/BackupRestoreLogic';
import Style from './style';
import SharedPage from './SharedPage';
import LabelInput from './components/LabelInput';


const FILE_STORAGE_PATH = RNFS.DownloadDirectoryPath;

export default class ProfilePage extends SharedPage {
    constructor(props){
        super(props);
        this.state = {
            fullName: '',
            email: '',
            country: '',
            city: '',
            area: ''
        }
    }

    componentDidMount() {
        try {
          let user = GlobalSession.currentUser;
          console.log(user);
          let country = "";
          let city = "";

          if(user != null && user.countryandcity != null)
            country = user.countryandcity.country;
          
          if(user != null && user.countryandcity != null)
            city = user.countryandcity.city;

          if(user.firstname == null)
            user.firstname = "";

          if(user.lastname == null)
            user.lastname = "";

          this.setState({
              fullName: user.firstname + " " + user.lastname,
              email: user.email,
              country: country,
              city: city,
              area: user.area
          })
        }
        catch (e){
          console.log("Error")
          console.log(e)
        }

    }

    async backup2()
    {
      try {
        await BackupRestoreLogic.backup();
        alert("Backup berhasil!")
      }
      catch (e)
      {
        console.log("Error ProfilePage.backup2()");
        console.log(e);
      }
    }

    async restore2()
    {
      try {
        await BackupRestoreLogic.restore();
        alert("Restore berhasil!")
      }
      catch (e)
      {
        console.log("Error ProfilePage.restore2()");
        console.log(e);
      }
    }


    backup()
    {
      var me  = this;
      RNFS.mkdir(FILE_STORAGE_PATH + "/retail-intelligence").then(function(){
        RNFS.copyFile("/data/data/com.telkomselretailintelligence/files/SQLite/retail-intelligence-v2", FILE_STORAGE_PATH + "/retail-intelligence/retail-intelligence-v2" ).then(() => {
          
          RNFS.copyFile("/data/data/com.telkomselretailintelligence/files/SQLite/retail-intelligence-v2-journal", FILE_STORAGE_PATH + "/retail-intelligence/retail-intelligence-v2-journal" ).then(()=>{
            //console.log("Copy " + RNFS.DownloadDirectoryPath + "/retail-intelligence/pics/ to " +  FILE_STORAGE_PATH + "/retail-intelligence/pics/");
            //me.copyRecursive(RNFS.DownloadDirectoryPath + "/retail-intelligence/pics", FILE_STORAGE_PATH + "/retail-intelligence/pics");
            alert("Backup success")
          
          }).catch((err) => {
            alert("Backup success");
          })
          
  
          
        }).catch(err => {
            console.log(err);
            alert("Backup gagal : " + JSON.stringify(err));
            Logging.log(err, "error", "ProfilePage.backup().RNFS.copyFile()")
        })
      })
    }
  
    restore()
    {
      RNFS.copyFile(FILE_STORAGE_PATH + "/retail-intelligence/retail-intelligence-v2" , "/data/data/com.telkomselretailintelligence/files/SQLite/retail-intelligence-v2" ).then(()=>{
  
        RNFS.copyFile(FILE_STORAGE_PATH + "/retail-intelligence/retail-intelligence-v2-journal", "/data/data/com.telkomselretailintelligence/files/SQLite/retail-intelligence-v2-journal").then(()=>{
          alert("Restore success")
        }).catch(err => {
          console.log(err);
          Logging.log(err, "error", "ProfilePage.restore().RNFS.copyFile(journalfile)")
        })
  
      }).catch(error => {
        console.log(error);
        Logging.log(err, "error", "ProfilePage.restore().RNFS.copyFile(dbfile)")
      });
    }

    logout()
    {
      GlobalSession.currentUser = null;
      Actions.reset("loginPage");
    }

    back() {
        Actions.pop();
    }

    isIn(dbfiles, filename)
    {
      for(var i=0; i < dbfiles.length; i++)
      {
        var dbfile = dbfiles[i];
        if(dbfile.filename.indexOf(filename) > -1)
        {
          return true;
        }
      }

      return false;
    }

    async clearUploadedPhoto(){

      let dbfiles = await UploadedFile.findAll({
        where: {
          isuploaded: 0
        }
      });

      var me = this;

      RNFS.readDir(FILE_STORAGE_PATH + '/retail-intelligence/pics/').then(function (files){
        files.forEach(async function (file){
          console.log(file.path);
          if(file.isDirectory())
          {
            console.log("Directory path : " + file.path)
            let dirfiles = await RNFS.readDir(file.path);
            dirfiles.forEach(async function(dfile){

              console.log(dfile)
              if(me.isIn(dbfiles, dfile.name) == false)
              {
                console.log("Deleting path : " + dfile.path)
                try{
                  await RNFS.unlink(dfile.path);
                }
                catch(err){
                  Logging.log(err, "error", "ProfilePage.clearUploadedPhoto().RNFS.unlink(dfile.path)")
                }
              }

            })

            dirfiles = await RNFS.readDir(file.path);
            if(dirfiles.length == 0)
            {
              try{
                await RNFS.unlink(file.path);
              }
              catch(err){
                Logging.log(err, "error", "ProfilePage.clearUploadedPhoto().RNFS.unlink(file.path)")
              }
            }
          }
        })
        alert("Sudah dihapus")
      }).catch(function (err){
        Logging.log(err, "error", "ProfilePage.clearUploadedPhoto().RNFS.readDir()")
      })

    }

    downloadTutorial()
    {
      let path = "retina-app-resources/tutorial.pdf";
      path = encodeURIComponent(path);

      let url = GlobalSession.Config.API_HOST_UPLOAD + "/upload/gcs/download/" + GlobalSession.Config.GCS_PROJECT + "/" + GlobalSession.Config.GCS_APP_BUCKET + "/" + path;
      url = "https://storage.googleapis.com/retail-intelligence-bucket/retina-app-resources/tutorial.pdf"      

      let gurl = "http://docs.google.com/gview?embedded=true&url=https://storage.googleapis.com/retail-intelligence-bucket/retina-app-resources/tutorial.pdf";
      console.log(gurl);

      Linking.openURL(url)
      //Actions.reset("webPage", { url: url, title: 'Tutorial Retina v.' + GlobalSession.Config.VERSION, type: "pdf"  })
    }

    render() 
    {
        return(
            <Container>
            <Header style={{backgroundColor: '#FFF', height: 80}}>
                <View  style={Style.headerHorizontalLayout}>

                            <Image style={{height: 40, width:40}} resizeMode='contain' source={require('./images/profile-user.png')}></Image>
  
                        <View style={{width: '5%'}}></View>
                        <View style={{marginTop: '0%'}}>
                          <Title style={{ color: '#666' }}>{this.state.fullName}</Title>
                          <Text style={Style.contentLight}>{this.state.area}</Text>
                        </View>
                </View>
            </Header>
            <Content  style={{backgroundColor: '#eee'}}>
                <View style={{height: 30}}></View>
                <View style={{ flex: 1, height: '100%', padding: '5%', backgroundColor: '#FFF', height:'auto' }}>
                  <TouchableOpacity onPress={()=>this.downloadTutorial()}>
                    <LabelInput text="Bantuan" subtext="Tutorial penggunaan retina"></LabelInput>
                    <View style={Style.horizontalLayout}>
                      <Image source={require('./images/pdf.png')}></Image>
                      <View style={{width: '5%'}}></View>
                      <Text style={{marginTop: '1%'}}>Download Tutorial Retina v.{GlobalSession.Config.VERSION}</Text>
                    </View>
                  </TouchableOpacity>

                </View>

                <View style={{height: 20}}></View>

                <Button style = {{display: 'none', alignSelf: 'center', margin:5, borderRadius: 10, 
                width: '80%', backgroundColor: '#AA2025'}}
                    onPress= {() => { this.clearUploadedPhoto(); }}>
                    <View style={{ flex:1, flexDirection: 'row', width: '100%', alignSelf: 'center', alignItems: 'center', justifyContent: 'center'}}>
                      <Image source={require('./images/delete_white.png')} style={{ height: 30, width: 30 }}></Image>
                      <Text style={{ color: '#ffffff', textAlign: 'center' }}>Hapus Uploaded Foto</Text>
                    </View>
                </Button>
                <Button style={Style.button} onPress={()=>this.logout()}>
                    <View style={{ alignItems: 'center', width: '100%' }}>
                        <Text style={{color: '#666'}}>Keluar</Text>
                    </View>
                </Button>


            </Content>
                {
                  this.getFooter(3)
                }
            </Container>
        )

    }
}