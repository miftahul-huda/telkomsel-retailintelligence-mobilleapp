import React, { Component } from 'react';
import { Container, Content, Text, Card, Header, Footer, Body, Title, 
  List,
  ListItem,
  Left,
  Item, CardItem, Icon, Button } from 'native-base';

import { Image, View, ScrollView, TouchableOpacity, Alert, ImageBackground } from 'react-native';
import { Actions } from 'react-native-router-flux';
import UploadedFile from './model/UploadedFile';
import * as RNFS from 'react-native-fs';
import Exif from 'react-native-exif';
import Logging from './util/Logging';

import GetLocation from 'react-native-get-location';
import FilePackageItem from './model/FilePackageItem';
GlobalSession = require( './GlobalSession');

import Sequelize from "rn-sequelize";
const Op = Sequelize.Op;


const FILE_STORAGE_PATH = RNFS.DownloadDirectoryPath;

export default class UploadPage extends Component {
    constructor(props) {
        super(props);
        this.state = {
            files: [],
            selectedFile: null
        }
    }

    componentDidMount(){
        this.loadFiles(this.props.imageCategory);
    }

    loadFiles(imageCategory){
        let me = this;
        if(imageCategory == null)
            imageCategory = "poster";

        UploadedFile.findAll({
            where:{
                [Op.and]:
                {
                    imageCategory: imageCategory,
                    picture_taken_by: GlobalSession.currentUser.email,
                    isuploaded: 0
                }
            }
            ,
            order: [
                ['id', 'DESC']
            ]
        }).then((files) => {

            files.map(file => {
                file.selected = false
            });

            if(files != null)
            {
                me.setState({
                    files: files
                })
            }

            console.log(files);
        }).catch((e)=>{
            Logging.log(e, "error", "UploadPage.loadFiles().UploadedFile.findAll()")
        })
    }

    onSaveRotateImage(res){

    }

    makeid(length) {
        var result           = '';
        var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        var charactersLength = characters.length;
        for ( var i = 0; i < length; i++ ) {
            result += characters.charAt(Math.floor(Math.random() * charactersLength));
        }
        return result;
    }

    getCurrentDate(){
        var date = new Date();
        var dateString = date.getFullYear() + "-" + (date.getMonth()  + 1) + "-" + date.getDate();
        dateString += " " + date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds();
        return dateString;
    }

    assembleUploadFileObject(me, msg, filename, uploadFile)
    {
        let uploadedFile = {};
        uploadedFile.pixel_width = msg.ImageWidth;
        uploadedFile.pixel_height  = msg.ImageHeight;

        uploadedFile.exposure_time = msg.exif.ExposureTime;
        uploadedFile.iso_speed_rating = msg.exif.ISOSpeedRatings;
        uploadedFile.white_balance = msg.exif.WhiteBalance;
        uploadedFile.orientation  = msg.exif.Orientation;
        uploadedFile.make = msg.exif.Make;
        uploadedFile.model = msg.exif.Model;
        uploadedFile.flash = msg.exif.Flash;
        uploadedFile.fnumber = msg.exif.FNumber;

        uploadedFile.filename = filename;
        uploadedFile.isuploaded = 0;
        uploadedFile.picture_taken_date = me.getCurrentDate();

        uploadedFile.picture_taken_by = GlobalSession.currentUser.email;

        if(GlobalSession.currentStore != null)
        {
          uploadedFile.store_name =  GlobalSession.currentStore.store_name;
          uploadedFile.store_id = GlobalSession.currentStore.storeid;
        }
        else
        {
            uploadedFile.store_name =  uploadFile.store_name;
            uploadedFile.store_id = uploadFile.store_id;
        }

        

        uploadedFile.imageCategory = uploadFile.imageCategory;

        return uploadedFile;
    }

    createNewFileInfo(filename, uploadFile){

        let uploadedFile = {};
        let promise  = new Promise((resolve, reject) => {
          Exif.getExif(FILE_STORAGE_PATH + "/retail-intelligence/pics/temp3.jpg" )
          .then(msg => 
            {
              GetLocation.getCurrentPosition({
                enableHighAccuracy: true,
                timeout: 15000,
              })
              .then(location => {
                  console.log(location);
                  console.log("Exit");
                  console.log(msg);
  
                  uploadedFile  = this.assembleUploadFileObject(this, msg, filename, uploadFile);
  
                  uploadedFile.lon = location.longitude;
                  uploadedFile.lat = location.latitude;
                  uploadedFile.alt = location.altitude;
  
                  resolve(uploadedFile);
              })
              .catch(error => {
                  const { code, message } = error;
                  console.log( message);
                  Logging.log(error, "error", "UploadPage.createNewFileInfo() : GetLocation.getCurrentPosition()")
                  uploadedFile  = this.assembleUploadFileObject(this, msg, filename, uploadFile);
                  resolve(uploadedFile);
              })
  
            }
            
          )
          .catch(msg => {
            reject(msg);
            let ss = JSON.stringify(msg);
            Logging.log(ss, "error", "UploadPage.createNewFileInfo() : Exif.getExif(FILE_STORAGE_PATH + /retail-intelligence/pics/temp3.jpg )")
            alert("Error createNewFileInfo " + ss);
          })
    
        });
  
        return promise;
  
    }


    async onSaveCropImage(res, uploadFile)
    {
        var me = this;
        me.setState({ loading: true  })
  
        let croppedFilename = res.uri.replace("file://", "");
        croppedFilename = croppedFilename.replace("file:", "");
  
        console.log('croppedFilename');
        console.log(croppedFilename);
  
        let dt = new Date();
        let dtfolder = dt.getFullYear() + "" + dt.getMonth() + "" + dt.getDate();
        let filename = GlobalSession.currentUser.email + "-" + dt.getHours() +  "" + dt.getMinutes() + "" + dt.getSeconds() + "-" + me.makeid(7) + ".jpg";
  
        let folder = FILE_STORAGE_PATH + '/retail-intelligence/pics/' + dtfolder;
        RNFS.mkdir(folder).then(function(){
          let savedFile = folder + "/" + filename;
          RNFS.copyFile(croppedFilename, savedFile ).then(function(){
  
            me.createNewFileInfo(savedFile, uploadFile).then(function(file){

                console.log("create new file info");
                console.log(file);

                UploadedFile.update(file, { where: {id: uploadFile.id } }).then(function(){
                    me.setState({ loading: false  })
                    Alert.alert("File saved");
                    Actions.pop();
                    //Actions.pop();
                    file.id = uploadFile.id;

                    try{
                        RNFS.unlink(uploadFile.filename);
                    }
                    catch(err)
                    {
                        
                    }
                    
                    me.loadFiles(me.props.imageCategory);
                    me.viewImage(file);
  
                    
              })
            }).catch(function(err){
              me.setState({ loading: false  })
              let sjson = JSON.stringify(err);
              Logging.log(err, "error", "UploadPage.onSaveImage() : me.createNewFileInfo()")
              alert(sjson);
            });
  
  
  
          }).catch(function(err){
            me.setState({ loading: false  })
            console.log(err)
            let sjson = JSON.stringify(err);
            Logging.log(err, "error", "UploadPage.onSaveImage() : RNFS.copyFile()")
            alert(json);
          })
        }).catch(function(err){
          me.setState({ loading: false  })
          Logging.log(err, "error", "UploadPage.onSaveImage() : RNFS.mkdir()")
          let sjson = JSON.stringify(err);
          alert(json);
        })
  
    }

    selectAll(){
        this.state.files.map(file => {
            file.selected = true;
        })

        this.setState({
            files:  this.state.files
        })
    }

    deselectAll(){
        this.state.files.map(file => {
            file.selected = false;
        })

        this.setState({
            files:  this.state.files
        })
    }

    deleteSelected(){
        var me = this;
        this.state.files.map(function(file) {
            if(file.selected){
                RNFS.unlink(file.filename).then(function(result) {
                    console.log("unlink result");
                    console.log(result);
                    UploadedFile.destroy({
                        where: { id: file.id }
                    }).then(function(result) {
                        console.log("destroy result");
                        console.log(result)
                        me.loadFiles();
                        return true;
                    }).catch(function(err) {
                        console.log("err destroy result");
                        console.log(err)

                        let ss = JSON.stringify(err);
                        alert("Error UploadedFile.destroy. " + ss);
                        Logging.log(err, "error", "UploadPage.deleteSelected().UploadedFile.create()")
                    })

                    FilePackageItem.destroy({
                        where: { upload_file_id : file.id }
                    }).catch(function(err){
                        let ss = JSON.stringify(err);
                        alert("Error FilePackageItem.destroy. " + ss);
                        Logging.log(err, "error", "UploadPage.deleteSelected().FilePackageItem.destroy()")
                    });

                    return true;
                }).catch(function(err) {
                    console.log("err unlink result");
                    console.log(err)
                    let ss = JSON.stringify(err);
                    alert("Error RNFS.unlink. " + ss);
                    Logging.log(err, "error", "UploadPage.deleteSelected().RNFS.unlink()")
                    
                })
            }
        });
    }

    selectDeselect(file, value){
        file.selected = value;
        this.setState({
            files:  this.state.files
        })      
    }

    back()
    {
        Actions.pop();
    }

    viewImage(file){
        this.state.selectedFile = file;

        Actions.viewImagePage({ editMode:true, file: file, onSaveCropImage: this.onSaveCropImage.bind(this), onSaveRotateImage: this.onSaveRotateImage.bind(this) })
    }
    
    render(){

        var me = this;

        return(
          <Container>
            <Header style={{backgroundColor: '#AA2025'}}>
              <Body>
                <View  style={{flex: 1, flexDirection: 'row'}}>
                <TouchableOpacity onPress={()=> me.back()} style={{marginTop: '0%', padding: '4%'}} >
                    <Image style={{ width: 20, height: 20}} source={require('./images/back.png')}></Image>
                </TouchableOpacity>
                <Image style={{ width: 30, height: 30, top: '2%'}} source={require('./images/top-images-white.png')}></Image>
                <Title style={{ marginLeft: '2%', marginTop: '3%' }}>File-file untuk diupload</Title>
                </View>
              </Body>
            </Header>

            <Content padder>
            <ImageBackground source={require('./images/background.png')} style={{ width: '100%', height: '100%' }}>
                <View style={{flex: 1}}>
                    <ScrollView>
                        <List>
                            {
                                
                             this.state.files.map(function(file) {
                                let filename = file.filename.split("/");
                                filename = filename[filename.length  -1];
                            return (<ListItem key={file.id}>
                            <TouchableOpacity onPress={()=> me.viewImage(file)} style={{width: '80%', flex:1, flexDirection: 'row'}} >
                                <Image style={{ width: 60, height: 60 }} source={{ uri: "file://" + file.filename }}></Image>
                                <Text style={{ marginLeft: '5%', fontWeight: 'bold', fontSize: 12 }}>{filename}</Text>
                            </TouchableOpacity>

                            { (file.selected  === true) ?
                                <TouchableOpacity onPress={()=> me.selectDeselect(file, false)} style={{marginTop: '0%', padding: '3%'}} >
                                    <Image style={{ width: 20, height: 20}} source={require('./images/check.png')}></Image>
                                </TouchableOpacity>
                                : 
                                <TouchableOpacity  onPress={()=> me.selectDeselect(file, true)} style={{marginTop: '0%', padding: '3%'}} >
                                    <Image style={{ width: 20, height: 20 }}></Image>
                                </TouchableOpacity> }
                            </ListItem>)
                            }) }
                        </List>
                    </ScrollView>
                </View>


                <View style={{height: 1000}}></View>

            </ImageBackground>
            </Content>
            <Footer style={{backgroundColor: '#AA2025', padding: '3%'}}>
                <TouchableOpacity onPress={this.selectAll.bind(this)} >
                    <Image source={require('./images/checked.png')} />
                </TouchableOpacity>
                <View style={{width: '15%'}}  />
                <TouchableOpacity onPress={this.deselectAll.bind(this)}>
                    <Image source={require('./images/uncheck.png')} />
                </TouchableOpacity>
                <View style={{width: '15%'}}  />
                <TouchableOpacity onPress={this.deleteSelected.bind(this)}>
                    <Image  onPress={this.deleteSelected.bind(this)} source={require('./images/delete_white.png')} />
                </TouchableOpacity>
                    
            </Footer>
          </Container>
        );
      }


}