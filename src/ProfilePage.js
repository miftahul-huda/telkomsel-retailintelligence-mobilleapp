import React, { Component } from 'react';
import { Dimensions, ImageBackground } from 'react-native';
import { Container, Content, Text, Card, Header, Footer, Body, Title, 
  List,
  ListItem,
  Left,
  Item, CardItem, Icon, Button } from 'native-base';


import { Image, View, ScrollView, TouchableOpacity, Alert } from 'react-native';
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


const FILE_STORAGE_PATH = RNFS.DownloadDirectoryPath;

export default class ProfilePage extends Component {
    constructor(props){
        super(props);
        this.state = {
            fullName: '',
            email: '',
            country: '',
            city: ''
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
              city: city
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
        Actions.popTo('loginPage');
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

    render() 
    {
        return(
            <Container>
            <Header style={{backgroundColor: '#AA2025'}}>
              <Body>
                <View  style={{flex: 1, flexDirection: 'row'}}>
                <TouchableOpacity onPress={()=> this.back()} style={{marginTop: '0%', padding: '4%'}} >
                    <Image style={{ width: 20, height: 20}} source={require('./images/back.png')}></Image>
                </TouchableOpacity>
                <Image style={{ width: 30, height: 30, top: '2%'}} source={require('./images/top-profile-white.png')}></Image>
                <Title style={{ marginLeft: '2%',marginTop: '3%' }}>Profile</Title>
                </View>
              </Body>
            </Header>
            <Content padder>
            <ImageBackground source={require('./images/background.png')} style={{ width: '100%', height: '100%' }}>
                <View style={{ flex: 1, height: '100%', padding: '5%' }}>
                        <Text style={{ fontWeight: 'bold', paddingBottom: 4 }}>Nama lengkap</Text>
                        <Text style={{ fontWeight: 'normal' }}>
                            {this.state.fullName}
                        </Text>
                        <View style={{height: 18}}></View>
                        <Text style={{ fontWeight: 'bold', paddingBottom: 4 }}>Email</Text>
                        <Text style={{ fontWeight: 'normal' }}>
                            {this.state.email}
                        </Text>

                        <View style={{height: 18}}></View>
                        <Text style={{ fontWeight: 'bold', paddingBottom: 4 }}>Negara</Text>
                        <Text style={{ fontWeight: 'normal' }}>
                            {this.state.country}
                        </Text>

                        <View style={{height: 18}}></View>
                        <Text style={{ fontWeight: 'bold', paddingBottom: 4 }}>Kota</Text>
                        <Text style={{ fontWeight: 'normal' }}>{this.state.city}</Text>

                </View>

                <View style={{height: '20%'}}>

                </View>


                <Button style = {{alignSelf: 'center', margin:5, borderRadius: 10, 
                width: '80%', backgroundColor: '#AA2025'}}
                    onPress= {() => { this.backup2(); }}>

                    <View style={{ flex:1, flexDirection: 'row', width: '100%', alignSelf: 'center', alignItems: 'center', justifyContent: 'center'}}>
                      <Image source={require('./images/backup_white.png')} style={{ height: 30, width: 30 }}></Image>
                      <Text style={{ color: '#ffffff', textAlign: 'center' }}>Backup</Text>
                    </View>
                </Button>
                <Button style = {{alignSelf: 'center', margin: 5, borderRadius: 10, 
                width: '80%', backgroundColor: '#AA2025'}}
                    onPress= {() => { this.restore2(); }}>
                    <View style={{ flex:1, flexDirection: 'row', width: '100%', alignSelf: 'center', alignItems: 'center', justifyContent: 'center'}}>
                      <Image source={require('./images/restore_white.png')} style={{ height: 30, width: 30 }}></Image>
                      <Text style={{ color: '#ffffff', textAlign: 'center' }}>Restore</Text>
                    </View>
                </Button>
                <Button style = {{alignSelf: 'center', margin:5, borderRadius: 10, 
                width: '80%', backgroundColor: '#AA2025'}}
                    onPress= {() => { this.clearUploadedPhoto(); }}>
                    <View style={{ flex:1, flexDirection: 'row', width: '100%', alignSelf: 'center', alignItems: 'center', justifyContent: 'center'}}>
                      <Image source={require('./images/delete_white.png')} style={{ height: 30, width: 30 }}></Image>
                      <Text style={{ color: '#ffffff', textAlign: 'center' }}>Hapus Uploaded Foto</Text>
                    </View>
                </Button>
                <View style={{height: 150}}></View>

            </ImageBackground>
            </Content>
            <Footer style={{backgroundColor: '#AA2025'}}>
                <TouchableOpacity onPress={this.logout.bind(this)} style={{marginTop: '0%', padding: '3%'}} >
                    <Image source={require('./images/logout_white.png')} />
                </TouchableOpacity>
            </Footer>
            </Container>
        )

    }
}