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
import StoreFrontItem from './model/StoreFrontItem';
import DropDownPicker from 'react-native-dropdown-picker';
import HttpClient from './util/HttpClient';
import GlobalSession from './GlobalSession';

import Logging from './util/Logging';

import * as SQLite from "expo-sqlite";
import Sequelize from "rn-sequelize";
const Op = Sequelize.Op;
const Model = Sequelize.Model;

export default class ImageInfoStoreFrontPage extends React.Component {
    constructor(props)
    {
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
        this.state.storeFrontItems = [];
        this.state.counter = 0;
        this.state.showIndicator = false;
        this.state.effortCounter = 0;
    }

    loadFileInfo(callback)
    {
        if(this.state.file.uploaded_filename == null || this.state.file.uploaded_filename.length == 0)
            this.loadFileInfoLocal(callback);
        else
            this.loadFileInfoRemote(callback);
    }

    loadFileInfoLocal(callback)
    {
        var me = this;
        UploadedFile.findByPk(this.state.file.id).then(function (file){
            console.log("FILE");
            console.log(file);

            me.setState({ ...me.state, file : file });
            if(callback != null)
                callback();
        }).catch((err)=>{
            Logging.log(err, "error", "ImageInfoStoreFrontPage.loadFileInfo().UploadedFile.findByPk()")
        })        
    }

    loadRemoteFile(file)
    {
        let me = this;
        let promise = new Promise((resolve, reject) => {
            let url = GlobalSession.Config.API_HOST + "/uploadfile/get/" + file.id;
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

    getOperators(){
        let promise = new Promise((resolve, reject)=>{
            let url = GlobalSession.Config.API_HOST + "/operator";
            
            HttpClient.get(url, function(res){
                
                resolve(res.payload);
            }, function(res){
                reject(res);
            });
        });

        return promise;
    }

    getSubOperators(operator_id){
        let promise = new Promise((resolve, reject)=>{
            let url = GlobalSession.Config.API_HOST + "/suboperator/" + operator_id;
            HttpClient.get(url, function(res){
                resolve(res.payload);
            });
        });
        return promise;
    }

    getStores(){
        let promise = new Promise((resolve, reject)=>{
            let url = GlobalSession.Config.API_HOST + "/store";
            HttpClient.get(url, function(res){
                resolve(res.payload);
            }, function(err){
                reject(err);
            });
        });
        return promise;
    }

    onOperatorChanged(item){
        var me  =  this;

        me.setState({
            ...me.state,
            selectedOperator: item,
        })

        me.state.file.operatorDominant = item.value;
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
        me.getOperators().then(function(operators){

            me.getStores().then(function(stores){
                let operatorItems = [];
                let storeItems = [];
                let initOp = { label: operators[0].operator_name, value: operators[0].operator_value };
                let initStore = { label: stores[0].store_name, value: stores[0].id  };
                
                operators.forEach(function(item, index){
                    let it = { value: item.operator_value, label: item.operator_name };
                    operatorItems.push( it );
                    if( me.state.file.operatorDominant != null && me.state.file.operatorDominant.toLowerCase().trim() == item.operator_name.toLowerCase().trim())
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
                Logging.log(e, "error", "ImageInfoStoreFrontPage.loadLookupData().me.getStores()")
            })
        }).catch((e)=>{
            Logging.log(e, "error", "ImageInfoStoreFrontPage.loadLookupData().me.getOperators()")
        })
    }

    initStoreFrontItemsFromRemote(me)
    {
        console.log("initStoreFrontItemsFromRemote")
        let tempid = me.getMaxTempId();
        let url = GlobalSession.Config.API_HOST + "/storefrontitem/file/" + me.state.file.id;
        HttpClient.get(url, function(response){
            let items = response.payload;
            items.forEach((item) => { 
                item.price = '' + item.price; 
                item.tempid = tempid; 
                tempid++; 
            })


            if(items == null)
                items = []
            me.setState({
                ...me.state,
                storeFrontItems: items
            })

        }, function(err){
            console.log("Error");
            console.error(err);
            Logging.log(err, "error", "ImageInfoStoreFrontPage.initStoreFrontItemsFromRemote().HttpClient.get(" + url + " ) ")

        })
    }

    initStoreFrontItemsFromLocal(me)
    {
        console.log("initStoreFrontItemsFromLocal")
        let tempid = me.getMaxTempId();
        StoreFrontItem.findAll({
            where: {
                upload_file_id: { [Op.eq] : this.state.file.id }
            }
        }).then(function (items){

            items.forEach((item) => { 
                item.price = '' + item.price; 
                item.tempid = tempid; tempid++; 
            })


            if(items == null)
                items = []
            me.setState({
                ...me.state,
                storeFrontItems: items
            })
        }).catch(function (err){
            console.log("Error");
            console.error(err);
            Logging.log(e, "error", "ImageInfoStoreFrontPage.initStoreFrontItems().StoreFrontItem.findAll()")
        })
    }

    initStoreFrontItems(me){
        if(this.state.file.uploaded_filename == null || this.state.file.uploaded_filename.length == 0)
            this.initStoreFrontItemsFromLocal(this);
        else
            this.initStoreFrontItemsFromRemote(this);
    }

    loadAll(callback)
    {
        var me = this;
        me.setState({
            showIndicator: true
        });
        me.loadFileInfo(function(){
            me.loadLookupData(me, function(){
                me.initStoreFrontItems(me);

                me.setState({
                    showIndicator: false
                });
                if(callback != null)
                    callback();
            });
        });
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

    callOperatorFilter(me, uri,  callback, callbackError){
        var url = GlobalSession.Config.API_HOST_DOMINANT_OPERATOR;
        //uri = uri.replace("https://storage.googleapis.com/", 'gs://')

        uri = encodeURIComponent(uri)
        url = url + "/" + uri

        console.log("Operator Filter")
        console.log(url);

        HttpClient.get(url,  function(res){


            if(res.success)
            {
                if(callback !=null)
                    callback(res.payload);
            }
            else
            {
                console.log("Retrieve operator error")
                console.log(res.error);
                if(callbackError != null)
                    callbackError(me, res.error);
            }

            
        }, function(err){
            console.log("Retrieve operator error")
            console.log(err);
            if(callbackError != null)
                callbackError(me, err);
            Logging.log(err, "error", "ImageInfoStoreFrontPage.callOperatorFilter().HttpClient.post() " + uri)
        });
    }

    getTheLargestCoverageOperator(me, operators)
    {
        var selOp = operators[0];
        operators.forEach(function(item){
            if(item.percentage > selOp.percentage)
                selOp = item;
        });
        return selOp;
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
                let resop = me.getTheLargestCoverageOperator(me, operators);
                let selResop = null;
                me.state.operators.forEach(function(operator, idx ){
                    if(operator.value.toLowerCase().trim() == resop.operator.toLowerCase().trim())
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

    autofill()
    {
        var me = this;
        this.setState({
            showIndicator: true
        })
        me.uploadToGcs( "vertical", function(uri){
            
            //Wait for 5 seconds, GCS needs to do some things before the file accessible
            console.log("wait 100 msecs before retrieving...")
            setTimeout(function(){
                
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

            }, 100);
        }, function(err){
            me.setState({
                showIndicator: false
            })
            let sError = JSON.stringify(err);
            alert("Upload error "  + sError);
            Logging.log(err, "error", "ImageInfoStoreFrontPage.autofill().me.uploadToGcs()")
        });
    }

    removeLocalStoreFrontItem(item)
    {
        StoreFrontItem.destroy({ where: { id: selectedItem.id  }  }).then(function(res){
            me.initStoreFrontItems(me);
        });
    }

    removeStoreFrontItem(item)
    {
        var me = this;
        var selectedIdx = -1;
        this.state.storeFrontItems.forEach(function(it, idx){
            if( (item.id != null && item.id == it.id) || ( item.tempid == it.tempid )){
                selectedIdx = idx;
            }
        })

        var storeFrontItems = this.state.storeFrontItems;

        if(selectedIdx > -1)
        {
            var selectedItem = this.state.storeFrontItems[selectedIdx];
            if(selectedItem.id != null)
            {
                if(me.state.file.uploaded_filename == null)
                    me.removeLocalStoreFrontItem();
                else {
                    me.state.storeFrontItems.splice(selectedIdx, 1);
                    me.setState({
                        ...me.state,
                        storeFrontItems: me.state.storeFrontItems
                    })
                }
            }
            else
            {
                me.state.storeFrontItems.splice(selectedIdx, 1);
                me.setState({
                    ...me.state,
                    storeFrontItems: me.state.storeFrontItems
                })
            }
        }
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
        if(this.state.storeFrontItems.length == 0)
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

        var url = GlobalSession.Config.API_HOST + "/uploadfile/create";
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
                me.uploadStoreFrontItems(me, me.state.storeFrontItems,0, res.payload.id, function(){
                    if(callback != null)
                        callback(res);
                }, function(res){
                    res.message = " uploadstoreFrontItems : " + res.message;
                    if(callbackError != null)
                        callbackError(res);
                });

            }
            else
            {
                res.message = " uploadImageInfo : " + res.message;
                if(callbackError != null)
                    callbackError(res);

                
            }
        }, function(res){
            Logging.log(res, "error", "ImageInfoStoreFrontPage.uploadImageInfo().HttpClient.post()")
        });
    }

    uploadStoreFrontItems(me, items, idx, parentid, callback, callbackError)
    {
        if(idx < items.length)
        {
            items[idx].upload_file_id = parentid;
            me.uploadStoreFrontItem(me, items[idx], function(res){
                me.uploadStoreFrontItems(me, items, idx + 1, parentid, callback, callbackError);  
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

    uploadStoreFrontItem(me, item, callback, callbackError)
    {
        var url = GlobalSession.Config.API_HOST + "/storefrontitem/create"; 
        console.log("uploading storefront item");
        
        var newItem = JSON.stringify(item);
        newItem = JSON.parse(newItem);
        newItem.id = null;

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
                if(callback != null)
                    callback(res);
            }
            else
            {
                res.message = " uploadStoreFrontItem : " + res.message;
                if(callbackError != null)
                    callbackError(res);
            }
        }, function(err){
            Logging.log(err, "error", "ImageInfoStoreFrontPage.uploadStoreFrontItem().HttpClient.post()")
        });
    }

    uploadToServer(callback, callbackError)
    {
        var me = this;
        var url = GlobalSession.Config.API_HOST_UPLOAD + "/upload/gcs/" + GlobalSession.Config.STOREFRONT_UPLOAD_PATH;
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
                    res.message = " uploadImageInfo : " +  res.message;
                    if(callbackError != null)
                        callbackError(res);
                });
            }
            else {
                res.message = " upload : " +  res.message;
                if(callbackError != null)
                    callbackError(res);
            }
            
        }, function(res){
            alert("Upload file to server failed")
            console.log(res);
            Logging.log(res, "error", "ImageInfoStoreFrontPage.uploadToServer().HttpClient.upload()")
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
            if(callbackError != null)
                callbackError(err);
            Logging.log(err, "error", "ImageInfoStoreFrontPage.updateUploadedFileLocally().UploadedFile.update()")
        });
    }

    saveLocalUpdateStoreFrontItem(items, idx, callback)
    {
        var me = this;
        if(idx < items.length)
        {
            
            StoreFrontItem.update({ operator : items[idx].operator, percentage: items[idx].percentage, productHero: items[idx].productHero, 
                price : items[idx].price, transferPrice: items[idx].transferPrice, gbmain: items[idx].gbmain, validity: items[idx].validity, 
                category: items[idx].category, campaignTheme: items[idx].campaignTheme
                     },
                {where: { id: items[idx].id }}).then(function (res){
                
                    me.saveLocalUpdateStoreFrontItem(items, idx + 1, callback);
                    return null;

            }).catch(err => {
                console.log("ImageInfoStoreFrontPage.saveLocalUpdateStoreFrontItem().StoreFrontItem.update()")
                console.log(err)
                Logging.log(err, "error", "ImageInfoStoreFrontPage.saveLocalUpdateStoreFrontItem().StoreFrontItem.update()")
            })
            
            
        }
        else
            if(callback != null)
                callback();
        
        //return true;
    }

    saveLocalDeleteStoreFrontItem(items, idx, callback)
    {
        var me = this;
        if(idx < items.length)
        {
            StoreFrontItem.destroy({where: { id: items[idx].id }}).then(function (res){
                me.saveLocalDeleteStoreFrontItem(items, idx + 1, callback);
            }).catch((err)=>{
                Logging.log(err, "error", "ImageInfoStoreFrontPage.saveLocalUpdateStoreFrontItem().StoreFrontItem.destroy()")
            })
        }
        else
            if(callback != null)
                callback();
    }

    saveLocalUploadedFileInfo(callback)
    {
        var me = this;
        this.state.file.operatorDominant = this.state.selectedOperator.label;
        this.state.file.store_name = this.state.selectedStore.store_name;
        this.state.file.store_id = this.state.selectedStore.storeid;

        let createdItems = [];
        let updatedItems = [];

        this.state.storeFrontItems.forEach(function (item){
            item.upload_file_id = me.state.file.id;
            if(item.id == null)
            {
                delete item.id;
                createdItems.push(item);
            }
            else
                updatedItems.push(item);
        });

        UploadedFile.update({ store_name : this.state.file.store_name, operatorDominant: this.state.file.operatorDominant }, {
            where: { id : this.state.file.id}
        }).then(function (file){
            

          console.log("Created Items")
          console.log(createdItems)

           StoreFrontItem.bulkCreate(createdItems).then(function (res){
               console.log("save created!")

                console.log("Updated Items")
                console.log(updatedItems)

                
                me.saveLocalUpdateStoreFrontItem( updatedItems, 0, function(){
                    console.log("save updated items")
                    
                    if(callback  != null)
                        callback();

                });

                return null;
              
           }).catch(function (err){
               console.log(err);
               Logging.log(err, "error", "ImageInfoStoreFrontPage.saveLocalUploadedFileInfo().UploadedFile.update()")
           })

           return true;
        }).catch(function (err){
            console.log(err);
            Logging.log(err, "error", "ImageInfoStoreFrontPage.saveLocalUploadedFileInfo().StoreFrontItem.bulkCreate()")
        })
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
        var url = GlobalSession.Config.API_HOST + "/storefrontitem/delete-by-uploadid/" + this.state.file.id;
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
        var url = GlobalSession.Config.API_HOST + "/uploadfile/update/" + me.state.file.id;
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
                console.log("delete remote store front items")

                me.deleteRemotePackageItems(function(response){

                    console.log("upload store front items")
                    console.log(me.state.packageItems)

                    me.uploadStoreFrontItems(me, me.state.storeFrontItems,0, me.state.file.id, function(){
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
                        res.message = " uploadStoreFrontItems : " + res.message;
                        me.setState({
                            showIndicator: false
                        })
                        Logging.log(res, "error", "ImageInfoStoreFrontPage.saveUpdateRemote().uploadStoreFrontItems()")
                        if(callbackError != null)
                            callbackError(res);
                    });

                }, function(err){
                    err.message = " deleteRemotePackageItems : " + err.message;
                    Logging.log(err, "error", "ImageInfoStoreFrontPage.saveUpdateRemote().deleteRemotePackageItems()")
                    if(callbackError != null)
                        callbackError(err);
                })

            }
            else
            {
                res.message = " saveUpdateRemote : " + JSON.stringify(res);
                Logging.log(res, "error", "ImageInfoStoreFrontPage.saveUpdateRemote().HttpClient.post()")
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

            me.saveLocalUploadedFileInfo(function(){
                
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
                                Actions.uploadPage({ imageCategory: "storefront" });

                            }, function(err)
                            {
                                me.setState({
                                    showIndicator: false
                                }); 
                            })
                            
                            
                        }, 
                        function(res)
                        {
                            alert("Upload foto gagal : " + res.message);
                            me.setState({
                                showIndicator: false
                            }); 
                        });
                        

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
        var url = GlobalSession.Config.API_HOST_UPLOAD + "/upload/gcs/telkomsel-retail-intelligence/retail-intelligence-bucket/temporary";
        console.log(url);
        HttpClient.upload(url, this.state.file.filename, function(res){
            console.log("done upload image");

            let uri = res.payload;
            uri = uri.replace("gs://", "https://storage.googleapis.com/")


            if(callback != null)
                callback(uri);

        }, function(err){
            if(callbackError != null)
                callbackError(err);
            
                Logging.log(err, "error", "ImageInfoStoreFrontPage.uploadToGcs().HttpClient.upload()")

            
        });
    }



    editPackageItem(item)
    {
        console.log("item")
        console.log(item);

        Actions.editStoreFrontItemPage({ mode: "edit", item: item, onSave: this.onSaveStoreFrontItem.bind(this), operator: this.state.selectedOperator });
    }

    addStoreFrontItem()
    {
        if(this.state.storeFrontItems == null)
            this.state.storeFrontItems = [];

        let max =  this.getMaxTempId();

        let item = { id:null, percentage: '', productHero: '', package_name: '', price: '', transferPrice: '', validity: '', gbmain: '', tempid: max };
        Actions.editStoreFrontItemPage({ mode: "add", item: item, onSave: this.onSaveStoreFrontItem.bind(this), operator: this.state.selectedOperator });
    }

    onSaveStoreFrontItem(item)
    {

        let exists = false;
        for(let i =0; i < this.state.storeFrontItems.length; i++)
        {
            if(this.state.storeFrontItems[i].tempid == item.tempid)
            {
                this.state.storeFrontItems[i] = item;
                exists = true;
            }
        }

        
        if(exists == false)
        {
            this.state.storeFrontItems.push(item);

        }
        

        this.setState({ 
            ...this.state,
            storeFrontItems: this.state.storeFrontItems   
        });
    }

    getMaxTempId()
    {
        let max = 0;
        this.state.storeFrontItems.forEach(function(it, idx){
            if(max < it.tempid)
                max = it.tempid;
        });

        return max + 1;
    }

    componentDidMount()
    {
        this.loadAll();
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
                        <TouchableOpacity onPress={this.autofill.bind(this)} style={{ flex:1, flexDirection: 'row', marginTop: '0%', marginLeft: '70%'}} >
                            <Image source={require('./images/refresh.png')} style={{ width: 20 }} resizeMode='contain' />
                            <Text style={{ fontWeight: 'bold', marginTop: '7%', marginLeft: '12%' }}>Isi Otomatis</Text>
                        </TouchableOpacity> : null }

                                                
                        <Button style = {{alignSelf: 'center', 
                        margin: 30, borderRadius: 10,
                        width: '60%', backgroundColor: '#AA2025'}}
                            onPress= {() => { this.previewImage(); }}>
                                <View style={{flex: 1, flexDirection: 'row', width:'100%', alignSelf: 'center', alignItems:'center', justifyContent:'center',}}>
                                    <Image source={require('./images/photo_white.png')} />
                                    <Text style={{ color: '#ffffff'}}>Lihat foto</Text>
                                </View>
                        </Button>

                        <View style={{height: 10}}></View> 
                        <Text style={{ fontWeight: 'bold', paddingBottom: 4 }}>Toko</Text>
                        <View style={{height: 10}}></View> 
                        <TouchableOpacity onPress={this.selectStore.bind(this)} style={{ flex:1, flexDirection: 'row', marginTop: '0%', marginLeft: '0%'}} >
                        {( this.state.file !== null && this.state.file.store_name != null  ) ?
                            <Text style={{ marginTop: '0%', marginLeft: '5%' }}>[{this.state.file.store_id}] {this.state.file.store_name}</Text>
                            :
                            <Text style={{ marginTop: '0%', marginLeft: '5%' }}>- Pilih toko -</Text>
                        }
                        </TouchableOpacity>
                        <View style={{height: 15}}></View>
                        <Text style={{ fontWeight: 'bold', paddingBottom: 4 }}>Operator Dominan</Text>
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

                        <Text style={{ fontWeight: 'bold' }}>Daftar item</Text>

                        { ( this.state.showIndicator ) ? 
                        <View>
                            <ActivityIndicator size="large" color="#000"></ActivityIndicator>
                        </View>
                        : null}
                        <List>
                            {
                                this.state.storeFrontItems.map((item, idx) => {
                                    return(<ListItem key={idx}>
                                        { (this.props.mode == "edit" ) ?
                                        <>
                                        <TouchableOpacity  style={{ marginLeft: '0%', fontWeight: 'normal', width: '90%' }} onPress={this.editPackageItem.bind(this, item)}>
                                            <Text style={{ alignSelf: 'flex-start' }}>
                                                {item.operator} - {item.gbmain} GB, Persentase: {item.percentage}, Rp. {item.price}
                                            </Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity onPress={this.removeStoreFrontItem.bind(this, item)} style={{marginLeft: '0%', padding: '0%'}} >
                                            <Image source={require('./images/minus.png')} />
                                        </TouchableOpacity>
                                        </> 
                                        : 
                                        <Text style={{ alignSelf: 'flex-start' }}>
                                            {item.operator} - {item.gbmain} GB, Persentase: {item.percentage}, Rp. {item.price}
                                        </Text>
                                        }
                                    </ListItem>)
                                })
                            }
                        </List>
                        
                        
                        <View style={{height: 18}}></View>
                        { (this.props.mode == "edit" ) ?
                        <View style={{ flex:1, flexDirection: 'row'}} >
                            <TouchableOpacity onPress={this.addStoreFrontItem.bind(this)} style={{marginTop: '0%', padding: '3%'}} >
                                <Image source={require('./images/plus.png')} />
                            </TouchableOpacity>
                        </View> : null}

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
                            {this.state.file.filename} 
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