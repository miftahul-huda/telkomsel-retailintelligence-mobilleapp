import React, { Component } from 'react';
import { Container, Content, Text, Card, Header, Footer, Body, Button, Title, 
  List,
  ListItem,
  Left,
  Item, CardItem, Icon, View } from 'native-base';

import { Image, ImageBackground, ScrollView, ActivityIndicator, StatusBar} from 'react-native';
import { Actions } from 'react-native-router-flux';

import UploadedFile from './model/UploadedFile';
import Config from './config.json';
import Style from './style';
import SharedPage from './SharedPage';

import Logging from './util/Logging';
import GlobalSession from './GlobalSession';
import HttpClient from './util/HttpClient';
import Util from './util/Util'

import Sequelize from "rn-sequelize";
import { TouchableOpacity } from 'react-native-gesture-handler';
const Op = Sequelize.Op;

import PushNotification from 'react-native-push-notification'
import Uploader from './util/Uploader';



export default class HomePage extends SharedPage {

    constructor(props){
      super(props);
      this.state = {
          posterFiles: [],
          storeFrontFiles: [],
          posterBeforeAfterFiles: [],
          storeFrontBeforeAfterFiles : [],
          totalSalesFiles: [],
          etalaseFiles: [],
          selectedFile: null,
          showLoading: false,
          textStatus: 'Draft',
          status: 'draft',
          offset: 0,
          limit: 10,
          selectedDate: null,
          selectedDateAll: true,
          interval: null,
          uploadedNumber: 0,
          processedNumber: 0,
          rejectedNumber: 0,
          draftNumber: 10,
          counter: 0,
          projectEndDate: '',
          uploadTarget: '',
          uploadStatusText: '',
      }
    }

    componentDidMount()
    {
        this.loadProjectInfo();
        this.refresh();
        var me = this;
        clearInterval(this.state.interval);
        /*this.state.interval = setInterval(function(){
            console.log('refresh')
            me.refresh();
        }, 10000)*/
    }

    loadProjectInfo()
    {
        var me = this;
        let url = GlobalSession.Config.API_HOST + "/application/get-by-version/" + GlobalSession.Config.VERSION;
        console.log(url);
        HttpClient.get(url, function(response){
            console.log(response)
            let data = response.payload.appMessage;
            data = JSON.parse(data);
            me.setState({
                projectEndDate: data.projectEndDate,
                uploadTarget: data.uploadTarget
            })
        })
    }

    refresh()
    {
        this.state.counter++;

        clearInterval(this.state.interval);

        this.setState({
            uploading: false
        })
        var me = this;
        this.getStatusNumbers();
        this.showPhotos("draft");
    }

    getStatusNumbers()
    {
        
        Util.getTotalStatus().then((result)=>{

            //alert(JSON.stringify(result));

            this.setState({
                uploadedNumber: result.uploaded,
                draftNumber: result.draft,
                rejectedNumber: result.rejected,
                processedNumber: result.processed
            })
        })

        
    }

    showAllPoster()
    {
        if(this.state.status != "uploaded")
            Actions.uploadPage({ imageCategory: 'poster', imageStatus: this.state.status})
        else
            Actions.uploadHistoryPage({ imageCategory: 'poster' })
    }

    showAllTotalSales()
    {
        if(this.state.status != "uploaded")
            Actions.uploadPage({ imageCategory: 'total-sales', imageStatus: this.state.status})
        else
            Actions.uploadHistoryPage({ imageCategory: 'total-sales' })
    }

    showAllEtalase()
    {
        if(this.state.status != "uploaded")
            Actions.uploadPage({ imageCategory: 'etalase', imageStatus: this.state.status})
        else
            Actions.uploadHistoryPage({ imageCategory: 'etalase' })
    }

    showAllPosterBeforeAfter()
    {
        if(this.state.status != "uploaded")
            Actions.uploadPage({ imageCategory: 'poster-before-after', imageStatus: this.state.status})
        else
            Actions.uploadHistoryPage({ imageCategory: 'poster-before-after' })
    }

    showAllStoreFront()
    {
        if(this.state.status != "uploaded")
            Actions.uploadPage({ imageCategory: 'storefront', imageStatus: this.state.status})
        else
            Actions.uploadHistoryPage({ imageCategory: 'storefront' })
    }

    showAllStoreFrontBeforeAfter()
    {
        if(this.state.status != "uploaded")
            Actions.uploadPage({ imageCategory: 'storefront-before-after', imageStatus: this.state.status})
        else
            Actions.uploadHistoryPage({ imageCategory: 'storefront-before-after' })
    }

    batchUpload()
    {
        var me = this;
        this.state.counter = 0;
        Uploader.START_UPLOAD = true;
        this.setState({
            uploading: true
        })

        this.state.interval = setInterval(function(){
            me.setState({
                uploadStatusText: Uploader.STATUS
            })
        }, 1000)

        Uploader.callback = function()
        {
            setTimeout(function(){
                me.refresh();
            }, 3000)
        }
        //Uploader.runUpload();
    }

    loadPosterFiles()
    {
        let me = this;
        let url = GlobalSession.Config.API_HOST + "/report/posters/byuploader/" + GlobalSession.currentUser.email + "/" + this.state.offset + "/" + this.state.limit;


        let dt = this.state.selectedDate;

        if(this.state.selectedDateAll)
            dt = "*";

        me.setState({
            showLoading: true
        })
        HttpClient.post(url, { outlet: "*", date: dt  }, function(response){

            let files = response.payload;
        

            files.map(file => {
                file.selected = false
                file.imageCategory = "poster"
                file.isuploaded = 1
            });

            if(files != null)
            {
                me.setState({
                    posterFiles: files,
                    totalAllData: response.allTotal[0].total,
                    showLoading: false
                })
            }
            
            me.setState({
                showLoading: false
            })
        })

    }

    loadPosterBeforeAfterFiles()
    {
        let me = this;
        let url = GlobalSession.Config.API_HOST + "/report/poster-before-after/byuploader/" + GlobalSession.currentUser.email + "/" + this.state.offset + "/" + this.state.limit;


        let dt = this.state.selectedDate;

        if(this.state.selectedDateAll)
            dt = "*";

        me.setState({
            showLoading: true
        })

        HttpClient.post(url, { outlet: "*", date: dt  }, function(response){

            let files = response.payload;

            console.log("loadPosterBeforeAfterFiles")
            console.log(response)

            
            console.log(files)
        
            if(files != null)
            {
                files.map(file => {
                    file.selected = false
                    file.imageCategory = "poster-before-after"
                    file.isuploaded = 1
                });

                console.log("posterBeforeAfterFiles")
                console.log(files);

                me.setState({
                    posterBeforeAfterFiles: files,
                    totalAllData: response.allTotal[0].total,
                    showLoading: false
                })
            }
            
            me.setState({
                showLoading: false
            })
        })
    }

    loadStoreFrontFiles()
    {
        let me = this;
        let url = GlobalSession.Config.API_HOST + "/report/storefronts/byuploader/" + GlobalSession.currentUser.email + "/" + this.state.offset + "/" + this.state.limit;

        me.setState({
            showLoading: true
        })

        let dt = this.state.selectedDate;
        if(this.state.selectedDateAll)
            dt = "*";

        HttpClient.post(url, { outlet: "*", date: dt  }, function(response){
            let files = response.payload;
            files.map(file => {
                file.selected = false
                file.imageCategory = "storefront"
                file.isuploaded = 1
            });

            if(files != null)
            {
                me.setState({
                    storeFrontFiles: files,
                    totalAllData: response.allTotal[0].total,
                    showLoading: false
                })
            }

            me.setState({
                showLoading: false
            })
        })

    }

    loadStoreFrontBeforeAfterFiles()
    {
        let me = this;
        let url = GlobalSession.Config.API_HOST + "/report/storefront-before-after/byuploader/" + GlobalSession.currentUser.email + "/" + this.state.offset + "/" + this.state.limit;

        me.setState({
            showLoading: true
        })

        let dt = this.state.selectedDate;
        if(this.state.selectedDateAll)
            dt = "*";

        HttpClient.post(url, { outlet: "*", date: dt  }, function(response){
            let files = response.payload;
            files.map(file => {
                file.selected = false
                file.imageCategory = "storefront-before-after"
                file.isuploaded = 1
            });

            if(files != null)
            {
                me.setState({
                    storeFrontBeforeAfterFiles: files,
                    totalAllData: response.allTotal[0].total,
                    showLoading: false
                })
            }

            me.setState({
                showLoading: false
            })
        })

    }

    loadTotalSalesFiles()
    {
        let me = this;
        let url = GlobalSession.Config.API_HOST + "/report/totalsales/byuploader/" + GlobalSession.currentUser.email + "/" + this.state.offset + "/" + this.state.limit;


        let dt = this.state.selectedDate;

        if(this.state.selectedDateAll)
            dt = "*";

        me.setState({
            showLoading: true
        })
        HttpClient.post(url, { outlet: "*", date: dt  }, function(response){

            let files = response.payload;
        

            files.map(file => {
                file.selected = false
                file.imageCategory = "total-sales"
                file.isuploaded = 1
            });

            if(files != null)
            {
                me.setState({
                    totalSalesFiles: files,
                    totalAllData: response.allTotal[0].total,
                    showLoading: false
                })
            }
            
            me.setState({
                showLoading: false
            })
        })

    }

    loadEtalaseFiles()
    {
        let me = this;
        let url = GlobalSession.Config.API_HOST + "/report/etalase/byuploader/" + GlobalSession.currentUser.email + "/" + this.state.offset + "/" + this.state.limit;


        let dt = this.state.selectedDate;

        if(this.state.selectedDateAll)
            dt = "*";

        me.setState({
            showLoading: true
        })
        HttpClient.post(url, { outlet: "*", date: dt  }, function(response){

            let files = response.payload;
        

            files.map(file => {
                file.selected = false
                file.imageCategory = "etalase"
                file.isuploaded = 1
            });

            if(files != null)
            {
                me.setState({
                    etalaseFiles: files,
                    totalAllData: response.allTotal[0].total,
                    showLoading: false
                })
            }
            
            me.setState({
                showLoading: false
            })
        })

    }

    loadLocalPosterFiles(status){
        let me = this;
        UploadedFile.findAll({
            where:{
                [Op.and]: [
                    {imageCategory: 'poster'},
                    {picture_taken_by: GlobalSession.currentUser.email },
                    {imageStatus: status }
                ]
            }
            ,
            order: [
                ['uploaded_id', 'DESC']
            ]
            ,
            limit: 10
        }).then(async (files) => {
            
            files.map(file => {
                file.selected = false
            });


            if(files != null)
            {
                files = await Util.setTotalItems(files);

                me.setState({
                    posterFiles: files
                })
            }
        }).catch((err) =>{
            //Logging.log(err, "error", "HomePage.loadLocalPosterFiles().findAll()")
        })
    }

    loadLocalPosterBeforeAfterFiles(status){
        console.log("loadLocalPosterBeforeAfterFiles")
        let me = this;
        UploadedFile.findAll({
            where:{
                [Op.and]: [
                    {imageCategory: 'poster-before-after'},
                    {picture_taken_by: GlobalSession.currentUser.email },
                    {imageStatus: status },
                    { beforeAfterType: 'before' }
                ]
            }
            ,
            order: [
                ['uploaded_id', 'DESC']
            ]
            ,
            limit: 10
        }).then(async (files) => {
            
            files.map(file => {
                file.selected = false
            });

            console.log("posterBeforeAfterFiles")
            console.log(files);

            if(files != null)
            {
                

                files = await Util.setTotalItems(files);

                me.setState({
                    posterBeforeAfterFiles: files
                })
            }
        }).catch((err) =>{
            console.log(err)
            //Logging.log(err, "error", "HomePage.loadLocalPosterFiles().findAll()")
        })
    }

    loadLocalStoreFrontFiles(status){
        let me = this;
        UploadedFile.findAll({
            where:{
                [Op.and]: [
                    {imageCategory: 'storefront'},
                    { picture_taken_by: GlobalSession.currentUser.email },
                    {
                       imageStatus: status
                    }
                ]
            }
            ,
            order: [
                ['uploaded_id', 'DESC']
            ]
            ,
            limit: 10
        }).then(async (files) => {
            files.map(file => {
                file.selected = false
            });



            if(files != null)
            {
                files = await Util.setTotalItems(files);

                me.setState({
                    storeFrontFiles: files
                })
            }
        }).catch((err) =>{
            Logging.log(err, "error", "HomePage.loadLocalStoreFrontFiles().findAll()")
        })
    }

    loadLocalStoreFrontBeforeAfterFiles(status){
        let me = this;
        UploadedFile.findAll({
            where:{
                [Op.and]: [
                    {imageCategory: 'storefront-before-after'},
                    { picture_taken_by: GlobalSession.currentUser.email },
                    {
                       imageStatus: status
                    },
                    {
                        beforeAfterType: 'before'
                    }
                ]
            }
            ,
            order: [
                ['uploaded_id', 'DESC']
            ]
            ,
            limit: 10
        }).then(async (files) => {
            files.map(file => {
                file.selected = false
            });



            if(files != null)
            {
                files = await Util.setTotalItems(files);

                me.setState({
                    storeFrontBeforeAfterFiles: files
                })
            }
        }).catch((err) =>{
            Logging.log(err, "error", "HomePage.loadLocalStoreFrontFiles().findAll()")
        })
    }

    loadLocalTotalSalesFiles(status){
        let me = this;
        UploadedFile.findAll({
            where:{
                [Op.and]: [
                    {imageCategory: 'total-sales'},
                    {picture_taken_by: GlobalSession.currentUser.email },
                    {imageStatus: status }
                ]
            }
            ,
            order: [
                ['uploaded_id', 'DESC']
            ]
            ,
            limit: 10
        }).then(async (files) => {
            
            files.map(file => {
                file.selected = false
            });

            console.log("total Sales")
            console.log(files)

            if(files != null)
            {
                files = await Util.setTotalItems(files);

                me.setState({
                    totalSalesFiles: files
                })
            }
        }).catch((err) =>{
            //Logging.log(err, "error", "HomePage.loadLocalPosterFiles().findAll()")
        })
    }

    loadLocalEtalaseFiles(status){
        let me = this;
        UploadedFile.findAll({
            where:{
                [Op.and]: [
                    {imageCategory: 'etalase'},
                    {picture_taken_by: GlobalSession.currentUser.email },
                    {imageStatus: status }
                ]
            }
            ,
            order: [
                ['uploaded_id', 'DESC']
            ]
            ,
            limit: 10
        }).then(async (files) => {
            
            files.map(file => {
                file.selected = false
            });


            if(files != null)
            {
                files = await Util.setTotalItems(files);

                me.setState({
                    etalaseFiles: files
                })
            }
        }).catch((err) =>{
            //Logging.log(err, "error", "HomePage.loadLocalPosterFiles().findAll()")
        })
    }

    onSaveRotateImage(res){

    }

    viewImage(file){
        this.state.selectedFile = file;

        if(file.imageCategory == "poster")
            Actions.imageHomePage( {file: file} );
        if(file.imageCategory == "poster-before-after")
        {   
            Actions.beforeAfterPosterHomePage( {beforeAfterID: file.beforeAfterID} );
        }
        else if(file.imageCategory == "storefront")
        {
            Actions.imageHomeStoreFrontPage({ file: file })
        }
        else if(file.imageCategory == "storefront-before-after")
        {
            Actions.beforeAfterStoreFrontHomePage( {beforeAfterID: file.beforeAfterID} );
        }
            

        //Actions.viewImagePage({ editMode:true, file: file, onSaveCropImage: Util.onSaveCropImage.bind(this), onSaveRotateImage: this.onSaveRotateImage.bind(this) })
    }   

    showPhotos(status)
    {

        if(status == "uploaded")
            this.setState({ textStatus: "Terunggah", status: "uploaded" })
        else if(status == "draft")
            this.setState({ textStatus: "Draft", status: "draft" })
        else if(status == "processed")
            this.setState({ textStatus: "Proses", status: "processed" })
        else if(status == "rejected")
            this.setState({ textStatus: "Ditolak", status: "rejected" })

        if(status == "uploaded")
        {
            this.loadPosterFiles();
            this.loadStoreFrontFiles();
            this.loadPosterBeforeAfterFiles();
            this.loadStoreFrontBeforeAfterFiles();
            this.state.status = "uploaded"
            //this.state.textStatus = "Terunggah";
        }
        else
        {
            this.loadLocalPosterFiles(status);
            this.loadLocalStoreFrontFiles(status);
            this.loadLocalPosterBeforeAfterFiles(status);
            this.loadLocalStoreFrontBeforeAfterFiles(status);
            this.loadLocalEtalaseFiles(status);
            this.loadLocalTotalSalesFiles(status);
            this.state.status = status;
            //this.state.textStatus = "Draft";
        }
    }



    render()
    {
        var me = this;
        return(<Container>
            <Header style={{backgroundColor: '#FFF'}}>
                <View style={{flex:1, flexDirection: 'row'}}>
                    <View style={{width: '50%', marginTop: '-5%'}}>
                        <Image source={require('./images/logo.png')} style={{width: '60%'}} resizeMode='contain'></Image>
                    </View>
                    <View style={{width: '40%'}}></View>
                    <View style={{width: '10%'}}>
                        <TouchableOpacity onPress={this.batchUpload.bind(this)}>
                            <Image source={require('./images/reload.png')} style={{width: '60%', marginTop: '20%'}} resizeMode='contain'></Image>
                        </TouchableOpacity>
                    </View>
                </View>
            </Header>
            <Content style={{backgroundColor: '#eee'}} >
                <View style={{height: 5}}></View>

                {
                    (this.state.uploading) ?
                    <>
                    <View style={{height: 5}}></View>
                    <View style={{width: '100%', height: 80, backgroundColor: '#fff', padding: 5}}>
                        <Text style={{ paddingLeft: 10 }}>Sedang mengunggah file-file dalam status diproses...</Text>
                        <Text style={{ paddingLeft: 10, fontSize:10, color: '#999' }}>{this.state.uploadStatusText}</Text>
                        <ActivityIndicator size="large" color='#ff0000'></ActivityIndicator>
                    </View><View style={{height: 5}}></View></>: null
                }

                <View style={{width: '100%', height: 80, backgroundColor: '#fff', padding: 15}}>
                    <View style={Style.horizontalLayout}>
                        <Text style={Style.contentTitle}>Target   </Text><Text style={Style.contentSubTitle}>({this.state.uploadedNumber}/{this.state.uploadTarget})</Text>
                    </View>
                    <View style={Style.horizontalLayout}>
                        <Text style={Style.contentLight}>Berakhir pada {this.state.projectEndDate}</Text>
                    </View>
                    
                </View>
                <View style={{height: 15}}></View>
                <View style={{width: '100%', height: 120, backgroundColor: '#fff', padding: 15}}>
                    
                    <View>
                        <Text style={Style.contentTitle}>Status foto</Text>
                    </View>
                    <View style={{height: 10}}></View>
                    <View style={Style.horizontalLayout}>
                        <View style={Style.box4}>
                            <TouchableOpacity onPress={()=> { this.showPhotos('uploaded') }} style={{ alignContent: 'center', alignItems: 'center'}}>
                                <Text style={Style.contentGreen}>Terunggah</Text>
                                <View style={{height: 10}}></View>
                                <Text style={Style.contentTitleGreenBold}>{this.state.uploadedNumber}</Text>
                                {
                                    (this.state.status == "uploaded") ? <View style={{width: '100%', height: 1, backgroundColor: '#666', borderWidth:0}}></View> : null
                                }
                            </TouchableOpacity>
                        </View>
                        <View style={Style.box4}>
                            <TouchableOpacity onPress={()=> { this.showPhotos('processed') }} style={{ alignContent: 'center', alignItems: 'center'}}>
                                <Text style={Style.contentYellow}>Diproses</Text>
                                <View style={{height: 10}}></View>
                                <Text style={Style.contentTitleYellowBold}>{this.state.processedNumber}</Text>
                                {
                                    (this.state.status == "processed") ? <View style={{width: '100%', height: 1, backgroundColor: '#ffff00', borderWidth:0}}></View> : null
                                }
                            </TouchableOpacity>
                        </View>
                        <View style={Style.box4}>
                            <TouchableOpacity onPress={()=> { this.showPhotos('rejected') }} style={{ alignContent: 'center', alignItems: 'center'}}>
                                <Text style={Style.contentRed}>Ditolak</Text>
                                <View style={{height: 10}}></View>
                                <Text style={Style.contentTitleRedBold}>{this.state.rejectedNumber}</Text>
                                {
                                    (this.state.status == "rejected") ? <View style={{width: '100%', height: 1, backgroundColor: '#ff0000', borderWidth:0}}></View> : null
                                }
                            </TouchableOpacity>
                        </View>
                        <View style={Style.box4}>
                            <TouchableOpacity onPress={()=> { this.showPhotos( 'draft') }} style={{ alignContent: 'center', alignItems: 'center'}}>
                                <Text style={Style.content}>Draft</Text>
                                <View style={{height: 10}}></View>
                                <Text style={Style.contentTitleBold}>{this.state.draftNumber}</Text>
                                {
                                    (this.state.status == "draft") ? <View style={{width: '100%', height: 1, backgroundColor: '#666', borderWidth:0}}></View> : null
                                }
                                
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
                <View style={{height: 20}}></View>
                <View style={{width: '100%', height: 400, backgroundColor: '#fff', padding: 20}}>
                    <View style={{height: 30}}>
                        <View style={Style.horizontalLayout}>
                            <View style={{width: '80%'}}><Text style={Style.contentTitle}>Foto Poster {this.state.textStatus}</Text></View>
                            <View style={{width: '20%'}}>
                                <TouchableOpacity onPress={()=>{ this.showAllPoster() }}>
                                    <Text style={Style.contentRedBold}>Lihat semua</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                    <View style={{height: 10}}></View>
                    <ScrollView style={{height: '50%'}} nestedScrollEnabled={true}>
                        {
                            (this.state.showLoading) ? <ActivityIndicator  color="#000" style={{ width: '100%', height: 40 }} size="large"></ActivityIndicator> : null
                        }
                        
                        {
                            (this.state.posterFiles.length == 0) ? 
                            <View style={{width: '100%', height: '100%'}}>
                                <Text style={{marginTop: '30%', fontSize: 16, color: '#999', alignSelf: 'center'}}>
                                    Tidak ada foto poster dengan status {this.state.textStatus}
                                </Text>
                            </View>
                            :
                            null
                        }
                        
                            {
                                
                            this.state.posterFiles.map(function(file) {
                                let filename = file.filename.split("/");
                                filename = filename[filename.length  -1];
                            return (
                            <TouchableOpacity key={file.id} onPress={()=> me.viewImage(file)}>
                                <View style={Style.horizontalLayout} >
                                    <Image style={{ width: 60, height: 60 }} source={{ uri: "file://" + file.filename }}></Image>
                                    <View style={{marginLeft: 20, width: '90%'}}>
                                        <Text style={Style.content}>{file.store_name}</Text>
                                        <Text style={Style.content}>{filename}</Text>
                                        <Text style={Style.content}>Tot. Item: {file.totalItems}</Text>
                                        {
                                            (file.imageStatus == "rejected") ?
                                            <View style={{width: '80%'}}><Text style={Style.contentRed}>Alasan ditolak: {file.rejectedReason}</Text></View>:null
                                        }
                                    </View>
                                </View>
                                <View style={{height: 20}}></View>
                            </TouchableOpacity>

                            )
                            }) }
                        
                        

                    </ScrollView>
                    
                </View>
                <View style={{height: 20}}></View>
                <View style={{width: '100%', height: 400, backgroundColor: '#fff', padding: 20}}>
                    <View style={{height: 30}}>
                        <View style={Style.horizontalLayout}>
                            <View style={{width: '80%'}}><Text style={Style.contentTitle}>Tampak Depan {this.state.textStatus}</Text></View>
                            <View style={{width: '20%'}}>
                                <TouchableOpacity onPress={()=>{ this.showAllStoreFront() }}>
                                    <Text style={Style.contentRedBold}>Lihat semua</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                    <View style={{height: 10}}></View>
                    <ScrollView style={{height: '50%'}} nestedScrollEnabled={true}>
                        {
                            (this.state.showLoading) ? <ActivityIndicator  color="#000" style={{ width: '100%', height: 40 }} size="large"></ActivityIndicator> : null
                        }

                        {
                            (this.state.storeFrontFiles.length == 0) ? 
                            <View style={{width: '100%', height: '100%'}}>
                                <Text style={{marginTop: '30%', fontSize: 16, color: '#999', alignSelf: 'center'}}>
                                    Tidak ada foto tampak depan dengan status {this.state.textStatus}
                                </Text>
                            </View>
                            :
                            null
                        }
                        
                        {
                            this.state.storeFrontFiles.map(function(file) {
                                let filename = file.filename.split("/");
                                filename = filename[filename.length  -1];
                            return (
                            <TouchableOpacity key={file.id} onPress={()=> me.viewImage(file)}>
                                <View style={Style.horizontalLayout} >
                                    <Image style={{ width: 60, height: 60 }} source={{ uri: "file://" + file.filename }}></Image>
                                    <View style={{marginLeft: 20}}>
                                        <Text style={Style.content}>{file.store_name}</Text>
                                        <Text style={Style.content}>{filename}</Text>
                                        <Text style={Style.content}>Tot. Item: {file.totalItems}</Text>
                                        {
                                            (file.imageStatus == "rejected") ?
                                            <View style={{width: '80%'}}><Text style={Style.contentRed}>Alasan ditolak: {file.rejectedReason}</Text></View>:null
                                        }
                                    </View>
                                </View>
                                <View style={{height: 20}}></View>
                            </TouchableOpacity>)
                            }) 
                        }

                        

                    </ScrollView>
                </View>
                <View style={{height: 20}}></View>
                <View style={{width: '100%', height: 400, backgroundColor: '#fff', padding: 20}}>
                    <View style={{height: 30}}>
                        <View style={Style.horizontalLayout}>
                            <View style={{width: '80%'}}><Text style={Style.contentTitle}>Poster A/B {this.state.textStatus}</Text></View>
                            <View style={{width: '20%'}}>
                                <TouchableOpacity onPress={()=>{ this.showAllPosterBeforeAfter() }}>
                                    <Text style={Style.contentRedBold}>Lihat semua</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                    <View style={{height: 10}}></View>
                    <ScrollView style={{height: '50%'}} nestedScrollEnabled={true}>
                        {
                            (this.state.showLoading) ? <ActivityIndicator  color="#000" style={{ width: '100%', height: 40 }} size="large"></ActivityIndicator> : null
                        }

                        {
                            (this.state.posterBeforeAfterFiles.length == 0) ? 
                            <View style={{width: '100%', height: '100%'}}>
                                <Text style={{marginTop: '30%', fontSize: 16, color: '#999', alignSelf: 'center'}}>
                                    Tidak ada foto poster A/B dengan status {this.state.textStatus}
                                </Text>
                            </View>
                            :
                            null
                        }
                        
                        {
                            this.state.posterBeforeAfterFiles.map(function(file) {
                                let filename = file.filename.split("/");
                                filename = filename[filename.length  -1];
                            return (
                            <TouchableOpacity key={file.id} onPress={()=> me.viewImage(file)}>
                                <View style={Style.horizontalLayout} >
                                    <Image style={{ width: 60, height: 60 }} source={{ uri: "file://" + file.filename }}></Image>
                                    <View style={{marginLeft: 20}}>
                                        <Text style={Style.content}>{file.store_name}</Text>
                                        <Text style={Style.content}>{filename}</Text>
                                        <Text style={Style.content}>Tot. Item: {file.totalItems}</Text>
                                        {
                                            (file.imageStatus == "rejected") ?
                                            <View style={{width: '80%'}}><Text style={Style.contentRed}>Alasan ditolak: {file.rejectedReason}</Text></View>:null
                                        }
                                    </View>
                                </View>
                                <View style={{height: 20}}></View>
                            </TouchableOpacity>)
                            }) 
                        }

                        

                    </ScrollView>
                </View>
                <View style={{height: 20}}></View>
                <View style={{width: '100%', height: 400, backgroundColor: '#fff', padding: 20}}>
                    <View style={{height: 30}}>
                        <View style={Style.horizontalLayout}>
                            <View style={{width: '80%'}}><Text style={Style.contentTitle}>Tampak Depan A/B {this.state.textStatus}</Text></View>
                            <View style={{width: '20%'}}>
                                <TouchableOpacity onPress={()=>{ this.showAllStoreFrontBeforeAfter() }}>
                                    <Text style={Style.contentRedBold}>Lihat semua</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                    <View style={{height: 10}}></View>
                    <ScrollView style={{height: '50%'}} nestedScrollEnabled={true}>
                        {
                            (this.state.showLoading) ? <ActivityIndicator  color="#000" style={{ width: '100%', height: 40 }} size="large"></ActivityIndicator> : null
                        }

                        {
                            (this.state.storeFrontBeforeAfterFiles.length == 0) ? 
                            <View style={{width: '100%', height: '100%'}}>
                                <Text style={{marginTop: '30%', fontSize: 16, color: '#999', alignSelf: 'center'}}>
                                    Tidak ada foto tampak depan A/B dengan status {this.state.textStatus}
                                </Text>
                            </View>
                            :
                            null
                        }
                        
                        {
                            this.state.storeFrontBeforeAfterFiles.map(function(file) {
                                let filename = file.filename.split("/");
                                filename = filename[filename.length  -1];
                            return (
                            <TouchableOpacity key={file.id} onPress={()=> me.viewImage(file)}>
                                <View style={Style.horizontalLayout} >
                                    <Image style={{ width: 60, height: 60 }} source={{ uri: "file://" + file.filename }}></Image>
                                    <View style={{marginLeft: 20}}>
                                        <Text style={Style.content}>{file.store_name}</Text>
                                        <Text style={Style.content}>{filename}</Text>
                                        <Text style={Style.content}>Tot. Item: {file.totalItems}</Text>
                                        {
                                            (file.imageStatus == "rejected") ?
                                            <View style={{width: '80%'}}><Text style={Style.contentRed}>Alasan ditolak: {file.rejectedReason}</Text></View>:null
                                        }
                                    </View>
                                </View>
                                <View style={{height: 20}}></View>
                            </TouchableOpacity>)
                            }) 
                        }

                        

                    </ScrollView>
                </View>

                <View style={{height: 20}}></View>
                <View style={{width: '100%', height: 400, backgroundColor: '#fff', padding: 20}}>
                    <View style={{height: 30}}>
                        <View style={Style.horizontalLayout}>
                            <View style={{width: '80%'}}><Text style={Style.contentTitle}>Foto Total Sales {this.state.textStatus}</Text></View>
                            <View style={{width: '20%'}}>
                                <TouchableOpacity onPress={()=>{ this.showAllTotalSales() }}>
                                    <Text style={Style.contentRedBold}>Lihat semua</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                    <View style={{height: 10}}></View>
                    <ScrollView style={{height: '50%'}} nestedScrollEnabled={true}>
                        {
                            (this.state.showLoading) ? <ActivityIndicator  color="#000" style={{ width: '100%', height: 40 }} size="large"></ActivityIndicator> : null
                        }
                        
                        {
                            (this.state.totalSalesFiles.length == 0) ? 
                            <View style={{width: '100%', height: '100%'}}>
                                <Text style={{marginTop: '30%', fontSize: 16, color: '#999', alignSelf: 'center'}}>
                                    Tidak ada foto total sales dengan status {this.state.textStatus}
                                </Text>
                            </View>
                            :
                            null
                        }
                        
                            {
                                
                            this.state.totalSalesFiles.map(function(file) {
                                let filename = file.filename.split("/");
                                filename = filename[filename.length  -1];
                            return (
                            <TouchableOpacity key={file.id} onPress={()=> me.viewImage(file)}>
                                <View style={Style.horizontalLayout} >
                                    <Image style={{ width: 60, height: 60 }} source={{ uri: "file://" + file.filename }}></Image>
                                    <View style={{marginLeft: 20, width: '90%'}}>
                                        <Text style={Style.content}>{file.store_name}</Text>
                                        <Text style={Style.content}>{filename}</Text>
                                        <Text style={Style.content}>Tot. Item: {file.totalItems}</Text>
                                        {
                                            (file.imageStatus == "rejected") ?
                                            <View style={{width: '80%'}}><Text style={Style.contentRed}>Alasan ditolak: {file.rejectedReason}</Text></View>:null
                                        }
                                    </View>
                                </View>
                                <View style={{height: 20}}></View>
                            </TouchableOpacity>

                            )
                            }) }
                        
                        

                    </ScrollView>
                    
                </View>
                <View style={{height: 20}}></View>
                <View style={{width: '100%', height: 400, backgroundColor: '#fff', padding: 20}}>
                    <View style={{height: 30}}>
                        <View style={Style.horizontalLayout}>
                            <View style={{width: '80%'}}><Text style={Style.contentTitle}>Foto Etalase {this.state.textStatus}</Text></View>
                            <View style={{width: '20%'}}>
                                <TouchableOpacity onPress={()=>{ this.showAllEtalase() }}>
                                    <Text style={Style.contentRedBold}>Lihat semua</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                    <View style={{height: 10}}></View>
                    <ScrollView style={{height: '50%'}} nestedScrollEnabled={true}>
                        {
                            (this.state.showLoading) ? <ActivityIndicator  color="#000" style={{ width: '100%', height: 40 }} size="large"></ActivityIndicator> : null
                        }
                        
                        {
                            (this.state.etalaseFiles.length == 0) ? 
                            <View style={{width: '100%', height: '100%'}}>
                                <Text style={{marginTop: '30%', fontSize: 16, color: '#999', alignSelf: 'center'}}>
                                    Tidak ada foto etalase dengan status {this.state.textStatus}
                                </Text>
                            </View>
                            :
                            null
                        }
                        
                            {
                                
                            this.state.etalaseFiles.map(function(file) {
                                let filename = file.filename.split("/");
                                filename = filename[filename.length  -1];
                            return (
                            <TouchableOpacity key={file.id} onPress={()=> me.viewImage(file)}>
                                <View style={Style.horizontalLayout} >
                                    <Image style={{ width: 60, height: 60 }} source={{ uri: "file://" + file.filename }}></Image>
                                    <View style={{marginLeft: 20, width: '90%'}}>
                                        <Text style={Style.content}>{file.store_name}</Text>
                                        <Text style={Style.content}>{filename}</Text>
                                        <Text style={Style.content}>Tot. Item: {file.totalItems}</Text>
                                        {
                                            (file.imageStatus == "rejected") ?
                                            <View style={{width: '80%'}}><Text style={Style.contentRed}>Alasan ditolak: {file.rejectedReason}</Text></View>:null
                                        }
                                    </View>
                                </View>
                                <View style={{height: 20}}></View>
                            </TouchableOpacity>

                            )
                            }) }
                        
                        

                    </ScrollView>
                    
                </View>
                <View style={{height: 20}}></View>

            </Content>

      
                
                {
                    this.getFooter(1)
                }



            </Container>)
    }
}