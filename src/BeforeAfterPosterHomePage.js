import React, { Component } from 'react';
import { Container, Content, Text, Card, Header, Footer, Body, Button, Title, 
  List,
  ListItem,
  Left,
  Item, CardItem, Icon, View } from 'native-base';

import { Image, ImageBackground, ScrollView, ActivityIndicator, LogBox, Alert} from 'react-native';
import { Actions } from 'react-native-router-flux';

import UploadedFile from './model/UploadedFile';
import Style from './style';
import SharedPage from './SharedPage';
import LabelInput from './components/LabelInput';

import Logging from './util/Logging';
import GlobalSession from './GlobalSession';
import HttpClient from './util/HttpClient';
import Util from './util/Util'

import Sequelize from "rn-sequelize";
import { TouchableOpacity } from 'react-native-gesture-handler';
import FilePackageItem from './model/FilePackageItem';
import FilePackageSubItem from './model/FilePackageSubItem';

import { call, Transitioning } from 'react-native-reanimated';
import { stat } from 'react-native-fs';
import Uploader from './util/Uploader';
import { Accelerometer } from 'expo';
const Op = Sequelize.Op;
import * as RNFS from 'react-native-fs';



export default class BeforeAfterPosterHomePage extends SharedPage {
    constructor(props)
    {
        super(props);
        this.state = {
            ...this.state,
            imageCategoryText: 'Poster',
            shortFilenameBefore: '',
            shortFilenameAfter: '',
            packageItemsBefore: [],
            packageItemsAfter: [],
            fileBefore: null,
            fileAfter: null,
            showProgress: false,
            selectedOperator: null,
            effortCounter: Array(),
            beforeAfterID: props.beforeAfterID,
            autofillBeforeDone: 0,
            autofilAfterDone: 0,
            operators: []
        }
    }

    async componentDidMount()
    {
        LogBox.ignoreAllLogs();
        var me = this;
        let filenameBefore = ""; 
        let filenameAfter = ""; 

        await this.loadOperators();
        await this.loadBeforeAfterFiles();

        if(this.state.fileBefore != null)
        {
            filenameBefore = this.state.fileBefore.filename;
            filenameBefore = filenameBefore.split("/");
            filenameBefore = filenameBefore[filenameBefore.length - 1];
            this.state.shortFilenameBefore = filenameBefore;
        }

        if(this.state.fileAfter != null)
        {
            filenameAfter = this.state.fileAfter.filename;
            filenameAfter = filenameBefore.split("/");
            filenameAfter = filenameBefore[filenameBefore.length - 1];
            this.state.shortFilenameAfter = filenameAfter;

        }


        this.setState({
            shortFilenameBefore: filenameBefore,
            shortFilenameAfter: filenameAfter
        })


        me.loadPackageItemsBefore();
        me.loadPackageItemsAfter();

    }

    async loadOperators()
    {
        let me = this;
        let promise = new Promise((resolve, reject)=>{

            let url = GlobalSession.Config.API_HOST + "/operator";
            HttpClient.get(url, function(result){

                me.setState({ operators: result.payload})
                resolve(result.payload)
            })
        })

        return promise;
    }

    getOperatorName(operator)
    {
        let opname = "";
        this.state.operators.map((op)=>{
            //console.log(op.operator_value + " === " + operator)
            if(op.operator_value.toLowerCase() == operator.toLowerCase())
            {
                //console.log("here")
                opname = op.operator_name;
            }
                
        })

        return opname;
    }

    getShortFilename(path)
    {
        let filename = path;
        filename = filename.split("/");
        filename = filename[filename.length - 1];
        return filename;
    }

    async loadBeforeAfterFiles(callback)
    {
        await this.loadBeforeAfterFilesLocal();

        console.log("this.props.beforeAfterID")
        console.log(this.props.beforeAfterID)
       

        if(this.state.fileBefore ==  null)
            await this.loadBeforeAfterFilesRemote(callback);
        else
        {
            if(callback != null)
                callback();
        }
    }

    async loadBeforeAfterFilesLocal(callback)
    {
        let beforeAfterFiles = await UploadedFile.findAll({ where: { beforeAfterID: this.props.beforeAfterID } })

        let beforeFile = null;
        let afterFile = null;

        beforeAfterFiles.map((file)=>{
            if(file.beforeAfterType == "before")
                beforeFile =  file;
            else
                afterFile = file;
        })


        this.setState({
            fileBefore: beforeFile,
            fileAfter: afterFile
        })

        if(callback != null)
            callback();
    }

    async loadBeforeAfterFilesRemote(callback)
    {
        let beforeFile = null;
        let afterFile = null;
        let me = this;

        

        let promise = new Promise((resolve, reject)=>{
            let url = GlobalSession.Config.API_HOST + "/uploadfile/before-after/" + this.props.beforeAfterID;
            HttpClient.get(url, function(response){
                let  beforeAfterFiles = response.payload;
                beforeAfterFiles.map((file)=>{
                    if(file.beforeAfterType == "before")
                        beforeFile =  file;
                    else
                        afterFile = file;

                });

                me.setState({
                    fileBefore: beforeFile,
                    fileAfter: afterFile
                });

                if(callback != null)
                    callback();

                resolve();
                
            })
        })

        return promise;
    }

    loadFileBefore(callback)
    {
        var me = this;
        this.loadLocalFileBefore(function(){
            if(me.state.fileBefore == null)
                me.loadRemoteFileBefore();  
            else
            {
                if(callback != null)
                    callback()
            }
        })

    }

    //Load file from local storage
    loadLocalFileBefore(callback)
    {
        let id = this.state.fileBefore.id;
        UploadedFile.findByPk(id).then((file)=>{

            this.setState({
                fileBefore: file
            })

            if(callback != null)
                callback(file);
            
            return true;

        }).catch((err)=>{
            console.log("Error")
        })
    }

    //Load file from remote storage
    loadRemoteFileBefore(callback)
    {
        let me = this;
        let promise = new Promise((resolve, reject)=>{
            let id = this.props.beforeAfterID;
            let url = GlobalSession.Config.API_HOST + "/uploadfile/before-after/" + id;
    
            HttpClient.get(url, function(response){
                let file = response.payload;
                me.setState({
                    fileBefore: file
                })
    
                if(callback != null)
                    callback(file);
                
                resolve()
            })
        })
        
        return promise;
    }

    loadFileAfter(callback)
    {

        var me = this;
        this.loadLocalFileAfter(function(){
            if(me.state.fileBefore == null)
                me.loadRemoteFileAfter(callback);  
            else
            {
                if(callback != null)
                    callback()
            }
        })
    }

    //Load file from local storage
    loadLocalFileAfer(callback)
    {
        let id = this.state.fileAfter.id;
        UploadedFile.findByPk(id).then((file)=>{

            this.setState({
                fileAfter: file
            })

            if(callback != null)
                callback(file);
            
            return true;

        }).catch((err)=>{
            console.log("Error")
        })
    }

    //Load file from remote storage
    loadRemoteFileAfter(callback)
    {
        let me = this;
        let promise = new Promise((resolve, reject)=>{
            let id = this.state.fileAfter.id;
            let url = GlobalSession.Config.API_HOST + "/uploadfile/get/" + id;
    
            HttpClient.get(url, function(response){
                let file = response.payload;
    
                me.setState({
                    fileAfter: file
                })
    
                if(callback != null)
                    callback(file);
            
                resolve();
            })
        })
        

    }



    back()
    {
        //Actions.pop();
        Actions.reset("homePage")
    }

    viewImage(file){

        Actions.viewImagePage({ editMode:true, file: file, onSaveCropImage: Util.onSaveCropImage.bind(this) })
    }

    onSavePackageItem(item)
    {
        var me = this;
        this.loadBeforeAfterFiles(function(){
            me.loadLocalPackageItemsBefore();
            me.loadLocalPackageItemsAfter();
        });
    }

    onSavePosterInfo()
    {
        var me = this;
        this.loadBeforeAfterFiles(function(){
            me.loadPackageItemsBefore();
            me.loadLocalPackageItemsAfter();
        });
    }

    addInfo(file)
    {
        Actions.posterInfoPage({ file: file, onAfterSave: this.onSavePosterInfo.bind(this) })
    }

    editPackageItem(item, file)
    {
        if(item.transferPrice == null)
            item.transferPrice = "";
            
        Actions.editPackageItemPage({ mode: "edit", file: file, item: item, onAfterSaved: this.onSavePackageItem.bind(this), operator: file.operator });
    }

    addPackageItem(file)
    {
        if(file.operator == null || file.operator.trim().length == 0)
        {
            alert("Mohon isi informasi umum poster terlebih dahulu")
        }
        else
        {
            if(this.state.packageItems == null)
                this.state.packageItems = [];

            //let max =  this.getMaxTempId();
            let max = Math.random().toString(36).substring(12);

            let item = { id:null, package_name: '', price: '', transferPrice: '', validity: '', gbmain: '', tempid: max, filePackageSubItems: [] };
            Actions.editPackageItemPage({ mode: "add", file: file, item: item, onAfterSaved: this.onSavePackageItem.bind(this, file), operator: file.operator });
    
        }
    }

    //------------ Start of PackageItems Before --------------------
    async loadPackageItemsBefore()
    {
        if(this.state.fileBefore != null && this.state.fileBefore.isuploaded == 1)
        {
            this.loadRemotePackageItemsBefore();
        }
        else if(this.state.fileBefore != null)
        {
            this.loadLocalPackageItemsBefore();
        }
    }

    async loadLocalPackageItemsBefore()
    {
        let packageItems = await FilePackageItem.findAll({ where: { upload_file_id: this.state.fileBefore.id }});

        this.setState({
            packageItemsBefore: packageItems
        })
        return true;
    }

    async loadRemotePackageItemsBefore()
    {
        let me = this;
        let id = this.state.fileBefore.id;
        let url = GlobalSession.Config.API_HOST + "/filepackageitem/file/" + id;

        HttpClient.get(url, function(response){
            
            let packageItems = response.payload;

            me.setState({
                packageItemsBefore: packageItems
            })
        })
    }

    //------------ End of PackageItems After --------------------

    //------------ Start of PackageItems After --------------------

    async loadPackageItemsAfter()
    {
        if(this.state.fileAfter != null && this.state.fileAfter.isuploaded == 1)
        {
            this.loadRemotePackageItemsAfter();
        }
        else if(this.state.fileAfter != null)
        {
            this.loadLocalPackageItemsAfter();
        }
    }

    async loadLocalPackageItemsAfter()
    {
        let packageItems = await FilePackageItem.findAll({ where: { upload_file_id: this.state.fileAfter.id }});
        this.setState({
            packageItemsAfter: packageItems
        })
        return true;
    }

    async loadRemotePackageItemsAfter()
    {
        let me = this;
        let id = this.state.fileAfter.id;
        let url = GlobalSession.Config.API_HOST + "/filepackageitem/file/" + id;
        HttpClient.get(url, function(response){
            
            let packageItems = response.payload;

            me.setState({
                packageItemsAfter: packageItems
            })
        })
    }

    //------------ End of PackageItems After --------------------

    displayPackageItems(packageItems, file)
    {
        return(<View>
            {
                packageItems.map((packageItem)=>{
                    
                    return(<ListItem key={packageItem.id} style={{ height: 60, flex:1,  flexDirection: 'row'}}>
                        <TouchableOpacity onPress={this.editPackageItem.bind(this, packageItem, file)}>
                            <Text style={Style.content}>Jenis paket : {packageItem.itemCategoryText}, Harga : {packageItem.price}, Harga Transfer: {packageItem.transferPrice}</Text>
                        </TouchableOpacity>
                    </ListItem>)
                })
            }
        </View>)
    }

    validate()
    {
        if(this.state.packageItemsBefore.length == 0)
            return { success: false, message: "Sebelum dapat diproses selanjutnya, mohon lengkapi informasi detail produk untuk Foto sebelum"}
        if(this.state.packageItemsAfter.length == 0)
            return { success: false, message: "Sebelum dapat diproses selanjutnya, mohon lengkapi informasi detail produk untuk Foto Sesudah"}
        if(this.state.fileBefore.operator == null || this.state.fileBefore.operator.length == 0)
            return { success: false, message: "Sebelum dapat diproses selanjutnya, mohon isi operator Foto Sebelum"}
        if(this.state.fileAfter.operator == null || this.state.fileAfter.operator.length == 0)
            return { success: false, message: "Sebelum dapat diproses selanjutnya, mohon isi operator Foto Sebelum"}
        if(this.state.fileBefore.posterType == null || this.state.fileBefore.posterType.length == 0)
            return { success: false, message: "Sebelum dapat diproses selanjutnya, mohon isi jenis poster Foto Sebelum"}
        if(this.state.fileAfter.posterType == null || this.state.fileAfter.posterType.length == 0)
            return { success: false, message: "Sebelum dapat diproses selanjutnya, mohon isi jenis poster Foto Sesudah"}
        if(this.state.fileBefore.areaPromotion == null || this.state.fileBefore.areaPromotion.length == 0)
            return { success: false, message: "Sebelum dapat diproses selanjutnya, mohon isi area promosi Foto Sebelum"}
        if(this.state.fileAfter.areaPromotion == null || this.state.fileAfter.areaPromotion.length == 0)
            return { success: false, message: "Sebelum dapat diproses selanjutnya, mohon isi area promosi Foto Sesudah"}        
        return { success: true}
    }

    async setStatus(status)
    {
        let res = { success: true};
        var me = this;

        if(status == "processed")
            res = this.validate();
        

        if(status == "processed" && res.success)
        {
            await UploadedFile.update({ imageStatus: status }, {where: { id: this.state.fileBefore.id}});
            await UploadedFile.update({ imageStatus: status }, {where: { id: this.state.fileAfter.id}});
            await me.loadBeforeAfterFiles();

            this.setState({
                fileBefore: me.state.fileBefore,
                fileAfter: me.state.fileAfter,
                showProgress: true
            })


            Uploader.START_UPLOAD = 1;

            Uploader.callback = function()
            {

                setTimeout(function(){
                    me.loadBeforeAfterFiles(function(){
                        let rejectedReason = "";
                        if(me.state.fileBefore != null && me.state.fileBefore.imageStatus == "rejected")
                        {
                            rejectedReason += "- " + me.state.fileBefore.rejectedReason;
                        }
                        if(me.state.fileAfter != null && me.state.fileAfter.imageStatus == "rejected")
                        {
                            rejectedReason += "- " + me.state.fileAfter.rejectedReason;
                        }

                        if( (me.state.fileBefore != null && me.state.fileBefore.imageStatus == "rejected") || 
                        ( me.state.fileAfter != null && me.state.fileAfter.imageStatus == "rejected"))
                        {
                            alert("Gagal", "Unggah gagal: " + rejectedReason)
                        }
                        else
                        {
                            alert("Unggah selesai", "Unggah foto telah berhasil dilakukan")
                            Actions.reset("uploadPage", {imageCategory: "poster-before-after", imageStatus: "draft"})
                        }
                        me.setState({
                            showProgress: false
                        })
                    })
                }, 1000);

            }
            

            
        }
        else if(status== "processed" && res.success == false)
        {
            this.showDialog("Pengisian kurang lengkap", res.message)
        }
        else
        {
            
            await UploadedFile.update({ imageStatus: status }, {where: { id: this.state.fileBefore.id}});
            await UploadedFile.update({ imageStatus: status }, {where: { id: this.state.fileAfter.id}});
            Actions.reset("uploadPage", { imageCategory: this.state.fileBefore.imageCategory, imageStatus: "draft" })
        }
    }


    uploadToGcs(orientation, file, callback, callbackError)
    {
        var url = GlobalSession.Config.API_HOST_UPLOAD + "/upload/gcs/telkomsel-retail-intelligence/retail-intelligence-bucket/temporary";
        console.log(url);
        HttpClient.upload(url, file.filename, function(res){
            console.log("done upload image");

            let uri = res.payload;
            uri = uri.replace("gs://", "https://storage.googleapis.com/")


            if(callback != null)
                callback(uri);

        }, function(err){
            Logging.log(err, "error", "ImageInfoPage.uploadToGcs().HttpClient.upload()")
            if(callbackError != null)
                callbackError(err);
        });
    }

    callFilter(me, uri, orientation, callback, callbackError){
        var url = GlobalSession.Config.API_HOST_FILTER;
        var data = { url: uri, orientation: orientation }

        console.log(url);
        console.log(data);

        HttpClient.post(url, data, function(res){

            if(callback !=null)
                callback(res);
            
        }, function(err){
            console.log("Retrieve error")
            console.log(err);

            Logging.log(err, "error", "ImageInfoPage.callFilter().HttpClient.post() : url : " + url + ", data : " + JSON.stringify(data))
            if(callbackError != null)
                callbackError(me, uri, orientation);
        });
    }

    callOperatorFilter(me, uri,  callback, callbackError){
        var url = GlobalSession.Config.API_HOST_OPERATOR_FILTER;
        uri = uri.replace("https://storage.googleapis.com/", 'gs://')
        var data = { url: uri }

        console.log("Operator Filter")
        console.log(url);
        console.log(data);

        HttpClient.post(url, data, function(res){

            if(callback !=null)
                callback(res);
            
        }, function(err){
            console.log("Retrieve operator error")
            console.log(err);

            Logging.log(err, "error", "ImageInfoPage.callOperatorFilter().HttpClient.post() : url : " + url + ", data : " + JSON.stringify(data))
            if(callbackError != null)
                callbackError(me, uri);
        });
    }

    autoRetrieveItems(me, file, uri, orientation, callback, callbackError)
    {
        console.log("autoRetrieveItems Retrieving...")
        me.callFilter(me, uri, orientation, function(items)
        {
            let packages = [];
            //let tempid = me.getMaxTempId();
            items.forEach(async function(item, idx){
                let package_name = "GB_Main";
                let gb = item["GB_Main"];
                if(item["GB_Main"] != "not found")
                {
                    let itempackage = { itemCategory: 'paket', itemCategoryText: 'Paket', gbmain: gb, price: "" + item["Price"], upload_file_id: file.id}
                    await FilePackageItem.create(itempackage);
                    //packages.push(itempackage);
                }
            })
            if(callback != null)
                callback(items);

        }, function(me, uri, orientation){
            if(me.state.effortCounter[file.id] < 5)
            {
                me.state.effortCounter[file.id]++;
                console.log("Try again... : " + me.state.effortCounter[file.id])
                me.autoRetrieveItems(me, file, uri, orientation, callback, callbackError);
            }
            else
            {
               
                me.state.effortCounter[file.id] = 0;
                if(callbackError != null)
                    callbackError({ error: "Call GB filter failed" });
            }
        })
    }

    autoRetrieveOperator(me, file, uri, callback, callbackError)
    {
        console.log("autoretrieve operator")
        var me = this;
        me.callOperatorFilter(me, uri, async function(operators){

            if(operators != null && operators.length > 0)
            {
                let resop = operators[0];
    
                if(resop != null)
                {
                    let opname = me.getOperatorName(resop);
                    await UploadedFile.update({ operator: resop, operatorText: opname }, {where:{ id: file.id }})

                    console.log("Autofill Result Operator")
                    console.log(opname)


                }

            }

            me.state.effortCounter[file.id] = 0;
            if(callback != null)
                callback();

        }, function(me, uri){
            if(me.state.effortCounter[file.id] < 5)
            {
                me.state.effortCounter[file.id]++;
                console.log("Try again autoretrieve operator... : " + me.state.effortCounter)
                me.autoRetrieveOperator(me, file, uri, callback, callbackError);
            }
            else
            {
                if(callbackError != null)
                    callbackError(err);
                me.state.effortCounter[file.id] = 0;
            }
        })
    }

    autofillNext(orientation, file, callback, callbackError)
    {
        var me = this;

        this.setState({
            showIndicator: true
        })
        me.uploadToGcs( orientation, file, function(uri){
        
            //Wait for 5 seconds, GCS needs to do some things before the file accessible
            console.log("wait 1 seconds before retrieving...")
            setTimeout(function(){

                me.state.effortCounter[file.id] = 0;
                me.autoRetrieveItems(me, file, uri, orientation, function(items){

                    console.log("autoRetrieveItems done for file: " + file.filename )
                    console.log(items);

                    me.state.effortCounter[file.id] = 0;
                    me.autoRetrieveOperator(me, file,  uri, function(){
                        
                        
                        if(callback != null)
                            callback();

                    }, function(err){

                        if(callbackError != null)
                            callbackError({ message: "autoRetrieveOperator for " + file.filename + " failed ", error: err});
                    })

                }, function(err){
                    if(callbackError != null)
                        callbackError({ message: "autoRetrieveItems for " + file.filename + " failed ", error: err});
                });
            }, 1000);
        }, function(err){

            if(callbackError != null)
                callbackError({ message: "Upload file " + file.filename + " failed ", error: err});
        });
    }


    afterSelectOrientation(orientation)
    {
        var me =this;
        Actions.pop();
        this.state.autofillBeforeDone = 0;
        this.state.autofillBeforeAfter = 0;
        this.autofillNext(orientation, this.state.fileBefore, function(){
            
            me.state.autofillBeforeDone = 1;
            me.doneAutoFill(me);
            
        }, function(){
            
            me.state.autofillBeforeDone = 2;
            me.doneAutoFill(me);
            
        });

        
        this.autofillNext(orientation, this.state.fileAfter, function(){
            
            me.state.autofillBeforeDone = 1;
            me.doneAutoFill(me);
            
        }, function(){
            
            me.state.autofillBeforeDone = 2;
            me.doneAutoFill(me);
            
        });
        
    }

    doneAutoFill(me)
    {
        me.setState({
            showIndicator: false,
            showProgress: false
        })

        me.loadBeforeAfterFiles(function(){
            me.loadLocalPackageItemsBefore();
            me.loadLocalPackageItemsAfter();
        })

        
        if(me.state.autofilAfterDone == 1  && me.state.autofillBeforeDone == 1)
        {
            me.setState({
                showIndicator: false,
                showProgress: false
            })

            me.loadBeforeAfterFiles(function(){
                me.loadLocalPackageItemsBefore();
                me.loadLocalPackageItemsAfter();
            })
        }

        if(me.state.autofilAfterDone  != 0 && me.state.autofillBeforeDone != 0)
        {
            if(me.state.autofilAfterDone == 2  || me.state.autofillBeforeDone == 2)
            {
                me.setState({
                    showIndicator: false,
                    showProgress: false
                })

                
    
                alert("Isi otomatis gagal, mohon isi secara manual")
            }
            me.loadBeforeAfterFiles(function(){
                me.loadLocalPackageItemsBefore();
                me.loadLocalPackageItemsAfter();
            })

        }

    }

    autofill()
    {
        Actions.selectOrientationPage({ onSelectOrientation: this.afterSelectOrientation.bind(this)  })
    }

    renderFileInfo(file)
    {
        return(
            <>
                <View style={{width: '100%', height: 100, backgroundColor: '#fff', padding: 20}}>
                    <View style={Style.horizontalLayout}>
                        <View style={{width: '95%', flex:1, flexDirection: 'row'}}>
                            <View style={{marginTop: -10}}>
                                <Image source={{ uri: 'file://' + file.filename }} style={Style.contentImage} resizeMode='contain' ></Image>
                            </View>
                            <View style={{width: 10}}></View>
                            <View style={{width: '70%'}}>
                                <Text style={Style.content}>{this.getShortFilename(file.filename)}</Text>
                                <View style={{height: 5}}></View>
                                <Text style={Style.content}>{file.picture_taken_date}</Text>
                            </View>
                        </View>

                        <TouchableOpacity onPress={() => this.viewImage(file)}>
                            <Text style={Style.contentRedBold}>
                                Lihat
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
                <View style={{height: 15}}></View>
                <View style={{width: '100%', height: 'auto', backgroundColor: '#fff', padding: 20}}>
                    
                    <View style={Style.horizontalLayout}>
                        <View style={{width: '95%'}}>
                            <Text style={Style.contentTitle}>Informasi Umum Poster</Text>
                            <LabelInput text="" subtext="Informasi umum keseluruhan poster."></LabelInput>

                        </View>
                        <View>
                            <TouchableOpacity onPress={this.addInfo.bind(this, file)}>
                                <Text style={Style.contentRedBold}>Edit</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                    
                    <View style={{height: 10}}></View>
                    <View style={Style.horizontalLayout}>
                    {
                        (file.operator != null) ?
                            <View>
                                <View style={Style.horizontalLayout}>
                                    <View style={{width: '50%', height:25}}>
                                        <Text style={Style.content}>Operator</Text> 
                                    </View>
                                    <View style={{width: '10%'}}>
                                        <Text style={Style.content}>:</Text> 
                                    </View>
                                    <Text style={Style.content}>{file.operatorText}</Text> 
                                </View>
                                <View style={Style.horizontalLayout}>
                                    <View style={{width: '50%', height: 25}}>
                                        <Text style={Style.content}>Jenis Poster</Text> 
                                    </View>
                                    <View style={{width: '10%'}}>
                                        <Text style={Style.content}>:</Text> 
                                    </View>
                                    <Text style={Style.content}>{file.posterTypeText}</Text> 
                                </View>
                                <View style={Style.horizontalLayout}>
                                    <View style={{width: '50%', height: 25}}>
                                        <Text style={Style.content}>Area Promosi</Text> 
                                    </View>
                                    <View style={{width: '10%'}}>
                                        <Text style={Style.content}>:</Text> 
                                    </View>
                                    <Text style={Style.content}>{file.areaPromotionText}</Text> 
                                </View>
                                <View style={Style.horizontalLayout}>
                                    <View style={{width: '50%', height: 25}}>
                                        <Text style={Style.content}>Tema</Text> 
                                    </View>
                                    <View style={{width: '10%'}}>
                                        <Text style={Style.content}>:</Text> 
                                    </View>
                                    <Text style={Style.content}>{file.posterTheme}</Text> 
                                </View>
                            </View>
                            :
                            <Text style={Style.contentLight}>Belum ada informasi konten</Text>
                    }
                        
                    </View>
                </View>
                <View style={{height: 15}}></View>
                <View style={{width: '100%', height: 'auto', backgroundColor: '#fff', padding: 20}}>
                    
                    <View style={Style.horizontalLayout}>
                        <View style={{width: '85%'}}>
                            <Text style={Style.contentTitle}>Detail Produk</Text>
                            <LabelInput text="" subtext="Daftar item-item paket yang ada di poster. Tekan tambah untuk menambahkan item. Tekan item untuk merubah atau menghapus."></LabelInput>
                        </View>
                        <View>
                            <TouchableOpacity onPress={this.addPackageItem.bind(this, file)}>
                                <Text style={Style.contentRedBold}>Tambah</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                    
                    <View style={{height: 10}}></View>
                    <View style={Style.horizontalLayout}>
                        {
                            (file.beforeAfterType == "before") ? 
                                (this.state.packageItemsBefore.length == 0) ? <Text style={Style.contentLight}>Belum ada detail produk</Text>
                                :
                                this.displayPackageItems(this.state.packageItemsBefore, file)
                            :
                                (this.state.packageItemsAfter.length == 0) ? <Text style={Style.contentLight}>Belum ada detail produk</Text>
                                :
                                this.displayPackageItems(this.state.packageItemsAfter, file)
                        }
                        
                    </View>
                </View>
            </>
        )
    }

    addFileAfter()
    {

        Actions.takePictureBeforeAfterPage({ store_id: this.state.fileBefore.store_id, store_name: this.state.fileBefore.store_name, imageCategory: "poster-before-after", beforeAfterType: "after", beforeAfterID: this.state.fileBefore.beforeAfterID })
    }

    getFilePackageItemIds(filaPakcageItems)
    {
        let ids = [];
        filaPakcageItems.map(file => {
            ids.push(file.id);
        })

        return ids;
    }

    async delete()
    {
        var me = this;
        Alert.alert("Konfirmasi hapus", "Data akan dihapus, apakah anda yakin?", [
            {
                text:  "Ya",
                onPress: async ()=>{

                    if(me.state.fileBefore != null)
                    {
                        let filePackageItems = await FilePackageItem.findAll({ where: { upload_file_id: me.state.fileBefore.id }  });
                        let ids = this.getFilePackageItemIds(filePackageItems);
    
                        await FilePackageSubItem.destroy({ where: { packageItemId: ids } });
                        await FilePackageItem.destroy({ where: { upload_file_id: me.state.fileBefore.id }  })
                        await UploadedFile.destroy({ where: { id: me.state.fileBefore.id } })
                        try { await RNFS.unlink(me.state.fileBefore.filename) } catch (e) {}
                        try { await RNFS.unlink(me.state.fileBefore.compressed_filename) } catch (e) {}
                    }

                    if(me.state.fileAfter != null)
                    {
                        let filePackageItems = await FilePackageItem.findAll({ where: { upload_file_id: me.state.fileAfter.id }  });
                        let ids = this.getFilePackageItemIds(filePackageItems);
    
                        await FilePackageSubItem.destroy({ where: { packageItemId: ids } });
                        await FilePackageItem.destroy({ where: { upload_file_id: me.state.fileAfter.id }  })
                        await UploadedFile.destroy({ where: { id: me.state.fileAfter.id } })
                        try { await RNFS.unlink(me.state.fileAfter.filename) } catch (e) {}
                        try { await RNFS.unlink(me.state.fileAfter.compressed_filename) } catch (e) {}
                    }

                    alert("Data telah dihapus")
                    Actions.reset("uploadPage", { imageCategory: "poster-before-after", imageStatus: "draft" })

                }
            },
            {
                text: "Tidak"
            }
        ])
    }

    render()
    {
        var me = this;
        let opacity = 1;
        if(this.state.showIndicator)
            opacity = 0.3;
        


            return(
                <Container>
                <Header style={{backgroundColor: '#FFF'}}>
                    <View  style={Style.headerHorizontalLayout}>
                            <TouchableOpacity onPress={()=> me.back()}>
                                <Image style={Style.headerImage} resizeMode='contain' source={require('./images/back-dark.png')}></Image>
                            </TouchableOpacity>
                            <View style={{width: 10}}></View>
                            <Title style={Style.headerTitle}>Lengkapi informasi gambar</Title>
                    </View>
                </Header>
                <Content style={{backgroundColor: '#eee', height: 'auto', opacity: opacity}} >
                    {
                        this.getDialog()
                    }
                    <View style={{height: 5}}>

                    </View>

                    <View style={{width: '100%', height: 100, backgroundColor: '#fff', padding: 20}}>
                        
                            <Text style={Style.contentTitle}>Outlet</Text>
                            <View style={{height: 10}}></View>
                            {
                                (this.state.fileBefore != null) ?
                                <Text style={Style.content}>{this.state.fileBefore.store_name}</Text>
                                :
                                null
                            }
   


                    {
                        (this.state.showIndicator) ? <ActivityIndicator style={{position: 'absolute', left: '40%', top: '40%'}} size="large" color="#ff0000"></ActivityIndicator> : null
                    }

                        
                    </View>
                    <View style={{height: 15}}></View>

                    <View style={{height: 40, backgroundColor: '#eee', marginLeft: 10}}>
                        <Text style={Style.contentTitleRedBold}>Foto Sebelum</Text>
                    </View>
                    {
                        (this.state.fileBefore != null) ?
                            this.renderFileInfo(this.state.fileBefore)
                            :
                            null
                        
                    }

                    <View style={{height: 15}}></View>

                    <View style={{height: 40, backgroundColor: '#eee', marginLeft: 10}}>
                        <Text style={Style.contentTitleBold}>Foto Sesudah</Text>
                    </View>
                    {
                        (this.state.fileAfter != null) ?
                            this.renderFileInfo(this.state.fileAfter)
                            :
                            <View style={{backgroundColor: '#fff', padding: 10, width: '100%', height: 'auto'}}>
                                 <Button style={Style.buttonRed} onPress={()=>this.addFileAfter()}>
                                    <View style={{ alignItems: 'center', width: '100%' }}>
                                        <Text style={{color: '#fff'}}>Ambil foto sesudah</Text>
                                    </View>
                                </Button>
                            </View>
                        
                    }
                    
                    <View style={{height: 15}}></View>
                    
                    
                    <View style={{height: 45}}></View>
                    
                </Content>

                    {
                        //this.getFooter(1)
                    }
                <Footer style={{height: 260, borderColor:'#eee', borderWidth: 2}}>
                    {(this.state.showProgress) ? <ActivityIndicator size="large" color="#FF0000"></ActivityIndicator>
                        :
                        <View style={{backgroundColor: '#fff', padding: '5%'}}>
                            {
                            (this.state.fileBefore != null && this.state.fileBefore.imageStatus != "uploaded") ?
                            <>
                                
                                
                                    <Button style={Style.buttonDark} onPress={()=>this.autofill()}>
                                        <View style={{ alignItems: 'center', width: '100%' }}>
                                            <Text style={{color: '#fff'}}>Isi otomatis</Text>
                                        </View>
                                    </Button>
                                    <Button style={Style.buttonRed} onPress={()=>this.setStatus("processed")}>
                                        <View style={{ alignItems: 'center', width: '100%' }}>
                                            <Text style={{color: '#fff'}}>Selesai dan unggah</Text>
                                        </View>
                                    </Button>
                                    <Button style={Style.button} onPress={()=>this.setStatus("draft")}>
                                        <View style={{ alignItems: 'center', width: '100%' }}>
                                            <Text style={{color: '#666'}}>Simpan sebagai draft</Text>
                                        </View>
                                    </Button>
                                    <Button style={Style.button} onPress={()=>this.delete()}>
                                        <View style={{ alignItems: 'center', width: '100%' }}>
                                            <Text style={{color: '#666'}}>Hapus</Text>
                                        </View>
                                    </Button>
                                
                            </>
                            :
                            null
                            }

                        </View>
                    }
                </Footer>
                </Container>
            );

    }

}