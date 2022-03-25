import React, { Component } from 'react';
import { Container, Content, Text, Card, Header, Footer, Body, Button, Title, 
  List,
  ListItem,
  Left,
  Item, CardItem, Icon, View } from 'native-base';

import { Image, ImageBackground, ScrollView, ActivityIndicator, ActionSheetIOS} from 'react-native';
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
const Op = Sequelize.Op;



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

    async loadEtalaseItems(me)
    {
        if(this.state.file.isuploaded)
            this.loadRemoteEtalaseItems(this);
        else
            this.loadLocalEtalaseItems(this);
    }

    async loadLocalEtalaseItems(me)
    {
        try
        {
            let etalaseItems = await EtalaseItem.findAll({ where: { upload_file_id: me.state.file.id }});
            console.log("etalaseItems")
            console.log(etalaseItems)
            this.setState({
                etalaseItems: etalaseItems
            })
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
        return(<View>
            {
                this.state.etalaseItems.map((etalaseItem)=>{
                    
                    return(<ListItem key={etalaseItem.id} style={{ height: 60, flex:1,  flexDirection: 'row'}}>
                        <TouchableOpacity onPress={this.editEtalaseItem.bind(this, etalaseItem)}>
                            <Text style={Style.content}>Operator : {etalaseItem.operatorText}, Persentase : {etalaseItem.percentage}%</Text>
                        </TouchableOpacity>
                    </ListItem>)
                })
            }
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
                    console.log(operator)
                    let max =  Util.makeid(10);
                    if(operator.percentage > 0)
                    {
                        let item = { id:null, operator: operator.operator.toLowerCase(), operatorText: operator.operatorText , percentage: operator.percentage,  tempid: max };
                        item.upload_file_id = me.state.file.id;
                        etalaseItems.push(item);
                        await EtalaseItem.create(item);
                    }
                })
                await UploadedFile.update({ operatorDominant: largestOp.operator.toLowerCase(), operatorDominantText: largestOp.operatorText },
                {where:{id: me.state.file.id } })

                me.loadFile(function(){
                    me.loadEtalaseItems(me);
                })
                

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
                    callbackError();
                me.state.effortCounter = 0;
            }
        })
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
                        alert("Extrak operator gagal. Mohon isi manual.");
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

    render()
    {
        var me = this;
        let opacity = 1;
        let botHeight = 200;

        

        if(this.state.showIndicator)
            opacity = 0.3;

        if(me.state.file != null)
        {
            
            if(me.state.file.imageStatus == "uploaded")
                botHeight = 1;

            
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
                <Content style={{backgroundColor: '#eee', opacity: opacity}} >
                    {
                        this.getDialog()
                    }
                    <View style={{height: 5}}></View>
                    <View style={{width: '100%', height: 100, backgroundColor: '#fff', padding: 20}}>
                        
                            <Text style={Style.contentTitle}>Outlet</Text>
                            <View style={{height: 10}}></View>
                            <Text style={Style.content}>{this.props.file.store_name}</Text>
                            {
                                (this.state.showIndicator) ? <ActivityIndicator size="large" color="#ff0000"></ActivityIndicator> : null
                            }
                        
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
                                    Edit
                                </Text>
                            </TouchableOpacity>
                        </View>
                        
                    </View>
                    <View style={{height: 15}}></View>
                    <View style={{width: '100%', height: 'auto', backgroundColor: '#fff', padding: 20}}>
                        
                        <View style={Style.horizontalLayout}>
                            <View style={{width: '95%'}}>
                                <Text style={Style.contentTitle}>Informasi Umum {this.state.imageCategoryText}</Text>
                                <LabelInput text="" subtext="Informasi umum keseluruhan tampak depan."></LabelInput>

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
                        
                        <View style={Style.horizontalLayout}>
                            <View style={{width: '85%'}}>
                                <Text style={Style.contentTitle}>Detail Produk</Text>
                                <LabelInput text="" subtext="Daftar item-item paket yang ada di etalase. Tekan tambah untuk menambahkan item. Tekan item untuk merubah atau menghapus."></LabelInput>
                            </View>
                            <View>
                                <TouchableOpacity onPress={this.addEtalaseItem.bind(this)}>
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
                        <View style={{backgroundColor: '#fff', height: 300, padding: '5%'}}>
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
                                
                                </> :  (this.state.file.imageStatus == "processed") ? 
                                        <View>
                                            <Button style={Style.button} onPress={()=>this.setStatus("draft")}>
                                                <View style={{ alignItems: 'center', width: '100%' }}>
                                                    <Text style={Style.textDark}>Simpan sebagai draft</Text>
                                                </View>
                                            </Button>
                                        </View> : null 
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