import React, { Component } from 'react';
import { Image, ActivityIndicator, PermissionsAndroid, ImageBackground } from 'react-native';
import { Container, Content, Text, Card, Header, Body, Button, Title, 
  CardItem, Left, View, Item, Input, Form, Label } from 'native-base';
import { Actions } from 'react-native-router-flux';

import Config from './config.json';
import HttpClient from './util/HttpClient';

import * as SQLite from "expo-sqlite";
import Sequelize from "rn-sequelize";

import UploadedFile from './model/UploadedFile';
import FilePackageItem from './model/FilePackageItem';
import FilePackageSubItem from './model/FilePackageSubItem';
import StoreFrontItem from './model/StoreFrontItem';

import * as RNFS from 'react-native-fs';

import Logging from './util/Logging';
import BackupRestoreLogic from './actions/BackupRestoreLogic';
import { TouchableOpacity } from 'react-native';
import WebView from 'react-native-webview';

export default class FirstPage extends Component {
    constructor(props)
    {
        super(props)
    }

    componentDidMount()
    {
        setTimeout(function(){
            Actions.pop();
            Actions.loginPage();
        }, 1000)
    }

    render()
    {
        return(<Container>
            <Content>
                <View style={{alignItems: 'center'}}>
                    <Image source={require('./images/logo.png')} style={{ width:'50%', marginTop: '70%' }} resizeMode="contain"></Image>
                    <Text style={{marginTop: '40%'}}>Version {Config.VERSION}</Text>
                    <Text style={{marginTop: '40%', color: '#ccc'}}>{'\u00A9'} Copyright Market & Intelligence Team 2021</Text>
                    <Text style={{marginTop: '2%', color: '#ccc'}}>&#174; All rights reserved Telkomsel</Text>
                </View>
            </Content>
        </Container>);
    }
}