import React, { Component } from 'react';
import { Container, Content, Text, Card, Header, Footer, Body, Title, 
  List,
  ListItem,
  Left,
  Item, CardItem, Icon, Button } from 'native-base';

import { Image, View, ScrollView, TouchableOpacity, Alert, ImageBackground, ActivityIndicator, LogBox } from 'react-native';
import { Actions } from 'react-native-router-flux';
import UploadedFile from './model/UploadedFile';
import * as RNFS from 'react-native-fs';
import Exif from 'react-native-exif';
import Logging from './util/Logging';
import Style from './style';
import SharedPage from './SharedPage';
import PageTab from './components/PageTab';
import ListGroup from './components/ListGroup';
import Util from './util/Util';

import GetLocation from 'react-native-get-location';
import FilePackageItem from './model/FilePackageItem';
import Sequelize from "rn-sequelize";
import Uploader from './util/Uploader';
import GlobalSession from './GlobalSession';
const Op = Sequelize.Op;


const FILE_STORAGE_PATH = RNFS.DownloadDirectoryPath;

export default class UploadPage extends SharedPage {
    constructor(props) {
        super(props);
        this.state = {
            files: [],
            selectedFile: null,
            title: "",
            fileItems: [],
            showFooter: false,
            selectAll: false,
            imageCategory: props.imageCategory,
            imageStatus: props.imageStatus,
            imageCategories: [{
                value: "poster",
                label: "Poster"
            }, {
                value:  "storefront",
                label: "Tampak Depan"
            },
            {
                value: 'poster-before-after',
                label: "Poster A/B"
            },
            {
                value: 'storefront-before-after',
                label: "Tmpk Depan A/B"
            }
            ,
            {
                value: 'etalase',
                label: "Etalase"
            }
            ,
            {
                value: 'total-sales',
                label: "Tot. Sales"
            }]
        }

        if(GlobalSession.currentMenuGroup == "poster")
        {
            this.state.imageCategories = [{
                value: "poster",
                label: "Poster"
            },
            {
                value: 'poster-before-after',
                label: "Poster A/B"
            }]
        }
        else
        {
            this.state.imageCategories = [
                {
                    value:  "storefront",
                    label: "Tampak Depan"
                },
                {
                    value: 'storefront-before-after',
                    label: "Tampak Depan A/B"
                }
                ,
                {
                    value: 'etalase',
                    label: "Etalase"
                }
                ,
                {
                    value: 'total-sales',
                    label: "Tot. Sales"
                }
            ]
        }
    }

    componentDidMount(){
        LogBox.ignoreAllLogs();

        let status = this.props.imageStatus;

        if(status == "uploaded")
            this.setState({ textStatus: "Terunggah" })
        else if(status == "draft")
            this.setState({ textStatus: "Draft" })
        else if(status == "processed")
            this.setState({ textStatus: "Proses" })
        else if(status == "rejected")
            this.setState({ textStatus: "Ditolak" })
        this.loadFiles(this.state.imageCategory, this.state.imageStatus);
    }

    searchBAByID(id, baFiles)
    {
        baFiles.map((f)=>
        {
            if(f.beforeAfterID == id)
            {
                return f;
            }
        })

        return null;
    }

    arrangeFilesForBeforeAfter(files)
    {
        let beforeAfterFiles = [];
        let me = this;

        let i = 0;
        files.map((file)=>{
            let id = file.beforeAfterID;
            let f = me.searchBAByID(id, beforeAfterFiles);
            if(f  == null)
            {
                f = { beforeAfterID: id }
                beforeAfterFiles.push(f);
            }
            if(file.beforeAfterType == "before")
                f.beforeFile = file;
            else if(file.beforeAfterType == "after")
                f.afterFile = file;
            beforeAfterFiles[i] =  f;
            i++;
        })
        return beforeAfterFiles;

    }

    getImageCategoryText()
    {
        if(this.state.imageCategory == "poster")
            return "Poster";
        if(this.state.imageCategory == "storefront")
            return "Tampak Depan";
        if(this.state.imageCategory == "beforeafter")
            return "Sebelum dan Sesudah";
        if(this.state.imageCategory == "total-sales")
            return "Tot. Sales";
        if(this.state.imageCategory == "etalase")
            return "Etalase";

    }

    loadFiles(imageCategory, imageStatus, callback){
        let me = this;
        if(imageCategory == null)
            imageCategory = "poster";

        if(imageStatus == null)
            imageStatus = "draft";

        let ands = [
            {imageCategory: imageCategory},
            {picture_taken_by: GlobalSession.currentUser.email},
            {imageStatus: imageStatus }
        ]

        if(imageCategory == "poster-before-after" || imageCategory == "storefront-before-after")
        {
            ands.push({ beforeAfterType: "before" })
        }

        console.log("ands")
        console.log(ands)

        UploadedFile.findAll({
            where:{
                [Op.and]: ands
            }
            ,
            order: [
                ['id', 'DESC']
            ]
        }).then(async (files) => {

            files.map(file => {
                file.selected = false
            });

            if(files != null)
            {
                let ff = null;

                ff = await me.getFiles2ListItem(files);

                me.setState({
                    files: files,
                    fileItems: ff
                })
            }

            if(callback != null)
                callback();

            
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

        
        uploadedFile.uploadStatus = "draft";
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

    async selectAll(){
        this.state.selectAll = !this.state.selectAll;
        console.log(this.state.selectAll)

        this.state.files.map(file => {
            file.selected = this.state.selectAll;
        })

        let items = await this.getFiles2ListItem(this.state.files);
        console.log(items);

        this.setState({
            files:  this.state.files,
            fileItems: items
        })

        if(this.state.selectAll && this.state.files.length > 0)
        {
            this.setState({
                showFooter: true
            })
        }
        else 
        {
            this.setState({
                showFooter: false
            })
        }
    }

    deselectAll(){
        this.state.files.map(file => {
            file.selected = false;
        })

        this.setState({
            files:  this.state.files
        })
    }

    async deleteSelectedFile(id, callback)
    {
        let promise = new Promise((resolve, reject)=>{
            UploadedFile.destroy({
                where: { id: id }
            }).then(function(result) {
                resolve()
            }).catch(function(err) {

                let ss = JSON.stringify(err);
                alert("Error UploadedFile.destroy. " + ss);
                Logging.log(err, "error", "UploadPage.deleteSelected().UploadedFile.destroy()")

                reject()
            })
        });

        return promise;
    }

    async deleteSelectedPackageItems(fileid)
    {
        let promise = new Promise((resolve, reject)=>{
            FilePackageItem.destroy({
                where: { upload_file_id : fileid }
            }).then(()=>{
                resolve();
            }).catch(function(err){
                let ss = JSON.stringify(err);
                alert("Error FilePackageItem.destroy. " + ss);
                Logging.log(err, "error", "UploadPage.deleteSelected().FilePackageItem.destroy()")
                reject();
            });
        })
        return promise;
    }

    async deleteSelectedFileBeforeAfter(file)
    {
        let me  = this;
        let promise = new Promise(async (resolve, reject)=>{
            try{
                let baFiles = await UploadedFile.findAll({where: { beforeAfterID: file.beforeAfterID }});
                if(baFiles.length  > 0)
                {
                    let id = baFiles[0].id;
                    await me.deleteSelectedFile(id);
                    await me.deleteSelectedPackageItems(id)
                }
        
                if(baFiles.length  > 1)
                {
                    let id = baFiles[1].id;
                    let filename = baFiles[1].filename;
                    await me.deleteSelectedFile(id);
                    await me.deleteSelectedPackageItems(id)

                    try{
                        await RNFS.unlink(filename)
                    }
                    catch(err)
                    {

                    }
                    
                }

                resolve();

            }
            catch(err)
            {
                reject(err);
            }
        })

        return promise;

    }

    async deleteSelectedFileNonBeforeAfter(file)
    {
        let me = this;
        let promise = new Promise(async (resolve, reject)=>{
            try
            {
                let id = file.id;
                await me.deleteSelectedFile(id);
                await me.deleteSelectedPackageItems(id);
                resolve();
            }
            catch(err)
            {
                reject(err);
            }
        });
        return promise;
    }

    async deleteSelectedFileEvent(file)
    {
        let me = this;
        let promise  = new Promise(async (resolve, reject)=>{

            try{
                if(file.beforeAfterID != null)
                {
                    await me.deleteSelectedFileBeforeAfter(file);
                }
                else
                {
                    await me.deleteSelectedFileNonBeforeAfter(file);
                }

                resolve()

            }
            catch(err)
            {
                reject(err)
            }
        })

        return promise;

    }

    deleteSelected(){
        var me = this;
        Alert.alert("Konfirmasi hapus", "Data akan dihapus, apakah anda yakin?", [
            {
                text:  "Ya",
                onPress: ()=>{
                    me.deleteAllSelected();
                }
            },
            {
                text: "Tidak"
            }
        ])
    }

    deleteAllSelected()
    {
        var me = this;
        this.state.files.map(async function(file) {
            if(file.selected){

                try
                {
                    await RNFS.unlink(file.filename);
                }
                catch(err)
                {

                }

                try
                {
                    await RNFS.unlink(file.compressed_filename);
                }
                catch(err)
                {
                    
                }
                
                await me.deleteSelectedFileEvent(file);
  
            }
        });

        me.loadFiles(me.state.imageCategory, me.state.imageStatus);
    }

    selectDeselect(file, value){
        file.selected = value;
        this.setState({
            files:  this.state.files
        })      
    }

    back()
    {
        Actions.reset("homePage")
        //Actions.pop();
    }

    viewImage(file){
        this.state.selectedFile = file;
        if(file.imageCategory == "poster")
            Actions.imageHomePage( {file: file} );
        if(file.imageCategory == "poster-before-after")
            Actions.beforeAfterPosterHomePage( {beforeAfterID: file.beforeAfterID} );
        else if(file.imageCategory == "storefront")
            Actions.imageHomeStoreFrontPage({ file: file })
        else if(file.imageCategory == "storefront-before-after")
            Actions.beforeAfterStoreFrontHomePage( {beforeAfterID: file.beforeAfterID} );
        else if(file.imageCategory == "total-sales")
            Actions.imageHomeTotalSalesPage( {file: file} );
        else if(file.imageCategory == "etalase")
            Actions.imageHomeEtalasePage( {file: file} );
            
        //Actions.viewImagePage({ editMode:true, file: file, onSaveCropImage: Util.onSaveCropImage.bind(this), onSaveRotateImage: this.onSaveRotateImage.bind(this) })
    }   

    onImageCategorySelected(item)
    {
        this.state.imageCategory = item.value;
        
        this.setState({
            imageCategory: item.value,
            showFooter: false
        })
        

        this.loadFiles(this.state.imageCategory, this.state.imageStatus)

    }

    getFilenameOnly(path)
    {
        if(path != null)
        {
            let ff = path.split('/');
            return ff[ff.length - 1];
        }
        else 
            return "";
 
    }

    async getFiles2ListItem(files)
    {
        try
        {
            files = await Util.setTotalItems(files);
            //console.log(files)
        }
        catch(err)
        {
            console.log(err);
            return [];
        }
        
        let newItems = [];
        let me  = this;
        files.map((file)=>{
            let newItem = {};
            newItem.title = file.store_name;
            newItem.subTitle =  me.getFilenameOnly( file.filename);
            newItem.content = "Jumlah item : " + file.totalItems;
            newItem.image = file.filename;
            newItem.group = file.store_name;
            newItem.imageCategory = file.imageCategory;
            newItem.data  = file;
            newItem.checked = file.selected;
            newItems.push(newItem);

        })

        return newItems;
    }

    async getFiles2ListItemBeforeAfter(files)
    {
        try
        {
            files = await Util.setTotalItems(files);
            //console.log(files)
        }
        catch(err)
        {
            console.log(err);
            return [];
        }
        
        let newItems = [];
        let me  = this;
        files.map((f)=>{
            let newItem = {};
            newItem.titleBefore = f.fileBefore.store_name;
            newItem.subTitleBefore =  me.getFilenameOnly( f.fileBefore.filename);
            newItem.contentBefore = "Jumlah item : " + f.fileBefore.totalItems;
            newItem.imageBefore = f.fileBefore.filename;
            newItem.groupBefore = f.fileBefore.store_name;
            newItem.imageCategoryBefore = f.fileBefore.imageCategory;
            newItem.dataBefore  = f.fileBefore;
            newItem.checkedBefore = f.fileBefore.selected;

            newItem.titleAfter = f.fileAfter.store_name;
            newItem.subTitleAfter =  me.getFilenameOnly( f.fileAfter.filename);
            newItem.contentAfter = "Jumlah item : " + f.fileAfter.totalItems;
            newItem.imageAfter = f.fileAfter.filename;
            newItem.groupAfter = f.fileAfter.store_name;
            newItem.imageCategoryAfter = f.fileAfter.imageCategory;
            newItem.dataAfter  = f.fileAfter;
            newItem.checkedAfter = f.fileAfter.selected;

            newItems.push(newItem);

        })

        return newItems;
    }

    onFileItemSelected(item)
    {
        this.viewImage(item.data)
    }

    cancelUpload()
    {
        this.setState({  showFooter: false})
    }

    setCheckedFiles(checkedItems)
    {
        this.state.files.map((file)=>{
            file.selected = false;
        })

        checkedItems.map((item)=>{
            this.state.files.map((file)=>{
                if(item.data.id == file.id)
                    file.selected = true;
            })
        })
    }



    onItemChecked(items)
    {
        this.setCheckedFiles(items);
        if(items.length  > 0)
        {
            this.setState({
                showFooter: true
            })
        }
        else
        {
            this.setState({
                showFooter: false
            })
        }
    }

    batchUpload()
    {
        this.state.files.map(async (file)=>{
            if(file.selected)
            {

                let newFile = await UploadedFile.update({ imageStatus: "processed" }, {where: { id: file.id }})
                console.log(newFile)
            }
        })

        this.setState({
            showFooter: false
        })

        Uploader.START_UPLOAD = true;

        
        var me = this;
        this.state.counter = 0;
 


        Uploader.callback = function()
        {

        }

        Uploader.processCallback = function(processInfo)
        {
            me.state.fileItems.map((item)=>{
                if(item.data.id == processInfo.file.id)
                {
                    if(processInfo.status == "processed")
                        item.showIndicator = <ActivityIndicator color="#00FF00" size="large"></ActivityIndicator>;
                    else if(processInfo.status ==  "rejected")
                        item.showIndicator = <Image source={require("./images/exclamation-mark.png")} style={{width: 20, height:20}} resizeMode="contain"></Image>
                    else if(processInfo.status ==  "uploaded")
                        item.showIndicator = <Image source={require("./images/checked-green.png")} style={{width: 20, height:20}} resizeMode="contain"></Image>

                }
            })

            me.setState({
                fileItems: me.state.fileItems
            })
        }
        

    }
    
    render(){

        var me = this;
        var title = "Daftar Foto " + this.state.textStatus;
        //if(this.props.imageCategory == "storefront")
        //    title = "Foto tampak depan"


        return(
          <Container>
            <Header style={{backgroundColor: '#fff', height: 130}}>
              <Body>
                <View  style={Style.horizontalLayout}>
                    <View style={Style.headerHorizontalLayout} >
                        <TouchableOpacity onPress={()=> me.back()}>
                            <Image style={Style.headerImage} resizeMode='contain' source={require('./images/back-dark.png')}></Image>
                        </TouchableOpacity>
                        <View style={{width: 30}}></View>
                        <Title style={Style.headerTitle}>Foto {this.state.textStatus}</Title>
                    </View>
                    
                    <View style={{width: '55%'}}></View>
                    <View style={Style.headerHorizontalLayout}>
                        <TouchableOpacity onPress={this.selectAll.bind(this)} >
                            {
                                (this.state.selectAll) ?
                                    <Image source={require('./images/checked-dark.png')} style={Style.headerImage}/>
                                    :
                                    <Image source={require('./images/uncheck-dark.png')} style={Style.headerImage}/>
                            }
                            
                        </TouchableOpacity>
                        <View style={{width: '20%'}}  />
                        <TouchableOpacity onPress={this.deleteSelected.bind(this)}>
                            <Image source={require('./images/delete.png')}  style={Style.headerImage}/>
                        </TouchableOpacity>
                    </View>
                </View>
                <View style={{height: 10, width:'100%', backgroundColor: '#eee', borderWidth: 0}}>

                </View>
                <View style={{backgroundColor: '#fff', height: 70, borderWidth: 0}}>
                    <PageTab items={this.state.imageCategories} selectedValue={this.props.imageCategory}
                    onSelected={this.onImageCategorySelected.bind(this)}>

                    </PageTab>
                </View>
              </Body>
            </Header>

            <Content style={{backgroundColor: '#fff'}}>
            <View style={{height: 5}}></View>

                <View style={{height: 20}}></View>
            
                <View>

                        {
                            (this.state.fileItems.length == 0) ? 
                            <View style={{width: '100%', height: '100%'}}>
                                <Text style={{marginTop: '30%', fontSize: 16, color: '#999', alignSelf: 'center'}}>
                                    Tidak ada foto {this.getImageCategoryText(this.state.imageCategory)} {this.state.textStatus}
                                </Text>
                            </View>
                            :
                            null
                        }
       
                        <ListGroup items={this.state.fileItems} onSelected={this.onFileItemSelected.bind(this)} onItemChecked={this.onItemChecked.bind(this)}>

                        </ListGroup>
                        
               
                </View>


                <View style={{height: 1000}}></View>


            </Content>
            {
                (this.state.showFooter) ?
                    <Footer style={{ height: 140, borderColor: '#eee', borderWidth: 6 }}>
                        <View style={{padding: '5%', backgroundColor: '#fff'}}>
                            <Button style={Style.buttonRed} onPress={()=>this.batchUpload()}>
                                <View style={{ alignItems: 'center', width: '100%' }}>
                                    <Text style={Style.textWhite}>Unggah</Text>
                                </View>
                            </Button>
                            <Button style={Style.button} onPress={()=>this.cancelUpload()}>
                                    <View style={{ alignItems: 'center', width: '100%' }}>
                                        <Text style={Style.textDark}>Batal</Text>
                                    </View>
                            </Button>
                        </View>
                    </Footer>  : null
            }
          </Container>
        );
      }


}