import React, { Component } from 'react';
import { Dimensions } from 'react-native';
import { Container, Content, Text, Card, Header, Footer, Body, Title, 
  List,
  ListItem,
  Left,
  Item, CardItem, Icon, Button, CheckBox, Right, Radio, ActionSheet } from 'native-base';


import { Image, View, ScrollView, TouchableOpacity, Alert, ActivityIndicator, ImageBackground } from 'react-native';
import { Actions } from 'react-native-router-flux';
import UploadedFile from './model/UploadedFile';
import FilePackageItem from './model/FilePackageItem';
import FilePackageSubItem from './model/FilePackageSubItem';
import DropDownPicker from 'react-native-dropdown-picker';

import Config from './config.json';
import HttpClient from './util/HttpClient';
GlobalSession = require( './GlobalSession');

import * as SQLite from "expo-sqlite";
import Sequelize from "rn-sequelize";
const Op = Sequelize.Op;
const Model = Sequelize.Model;

import Logging from './util/Logging';

export default class ImageInfoPage extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            selectedOperator: { label: '', value: 0},
            selectedSubOperator:  { label: '', value: 0},
            selectedPackage:  { label: '', value: 0},
            selectedStore:  { label: '', value: 0}
        }
        this.state.file = this.props.file;
        this.state.operators = [ { label: '', value: 0}];
        this.state.suboperators = [ { label: '', value: 0}];
        this.state.packages = [ { label: '', value: 0}];
        this.state.stores = [ { label: '', value: 0}];
        this.state.packageItems = [];
        this.state.counter = 0;
        this.state.showIndicator = false;
        this.state.effortCounter = 0;
        this.state.localOrRemote =  "local";

        this.state.isPoster = Boolean(this.props.file.isPoster);

        console.log("FILE");
        console.log(this.state.file);

    }

    loadFileInfoLocal(callback)
    {
        var me = this;
        UploadedFile.findByPk(this.state.file.id).then(function (file){

            me.setState({ ...me.state, file : file, isPoster: Boolean(file.isPoster)});
            if(callback != null)
                callback();
        }).catch((e)=>{
            Logging.log(e, "error", "ImageInfoPage.loadFileInfo().UploadedFile.findByPk");
        });
    }

    loadRemoteFile(file)
    {
        let me = this;
        let promise = new Promise((resolve, reject) => {
            let url = Config.API_HOST + "/uploadfile/get/" + file.id;
            HttpClient.get(url, function(response){
                resolve(response.payload)
            }, function (error){
                reject(error)
            })
        })

        return promise;
    }

    async loadFileInfoRemote(callback)
    {
        var me = this;
        this.loadRemoteFile(this.state.file).then((file) => {
            //alert(JSON.stringify(file));
            me.setState({ ...me.state, file : file, isPoster: Boolean(file.isPoster)});
            if(callback != null)
                callback();
        }).catch((err) => {
            Logging.log(err, "error", "ImageInfoPage.loadFileInfoRemote().loadRemoteFile()")
            console.log(err)
            alert("Cannot load file " + file.id)
        })

    }

    loadFileInfo(callback)
    {
        if(this.state.file.uploaded_filename == null || this.state.file.uploaded_filename.length == 0)
            this.loadFileInfoLocal(callback);
        else
            this.loadFileInfoRemote(callback);

    }

    getOperators(){
        let promise = new Promise((resolve, reject)=>{
            let url = Config.API_HOST + "/operator";
            
            HttpClient.get(url, function(res){
                
                resolve(res.payload);
            }, function(e){
                reject(e);
            });
        });

        return promise;
    }

    getSubOperators(operator_id){
        let promise = new Promise((resolve, reject)=>{
            let url = Config.API_HOST + "/suboperator/" + operator_id;
            HttpClient.get(url, function(res){
                resolve(res.payload);
            });
        });
        return promise;
    }

    getStores(){
        let promise = new Promise((resolve, reject)=>{
            let url = Config.API_HOST + "/store";
            HttpClient.get(url, function(res){
                resolve(res.payload);
            });
        });
        return promise;
    }

    onOperatorChanged(item){
        var me  =  this;
        me.state.file.operator = item.value;
        me.setState({
            ...me.state,
            selectedOperator: item,
        })
    }

    onSubOperatorChanged(item){
        this.setState({
            ...this.state,
            selectedSubOperator: item
        })
    }

    onStoreChanged(item){
        this.setState({
            ...this.state,
            selectedStore: item
        })
    }

    onAfterSelectStore(selectedStore)
    {
        this.state.file.store_name = selectedStore.store_name;
        this.state.file.store_id = selectedStore.storeid;
        this.setState({
            ...this.state,
            selectedStore: selectedStore,
        });
        Actions.pop();
    }

    selectStore()
    {
        Actions.selectStorePage({ onAfterSelectStore: this.onAfterSelectStore.bind(this) })
    }

    loadLookupData(me, callback)
    {

        console.log("loadLookupData")
        me.getOperators().then(function(operators){

            console.log("getOperators")
            me.getStores().then(function(stores){

                console.log("getStores")

                let operatorItems = [];
                let storeItems = [];
                let initOp = { label: operators[0].operator_name, value: operators[0].operator_value };
                let initStore = { label: stores[0].store_name, value: stores[0].id  };
                
                operators.forEach(function(item, index){
                    let it = { value: item.operator_value, label: item.operator_name };
                    operatorItems.push( it );
                    if( me.state.file.operator != null && me.state.file.operator.toLowerCase().trim() == item.operator_value.toLowerCase().trim())
                        initOp = it;
                });


                stores.forEach(function(item, index){
                    let it = { value: item.id, label: item.store_name };
                    storeItems.push(it);

                    if( me.state.file.store_name != null && me.state.file.store_name.toLowerCase().trim() == item.store_name.toLowerCase().trim())
                        initStore = it;
                });


                me.setState({
                    ...me.state,
                    operators: operatorItems,
                    stores: storeItems,
                    selectedOperator: initOp,
                    selectedStore: initStore
                })

                me.onOperatorChanged(initOp);
                if(callback != null)
                    callback();

            }).catch((e)=>{
                Logging.log(e, "error", "ImageInfoPage.loadLookupData().getStores()")
            });
        }).catch((e)=>{
            Logging.log(e, "error", "ImageInfoPage.loadLookupData().getOperators()")
        });
    }

    loadAll(callback)
    {
        var me = this;
        me.setState({
            showIndicator: true
        });
        me.loadFileInfo(function(){
            me.loadLookupData(me, function(){
                me.initPackageItems(me);

                me.setState({
                    showIndicator: false
                });
                if(callback != null)
                    callback();
            });
        });
    }

    componentDidMount() {
        this.loadAll();
    }

    initPackageItemsFromLocal(me, callback)
    {
        
        console.log("initPackageItemsFromLocal")
        FilePackageItem.findAll({
            where: {
                upload_file_id: { [Op.eq] : this.state.file.id }
            }
        }).then(function (items){
            items.forEach( async (item) => { 
                item.price = '' + item.price; 
                item.transferPrice = '' + item.transferPrice;

                item.filePackageSubItems = [];
                let packageSubItems = await FilePackageSubItem.findAll({ where : { packageItemId: item.id }});
                item.filePackageSubItems = packageSubItems;

            })

            if(items == null)
                items = []
            me.state.packageItems = items;
            me.setState({
                
                packageItems: items
            })

            console.log(me.state.packageItems)

            if(callback != null)
                callback()
            
            return true;

        }).catch(function (err){
            console.log("Error");
            console.error(err);
            Logging.log(err, "error", "ImageInfoPage.initPackageItems().FilePackageItem.findAll()")
        })
    }

    initPackageItemsFromRemote(me, callback)
    {
        let tempid = me.getMaxTempId();
        let url = Config.API_HOST + "/filepackageitem/file/" + me.state.file.id;
        HttpClient.get(url, function(response){
            let items = response.payload;
            console.log("items from remote")
            console.log(items)
            items.forEach((item) => { 
                item.price = '' + item.price; 
                item.transferPrice = '' + item.transferPrice;

                let url = Config.API_HOST + "/filepackagesubitem/packageitem/" + item.id;
                HttpClient.get(url, (response) => {
                    let subItems = response.payload;
                    item.filePackageSubItems = subItems;
                })

            })


            if(items == null)
                items = []
            me.setState({
                ...me.state,
                packageItems: items
            })


            if(callback != null)
                callback()


        }, function(err){
            console.log("Error");
            console.error(err);
            Logging.log(err, "error", "ImageInfoPage.initPackageItemsFromRemote().HttpClient.get(" + url + " ) ")

        })
    }

    initPackageItems(me, callback){
        console.log("initPackageItems")

        if(me.state.file.uploaded_filename == null || me.state.file.uploaded_filename.length == 0)
            me.initPackageItemsFromLocal(me, callback);
        else
        {
            me.initPackageItemsFromRemote(me, callback);
        }
            
    }

    saveLocalUpdatePackageItem(items, idx, callback)
    {
        var me = this;
        if(idx < items.length)
        {

            FilePackageItem.update({ package_name : items[idx].package_name, 
                    price : items[idx].price, transferPrice: items[idx].transferPrice, itemCategory: items[idx].itemCategory, 
                    itemCategoryText: items[idx].itemCategoryText,
                    category: items[idx].category, campaignTheme: items[idx].campaignTheme
                },
                {where: { id: items[idx].id }}).then(function (res){
                
                me.saveLocalUpdatePackageItem(items, idx + 1, callback);
            });
        }
        else
            if(callback != null)
                callback();
    }

    saveLocalDeletePackageItem(items, idx, callback)
    {
        var me = this;
        if(idx < items.length)
        {
            FilePackageItem.destroy({where: { id: items[idx].id }}).then(function (res){
                me.saveLocalDeletePackageItem(items, idx + 1, callback);
            }).catch((e)=>{
                Logging.log(e, "error", "ImageInfoPage.saveLocalDeletePackageItem().FilePackageItem.destroy()")
            })
        }
        else
            if(callback != null)
                callback();
    }

    saveFilePackageSubItemsFromPackageItemsLocal(previousPackageItems)
    {
        var me = this;
        console.log("saveFilePackageSubItemsFromPackageItemsLocal");
        console.log(this.state.packageItems);
        previousPackageItems.forEach(async function (item){
            
            for(var i = 0; i < item.filePackageSubItems.length; i++)
            {
                let packageItem = me.getPackageItemByTempId(item.tempid)
                item.filePackageSubItems[i].packageItemId = packageItem.id;
            }
                

                //alert(JSON.stringify(item.filePackageSubItems));
            //console.log("destroy filePackageSubItems")
            //await FilePackageSubItem.destroy({ where: { packageItemId : item.id }});
            me.saveFilePackageSubItemsLocal(item.filePackageSubItems);
            me.deleteFilePackageSubItemsLocal(item.removedPackageSubItems);
        });
    }

    getPackageItemByTempId(tempid)
    {
        let selectedItem = null;
        this.state.packageItems.forEach( function (item){
            if(item.tempid == tempid)
                selectedItem = item;
        });

        return selectedItem;
    }

    async saveFilePackageSubItemsLocal(filePackageSubItems)
    {
        console.log("saveFilePackageSubItemsLocal.filePackageSubItems");
        console.log(filePackageSubItems);

        filePackageSubItems.map(async (item)=>{

            if(item.id == null)
            {
                delete item.id;
                console.log("add filePackageSubItem")
                console.log(item)
                await FilePackageSubItem.create(item).then((response) => { console.log("Saved new filePackageSubItems") }).catch((err) => console.log(err))
            }
            else
            {
                let id = item.id;
                delete item.id;
                console.log("update filePackageSubItem")
                console.log(item)
                let itm = JSON.stringify(item);
                itm = JSON.parse(itm);
                await FilePackageSubItem.update(itm, { where: { id: id } }).then((response) => { console.log(response); console.log("Saved update filePackageSubItems") })
            }
                
        })
    }

    async deleteFilePackageSubItemsLocal(filePackageSubItems)
    {
        if(filePackageSubItems != null)
        {
            filePackageSubItems.map((item)=>{

                if(item.id != null)
                {
                    console.log("delete filePackageSubItem")
                    console.log(item)
                    FilePackageSubItem.destroy({ where: { id: item.id } }).then((response) => { console.log("Delete filePackageSubItems") }).catch((err) => console.log(err))
                }
            })
        }

    }

    saveLocalUploadedFileInfo(callback)
    {
        var me = this;
        this.state.file.operator = this.state.selectedOperator.label;
        this.state.file.suboperator = this.state.selectedSubOperator.label;
        this.state.file.store_name = this.state.selectedStore.store_name;
        this.state.file.store_id = this.state.selectedStore.storeid;

        let createdItems = [];
        let updatedItems = [];

        this.state.packageItems.forEach(function (item){
            item.upload_file_id = me.state.file.id;
            if(item.id == null)
            {
                delete item.id;
                createdItems.push(item);
            }
            else
                updatedItems.push(item);
        });

        UploadedFile.update({ store_id : this.state.file.store_id,  store_name : this.state.file.store_name, operator: this.state.file.operator,
        suboperator: this.state.file.suboperator, isPoster: this.state.file.isPoster, posterType: this.state.file.posterType, areaPromotion: this.state.file.areaPromotion }, {
            where: { id : this.state.file.id}
        }).then(function (file){
            
           FilePackageItem.bulkCreate(createdItems).then(function (res){
               console.log("save created!")

                me.saveLocalUpdatePackageItem( updatedItems, 0, function(){
                    console.log("save updated items")
                    

                    let previousPackageItems = me.state.packageItems;
                    me.initPackageItems(me, ()=>{
     
                        console.log("Sadfa");
                        console.log(me.state.packageItems)
                        me.saveFilePackageSubItemsFromPackageItemsLocal(previousPackageItems);
                    })

                    

                    if(callback  != null)
                        callback();

                    return true;
                });

                return true;
              
           }).catch(function (err){
               console.log(err);
               Logging.log(err, "error", "ImageInfoPage.saveLocalUploadedFileInfo().FilePackageItem.bulkCreate()")
           })

           return true;
        }).catch(function (err){
            console.log(err);
            Logging.log(err, "error", "ImageInfoPage.saveLocalUploadedFileInfo().UploadedFile.update()")
        })
    }

    stopActivity()
    {
        this.setState({
            ...this.state,
            showIndicator: false
        })
    }

    validate()
    {
        let result = { valid: true };
        let storename  = this.state.file.store_name + "";
        if(this.state.file.store_name.trim().length == 0 )
            return { valid: false, message: "Masukkan informasi nama toko" }
            
        result = this.validatePackageItems();
        return result;
    }

    validatePackageItems()
    {
        if(this.state.packageItems.length == 0)
            return { valid: false, message: "Masukkan item paket"}

        return { valid: true };
    }

    getCurrentDate(){
        var date = new Date();
        var dateString = date.getFullYear() + "-" + (date.getMonth()  + 1) + "-" + date.getDate();
        dateString += " " + date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds();
        return dateString;
    }

    uploadImageInfo(me, uploaded_filename, item, callback, callbackError){

        var url = Config.API_HOST + "/uploadfile/create";
        me.state.file.upload_date = me.getCurrentDate();
        me.state.file.uploaded_by_email = GlobalSession.currentUser.email;
        me.state.file.uploaded_by_fullname = GlobalSession.currentUser.firstname + " " + GlobalSession.currentUser.lastname;
        me.state.file.uploaded_filename = uploaded_filename;

        var newFile = JSON.stringify(me.state.file);
        newFile = JSON.parse(newFile);
        newFile.id = null;
        console.log(newFile);


        HttpClient.post(url, newFile, function (res){
            if(res.success){
                console.log("upload package items")
                console.log(me.state.packageItems)
                me.uploadPackageItems(me, me.state.packageItems,0, res.payload.id, function(){
                    if(callback != null)
                        callback(res);
                }, function(res){
                    res.message = " uploadPackageItems : " + res.message;
                    if(callbackError != null)
                        callbackError(res);
                });

            }
            else
            {
                res.message = " uploadImageInfo : " + JSON.stringify(res);
                Logging.log(res, "error", "ImageInfoPage.uploadImageInfo().HttpClient.post()")
                if(callbackError != null)
                    callbackError(res);

                
            }
        });
    }


    uploadPackageItems(me, items, idx, parentid, callback, callbackError)
    {
        if(idx < items.length)
        {
            let itm = JSON.stringify(items[idx]);
            itm = JSON.parse(itm);
            itm.upload_file_id = parentid;
            itm.filePackageSubItems = items[idx].filePackageSubItems;
 
            me.uploadPackageItem(me, itm, function(res){
                me.uploadPackageItems(me, items, idx + 1, parentid, callback, callbackError);  
            }, function(res){
                if(callbackError != null)
                    callbackError(res);
            });
        }
        else
        {
            if(callback != null)
                callback();
        }
    }

    uploadPackageItem(me, item, callback, callbackError)
    {
        var url = Config.API_HOST + "/filepackageitem/create"; 
        console.log("uploading package item");
        console.log(item);
        
        var newItem = JSON.stringify(item);
        
        newItem = JSON.parse(newItem);
        delete newItem.id;

        if(newItem.price == "")
            newItem.price = 0;
        
        if(newItem.validity == "")
            newItem.validity = 0;
        
        if(newItem.transferPrice == "")
            newItem.transferPrice = 0;
        
        if(newItem.gbmain_duration_days == "")
            newItem.gbmain_duration_days = 0;

        //delete newItem.id;

        HttpClient.post(url, newItem, function (res){
            if(res.success)
            {
                //Delete previous packagesubitems
                me.deletePackageSubItemsByPackageIdRemote(item.id);

                //Save  filePackageSubItems to server
                me.uploadFilePackageSubItems(item.filePackageSubItems, res.payload.id);

                //Call callback function
                if(callback != null)
                    callback(res);
            }
            else
            {
                res.message = " uploadPackageItem : " + res.message;
                if(callbackError != null)
                    callbackError(res);
            }
        }, function(err){
            Logging.log(err, "error", "ImageInfoPage.uploadPackageItem().HttpClient.post():" + url)
        });
    }

    deletePackageSubItemsByPackageIdRemote(packageId, callback)
    {
        let url = Config.API_HOST + "/filepackagesubitem/delete-by-packageitem/" + packageId;
        HttpClient.get(url, (response) => {
            if(callback != null)
                callback(response);
        })
    }

    uploadFilePackageSubItems(filePackageSubItems, parentId)
    {
        if(filePackageSubItems != null)
        {


            //For each filepackageSubItems
            filePackageSubItems.map((item) => {

                //Change the sequelize object to ordinary object
                let newItem = JSON.parse( JSON.stringify(item));

                //Remove the id, or else the saving would fail 
                delete newItem.id;

                //Set the foreign key to filepackageitem
                newItem.packageItemId = parentId;

                //Call the REST API to save the new item
                var url = Config.API_HOST + "/filepackagesubitem/create";

                //Log
                console.log("Call " + url);
                console.log(newItem);

                //Post to REST API
                HttpClient.post(url, newItem, (response)=>{
                    console.log("uploadFilePackageSubItems.filePackageSubItems.map.HttpClient.post.Response : ");
                    console.log(response);
                }, (responseError) => {
                    console.log("uploadFilePackageSubItems.filePackageSubItems.map.HttpClient.post.ResponseError : ");
                    console.log(responseError);
                })

            })

        }

    }

    uploadToServer(callback, callbackError)
    {
        var me = this;
        var url = Config.API_HOST_UPLOAD + "/upload/gcs/" + Config.POSTER_UPLOAD_PATH;
        console.log(url);
        HttpClient.upload(url, this.state.file.filename, function(res){
            console.log("done upload image");
            console.log(res);

            if(res.success){
                console.log("upload image info to server")
                me.uploadImageInfo(me, res.payload, me.state.file, function (res){
                    
                    if(callback != null)
                        callback(res);
                }, function(res)
                {
                    res.message = " uploadImageInfo : " +  JSON.stringify(res);
                    Logging.log(res, "error", "ImageInfoPage.uploadToServer().me.uploadImageInfo()")
                    if(callbackError != null)
                        callbackError(res);
                    
                });
            }
            else {
                res.message = " upload : " +  res.message;
                if(callbackError != null)
                    callbackError(res);
            }
        }, function(err){
            Logging.log(err, "error", "ImageInfoPage.uploadToServer().HttpClient.upload()")
        });

    }

    updateUploadedFileLocally(me, callback, callbackError)
    {
        
        me.state.file.isuploaded = 1;

        let dt = new Date();
        dt = dt.getFullYear()  + "-"  + dt.getMonth() + "-" + dt.getDate() + "-" + dt.getHours() + "-" + dt.getMinutes() + "-" + dt.getSeconds();
        dt = dt.replace(/-/gi, "");

        dt = Number(dt);
 
        UploadedFile.update({ isuploaded : 1, uploaded_id: dt }, {
            where: {
                id: me.state.file.id
            }
        }).then(function(res){
            if(callback != null)
                callback(res);

        }).catch(function(err){
            Logging.log(err, "error", "ImageInfoPage.updateUploadedFileLocally().UploadedFile.update()")
            if(callbackError != null)
                callbackError(err);
            
        });
    }

    ok(isupload)
    {
        if(this.state.file.uploaded_filename == null || this.state.file.uploaded_filename.length == 0)
            this.saveNewLocal(isupload);
        else
            this.saveUpdateRemote();
    }

    //Delete remote package items
    deleteRemotePackageItems(callback, callbackError)
    {
        var url = Config.API_HOST + "/filepackageitem/delete-by-uploadid/" + this.state.file.id;
        HttpClient.get(url, function(response){
            if(callback != null)
                callback(response);
        }, function(err){
            if(callbackError != null)
            callbackError(err);
        })
    }


    //Save updated uploadedfile to remote
    saveUpdateRemote(callback, callbackError)
    {
        var me= this;
        var url = Config.API_HOST + "/uploadfile/update/" + me.state.file.id;
        me.state.file.updatedAt = me.getCurrentDate();

        var newFile = JSON.stringify(me.state.file);
        newFile = JSON.parse(newFile);
        delete newFile.createdAt;
        delete newFile.updatedAt;
        delete newFile.id;

        me.setState({
            showIndicator: true
        })

        console.log("saveUpdateRemote()")
        console.log(newFile);

        HttpClient.post(url, newFile, function (res){
            if(res.success){
                console.log("delete remote package items")

                me.deleteRemotePackageItems(function(response){

                    console.log("upload package items")
                    console.log(me.state.packageItems)

                    me.uploadPackageItems(me, me.state.packageItems,0, me.state.file.id, function(){
                        me.setState({
                            showIndicator: false
                        })
                        alert("Update foto berhasil");
                        if(callback != null)
                            callback(res);
                        
                        Actions.pop();
                        Actions.pop();
                        Actions.pop();
                        Actions.uploadHistoryPage();

                    }, function(res){
                        res.message = " uploadPackageItems : " + res.message;
                        me.setState({
                            showIndicator: false
                        })
                        Logging.log(res, "error", "ImageInfoPage.saveUpdateRemote().uploadPackageItems()")
                        if(callbackError != null)
                            callbackError(res);
                    });

                }, function(err){
                    err.message = " deleteRemotePackageItems : " + err.message;
                    Logging.log(err, "error", "ImageInfoPage.saveUpdateRemote().deleteRemotePackageItems()")
                    if(callbackError != null)
                        callbackError(err);
                })

            }
            else
            {
                res.message = " uploadImageInfo : " + JSON.stringify(res);
                Logging.log(res, "error", "ImageInfoPage.saveUpdateRemote().HttpClient.post()")
                alert("Gagal menyimpan informasi")
                console.log(res);
                if(callbackError != null)
                    callbackError(res);

                
            }
        });      
    }

    saveNewLocal(isupload)
    {
        var me = this;
        var validationResult = me.validate();

        if(validationResult.valid)
        {
            me.setState({
                showIndicator: true
            })

            this.saveLocalUploadedFileInfo(function(){
                me.loadAll(function(){

                    if(isupload == true)
                    {
                        me.setState({
                            showIndicator: true
                        })
                        me.uploadToServer(function(res){

                            me.updateUploadedFileLocally(me, function(res){
                                alert("Upload foto berhasil");
                                me.setState({
                                    showIndicator: false
                                }); 
                                Actions.pop();
                                Actions.pop();
                                Actions.pop();
                                
                                Actions.uploadPage({ imageCategory: "poster" });

                            }, function(err)
                            {
                                me.setState({
                                    showIndicator: false
                                }); 
                            })
                            
                        }, function(res)
                        {
                            alert("Upload foto gagal : " + res.message);
                            me.setState({
                                showIndicator: false
                            }); 
                        });
                        /*if(me.props.onUpload != null)
                            me.props.onUpload( {  packageItems:  me.state.packageItems, finish: me.stopActivity.bind(me) }, function(){
                                me.setState({
                                    showIndicator: false
                                });                    
                            });
                        */
                    }
                    else
                    {   
                        me.setState({
                            showIndicator: false
                        });  
                    }
                });
                //Actions.pop();

            });
        }
        else {
            alert(validationResult.message);
        }
    }

    back()
    {
        Actions.pop();
    }

    uploadToGcs(orientation, callback, callbackError)
    {
        var url = Config.API_HOST_UPLOAD + "/upload/gcs/telkomsel-retail-intelligence/retail-intelligence-bucket/temporary";
        console.log(url);
        HttpClient.upload(url, this.state.file.filename, function(res){
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
        var url = Config.API_HOST_FILTER;
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
        var url = Config.API_HOST_OPERATOR_FILTER;
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

    autoRetrieveItems(me, uri, orientation, callback, callbackError)
    {
        console.log("Retrieving...")
        me.callFilter(me, uri, orientation, function(items)
        {
            let packages = [];
            let tempid = me.getMaxTempId();
            items.forEach(function(item, idx){
                let package_name = "GB_Main";
                let gb = item["GB_Main"];
                if(item["GB_Main"] != "not found")
                {
                    let itempackage = { package_name: package_name, gbmain: gb, price: "" + item["Price"], upload_file_id: me.state.file.id, 
                                        validity: '', transferPrice: '', category: '', campaignTheme: '',
                                        tempid: tempid  }
                    tempid++;
                    packages.push(itempackage);
                }
            })

            me.setState({
                ...me.state,
                packageItems: packages
            })
            me.state.effortCounter = 0;

            if(callback != null)
                callback();

        }, function(me, uri, orientation){
            if(me.state.effortCounter < 5)
            {
                me.state.effortCounter++;
                console.log("Try again... : " + me.state.effortCounter)
                me.autoRetrieveItems(me, uri, orientation, callback, callbackError);
            }
            else
            {
               
                me.state.effortCounter = 0;
                if(callbackError != null)
                    callbackError({ error: "Call GB filter failed" });
            }
        })
    }

    autoRetrieveOperator(me, uri, callback, callbackError)
    {
        console.log("autoretrieve operator")
        var me = this;
        me.callOperatorFilter(me, uri, function(operators){

            console.log("operators")
            console.log(operators)
            if(operators != null && operators.length > 0)
            {
                let resop = operators[0];
                let selResop = null;
                me.state.operators.forEach(function(operator, idx ){
                    if(operator.value.toLowerCase().trim() == resop.toLowerCase().trim())
                    {
                        selResop = operator;
                        
                    }
                });

                if(selResop != null)
                {
                    me.setState({
                        ...me.state,
                        selectedOperator: selResop
                    })

                }

            }

            me.state.effortCounter = 0;
            if(callback != null)
                callback();

        }, function(me, uri){
            if(me.state.effortCounter < 5)
            {
                me.state.effortCounter++;
                console.log("Try again autoretrieve operator... : " + me.state.effortCounter)
                me.autoRetrieveOperator(me, uri, callback, callbackError);
            }
            else
            {
                if(callbackError != null)
                    callbackError(err);
                me.state.effortCounter = 0;
            }
        })
    }

    autofillNext(orientation)
    {
        Actions.pop();

        var me = this;

        this.setState({
            showIndicator: true
        })
        me.uploadToGcs( orientation, function(uri){
            
            //Wait for 5 seconds, GCS needs to do some things before the file accessible
            console.log("wait 1 seconds before retrieving...")
            setTimeout(function(){
                me.autoRetrieveItems(me, uri, orientation, function(){
                    me.autoRetrieveOperator(me, uri, function(){
                        me.setState({
                            showIndicator: false
                        })
                    }, function(err){
                        me.setState({
                            showIndicator: false
                        })
                        //let sError = JSON.stringify(err);
                        alert("Extrak operator gagal. Mohon isi manual.");
                    })

                    /*me.setState({
                        showIndicator: false
                    })*/

                }, function(err){
                    me.setState({
                        showIndicator: false
                    })
                    //let sError = JSON.stringify(err);
                    alert("Ekstrak daftar paket dari gambar gagal. Mohon isi manual.");
                });
            }, 1000);
        }, function(err){
            me.setState({
                showIndicator: false
            })
            let sError = JSON.stringify(err);
            alert("Upload error "  + sError);
        });
    }


    autofill()
    {

        Actions.selectOrientationPage({ onSelectOrientation: this.autofillNext.bind(this)  })

    }

    removeLocalPackageItems(selectedItem)
    {
        let me = this;
        FilePackageItem.destroy({ where: { id: selectedItem.id  }  }).then(function(res){
            me.initPackageItems(me);
            return null;
        }).catch((err)=>{
            Logging.log(err, "error", "ImageInfoPage.removePackageItem().FilePackageItem.destroy()")
        })
    }

    removePackageItem(item)
    {
        var me = this;
        var selectedIdx = -1;
        this.state.packageItems.forEach(function(it, idx){
            if( (item.id != null && item.id == it.id) || ( item.tempid == it.tempid )){
                selectedIdx = idx;
            }
        })

        var packageItems = this.state.packageItems;

        if(selectedIdx > -1)
        {
            var selectedItem = this.state.packageItems[selectedIdx];
            if(selectedItem.id != null)
            {
                if(me.state.file.uploaded_filename == null)
                    me.removeLocalPackageItems(selectedItem);
                else {
                    me.state.packageItems.splice(selectedIdx, 1);
                    me.setState({
                        ...me.state,
                        packageItems: me.state.packageItems
                    })
                }
            }
            else
            {
                me.state.packageItems.splice(selectedIdx, 1);
                me.setState({
                    ...me.state,
                    packageItems: me.state.packageItems
                })
            }
        }
    }


    getMaxTempId()
    {
        let max = 0;
        this.state.packageItems.forEach(function(it, idx){
            if(max < it.tempid)
                max = it.tempid;
        });

        return max + 1;
    }

    editPackageItem(item)
    {
        Actions.editPackageItemPage({ mode: "edit", item: item, onSave: this.onSavePackageItem.bind(this), operator: this.state.selectedOperator });
    }

    addPackageItem()
    {
        if(this.state.packageItems == null)
            this.state.packageItems = [];

        //let max =  this.getMaxTempId();
        let max = Math.random().toString(36).substring(12);

        let item = { id:null, package_name: '', price: '', transferPrice: '', validity: '', gbmain: '', tempid: max, filePackageSubItems: [] };
        Actions.editPackageItemPage({ mode: "add", item: item, onSave: this.onSavePackageItem.bind(this), operator: this.state.selectedOperator });
    }

    onSavePackageItem(item)
    {
        console.log("onSavePackageItem");
        console.log(item);
        let exists = false;
        for(let i =0; i < this.state.packageItems.length; i++)
        {
            if(this.state.packageItems[i].tempid == item.tempid)
            {
                this.state.packageItems[i] = item;
                exists = true;
            }
        }

        
        if(exists == false)
        {
            this.state.packageItems.push(item);

        }
        

        this.setState({ 
            ...this.state,
            packageItems: this.state.packageItems   
        });

        console.log("onSavePackageItem.packageItems");
        console.log(this.state.packageItems);
    }

    onPosterTypeChange(value)
    {
        this.state.file.posterType = value;
        this.setState({
            ...this.state,
            file: this.state.file
        })
    }

    onPromotionAreaChange(value)
    {
        this.state.file.areaPromotion = value;
        this.setState({
            ...this.state,
            file: this.state.file
        })
    }

    onIsPosterChange()
    {
        if(this.state.file.isPoster == 1)
            this.state.file.isPoster = 0;
        else
            this.state.file.isPoster = 1;

        this.setState({
            ...this.state,
            file: this.state.file,
            isPoster: Boolean(this.state.file.isPoster)
        })
    }

    previewImage()
    {
        let filename = "file://" + this.state.file.filename;
        if(this.state.file.uploaded_filename == null)
            Actions.previewImagePage({ filename: filename });
        else
        {
            filename = this.state.file.uploaded_filename.replace("gs://", "https://storage.googleapis.com/");
            Actions.previewImagePage({ filename: filename });
        }
        
    }

    render() 
    {

        let w = '15%'
        if(this.state.file.uploaded_filename != null)
            w = '30%';

        return(
            <Container>
            <Header style={{backgroundColor: '#AA2025'}}>
              <Body>
                <View  style={{flex: 1, flexDirection: 'row'}}>
                <TouchableOpacity onPress={()=> this.back()} style={{marginTop: '0%', padding: '4%'}} >
                    <Image style={{ width: 20, height: 20}} source={require('./images/back.png')}></Image>
                </TouchableOpacity>
                { (this.props.mode == "edit" ) ?
                <Title style={{ marginTop: '3%' }}>Tambah informasi</Title>
                :
                <Title style={{ marginTop: '3%' }}>Lihat informasi</Title>
                }
                </View>
              </Body>
            </Header>
            <Content padder>
            <ImageBackground source={require('./images/background.png')} style={{ width: '100%', height: '100%' }}>
                <View style={{ flex: 1, height: '100%', padding: '5%' }}>
                        { (this.props.mode == "edit" ) ?
                        <TouchableOpacity onPress={this.autofill.bind(this)} style={{ display: 'none', flex:1, flexDirection: 'row', marginTop: '0%', marginLeft: '70%'}} >
                            <Image source={require('./images/refresh.png')} style={{ width: 20 }} resizeMode='contain' />
                            <Text style={{ fontWeight: 'bold', marginTop: '7%', marginLeft: '12%' }}>Isi Otomatis</Text>
                        </TouchableOpacity> : null }
                        <View style={{height: 10}}></View> 
                        <Text style={{ fontWeight: 'bold', paddingBottom: 4 }}>Operator</Text>
                        <DropDownPicker
                            items={this.state.operators}
                            defaultValue={this.state.selectedOperator.value}
                            containerStyle={{height: 60}}
                            style={{backgroundColor: '#ffffff'}}
                            itemStyle={{
                                justifyContent: 'flex-start'
                            }}
                            labelStyle={{
                                fontSize: 16,
                                textAlign: 'left',
                                color: '#000'
                            }}
                            dropDownStyle={{backgroundColor: '#ffffff'}}
                            onChangeItem={this.onOperatorChanged.bind(this)}
                        />
                        <View style={{height: 60}}></View> 
                        <Text style={{ fontWeight: 'bold', paddingBottom: 4 }}>Toko</Text>
                        <View style={{height: 10}}></View> 
                        <TouchableOpacity onPress={this.selectStore.bind(this)} style={{ flex:1, flexDirection: 'row', marginTop: '0%', marginLeft: '0%'}} >
                        {( this.state.file !== null && this.state.file.store_name != null  ) ?
                            <Text style={{ marginTop: '0%', marginLeft: '5%' }}>[{this.state.file.store_id}] - {this.state.file.store_name}</Text>
                            :
                            <Text style={{ marginTop: '0%', marginLeft: '5%' }}>- Pilih toko -</Text>
                        }
                        </TouchableOpacity>
                        <View style={{height: 15}}></View>
                        <Button style = {{alignSelf: 'center', 
                        margin: 30, borderRadius: 10,
                        width: '60%', backgroundColor: '#AA2025'}}
                            onPress= {() => { this.previewImage(); }}>
                                <View style={{flex: 1, flexDirection: 'row', width:'100%', alignSelf: 'center', alignItems:'center', justifyContent:'center',}}>
                                    <Image source={require('./images/photo_white.png')} />
                                    <Text style={{ color: '#ffffff'}}>Lihat foto</Text>
                                </View>
                        </Button>
                        <Text style={{ fontWeight: 'bold' }}>Daftar paket</Text>

                        { ( this.state.showIndicator ) ? 
                        <View>
                            <ActivityIndicator size="large" color="#000"></ActivityIndicator>
                        </View>
                        : null}
                        <List>
                            {
                                this.state.packageItems.map((item, idx) => {
                                    return(<ListItem key={idx}>
                                        { (this.props.mode == "edit" ) ?
                                        <>
                                        <TouchableOpacity  style={{ marginLeft: '0%', fontWeight: 'normal', width: '90%' }} onPress={this.editPackageItem.bind(this, item)}>
                                            <Text style={{ alignSelf: 'flex-start' }}>
                                                {item.itemCategoryText}, Harga: Rp. {item.price}, Harga Transfer: Rp. {item.transferPrice}
                                            </Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity onPress={this.removePackageItem.bind(this, item)} style={{marginLeft: '0%', padding: '0%'}} >
                                            <Image source={require('./images/minus.png')} />
                                        </TouchableOpacity>
                                        </> 
                                        : 
                                        <Text style={{ alignSelf: 'flex-start' }}>
                                            {item.itemCategoryText}, Harga: Rp. {item.price}, Harga Transfer: Rp. {item.transferPrice}
                                        </Text>
                                        }
                                    </ListItem>)
                                })
                            }
                        </List>
                        
                        
                        <View style={{height: 18}}></View>
                        { (this.props.mode == "edit" ) ?
                        <View style={{ flex:1, flexDirection: 'row'}} >
                            <TouchableOpacity onPress={this.addPackageItem.bind(this)} style={{marginTop: '0%', padding: '3%'}} >
                                <Image source={require('./images/plus.png')} />
                            </TouchableOpacity>
                        </View> : null}


                        <View style={{height: 18}}></View>


                        <View style={{ flex: 1, flexDirection: 'column', }}>
                            <Text style={{ fontWeight: 'bold' }}>Jenis poster</Text>
                            <List>
                                <ListItem onPress={()=> this.onPosterTypeChange( 'product')} style={{ height: 60}}>
                                    <Left>
                                        <Text>Produk</Text>
                                    </Left>
                                    <Right>
                                    {(this.state.file.posterType == "product" ) ? <Image source={require('./images/check.png')} style={{ width: 20 }} resizeMode='contain' ></Image> 
                                        : null
                                    }
                                    </Right>
                                </ListItem>
                                <ListItem onPress={()=> this.onPosterTypeChange( 'promo')} style={{ height: 60}}>
                                    <Left>
                                        <Text>Promo</Text>
                                    </Left>
                                    <Right>
                                    {(this.state.file.posterType == "promo" ) ? <Image source={require('./images/check.png')} style={{ width: 20 }} resizeMode='contain' ></Image> 
                                        : null
                                    }
                                    </Right>
                                </ListItem>
                            </List>                            
                        </View>

                        <View style={{height: 18}}></View>


                        <View style={{ flex: 1, flexDirection: 'column', }}>
                            <Text style={{ fontWeight: 'bold' }}>Area promosi</Text>
                            <List>
                            <ListItem onPress={()=> this.onPromotionAreaChange( 'national')} style={{ height: 60}}>
                                    <Left>
                                        <Text>Nasional</Text>
                                    </Left>
                                    <Right>
                                    {(this.state.file.areaPromotion == "national" ) ? <Image source={require('./images/check.png')} style={{ width: 20 }} resizeMode='contain' ></Image> 
                                        : null
                                    }
                                    </Right>
                                </ListItem>
                                <ListItem onPress={()=> this.onPromotionAreaChange( 'local')} style={{ height: 60}}>
                                    <Left>
                                        <Text>Lokal</Text>
                                    </Left>
                                    <Right>
                                    {(this.state.file.areaPromotion == "local" ) ? <Image source={require('./images/check.png')} style={{ width: 20 }} resizeMode='contain' ></Image> 
                                        : null
                                    }
                                    </Right>
                                </ListItem>
                            </List>                            
                        </View>

                        <View style={{height: 18}}></View>
                        <Text style={{ fontWeight: 'bold', paddingBottom: 4 }}>Lokasi pengambilan foto</Text>
                        <Text style={{ fontWeight: 'normal' }}>
                            Lon: {this.state.file.lon}, Lat: {this.state.file.lat}, Alt: {this.state.file.alt}
                        </Text>

                        <View style={{height: 18}}></View>
                        <Text style={{ fontWeight: 'bold', paddingBottom: 4 }}>Dimensi foto</Text>
                        <Text style={{ fontWeight: 'normal' }}>
                            Width: {this.state.file.pixel_width}px, Height: {this.state.file.pixel_height}px
                        </Text>

                        <View style={{height: 18}}></View>
                        <Text style={{ fontWeight: 'bold', paddingBottom: 4 }}>Device</Text>
                        <Text style={{ fontWeight: 'normal' }}>{this.state.file.make}</Text>

                        <View style={{height: 18}}></View>
                        <Text style={{ fontWeight: 'bold', paddingBottom: 4 }}>Model</Text>
                        <Text style={{ fontWeight: 'normal' }}>{this.state.file.model}</Text>

                        <View style={{height: 18}}></View>
                        <Text style={{ fontWeight: 'bold', paddingBottom: 4 }}>Exposure time</Text>
                        <Text style={{ fontWeight: 'normal' }}>{this.state.file.exposure_time}</Text>

                        <View style={{height: 18}}></View>
                        <Text style={{ fontWeight: 'bold', paddingBottom: 4 }}>White balance</Text>
                        <Text style={{ fontWeight: 'normal' }}>{this.state.file.white_balance}</Text>

                        <View style={{height: 18}}></View>
                        <Text style={{ fontWeight: 'bold', paddingBottom: 4 }}>Orientation</Text>
                        <Text style={{ fontWeight: 'normal' }}>{this.state.file.orientation}</Text>

                        <View style={{height: 18}}></View>
                        <Text style={{ fontWeight: 'bold', paddingBottom: 4 }}>Flash</Text>
                        <Text style={{ fontWeight: 'normal' }}>{this.state.file.flash}</Text>

                        <View style={{height: 18}}></View>
                        <Text style={{ fontWeight: 'bold', paddingBottom: 4 }}>FNumber</Text>
                        <Text style={{ fontWeight: 'normal' }}>{this.state.file.fnumber}</Text>

                        <View style={{height: 18}}></View>
                        <Text style={{ fontWeight: 'bold', paddingBottom: 4 }}>ISO speed rating</Text>
                        <Text style={{ fontWeight: 'normal' }}>{this.state.file.iso_speed_rating}</Text>

                        <View style={{height: 18}}></View>
                        <Text style={{ fontWeight: 'bold', paddingBottom: 4 }}>Diambil oleh</Text>
                        <Text style={{ fontWeight: 'normal' }}>
                            {this.state.file.picture_taken_by} on {this.state.file.picture_taken_date}
                        </Text>

                        <View style={{height: 18}}></View>
                        <Text style={{ fontWeight: 'bold', paddingBottom: 4 }}>File lokal</Text>
                        <Text style={{ fontWeight: 'normal' }}>
                            {this.state.file.filename} on {this.state.file.filename}
                        </Text>

                        {
                            (this.state.file.uploaded_filename != null) ?
                        <>
                        <View style={{height: 18}}></View>
                        <Text style={{ fontWeight: 'bold', paddingBottom: 4 }}>Nama file upload</Text>
                        <Text style={{ fontWeight: 'normal' }}>
                             {this.state.file.uploaded_filename}
                        </Text></> : null
                        }

                        <View style={{height: 222}}></View>

                </View>
                <View style={{height: 150}}></View>

            </ImageBackground>
            </Content>
            { (this.props.mode == "edit" ) ?
            <Footer style={{backgroundColor: '#AA2025', padding: '2%'}}>
                {(this.state.file.uploaded_filename == null) ?
                <>
                <TouchableOpacity onPress={this.ok.bind(this, false)} >
                    <Image source={require('./images/save_white.png')} />
                </TouchableOpacity><View style={{width: w}}  /></> : null}

                
                <TouchableOpacity onPress={this.ok.bind(this, true)} >
                    <Image source={require('./images/upload_white.png')} />
                </TouchableOpacity> 
                <View style={{width: w}}  />
                <TouchableOpacity onPress={this.back.bind(this)}>
                    <Image source={require('./images/cancel_white.png')} />
                </TouchableOpacity>
            </Footer>
            : null }
            </Container>
        )

    }
}