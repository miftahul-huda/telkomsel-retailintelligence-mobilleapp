import React, { Component } from 'react';
import { Container, Content, Text, Card, Header, Footer, Body, Button, Title, 
  List,
  ListItem,
  Left,
  Item, CardItem, Icon, View, ActionSheet } from 'native-base';

import { Image, ImageBackground, ScrollView, LogBox } from 'react-native';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { Actions } from 'react-native-router-flux';
import GlobalSession from './GlobalSession';
import UploadedFile from './model/UploadedFile';
import Style from './style';
import Dialog, { DialogFooter, DialogButton, DialogContent } from 'react-native-popup-dialog';
import WebView from 'react-native-webview';

export default class SharedPage extends Component {
    constructor(props)
    {
        super(props)
        this.state = {
            showDialog: false,
            dialogLink: null,
            dialogContent: '',
            dialogTitle: '',
            dialogType: '',
            dialogHeight: 400,
            dialogWidth: 400,
        }
        LogBox.ignoreLogs(['Warning: ...']);
    }

    home()
    {
        //Actions.popTo("homePage")
        Actions.reset("homePage");
        //Actions.homePage();
    }


    camera()
    {
        Actions.reset("takePicturePage")

        //Actions.takePicturePage();
    }

    profile()
    {
        Actions.reset("profilePage")
    }

    closeDialog()
    {
        this.setState({
            showDialog: false
        })
    }

    showDialog(title, content)
    {
        this.setState({
            showDialog: true,
            dialogContent: content,
            dialogTitle: title,
            dialogType: '',
            dialogWidth: 350,
            dialogHeight: 150,
        })
    }

    onShowInfo(link)
    {
        link = GlobalSession.Config.HELP_BASE_URL + "/" + link;
        this.setState({
            showDialog: true,
            dialogLink: link,
            dialogType: 'web',
            dialogHeight: 400,
            dialogWidth: 400,
        })
    }

    getDialog()
    {
        return(
            <View style={{width: '100%'}}>
                <Dialog
                    visible={this.state.showDialog}
                    footer={
                    <DialogFooter>

                        <DialogButton
                        text="OK"
                        onPress={() => {this.closeDialog()}}
                        />
                    </DialogFooter>
                    }>
                    <DialogContent style={{width: this.state.dialogWidth, height: this.state.dialogHeight}}>
                        {
                            (this.state.dialogType == "web") ?
                        
                                <WebView source={{ uri: this.state.dialogLink}}>
                                </WebView>
                                :
                                <View style={{height: 'auto'}}>
                                    <View style={{padding: 20, height: 20}}><Text style={{ fontWeight: 'bold', fontSize: 20 }}>{this.state.dialogTitle}</Text></View>
                                    <View style={{height: 10}}></View>
                                    <View style={{padding: 20}}><Text style={Style.content}>{this.state.dialogContent}</Text></View>
                                </View>
                        }
                    </DialogContent>
                </Dialog>
            </View>
        )
    }

    getCameraMenu()
    {
        return(<View style={{width: 60, height:60, position: 'absolute', left: '45%', top: '89%', zIndex: 1000000}}>
                <Image source={require("./images/camera2.png")} style={{width:'100%', height:'100%', opacity: 0.8}} size="large" resizeMode="contain"></Image>
            </View>);
    }


    photoList()
    {
        Actions.uploadPage({ imageCategory: "poster", imageStatus: "draft" })
    }


    getFooter(idx=null)
    {
        let imageColor1 = require("./images/home.png");
        let textStyle1 = Style.contentLight;
        let imageColor2 = require("./images/imagelist.png");
        let textStyle2 = Style.contentLight;
        let imageColor3 = require("./images/profile.png");
        let textStyle3 = Style.contentLight;

        if(idx == 1)
        {
            imageColor1 = require("./images/home-red.png");
            textStyle1 = Style.contentRedBold;
        }

        if(idx == 2)
        {
            imageColor2 = require("./images/imagelist-red.png");
            textStyle2 = Style.contentRedBold;
        }

        if(idx == 3)
        {
            imageColor3 = require("./images/profile-red.png");
            textStyle3 = Style.contentRedBold;
        }
            
        

        return(
        <>
        <View style={{ position: 'absolute', left: '45%', top: '89%', elevation: 1000000, opacity: 0.8, zIndex: 100000}}>
            <TouchableOpacity onPress={this.camera.bind(this)}>
                <View style={{alignContent: 'center', alignItems: 'center'}}>
                    <Image source={require("./images/camera2.png")} resizeMode="contain" style={{width: 60, height: 60}}></Image>
                    <View style={{height: 5}}></View>
                    <Text style={Style.contentLight}>Ambil Data</Text>
                </View>
            </TouchableOpacity>
        </View>
        <Footer style={Style.footer}><TouchableOpacity onPress={this.home.bind(this)}>
        <View>
            <View style={{alignItems: 'center'}}>
                <Image source={imageColor1}  style={{ width: 24, height: 24}} resizeMode='contain'/>
            </View>
            <View style={{height: 5}}></View>
            <View style={{alignItems: 'center'}}>
                <Text style={textStyle1}>Beranda</Text>
            </View>
        </View>
        </TouchableOpacity>
        <View style={{width: '40%'}}  />
        <TouchableOpacity style={{display:'none'}} onPress={this.photoList.bind(this)}>
            <View >
                <View style={{alignItems: 'center'}}>
                    <Image source={imageColor2} style={{ width: 24, height: 24}} resizeMode='contain'></Image>
                </View>
                <View style={{height: 5}}></View>
                <View style={{alignItems: 'center'}}>
                    <Text style={textStyle2}>Daftar Foto</Text>
                </View>
            </View>
        </TouchableOpacity>
        <View style={{width: '20%'}}  />
        <TouchableOpacity onPress={this.profile.bind(this)} >
            <View>
                <View style={{alignItems: 'center'}}>
                    <Image source={imageColor3} style={{ width: 24, height: 24}} resizeMode='contain' />
                </View>
                <View style={{height: 5}}></View>
                <View style={{alignItems: 'center'}}>
                    <Text style={textStyle3}>Profil</Text>
                </View>
            </View>
        </TouchableOpacity></Footer>
        </>);

    }
}