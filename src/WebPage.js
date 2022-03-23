import React, { Component } from 'react';
import { Dimensions, ImageBackground,StyleSheet } from 'react-native';
import { Container, Content, Text, Card, Header, Footer, Body, Title, 
  List,
  ListItem,
  Left,
  Item, CardItem, Icon, Button } from 'native-base';


import { Image, View, ScrollView, TouchableOpacity, Alert } from 'react-native';
import WebView  from 'react-native-webview';
import { Actions } from 'react-native-router-flux';
import UploadedFile from './model/UploadedFile';
import FilePackageItem from './model/FilePackageItem';
import StoreFrontItem from './model/StoreFrontItem';
import DropDownPicker from 'react-native-dropdown-picker';

import Config from './config.json';
import HttpClient from './util/HttpClient';
GlobalSession = require( './GlobalSession');

import * as RNFS from 'react-native-fs';

import Sequelize from "rn-sequelize";
const Op = Sequelize.Op;
const Model = Sequelize.Model;

import Logging from './util/Logging';

import BackupRestoreLogic from './actions/BackupRestoreLogic';
import Style from './style';
import SharedPage from './SharedPage';
import LabelInput from './components/LabelInput';
import Pdf from 'react-native-pdf';

const styles = StyleSheet.create({
    container: {
        flex: 0,
        justifyContent: 'flex-start',
        alignItems: 'center',
        marginTop: 0,
        borderWidth:2,
        
    },
    pdf: {
        flex:0,
        width:Dimensions.get('window').width,
        height:Dimensions.get('window').height,
        borderWidth:1
    }
});


export default class WebPage extends SharedPage
{
    constructor(props)
    {
        super(props);
        this.state.prev = "<<";
        this.state.next = ">>";
        this.pdf = null;
        this.state.curPage = 1;

        this.state.totalPages = 1;
    }

    next()
    {
        this.state.curPage = this.state.curPage + 1;
        if(this.state.curPage == this.state.totalPages)
            this.state.curPage = this.state.totalPages;

        this.pdf.setPage(this.state.curPage);
    }

    prev()
    {
        this.state.curPage = this.state.curPage - 1;
        if(this.state.curPage == 0)
            this.state.curPage = 1;

        this.pdf.setPage(this.state.curPage);
    }

    render()
    {
        let h = Dimensions.get('window').height;
        console.log(h);

        return(
            <Container>
            <Header style={{backgroundColor: '#FFF'}}>
                <View  style={Style.headerHorizontalLayout}>
                        <Image style={Style.headerImage} resizeMode='contain' source={require('./images/pdf.png')}></Image>
                        <View style={{width: 10}}></View>
                        <Title style={Style.headerTitle}>{this.props.title}</Title>
                </View>
            </Header>
            <Content  style={{backgroundColor: '#eee', height: 4000}}>
                {(this.props.type != "pdf") ?
                <View style={{height:h}}>
                    <WebView style={{width: '100%', borderWidth: 1}}
                        source={{
                            uri: this.props.url
                        }}
                        
                    />
                </View>
                :
                <View style={{ height: 1000, borderWidth: 0}}>
                    
                        <View  style={{height: 50, borderWidth:0}}>
                            <View style={Style.horizontalLayout}>
                                <TouchableOpacity onPress={this.prev.bind(this)} style={{width:'50%', marginTop: '2%', alignContent: 'center', alignItems:'center'}}>
                                    <View >
                                        <Text>{this.state.prev}</Text>
                                    </View>
                                </TouchableOpacity>
                                <TouchableOpacity onPress={this.next.bind(this)} style={{width:'50%', marginTop: '2%', alignContent: 'center', alignItems:'center'}}>
                                    <View >
                                        <Text>{this.state.next}</Text>
                                    </View>
                                </TouchableOpacity>
                            </View>

                        </View>
                        <View style={styles.container}>
                            <Pdf
                            ref={(pdf) => { this.pdf = pdf; }} 
                            singlePage={true}
                            source={{ uri: this.props.url}} 
                            onPageSingleTap={()=>{ alert("sd")}}
                            onLoadComplete={(numberOfPages,filePath)=>{
                                this.state.totalPages = numberOfPages;
                                console.log(`number of pages: ${numberOfPages}`);
                            }}
                            onPageChanged={(page,numberOfPages)=>{
                                console.log(`current page: ${page}`);
                            }}
                            onError={(error)=>{
                                console.log(error);
                            }}
                            onPressLink={(uri)=>{
                                console.log(`Link presse: ${uri}`)
                            }}
                            style={styles.pdf}/></View>
                        
                    </View>
                
                }

            </Content>
            <Footer style={Style.footer}>
                {
                  this.getFooter(3)
                }
            </Footer>
            </Container>
        )
    }
}