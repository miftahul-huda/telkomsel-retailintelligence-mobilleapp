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
import LabelInput from './components/LabelInput';

export default class EtalaseInfoPage extends SharedPage
{
    constructor(props)
    {
        super(props);
        this.state = {
            ...this.state,
            imageCategoryText: 'Etalase',
            shortFilename: '',
            file: props.file,
            packageItems: [],
            operators: [{ value: 'telkomsel', label: 'Telkomsel' }],
            selectedOperatorValue: 'telkomsel',
            categories: [{ label: 'Akuisisi', value: 'acquisition' }, { label: 'Voucher', value: 'voucher' }]
            
        }

    }

    setProductHero(value){

        this.state.file.productHero = value;

        this.setState({
            ...this.state,
            file: this.state.file
            
        })
    }

    setProductHeroQuota(value){

        this.state.file.productHeroQuota = value;

        this.setState({
            ...this.state,
            file: this.state.file
            
        })
    }

    setProductHeroPrice(value){
        this.state.file.productHeroPrice = value;
        this.setState({
            ...this.state,
            file: this.state.file
            
        })
    }

    setProductHeroTransferPrice(value){
        this.state.file.productHeroTransferPrice = value;
        this.setState({
            ...this.state,
            file: this.state.file
            
        })
    }

    setProdutHeroValidity(value){
        this.state.file.productHeroValidity = value;
        this.setState({
            ...this.state,
            file: this.state.file
            
        })
    }

    setProductHeroTransferPrice(value){
        this.state.file.productHeroTransferPrice = value;
        this.setState({
            ...this.state,
            file: this.state.file
            
        })
    }

    setProductHeroCampaignTheme(value){
        this.state.file.productHeroTheme = value;
        this.setState({
            ...this.state,
            file: this.state.file
            
        })
    }

    onProductHeroCategoryChange(item)
    {
        this.state.file.productHeroCategory = item.value;
        this.setState({
            ...this.state,
            file: this.state.file
            
        })        
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

                    me.setState({
                        operators: ops,
                        file: file,
                        selectedOperatorValue: file.operatorDominant
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
            if(file.operatorDominant == null || file.operatorDominant.length == 0 || file.operatorDominantText == null || file.operatorDominantText.length == 0)
            {
                file.operatorDominant = me.state.operators[0].value;
                file.operatorDominantText = me.state.operators[0].label;
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



    onOperatorChanged(item)
    {
        this.state.file.operatorDominant = item.value;
        this.state.file.operatorDominantText = item.label;
        
        this.setState({
            ...this.state,
            file: this.state.file,
            selectedOperatorValue: this.state.file.operatorDominant
        })
    }


    saveEtalase()
    {
        let res = this.validate();
        if(res.success)
        {
            if(this.state.file.isuploaded)
                this.saveRemoteEtalase();
            else
                this.saveLocalEtalase();

        }
        else
        {
            this.showDialog("Pengisian kurang lengkap", res.message);
        }

    }

    saveLocalEtalase()
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

    saveRemoteEtalase()
    {
        let me = this;
        let f = JSON.stringify(this.state.file);
        f = JSON.parse(f);

        let url = GlobalSession.Config.API_HOST + "/uploadfile/update/" + this.state.file.id;

        console.log("Save remote etalase")
        console.log(url)
        HttpClient.post(url, f, function(response){
            console.log(response)
            console.log("Saved")
            

            if(me.props.onAfterSave != null)
                me.props.onAfterSave()

            Actions.pop();
        })
    }

    back()
    {
        Actions.pop();
    }

    validate()
    {
        let result = { success: true }
        result = (this.state.file.operatorDominant == null || this.state.file.operatorDominant.length == 0) ? { success: false, message: "Mohon memilih operator yang paling dominan di foto." } : result;
        return result;
    }

    getEtalaseInput()
    {
        return(<>
        <View>
            <LabelInput text="Produk Terlaris *" subtext="Produk terlaris"></LabelInput>
            <TextInput style={Style.textInput}  value={this.state.file.productHero} onChangeText={this.setProductHero.bind(this)}/>
        </View>
        <View style={{height: 20}}></View>
        <View>
            <LabelInput text="Kuota (GB) *" subtext="Kuota produk paling laris (masukkan '-1' jika unlimited)"></LabelInput>
            <TextInput style={Style.textInput} keyboardType="numeric"  value={(this.state.file.productHeroQuota == null ) ? this.state.file.productHeroQuota : this.state.file.productHeroQuota.toString()} onChangeText={this.setProductHeroQuota.bind(this)}/>
        </View>
        <View style={{height: 20}}></View>
        <View>
            <LabelInput text="Harga Display (Rp) *" subtext="Harga display produk paling laris"></LabelInput>
            <TextInput style={Style.textInput}  keyboardType="numeric"  value={(this.state.file.productHeroPrice == null ) ? this.state.file.productHeroPrice : this.state.file.productHeroPrice.toString()} onChangeText={this.setProductHeroPrice.bind(this)}/>
        </View>
        <View style={{height: 20}}></View>
        <View>
            <LabelInput text="Harga Beli (Rp) *" subtext="Harga beli produk paling laris"></LabelInput>
            <TextInput style={Style.textInput}  keyboardType="numeric"  value={(this.state.file.productHeroTransferPrice == null ) ? this.state.file.productHeroTransferPrice : this.state.file.productHeroTransferPrice.toString()} onChangeText={this.setProductHeroTransferPrice.bind(this)}/>
        </View>
        <View style={{height: 20}}></View>
        <View>
            <LabelInput text="Masa aktif paket (hari) *" subtext="Masa aktif paket produk paling laris"></LabelInput>
            <TextInput style={Style.textInput} keyboardType="numeric"  value={(this.state.file.productHeroValidity == null ) ? this.state.file.productHeroValidity : this.state.file.productHeroValidity.toString()} onChangeText={this.setProdutHeroValidity.bind(this)}/>
        </View>
        <View style={{height: 20}}></View>
        <View>
                <LabelInput text="Kategori *" subtext="Pilih kategori (Acquisition atau Voucher) produk paling laris"></LabelInput>
                <OptionButtons items={this.state.categories}
                selectedValue={this.state.file.productHeroCategory}
                onSelectItem={this.onProductHeroCategoryChange.bind(this)}></OptionButtons>
        </View>
        <View style={{height: 20}}></View>
        <View>
            <LabelInput text="Tema promosi" subtext="Tema promisi produk terlaris"></LabelInput>
            <TextInput style={Style.textInput} value={this.state.file.productHeroTheme} onChangeText={this.setProductHeroCampaignTheme.bind(this)}/>
        </View>
        </>
        )
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
                        <Title style={Style.headerTitle}>Perbarui Informasi Etalase</Title>
                </View>
            </Header>
            <Content style={{backgroundColor: '#eee'}} >
                {
                    this.getDialog()
                }
                <View style={{height: 5}}></View>   
                <View style={{width: '100%', height: 120, backgroundColor: '#fff', padding: 20}}>
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
                <View style={{width: '100%', height: 300, backgroundColor: '#fff', padding: 20}}>
                

                    <Text style={Style.contentTitle}>
                        Informasi Umum
                    </Text>
                    
                    
                    <View style={{height: 'auto'}}>
                        <View style={{height: 20}}></View>
         
                        <LabelInput text="Operator dominan *" subtext="Pilih operator paling dominan di gambar"></LabelInput>

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
                            zIndex={100000}
                        />
                    </View>

                </View>
                <View style={{height: 15}}></View>
                <View style={{display: 'none', width: '100%', height: 'auto', backgroundColor: '#fff', padding: 20}}>

                    <Text style={Style.contentTitle}>
                        Informasi Produk Terlaris
                    </Text>

                    <View style={{height: 20}}>

                    </View>

                    {
                        (this.state.file != null) ?
                            this.getEtalaseInput() : null
                    }
                </View>

                

                <View style={{height: 15}}></View>
            </Content>

                {
                    //this.getFooter(1)
                }
                <Footer style={{height: 150, backgroundColor:'#fff', borderColor: '#eee', borderWidth: 2}}>
                <View style={{padding: '5%', backgroundColor: '#ffffff'}}>
                    <Button style={Style.buttonRed} onPress={()=>this.saveEtalase()}>
                        <View style={{ alignItems: 'center', width: '100%' }}>
                            <Text>Perbarui</Text>
                        </View>
                    </Button>
                    <Button style={Style.button} onPress={()=>this.back()}>
                            <View style={{ alignItems: 'center', width: '100%' }}>
                                <Text style={{color: '#666'}}>Batal</Text>
                            </View>
                    </Button>
                </View>
                </Footer>
 
            </Container>
        );
    }
}