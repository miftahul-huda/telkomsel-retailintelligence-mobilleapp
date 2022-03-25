import React, { Component } from 'react';
import { Container, Content, Text, Card, Header, Footer, Body, Button, Title, 
  List,
  ListItem,
  Left,
  Item, CardItem, Icon, View } from 'native-base';

import { Image, ImageBackground, ScrollView, ActivityIndicator, ActionSheetIOS} from 'react-native';
import { Actions } from 'react-native-router-flux';

import UploadedFile from './model/UploadedFile';
import TotalSales from './model/TotalSales';
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
const Op = Sequelize.Op;



export default class ImageHomeTotalSalesPage extends SharedPage {
    constructor(props)
    {
        super(props);
        this.state = {
            imageCategoryText: 'Total Sales',
            shortFilename: '',
            file: props.file,
            showIndicator: false,
            operators: [],
            selectedOperator: null,
            totalSales: {},
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
            me.loadTotalSales().then((totalSales)=>{
                console.log("componentDidMount")
                console.log(totalSales)
                if(totalSales == null)
                    totalSales = {}
                me.setState({
                    totalSales: totalSales
                })
            })
        });
    
    }

    async loadTotalSales()
    {
        if(this.state.file.isuploaded == 1)
            return this.loadRemoteTotalSales();
        else
            return this.loadLocalTotalSales();
    }

    async loadRemoteTotalSales()
    {        
        let id = this.state.file.id;
        let url = GlobalSession.Config.API_HOST + "/totalsales/file/" + id;
        console.log(url)
        HttpClient.get(url, function(response){
            
            console.log(response);
            let packageItems = response.payload;

            me.setState({
                etalaseItems: packageItems
            })
        })

    }

    async loadLocalTotalSales()
    {
        let promise = new Promise(async(resolve, reject)=>{
            let totalSales = await TotalSales.findOne({ where: { upload_file_id : this.state.file.id } })
            console.log("loadTotalSales")
            console.log(totalSales)
            resolve(totalSales);
        })

        return promise;
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


    onSaveTotalSales(totalSales)
    {
        var me = this;
        console.log("totalSales")
        console.log(totalSales)

        this.setState({
            totalSales: totalSales
        })
    }

    addInfo()
    {
        Actions.editTotalSalesPage({ file: this.state.file, totalSales: this.state.totalSales, onAfterSaved: this.onSaveTotalSales.bind(this) })
    }


    saveRemote()
    {
        console.log("========================here================")
        let result = this.validate();
        if(result.success == false)
            this.showDialog("Tidak valid", result.message)
        else
        {
            let file = JSON.stringify(this.state.file)
            
            let totalSales = JSON.stringify(this.state.totalSales)
            file = JSON.parse(file)
            totalSales = JSON.parse(totalSales)
            file.totalSales = [totalSales];
            file.imageCategory = "total-sales"

            this.setState({
                showIndicator: true
            })
            Uploader.uploadFile(file.filename, "total-sales").then((result) => {
                console.log("Done upload file")
                Uploader.uploadFileInfo(file).then((result)=>{

                    console.log("saveRemote()")
                    console.log(result)
                    this.setState({
                        showIndicator: false
                    })
                    //this.showDialog("Success", "Simpan informasi berhasil")

                    UploadedFile.destroy({where:{ id: file.id }})
                    TotalSales.destroy({where:{ upload_file_id: file.id }})

                    Actions.reset("homePage")
                })

            }).catch((err)=>{
                this.showDialog("error", "Upload gambar gagal")
            })
        }
    }

    validate()
    {
        let result = { success: true }
        if(this.state.totalSales.kartuPerdana == null || this.state.totalSales.kartuPerdana.length == 0)
            result = { success: false, message: 'Kartu perdana tidak boleh kosong' }
        if(this.state.totalSales.voucherFisik == null || this.state.totalSales.voucherFisik.length == 0)
            result = { success: false, message: 'Voucher fisik tidak boleh kosong' }
        if(this.state.totalSales.isiUlang == null || this.state.totalSales.isiUlang.length == 0)
            result = { success: false, message: 'Isi ulang tidak boleh kosong' }
        if(this.state.totalSales.paketPalingBanyakDibeli == null || this.state.totalSales.paketPalingBanyakDibeli.length == 0)
            result = { success: false, message: 'Paket paling banyak dibeli tidak boleh kosong' }

        return result;
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
                                Actions.reset("uploadPage", {imageCategory: "total-sales", imageStatus: "draft"})
                            }
                        }
                        else
                        {
                            alert("Unggah selesai", "Unggah foto telah berhasil dilakukan")
                            Actions.reset("homePage")
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

            Actions.reset("uploadPage", { imageCategory: "total-sales", imageStatus: "draft" })
        }
    }


    getTotalSalesInfoDisplay()
    {
        return(<View>
                <View style={Style.horizontalLayout}>
                    <View style={{width: '60%', height:25}}>
                        <Text style={Style.content}>Kartu Perdana</Text> 
                    </View>
                    <View style={{width: '10%'}}>
                        <Text style={Style.content}>:</Text> 
                    </View>
                    <Text style={Style.content}>{this.state.totalSales.kartuPerdana}</Text> 
                </View>
                <View style={Style.horizontalLayout}>
                    <View style={{width: '60%', height:25}}>
                        <Text style={Style.content}>Voucher Fisik</Text> 
                    </View>
                    <View style={{width: '10%'}}>
                        <Text style={Style.content}>:</Text> 
                    </View>
                    <Text style={Style.content}>{this.state.totalSales.voucherFisik}</Text> 
                </View>
                <View style={Style.horizontalLayout}>
                    <View style={{width: '60%', height:25}}>
                        <Text style={Style.content}>Isi Ulang</Text> 
                    </View>
                    <View style={{width: '10%'}}>
                        <Text style={Style.content}>:</Text> 
                    </View>
                    <Text style={Style.content}>{this.state.totalSales.isiUlang}</Text> 
                </View>
                <View style={Style.horizontalLayout}>
                    <View style={{width: '60%', height:25}}>
                        <Text style={Style.content}>Paket paling banyak dibeli</Text> 
                    </View>
                    <View style={{width: '10%'}}>
                        <Text style={Style.content}>:</Text> 
                    </View>
                    <Text style={Style.content}>{this.state.totalSales.paketPalingBanyakDibeli}</Text> 
                </View>
                
        </View>)
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
                            <Title style={Style.headerTitle}>Lengkapi informasi gambar</Title>
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
                                <Text style={Style.contentTitle}>Informasi Umum</Text>
                                <LabelInput text="" subtext="Informasi umum keseluruhan."></LabelInput>

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
                            (this.state.totalSales.kartuPerdana != null) ?
                                this.getTotalSalesInfoDisplay()
                                :
                                <Text style={Style.contentLight}>Belum ada informasi konten</Text>
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