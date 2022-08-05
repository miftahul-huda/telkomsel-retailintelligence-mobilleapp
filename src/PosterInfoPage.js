import React, { Component } from 'react';
import { Dimensions } from 'react-native';
import { Container, Content, Text, Card, Header, Footer, Body, Title, 
  List,
  ListItem,
  Left,
  Item, CardItem, Icon, Button, CheckBox, Right, Radio, ActionSheet } from 'native-base';


import { Image, View, ScrollView, TouchableOpacity, Alert, ActivityIndicator, ImageBackground, TextInput } from 'react-native';
import { Actions } from 'react-native-router-flux';
import UploadedFile from './model/UploadedFile';
import FilePackageItem from './model/FilePackageItem';
import FilePackageSubItem from './model/FilePackageSubItem';
import DropDownPicker from 'react-native-dropdown-picker';
import SharedPage from './SharedPage';
import OptionButtons from './components/OptionButtons';

import Config from './config.json';
import HttpClient from './util/HttpClient';
GlobalSession = require( './GlobalSession');

import * as SQLite from "expo-sqlite";
import Sequelize from "rn-sequelize";
const Op = Sequelize.Op;
const Model = Sequelize.Model;

import Logging from './util/Logging';
import Style from './style';
import Util from './util/Util';
import { call } from 'react-native-reanimated';

export default class PosterInfoPage extends SharedPage
{
    constructor(props)
    {
        super(props);
        this.state = {
            ...this.state,
            imageCategoryText: 'Poster',
            shortFilename: '',
            file: props.file,
            packageItems: [],
            operators: [{ value: 'telkomsel', label: 'Telkomsel' }],
            selectedOperatorValue: 'telkomsel'
            
        }

        console.log("construcgor")
        console.log(this.state.file)

        /*
        if(this.state.file.posterType == null)
        {
            this.state.file.posterType = "product";
            this.state.file.posterTypeText = "Product";
        }
        */

        /*if(this.state.file.areaPromotion == null)
        {
            this.state.file.areaPromotion = "local";
            this.state.file.areaPromotionText = "Local";
        }*/

    }

    componentDidMount()
    {
        let me = this;
        let filename = this.state.file.filename;

        filename = filename.split("/");
        filename = filename[filename.length - 1];
        this.state.shortFilename = filename;

        Util.getOperators().then((operators)=>{

            me.displayOperators(operators, function(ops){
                
                me.loadFile(function(file){

                    console.log("Operators")
                    console.log(ops);

                    me.setState({
                        operators: ops,
                        file: file,
                        selectedOperatorValue: file.operator
                    })

                })
            });

        })

        this.setState({
            shortFilename: filename
        })

        
    }

    loadFile(callback)
    {
        if(this.state.file.isuploaded ==  1)
        {
            this.loadRemoteFile(callback);
        }
        else
        {
            this.loadLocalFile(callback)
        }
    }

    loadLocalFile(callback)
    {
        
        let id = this.state.file.id;
        UploadedFile.findOne({ where: { id: id }}).then((file)=>{
            console.log("loadedfile");
            console.log(file);
            if(callback != null)
                callback(file);
            return true;
        }).catch((err)=>{
            console.log("Error")
        })
    }

    loadRemoteFile(callback)
    {
       
        let id = this.state.file.id;
        let me  = this;
        let url = GlobalSession.Config.API_HOST + '/uploadfile/get/'  + id;
        console.log(url);

        HttpClient.get(url, function(response){
            let file = response.payload;
            console.log("loadedfile");
            console.log(file);
            if(file.operator == null || file.operator.length == 0 || file.operatorText == null || file.operatorText.length == 0)
            {
                file.operator = me.state.operators[0].value;
                file.operatorText = me.state.operators[0].label;
            }
            if(callback != null)
                callback(file);
        })
    }

    displayOperators(operators, callback)
    {
        let ops=[];
        operators.forEach((operator)=>{
            ops.push({ value: operator.operator_value, label: operator.operator_name })
        })

        console.log(ops)
        if(callback != null)
            callback(ops)

    }

    viewImage(){
        let file = this.props.file;
        this.state.selectedFile = file;

        Actions.viewImagePage({ editMode:true, file: file, onSaveCropImage: Util.onSaveCropImage.bind(this) })
    }


    selectPosterType(item)
    {
        this.state.file.posterType = item.value;
        this.state.file.posterTypeText = item.label;

        this.setState({
            file: this.state.file
        })
        
    }

    selectPromotionArea(item)
    {
        this.state.file.areaPromotion = item.value;
        this.state.file.areaPromotionText = item.label;

        this.setState({
            ...this.state,
            file: this.state.file
        })
    }

    onOperatorChanged(item)
    {
        this.state.file.operator = item.value;
        this.state.file.operatorText = item.label;
        
        this.setState({
            ...this.state,
            file: this.state.file,
            selectedOperatorValue: this.state.file.operator
        })
    }

    savePoster()
    {
        let res = this.validate();
        
        if(res.success)
        {
            if(this.state.file.isuploaded == 1)
            {
                this.saveRemotePoster();
            }
            else
            {
                this.saveLocalPoster();
            }
        }
        else
        {

            this.showDialog("Pengisian kurang lengkap", res.message);
        }

    }


    saveRemotePoster()
    {
        let me = this;
        let f = JSON.stringify(this.state.file);
        f = JSON.parse(f);

        let url = GlobalSession.Config.API_HOST + "/uploadfile/update/" + this.state.file.id;
        HttpClient.post(url, f, function(response){
            console.log(response)
            console.log("Saved")
            

            if(me.props.onAfterSave != null)
                me.props.onAfterSave()

            Actions.pop();
        })
    }

    saveLocalPoster()
    {
        let me  = this;
        let f = JSON.stringify(this.state.file);
        f = JSON.parse(f);

        UploadedFile.update(f, { where: { id: this.state.file.id } }).then(()=>{
            console.log("Saved")
            //console.log(me.state.file);
            Actions.pop();

            //me.loadFile()
            if(this.props.onAfterSave != null)
                this.props.onAfterSave()
            return true
            
        }).catch((err)=>{
            console.log("Error")
        })

    }

    back()
    {
        Actions.pop();
    }

    setPosterTheme(value)
    {
        this.state.file.posterTheme = value;
        this.setState({
            file: this.state.file
        })
    }

    validate()
    {
        let result = { success: true }
        result = (this.state.file.posterType == null || this.state.file.posterType.length == 0) ? { success: false, message: "Mohon memilih jenis poster" } : result;
        result = (this.state.file.operator == null || this.state.file.operator.length == 0) ? { success: false, message: "Mohon memilih operator yang tertera di poster" } : result;
        result = (this.state.file.areaPromotion == null || this.state.file.areaPromotion.length == 0) ? { success: false, message: "Mohon mengisi area promosi" } : result;
        return result;
    }

    render()
    {
        var me = this;


        return(
            <Container>
            <Header style={{backgroundColor: '#FFF'}}>
                <View  style={Style.headerHorizontalLayout}>
                        <TouchableOpacity onPress={()=> me.back()}>
                            <Image style={Style.headerImage} resizeMode='contain' source={require('./images/back-dark.png')}></Image>
                        </TouchableOpacity>
                        <View style={{width: 10}}></View>
                        <Title style={Style.headerTitle}>Perbarui Informasi Poster</Title>
                </View>
            </Header>
            <Content style={{backgroundColor: '#eee'}} >
                {
                    this.getDialog()
                }
                <View style={{height: 5}}></View>   
                <View style={{width: '100%', height: 100, backgroundColor: '#fff', padding: 20}}>
                    <View style={Style.horizontalLayout}>
                        <Image source={{ uri: 'file://' + this.props.file.filename }} style={Style.contentImage} resizeMode='contain' ></Image>
                        <View style={{width: 10}}></View>
                        <View style={{width: '70%'}}>
                            <Text style={Style.content}>{this.state.shortFilename}</Text>
                            <View style={{height: 5}}></View>
                            <Text style={Style.content}>{this.props.file.picture_taken_date}</Text>
                        </View>

                        <TouchableOpacity onPress={() => this.viewImage()}>
                            <Text style={Style.contentRedBold}>
                                Lihat
                            </Text>
                        </TouchableOpacity>
                    </View>
                    
                </View>
                <View style={{height: 15}}></View>
                <View style={{width: '100%', height: 150, backgroundColor: '#fff', padding: 20}}>
                    <View style={{height: 40}}>
                        <Text style={Style.contentTitle}>Tipe Poster</Text>
                        <View style={{height: 10}}></View>
                        <Text style={Style.contentLight}>Jenis Poster *</Text>
                    </View>
                    <View style={{ height: 20}}></View>

                        <OptionButtons items={[{ label: 'Produk', value: 'product' }, { label: 'Promosi', value: 'promo' }]}
                        selectedValue={this.state.file.posterType}
                        onSelectItem={this.selectPosterType.bind(this)}></OptionButtons>

                </View>
                <View style={{height: 15}}></View>
                <View style={{width: '100%', height: 'auto', backgroundColor: '#fff', padding: 20}}>
                
                    <Text style={Style.contentTitle}>
                        Informasi Umum
                    </Text>
                    
                    <View style={{height: 100}}>
                        <View style={{height: 20}}></View>
                        <Text style={Style.content}>Operator</Text>
                        
                        <View style={{height: 5}}></View>
                        <DropDownPicker
                            items={this.state.operators}
                            defaultValue={this.state.selectedOperatorValue}
                            containerStyle={{height: 50}}
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
                            zIndex={1000}
                        />
                    </View>
                    <View style={{ height: 20}}></View>

                    <Text style={Style.content}>Area Promosi</Text>
                    <View style={{ height: 10}}></View>
                    <OptionButtons items={[{ label: 'Lokal', value: 'local' }, { label: 'Nasional', value: 'national' }]}
                        selectedValue={this.state.file.areaPromotion}
                        onSelectItem={this.selectPromotionArea.bind(this)}></OptionButtons>

                    
                    <View style={{ height: 20}}></View>
                    <View>
                        <Text style={Style.content}>Tema Promosi</Text>
                        <View style={{height: 5}}></View>
                        <TextInput style={Style.textInput} value={this.state.file.posterTheme} onChangeText={this.setPosterTheme.bind(this)}></TextInput>

                    </View>

                </View>
                <View style={{height: 15}}></View>
                
                
            </Content>
                {
                    //this.getFooter(1)
                }
                <Footer style={{height: 150, backgroundColor:'#fff', borderColor: '#eee', borderWidth: 2}}>
                    <View style={{padding: '5%', backgroundColor: '#ffffff'}}>
                        <Button style={Style.buttonRed} onPress={()=>this.savePoster()}>
                            <View style={{ alignItems: 'center', width: '100%' }}>
                                <Text style={Style.textWhite}>Perbarui</Text>
                            </View>
                        </Button>
                        <Button style={Style.button} onPress={()=>this.back()}>
                                <View style={{ alignItems: 'center', width: '100%' }}>
                                    <Text style={Style.textDark}>Batal</Text>
                                </View>
                        </Button>
                    </View>
                </Footer>

            </Container>
        );
    }
}