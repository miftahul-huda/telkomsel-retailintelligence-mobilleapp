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

import Sequelize from "rn-sequelize";
import { TouchableOpacity } from 'react-native-gesture-handler';
import FilePackageItem from './model/FilePackageItem';
import { call } from 'react-native-reanimated';
import { stat } from 'react-native-fs';
import Uploader from './util/Uploader';
import FilePackageSubItem from './model/FilePackageSubItem';
const Op = Sequelize.Op;
import * as RNFS from 'react-native-fs';




export default class ImageHomePage extends SharedPage {
    constructor(props)
    {
        super(props);
        this.state = {
            imageCategoryText: 'Poster',
            shortFilename: '',
            packageItems: [],
            file: props.file,
            packageItmes: [],
            showProgress: false,
            selectedOperator: null,
            effortCounter: 0
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
            me.loadPackageItems();
        });
    
    }

    loadFile(callback)
    {
        console.log("this.state.file");
        console.log(this.state.file);
        //alert(this.state.file.imageStatus)
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
        Actions.reset("homePage");
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
            me.loadPackageItems();
        });
    }

    onSavePosterInfo()
    {
        var me = this;
        this.loadFile(function(){
            me.loadPackageItems();
        });
    }

    addInfo()
    {
        Actions.posterInfoPage({ file: this.state.file, onAfterSave: this.onSavePosterInfo.bind(this) })
    }

    editPackageItem(item)
    {
        if(item.transferPrice == null)
            item.transferPrice = "";
            
        Actions.editPackageItemPage({ mode: "edit", file: this.state.file, item: item, onAfterSaved: this.onSavePackageItem.bind(this), operator: this.state.selectedOperator });
    }

    addPackageItem()
    {
        if(this.state.file.operator == null || this.state.file.operator.trim().length == 0)
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
            Actions.editPackageItemPage({ mode: "add", file: this.state.file, item: item, onAfterSaved: this.onSavePackageItem.bind(this), operator: this.state.selectedOperator });
    

        }
    }

    async loadPackageItems()
    {
        if(this.state.file.isuploaded == 1)
        {
            this.loadRemotePackageItems();
        }
        else
        {
            this.loadLocalPackageItems();
        }
    }

    async loadLocalPackageItems()
    {
        let packageItems = await FilePackageItem.findAll({ where: { upload_file_id: this.state.file.id }});
        this.setState({
            packageItems: packageItems
        })
        return true;
    }

    async loadRemotePackageItems()
    {
        let me = this;
        let id = this.state.file.id;
        let url = GlobalSession.Config.API_HOST + "/filepackageitem/file/" + id;
        console.log(url)
        HttpClient.get(url, function(response){
            
            console.log(response);
            let packageItems = response.payload;

            me.setState({
                packageItems: packageItems
            })
        })

    }

    displayPackageItems()
    {
        return(<View>
            {
                this.state.packageItems.map((packageItem)=>{
                    
                    return(<ListItem key={packageItem.id} style={{ height: 60, flex:1,  flexDirection: 'row'}}>
                        <TouchableOpacity onPress={this.editPackageItem.bind(this, packageItem)}>
                            <Text style={Style.content}>Jenis paket : {packageItem.itemCategoryText}, Besaran: {packageItem.gbmain} GB , Harga Display: {packageItem.price}, Harga Beli/TP : {packageItem.transferPrice}</Text>
                        </TouchableOpacity>
                    </ListItem>)
                })
            }
        </View>)
    }

    async validate()
    {
        if(this.state.packageItems.length == 0)
            return { success: false, message: "Sebelum dapat diproses selanjutnya, mohon lengkapi informasi detail produk."}
        if(this.state.file.operator == null || this.state.file.operator.length == 0)
            return { success: false, message: "Sebelum dapat diproses selanjutnya, mohon isi operator"}
        if(this.state.file.posterType == null || this.state.file.posterType.length == 0)
            return { success: false, message: "Sebelum dapat diproses selanjutnya, mohon isi jenis poster"}
        if(this.state.file.areaPromotion == null || this.state.file.areaPromotion.length == 0)
            return { success: false, message: "Sebelum dapat diproses selanjutnya, mohon isi area promosi"}

        let res = await this.validatePackageSubItems(this.state.packageItems);

        if(res.length > 0)
        {
            return { success: false, message: res[0].message}
        }
        
        return { success: true}
    }

    async validatePackageSubItems(packageItems, callback, callbackError)
    {
        let result = [];

        await Promise.all(
            packageItems.map(async (packageItem)=>{
                let filePackageSubItems = await  FilePackageSubItem.findAll({where: { packageItemId : packageItem.id } });
                
                let subItemQuotaCounter = 0;
                filePackageSubItems.map((subItem)=>{
                    
                    let quotaCategory = subItem.quotaCategory + "";
                    if(subItem.quota == null && quotaCategory.indexOf("unlimited") < 0)
                    {
                        subItemQuotaCounter++;
                    }
                })
                console.log(subItemQuotaCounter);
                if(subItemQuotaCounter >= filePackageSubItems.length)
                {
                    result.push({ success: false, message: "Minimal satu quota sub item atau pilih unlimited untuk paket item " + packageItem.gbmain + " GB diisi."})
                }
            })
        );

        return result;
    }

    async setStatus(status)
    {
        let res = { success: true};
        var me = this;

        if(status == "processed")
            res = await this.validate();

        

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
                                Actions.reset("uploadPage", {imageCategory: "poster", imageStatus: "draft"})
                            }
                        }
                        else
                        {
                            alert("Unggah selesai", "Unggah foto telah berhasil dilakukan")
                            Actions.reset("uploadPage", {imageCategory: "poster", imageStatus: "draft"})
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

            Actions.reset("uploadPage", { imageCategory: "poster", imageStatus: "draft" })
        }
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
            Logging.log(err, "error", "ImageHomePage.uploadToGcs().HttpClient.upload()")
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

            Logging.log(err, "error", "ImageHomePage.callFilter().HttpClient.post() : url : " + url + ", data : " + JSON.stringify(data))
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

            Logging.log(err, "error", "ImageHomePage.callOperatorFilter().HttpClient.post() : url : " + url + ", data : " + JSON.stringify(data))
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
            //let tempid = me.getMaxTempId();
            items.forEach(async function(item, idx){
                let package_name = "GB_Main";
                let gb = item["GB_Main"];
                if(item["GB_Main"] != "not found")
                {
                    let itempackage = { itemCategory: 'paket', itemCategoryText: 'Paket', gbmain: gb, price: "" + item["Price"], upload_file_id: me.state.file.id}
                    await FilePackageItem.create(itempackage);
                    //packages.push(itempackage);
                }
            })




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
        me.callOperatorFilter(me, uri, async function(operators){

            console.log("operators")
            console.log(operators)
            if(operators != null && operators.length > 0)
            {
                let resop = operators[0];
    
                if(resop != null)
                {

                    await UploadedFile.update({ operator: resop, operatorText: resop.toUpperCase() }, {where:{ id: me.state.file.id }})

                    console.log("Autofill Result Operator")
                    console.log(resop)

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
                        me.loadFile(function(){
                            me.loadPackageItems();
                        })

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
        this.state.effortCounter = 0;
        Actions.selectOrientationPage({ onSelectOrientation: this.autofillNext.bind(this)  })

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

                    let filePackageItems = await FilePackageItem.findAll({ where: { upload_file_id: me.state.file.id }  });
                    let ids = this.getFilePackageItemIds(filePackageItems);

                    await FilePackageSubItem.destroy({ where: { packageItemId: ids } });
                    await FilePackageItem.destroy({ where: { upload_file_id: me.state.file.id }  })
                    await UploadedFile.destroy({ where: { id: me.state.file.id } })
                    try { await RNFS.unlink(me.state.file.filename) } catch (e) {}
                    try { await RNFS.unlink(me.state.file.compressed_filename) } catch (e) {}
                    alert("Data telah dihapus")
                    Actions.reset("uploadPage", { imageCategory: "poster", imageStatus: "draft" })

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
        let botHeight = 240;
        if(this.state.showIndicator)
            opacity = 0.3;
        
        if(this.state.file != null)
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
                                <TouchableOpacity onPress={this.addInfo.bind(this)}>
                                    <Text style={Style.contentRedBold}>Edit</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                        
                        <View style={{height: 10}}></View>
                        <View style={Style.horizontalLayout}>
                        {
                            (this.state.file.operator != null) ?
                                <View>
                                    <View style={Style.horizontalLayout}>
                                        <View style={{width: '50%', height:25}}>
                                            <Text style={Style.content}>Operator</Text> 
                                        </View>
                                        <View style={{width: '10%'}}>
                                            <Text style={Style.content}>:</Text> 
                                        </View>
                                        <Text style={Style.content}>{this.state.file.operatorText}</Text> 
                                    </View>
                                    <View style={Style.horizontalLayout}>
                                        <View style={{width: '50%', height: 25}}>
                                            <Text style={Style.content}>Jenis Poster</Text> 
                                        </View>
                                        <View style={{width: '10%'}}>
                                            <Text style={Style.content}>:</Text> 
                                        </View>
                                        <Text style={Style.content}>{this.state.file.posterTypeText}</Text> 
                                    </View>
                                    <View style={Style.horizontalLayout}>
                                        <View style={{width: '50%', height: 25}}>
                                            <Text style={Style.content}>Area Promosi</Text> 
                                        </View>
                                        <View style={{width: '10%'}}>
                                            <Text style={Style.content}>:</Text> 
                                        </View>
                                        <Text style={Style.content}>{this.state.file.areaPromotionText}</Text> 
                                    </View>
                                    <View style={Style.horizontalLayout}>
                                        <View style={{width: '50%', height: 25}}>
                                            <Text style={Style.content}>Tema</Text> 
                                        </View>
                                        <View style={{width: '10%'}}>
                                            <Text style={Style.content}>:</Text> 
                                        </View>
                                        <Text style={Style.content}>{this.state.file.posterTheme}</Text> 
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
                                <TouchableOpacity onPress={this.addPackageItem.bind(this)}>
                                    <Text style={Style.contentRedBold}>Tambah</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                        
                        <View style={{height: 10}}></View>
                        <View style={Style.horizontalLayout}>
                            {
                                (this.state.packageItems.length == 0) ? <Text style={Style.contentLight}>Belum ada detail produk</Text>
                                :
                                this.displayPackageItems()
                            }
                            
                        </View>
                    </View>

                    <View style={{height: 15}}></View>
                    <View style={{width: '100%', height: 'auto', backgroundColor: '#fff', padding: 20}}>
                        <Text style={Style.contentTitle}>Status</Text>
                        <Text style={Style.content}>{Util.getImageStatus(this.state.file.imageStatus)}</Text>
                    </View>
                    <View style={{height: 15}}></View>
                    
                    <View style={{height: 45}}></View>
                    
                </Content>

                    {
                        //this.getFooter(1)
                    }
                    <Footer style={{height: botHeight, backgroundColor:'#fff', borderColor: '#eee', borderWidth: 2}}>
                    {(this.state.showProgress) ? <ActivityIndicator size="large" color="#FF0000"></ActivityIndicator>
                    :
                    <View style={{backgroundColor: '#fff', padding: '5%'}}>
                    {
                        (this.state.file.imageStatus != "processed" && this.state.file.imageStatus != "uploaded") ?
                            <>
                                
                                    <Button style={Style.buttonDark} onPress={()=>this.autofill()}>
                                        <View style={{ alignItems: 'center', width: '100%' }}>
                                            <Text style={Style.textWhite}>Isi otomatis</Text>
                                        </View>
                                    </Button>
                                    <View style={{height: 2}}></View>
                                    <Button style={Style.buttonRed} onPress={()=>this.setStatus("processed")}>
                                        <View style={{ alignItems: 'center', width: '100%' }}>
                                            <Text style={Style.textWhite}>Selesai dan unggah</Text>
                                        </View>
                                    </Button>
                                    <View style={{height: 2}}></View>
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
                                        </View> : null }
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