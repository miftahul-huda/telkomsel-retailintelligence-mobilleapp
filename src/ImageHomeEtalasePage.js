import React, { Component } from 'react';
import { Container, Content, Text, Card, Header, Footer, Body, Button, Title, 
  List,
  ListItem,
  Left,
  Item, CardItem, Icon, View } from 'native-base';

import { Image, ImageBackground, ScrollView, ActivityIndicator, ActionSheetIOS, Alert} from 'react-native';
import { Actions } from 'react-native-router-flux';

import UploadedFile from './model/UploadedFile';
import Style from './style';
import SharedPage from './SharedPage';
import LabelInput from './components/LabelInput';

import Logging from './util/Logging';
import GlobalSession from './GlobalSession';
import HttpClient from './util/HttpClient';
import Util from './util/Util'
import Uploader from './util/Uploader';

import Sequelize from "rn-sequelize";
import { TouchableOpacity } from 'react-native-gesture-handler';
import EtalaseItem from './model/EtalaseItem';
import { flushSync } from 'react-dom';
import { RNFetchBlobStat } from 'rn-fetch-blob';
const Op = Sequelize.Op;
import * as RNFS from 'react-native-fs';




export default class ImageHomeEtalasePage extends SharedPage {
    constructor(props)
    {
        super(props);
        this.state = {
            imageCategoryText: 'Etalase',
            shortFilename: '',
            packageItems: [],
            file: props.file,
            etalaseItems: [],
            showIndicator: false,
            showButtons: false,
            operators: [],
            selectedOperator: null
        }
    }

    componentDidMount()
    {
        var me = this;

        let filename = this.props.file.filename;

        filename = filename.split("/");
        filename = filename[filename.length - 1];
        this.state.shortFilename = filename;

        this.setState({
            shortFilename: filename
        })

        this.loadFile(function(){
            me.loadEtalaseItems(me);
        });
    
    }

    loadFile(callback)
    {
        console.log(this.state.file);
        if(this.state.file.isuploaded == 1)
        {
            console.log("loadremotefile")
            this.loadRemoteFile(callback)
        }
        else
        {
            this.loadLocalFile(callback)
        }
    }

    //Load file from local storage
    loadLocalFile(callback)
    {
        let id = this.state.file.id;
        UploadedFile.findByPk(id).then((file)=>{
            console.log("loadedfile");
            console.log(file);
            this.setState({
                file: file
            })

            if(callback != null)
                callback(file);
            
            return true;

        }).catch((err)=>{
            console.log("Error")
        })
    }

    //Load file from remote storage
    loadRemoteFile(callback)
    {
        let me = this;
        let id = this.state.file.id;
        let url = GlobalSession.Config.API_HOST + "/uploadfile/get/" + id;
        console.log(url)
        HttpClient.get(url, function(response){
            let file = response.payload;

            console.log("loadedfile");
            console.log(file);
            me.setState({
                file: file
            })

            if(callback != null)
                callback(file);
        })
    }

    back()
    {
        //Actions.pop();
        Actions.reset("homePage")
    }

    viewImage(){
        let file = this.props.file;
        this.state.selectedFile = file;

        Actions.viewImagePage({ editMode:true, file: file, onSaveCropImage: Util.onSaveCropImage.bind(this) })
    }

    onSavePackageItem(item)
    {
        var me = this;
        this.loadFile(function(){
            me.loadEtalaseItems(me);
        });
    }

    onSavePosterInfo()
    {
        var me = this;
        this.loadFile(function(){
            me.loadEtalaseItems(me);
        });
    }

    addInfo()
    {
        Actions.etalaseInfoPage({ file: this.state.file, onAfterSave: this.onSavePosterInfo.bind(this) })
    }

    onSaveEtalaseItem(item)
    {
        //alert("haoi")
        var me = this;
        this.loadFile(function(){
            me.loadEtalaseItems(me);
        });       
    }

    editEtalaseItem(item)
    {
        console.log("item")
        console.log(item);

        Actions.editEtalaseItemPage({ mode: "edit", file: this.state.file, item: item, onAfterSaved: this.onSaveEtalaseItem.bind(this), operator: this.state.selectedOperator });
    }

    addEtalaseItem()
    {
        if(this.state.etalaseItems == null)
            this.state.etalaseItems = [];

        let max =  Util.makeid(10);

        let item = { id:null, percentage: '', productHero: '', package_name: '', price: '', transferPrice: '', validity: '', gbmain: '', tempid: max };
        Actions.editEtalaseItemPage({ mode: "add", file: this.state.file, item: item, onAfterSaved: this.onSaveEtalaseItem.bind(this), operator: this.state.selectedOperator });
    }

    async loadEtalaseItems(me, callback)
    {
        if(this.state.file.isuploaded)
            this.loadRemoteEtalaseItems(this);
        else
            this.loadLocalEtalaseItems(this, callback);
    }

    async loadLocalEtalaseItems(me, callback)
    {
        try
        {
            let etalaseItems = await EtalaseItem.findAll({ where: { upload_file_id: me.state.file.id }});
            console.log("etalaseItems")
            console.log(etalaseItems)
            this.setState({
                etalaseItems: etalaseItems
            })

            if(callback != null)
                callback()
            return true;
        }
        catch(err)
        {
            console.log(err)
        }

    }

    async loadRemoteEtalaseItems(me)
    {
        let id = this.state.file.id;
        let url = GlobalSession.Config.API_HOST + "/etalaseitem/file/" + id;
        console.log(url)
        HttpClient.get(url, function(response){
            
            console.log(response);
            let packageItems = response.payload;

            me.setState({
                etalaseItems: packageItems
            })
        })

    }

    validate()
    {
        let res = {success: true}
        res = (this.state.etalaseItems == null || this.state.etalaseItems.length == 0) ? {success:false, message:"Mohon dilengkapi informasi detail produk."} : res;
        return res;
    }

    async setStatus(status)
    {
        let res = { success: true};
        var me = this;

        if(status == "processed")
            res = this.validate();
        

        if(status == "processed" && res.success)
        {
            this.state.file.imageStatus = status;
            await UploadedFile.update({ imageStatus: status }, {where: { id: this.state.file.id}});
            this.setState({
                file: this.state.file,
                showProgress: true
            })


            Uploader.START_UPLOAD = 1;
            Uploader.UPLOAD_STATUS = "";

            Uploader.callback = function()
            {

                setTimeout(function(){
                    me.loadFile(function(){
                        if(me.state.file != null)
                        {
                            if(me.state.file.imageStatus == "rejected")
                            {
                                me.showDialog("Upload gagal", me.state.file.rejectedReason)
                            }
                            else
                            {
                                Actions.reset("uploadPage", {imageCategory: "etalase", imageStatus: "draft"})
                            }
                        }
                        else
                        {
                            alert("Unggah selesai", "Unggah foto telah berhasil dilakukan")
                            Actions.reset("uploadPage", {imageCategory: "etalase", imageStatus: "draft"})
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
            this.state.file.imageStatus = status;
            await UploadedFile.update({ imageStatus: status }, {where: { id: this.state.file.id}});
            this.setState({
                file: this.state.file
            })

            Actions.reset("uploadPage", { imageCategory: "etalase", imageStatus: "draft" })
        }
    }

    displayEtalaseItems()
    {
        /*
        return(<View>
            {
                this.state.etalaseItems.map((etalaseItem)=>{
                    
                    return(<ListItem key={etalaseItem.id} style={{ height: 80, flex:1,  flexDirection: 'row'}}>
                        <TouchableOpacity onPress={this.editEtalaseItem.bind(this, etalaseItem)}>
                            <Text style={Style.content}>{etalaseItem.operatorText.toUpperCase()}</Text> 
                            <Text style={Style.content}>Availability: {etalaseItem.percentage} %</Text>
                            <Text style={Style.content}>Visibility: {etalaseItem.visibility_percentage} %</Text>
                        </TouchableOpacity>
                    </ListItem>)
                })
            }
        </View>)
        */

        
        return(<View>
            <View>
                <Image source={require('./images/checked-green.png')} style={{width: 60, height: 60, resizeMode: 'stretch', alignSelf: 'center'}}></Image>
            </View>
            <View style={{height: 20}}>

            </View>
            <View>
                <Text>Informasi AV-Index Berhasil diambil. Data sudah bisa diunggah.</Text>
            </View>
        </View>)
        
    }

    getEtalaseInfoDisplay()
    {
        
        return(<View>
                <View style={Style.horizontalLayout}>
                    <View style={{width: '60%', height:25}}>
                        <Text style={Style.content}>Operator dominan</Text> 
                    </View>
                    <View style={{width: '10%'}}>
                        <Text style={Style.content}>:</Text> 
                    </View>
                    <Text style={Style.content}>{this.state.file.operatorDominantText}</Text> 
                </View>
                
        </View>)
        

        /*
        return(<View>
            <View>
                <Image source={require('./images/checked-green.png')} style={{width: 60, height: 60, resizeMode: 'stretch', alignSelf: 'center'}}></Image>
            </View>
            <View style={{height: 20}}>

            </View>
            <View>
                <Text>Informasi operator dominan berhasil diambil. Data sudah bisa diunggah.</Text>
            </View>
        </View>)
        */
    }

    callOperatorFilter(me, uri,  callback, callbackError){
        var url = GlobalSession.Config.API_HOST_ETALASE_DOMINANT_OPERATOR;
        uri = uri.replace("https://storage.googleapis.com/", 'gs://')

        
        let fname = uri.split('/').pop()
        let dest = uri.replace("gs://", "")
        dest = uri.replace(fname, "");
        var data = { image_gcs_path: uri, destination_gcs_path: dest }

        console.log("Foto to analyze")
        console.log(uri)

        console.log("Operator Filter")
        console.log(url);
        console.log(data);

        let authorizationHeader = { 'Authorization': 'Bearer ' +  GlobalSession.Config.API_HOST_ETALASE_DOMINANT_OPERATOR_KEY}
        console.log("Authorization key : ")
        console.log(GlobalSession.Config.API_HOST_ETALASE_DOMINANT_OPERATOR_KEY)

        HttpClient.post(url, data, function(res){

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
            console.log("Retrieve operator error 2")
            console.log(err);
            if(callbackError != null)
                callbackError(me, uri);
            Logging.log(err, "error", "ImageInfoEtalasePage.callOperatorFilter().HttpClient.post() " + uri)
        }, authorizationHeader);
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

    callVisibilityScoring(me, uri, etalaseItems, callback, callbackError)
    {
        var url = GlobalSession.Config.API_HOST_ETALASE_VISIBILITY_SCORE;
        uri = uri.replace("https://storage.googleapis.com/", 'gs://')

        let fname = uri.split('/').pop()
        let dest = uri.replace("gs://", "")
        dest = uri.replace(fname, "");
        var data = { image_gcs_path: uri, destination_gcs_path: dest }

        console.log("Foto to analyze")
        console.log(uri)

        console.log("Visibility Filter")
        console.log(url);
        console.log(data);

        let authorizationHeader = { 'Authorization': 'Bearer ' +  GlobalSession.Config.API_HOST_ETALASE_VISIBILITY_SCORE_KEY}
        console.log("Authorization key : ")
        console.log(GlobalSession.Config.API_HOST_ETALASE_VISIBILITY_SCORE_KEY)

        HttpClient.post(url, data, function(res){

            console.log("RESULT VISIBILITY SCORE")
            console.log(res.payload)

            if(res.success)
            {

                let operators = res.payload.operators;
                operators.map((op)=>{
                    etalaseItems.map((item)=>{
                        if(item.operator == op.operator)
                        {
                            item.visibility_percentage = op.total_point;
                            item.visibility_score = op.score;
                            item.original_visibility_percentage = op.total_point;
                            item.original_visibility_score = op.score;
                        }
                    })
                })

                if(callback !=null)
                    callback(etalaseItems);
            }
            else
            {
                console.log("Retrieve visibility score error")
                console.log(res.error);
                if(callbackError != null)
                    callbackError(me, res.error);
            }


            
        }, function(err){
            console.log("Retrieve operator error 2")
            console.log(err);
            if(callbackError != null)
                callbackError(me, uri);
            Logging.log(err, "error", "ImageInfoEtalasePage.callOperatorFilter().HttpClient.post() " + uri)
        }, authorizationHeader);
    }

    autoRetrieveOperator(me, uri, callback, callbackError)
    {
        console.log("autoretrieve operator")
        var me = this;
        me.callOperatorFilter(me, uri, async function(payload){

            let operators = payload.operators;

            console.log("operators")
            console.log(operators)

            if(operators != null && operators.length > 0)
            {
                let etalaseItems = [];
                let largestOp = me.getTheLargestCoverageOperator(me, operators);
                console.log(largestOp)

                await EtalaseItem.destroy({where: { upload_file_id: me.state.file.id }})

                operators.map(async (operator)=>{

                    let max =  Util.makeid(10);
                    if(operator.percentage > 0)
                    {
                        let item = { id:null, operator: operator.operator.toLowerCase(), operatorText: operator.operatorText , percentage: operator.percentage, availability_score: operator.score,  tempid: max };
                        item.upload_file_id = me.state.file.id;
                        item.originalOperator = operator.operator.toLowerCase();
                        item.originalOperatorText  = operator.operatorText;
                        item.original_availability_percentage = operator.percentage;
                        item.original_availability_score = operator.score;
                        etalaseItems.push(item);
                        //await EtalaseItem.create(item);
                    }
                })
                await UploadedFile.update({ operatorDominant: largestOp.operator.toLowerCase(), operatorDominantText: largestOp.operatorText, originalOperatorDominant: largestOp.operator.toLowerCase(), originalOperatorDominantText: largestOp.operatorText },
                {where:{id: me.state.file.id } })

                me.callVisibilityScoring(me, uri, etalaseItems, async function(newEtalaseItems){

                    let idx = 0;
                    newEtalaseItems.map((item)=>{
                        if(item.visibility_score == null)
                        {
                            newEtalaseItems.splice(idx, 1)
                        }
                        idx++;
                    })

                    console.log("NEW ETALASE ITEMS")
                    console.log(newEtalaseItems)

                    await EtalaseItem.bulkCreate(newEtalaseItems);
                    me.loadFile(function(){
                        me.loadEtalaseItems(me);
                        me.state.effortCounter = 0;
                        if(callback != null)
                            callback();
                    })
                })

            }

            me.state.effortCounter = 0;
            //if(callback != null)
            //    callback();

        }, function(me, uri){
            //alert("Foto tidak dapat dibaca. Mohon ambil foto yang valid.")
            if(callbackError != null)
                callbackError();
        })
    }

    uploadToGcs(orientation, callback, callbackError)
    {
        var url = GlobalSession.Config.API_HOST_UPLOAD + "/upload/gcs/" + GlobalSession.Config.TEMPORARY_UPLOAD_PATH;
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
            
                Logging.log(err, "error", "ImageInfoEtalasePage.uploadToGcs().HttpClient.upload()")

            
        });
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
                        alert("Extrak operator gagal. Sepertinya foto sulit dibaca. Mohon ambil ulang foto yang lebih baik. ");
                    })

            }, 100);
        }, function(err){
            me.setState({
                showIndicator: false
            })
            let sError = JSON.stringify(err);
            alert("Upload error "  + sError);
            Logging.log(err, "error", "ImageInfoEtalasePage.autofill().me.uploadToGcs()")
        });
    }

    async delete()
    {
        var me = this;
        Alert.alert("Konfirmasi hapus", "Data akan dihapus, apakah anda yakin?", [
            {
                text:  "Ya",
                onPress: async ()=>{

                    await EtalaseItem.destroy({ where: { upload_file_id: me.state.file.id }  })
                    await UploadedFile.destroy({ where: { id: me.state.file.id } })
                    try { await RNFS.unlink(me.state.file.filename) } catch (e) {}
                    try { await RNFS.unlink(me.state.file.compressed_filename) } catch (e) {}
                    alert("Data telah dihapus")
                    Actions.reset("uploadPage", { imageCategory: "etalase", imageStatus: "draft" })

                }
            },
            {
                text: "Tidak"
            }
        ])
    }


    viewUploadHistory(imageCategory)
    {
        Actions.uploadHistoryPage({  imageCategory: imageCategory })
    }

    isCloseToBottom({ layoutMeasurement, contentOffset, contentSize }) 
    {
        return layoutMeasurement.height + contentOffset.y >= contentSize.height - 1;
    }

    render()
    {
        var me = this;
        let opacity = 1;
        let botHeight = 240;

        

        if(this.state.showIndicator)
            opacity = 0.3;

        if(me.state.file != null)
        {
            console.log(me.state.file.imageStatus)
            console.log(me.state.showProgress)
            
            if(me.state.file.imageStatus == "uploaded")
                botHeight = 100;

            
            return(
                <Container>
                <Header style={{backgroundColor: '#FFF'}}>
                    <View  style={Style.headerHorizontalLayout}>
                            <TouchableOpacity onPress={()=> me.back()}>
                                <Image style={Style.headerImage} resizeMode='contain' source={require('./images/back-dark.png')}></Image>
                            </TouchableOpacity>
                            <View style={{width: 10}}></View>
                            <Title style={Style.headerTitle}>Lengkapi gambar etalase</Title>
                    </View>
                </Header>
                <Content style={{backgroundColor: '#eee', opacity: opacity}}  onScroll={({ nativeEvent }) => {
                    if (this.isCloseToBottom(nativeEvent)) {
                        //console.warn("Reached end of page");
                        this.setState({
                            ...this.state,
                            showButtons: true
                        })
                    }
                    else
                    {
                        this.setState({
                            ...this.state,
                            showButtons: false
                        })
                    }
                }}>
                    {
                        this.getDialog()
                    }
                    <View style={{height: 5}}></View>
                    <View style={{width: '100%', height: 100, backgroundColor: '#fff', padding: 20}}>
                        
                            <Text style={Style.contentTitle}>Outlet</Text>
                            <View style={{height: 10}}></View>
                            <Text style={Style.content}>{this.props.file.store_name}</Text>
                    </View>
                    <View style={{height: 15}}></View>
                    <View style={{width: '100%', height: 100, backgroundColor: '#fff', padding: 20}}>
                        <View style={Style.horizontalLayout}>
                            <View style={{width: '95%', flex:1, flexDirection: 'row'}}>
                                <View style={{marginTop: -10}}>
                                    <Image source={{ uri: 'file://' + this.props.file.filename }} style={Style.contentImage} resizeMode='contain' ></Image>
                                </View>
                                <View style={{width: 10}}></View>
                                <View style={{width: '70%'}}>
                                    <Text style={Style.content}>{this.state.shortFilename}</Text>
                                    <View style={{height: 5}}></View>
                                    <Text style={Style.content}>{this.props.file.picture_taken_date}</Text>
                                </View>
                            </View>

                            <TouchableOpacity onPress={() => this.viewImage()}>
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
                                <Text style={Style.contentTitle}>Operator paling dominan</Text>
                                <LabelInput text="" subtext="Informasi operator paling dominan. Tekan 'Isi Otomatis' untuk mengisinya."></LabelInput>

                            </View>
                            <View>
                                <TouchableOpacity onPress={this.addInfo.bind(this)}>
                                    <Text style={Style.contentRedBold}>Edit</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                        
                        <View style={{height: 10}}></View>
                        <View style={Style.horizontalLayout}>
                        {
                            (this.state.file.operatorDominant != null) ?
                                this.getEtalaseInfoDisplay()
                                :
                                <Text style={Style.contentLight}>Belum ada informasi konten</Text>
                        }
                            
                        </View>

                    </View>
                    <View style={{height: 15}}></View>
                    <View style={{width: '100%', height: 'auto', backgroundColor: '#fff', padding: 20}}>
                        {
                                (this.state.showIndicator) ? <ActivityIndicator size="large" color="#ff0000"></ActivityIndicator> : null
                        }
                        <View style={Style.horizontalLayout}>
                            <View style={{width: '85%'}}>
                                <Text style={Style.contentTitle}>Daftar operator dan visibility/availability-nya</Text>
                                <LabelInput text="" subtext="Daftar item-item paket yang ada di etalase. Tekan 'Isi Otomatis' untuk mengisi item"></LabelInput>
                            </View>
                            <View>
                                <TouchableOpacity style={{display: 'none'}} onPress={this.addEtalaseItem.bind(this)}>
                                    <Text style={Style.contentRedBold}>Tambah</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                        
                        <View style={{height: 10}}></View>
                        <View style={Style.horizontalLayout}>
                            {
                                (this.state.etalaseItems == null || this.state.etalaseItems.length == 0) ? <Text style={Style.contentLight}>Belum ada detail produk</Text>
                                :
                                this.displayEtalaseItems()
                            }
                            
                        </View>

                    </View>

                    <View style={{height: 15}}></View>
                    <View style={{width: '100%', height: 'auto', backgroundColor: '#fff', padding: 20}}>
                        <Text style={Style.contentTitle}>Status</Text>
                        <Text style={Style.content}>{Util.getImageStatus(this.state.file.imageStatus)}</Text>
                    </View>

                    <View style={{height: 45}}></View>
                    
                    
                </Content>

                    {
                        //this.getFooter(1)
                    }

                <Footer style={{height: botHeight, backgroundColor:'#fff', borderColor: '#eee', borderWidth: 2}}>
                {(this.state.showProgress) ? <ActivityIndicator size="large" color="#FF0000"></ActivityIndicator>
                        :
                        <View style={{backgroundColor: '#fff', height: 600, padding: '5%'}}>
                        {
                            (this.state.file.imageStatus != "processed" && this.state.file.imageStatus != "uploaded") ?
                            <>
                                    <Button style={Style.buttonDark} onPress={()=>this.autofill()}>
                                        <View style={{ alignItems: 'center', width: '100%' }}>
                                            <Text style={Style.textWhite}>Isi otomatis</Text>
                                        </View>
                                    </Button>
                                    <View style={{height: 5}}></View>
                                    <Button style={Style.buttonRed} onPress={()=>this.setStatus("processed")}>
                                        <View style={{ alignItems: 'center', width: '100%' }}>
                                            <Text style={Style.textWhite}>Selesai dan unggah</Text>
                                        </View>
                                    </Button>
                                    <View style={{height: 5}}></View>
                                    <Button style={Style.button} onPress={()=>this.setStatus("draft")}>
                                        <View style={{ alignItems: 'center', width: '100%' }}>
                                            <Text style={Style.textDark}>Simpan sebagai draft</Text>
                                        </View>
                                    </Button>
                                    <View style={{height: 5}}></View>
                                    <Button style={Style.button} onPress={()=>this.delete()}>
                                        <View style={{ alignItems: 'center', width: '100%' }}>
                                            <Text style={Style.textDark}>Hapus</Text>
                                        </View>
                                    </Button>
                                
                                </> :  (this.state.file.imageStatus == "processed") ? 
                                        <View>
                                            <Button style={Style.button} onPress={()=>this.setStatus("draft")}>
                                                <View style={{ alignItems: 'center', width: '100%' }}>
                                                    <Text style={Style.textDark}>Simpan sebagai draft</Text>
                                                </View>
                                            </Button>
                                        </View> 
                                        : 
                                        <View>
                                            <Button style={Style.button} onPress={()=>this.viewUploadHistory("etalase")}>
                                                <View style={{ alignItems: 'center', width: '100%' }}>
                                                    <Text style={Style.textDark}>Kembali ke daftar unggah</Text>
                                                </View>
                                            </Button>
                                        </View> 
                        }
                        </View>
                }
                </Footer> 
                </Container>
            );
        }
        else
            return <></>;
    }

}