import React, { Component } from 'react';
import { Dimensions } from 'react-native';
import { Container, Content, Text, Card, Header, Footer, Body, Title, 
  List,
  ListItem,
  Left,
  Item, CardItem, Icon, Button } from 'native-base';

import { Image, View, ScrollView, TouchableOpacity, Alert,ActivityIndicator, BackHandler } from 'react-native';
import { Actions } from 'react-native-router-flux';
import UploadedFile from './model/UploadedFile';
import * as RNFS from 'react-native-fs';
import SharedPage from './SharedPage';
import Style from './style';
import Config from './config.json'
import HttpClient from './util/HttpClient'
GlobalSession = require( './GlobalSession');

export default class ViewImagePage extends SharedPage {
    constructor(props) {
        super(props);
        this.state = {
            imgWidth: 0,
            imgHeight: 0,
            file: this.props.file,
            showIndicator: false,
            finish: null,
            filename: this.props.file.filename
        }
    }



    componentDidMount(){
        if(this.props.file.uploaded_filename  != null && this.props.file.uploaded_filename.length > 0)
        {
            this.state.filename = this.props.file.uploaded_filename.replace("gs://", "https://storage.googleapis.com/");
        }
        else {
            this.state.filename = "file://" + this.props.file.filename;
        }   

        this.setState({
            filename: this.state.filename
        })

        console.log(this.state.filename)
    }

    reload()
    {

    }

    onSaveCropImage(res)
    {
        this.props.onSaveCropImage(res, this.props.file);
    }

    crop()
    {
        var me = this;
        Actions.imageCropperPage( { file: this.props.file,  filename: 'file://' + this.props.file.filename, onSaveImage: me.onSaveCropImage.bind(this) });
    }

    finish()
    {

    }


    addInfo(value){
        if(value)
        {
            if(this.state.file.imageCategory == "poster")
                Actions.imageInfoPage({ mode: "edit", file: this.state.file  });
            else
                Actions.imageInfoStoreFrontPage({ mode: "edit", file: this.state.file  })
        }
        else
        {
            if(this.state.file.imageCategory == "poster")
                Actions.imageInfoPage({ mode: "view", file: this.state.file })
            else
                Actions.imageInfoStoreFrontPage({ mode: "view", file: this.state.file  })
        }

    }


    getCurrentDate(){
        var date = new Date();
        var dateString = date.getFullYear() + "-" + (date.getMonth()  + 1) + "-" + date.getDate();
        dateString += " " + date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds();
        return dateString;
    }


    back()
    {
        Actions.pop();
    }

    undo(){

    }

    setImageDimension(view)
    {
        var me  = this;
        const windowWidth = Dimensions.get('window').width;

        //if(me.props.file.uploaded_filename == null || me.props.file.uploaded_filename.length == 0)
        //{
            Image.getSize(this.state.filename, (w, h) => {

                let ratio = w/h;
                let vw = view.width * 2;


                let vh = vw / ratio;

                me.setState({ ...this.state,
                    imgWidth : vw,
                    imgHeight : vh
                })
            } );
        //}
    }

    render() {

        return(
            <Container>
              <Header style={{backgroundColor: '#FFF'}}>
                <Body>
                  <View style={Style.headerHorizontalLayout}>
                    <TouchableOpacity onPress={()=> this.back()} >
                        <Image style={Style.headerImage} source={require('./images/back-dark.png')} resizeMode='contain'></Image>
                    </TouchableOpacity>
                    <View style={{width: 10}}></View>
                    <Title style={Style.headerTitle}>Edit file</Title>
                  </View>
                </Body>
              </Header>
  
              <Content style={{ flex:1, backgroundColor: '#000000' }} >
              
                <View style={{ flex:1, marginTop: '30%', backgroundColor: '#000', height:'100%', justifyContent: 'center',
                        alignItems: 'center', flexDirection: 'column' }} onLayout={(event) => {
                        var viewRes = event.nativeEvent.layout;
                        this.setImageDimension(viewRes);
                    }} >

                    { (this.state.showIndicator) ? 
                    <ActivityIndicator color="#fff" size="large" /> : <></>
                    }
                    <Image style={{ flex:1, width: this.state.imgWidth * 50/100, height: this.state.imgHeight * 50/100 }} resizeMode='contain' source={{ uri: this.state.filename}} ></Image>  
                    
                </View>
                
                

              </Content>
              <Footer style={{backgroundColor: '#FFF', padding: '3%', display: 'none'}}>
                  { (this.props.editMode) ?
                  <>
                  <TouchableOpacity onPress={this.crop.bind(this)} >
                      <Image source={require('./images/crop.png')} />
                  </TouchableOpacity>
                  <View style={{width: '15%'}}  />
                  <TouchableOpacity onPress={this.addInfo.bind(this, true)}>
                      <Image source={require('./images/upload.png')} />
                  </TouchableOpacity>
                  </>
                  : <TouchableOpacity onPress={this.addInfo.bind(this, false)}>
                        <Image source={require('./images/info.png')} />
                    </TouchableOpacity> }
                      
              </Footer>
            </Container>
          );
    }
}