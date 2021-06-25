import React, { Component } from 'react';
import { Dimensions, StyleSheet } from 'react-native';
import { Container, Content, Text, Card, Header, Footer, Body, Title, 
  List,
  ListItem,
  Item, CardItem, Icon, Button, Input, Label, Radio, Right, Left, CheckBox } from 'native-base';
import { Image, View, ScrollView, TouchableOpacity, Alert, TextInput } from 'react-native';
import { Actions } from 'react-native-router-flux';
import UploadedFile from './model/UploadedFile';
import DropDownPicker from 'react-native-dropdown-picker';
import RadioButtonGroup from './components/RadioButtonGroup'
import { Table, TableWrapper, Row, Rows, Col, Cols, Cell } from 'react-native-table-component';
import RadioButton from 'react-native-radio-button'

import FilePackageSubItem from './model/FilePackageSubItem';
import InternetQuota from './components/InternetQuota';
import VoiceQuota from './components/VoiceQuota';
import SmsQuota from './components/SmsQuota';
import ValidityView from './components/ValidityView';

import Config from './config.json';
import HttpClient from './util/HttpClient';
GlobalSession = require( './GlobalSession');

import Logging from './util/Logging';

import rectred from './images/rectangle-red.png';
import rectgreen from './images/rectangle-green.png';
import rectyellow from './images/rectangle-yellow.png';
import rectblue from './images/rectangle-blue.png';
import { call } from 'react-native-reanimated';
import QuotaAppPage from './QuotaAppPage';

const styles = StyleSheet.create({
    container: { flex: 1, padding: 1, paddingTop: 12, backgroundColor: '#fff' },
    head: {  height: 40,  backgroundColor: '#f1f8ff'  },
    wrapper: { flexDirection: 'row' },
    title: { flex: 1, backgroundColor: '#f6f8fa' },
    row: {  height: 28  },
    text: { textAlign: 'center' }
  });

export default class EditPackageSubItemPage extends React.Component {


    constructor(props) {
        super(props);

        this.state = {
            file: props.file,
            title: (props.mode == "edit") ? "Edit" : "Add",
            item: props.item,
            itemSubCategories: [],
            itemSubCategoriesForRadioGroup: [],
            itemSubCategoryTypes: [],
            itemSubCategoryTypesForRadioGroup: [],
            quotaAppType: null,
            quotaAppTypes: [],
            quotaUsages: [ { text: 'Setiap saat', value: 'setiapsaat' },  { text: 'Malam hari', value: 'malamhari' } ],
            tableHead: ['Tipe App', 'Nama', ''],
            tableData: [['', '', '']],
            widthArr: [ 170, 170, 50],
        }
    }

    setNull2Zero()
    {
        if(this.props.item.quota == null)
            this.props.item.quota = 0;
        if(this.props.item.fup == null)
            this.props.item.fup = 0;
    }

    componentDidMount()
    {
        
        this.setNull2Zero();
        this.handleItemSubCategories(function(){

        });
    }

    handleItemSubCategories(callback)
    {
        let me = this;
        me.getAllSubCategories(function(itemSubCategories){
            me.displaySubCategories(itemSubCategories)

            if(callback != null)
                callback();
        });
    }

    handleItemSubCategoryTypes(itemSubCategoryId, callback)
    {
        let me = this;
        me.getAllSubCategorTypes(itemSubCategoryId, function(itemSubCategoryTypes){
            me.displaySubCategoryTypes(itemSubCategoryTypes)
        });
    }

    getAllSubCategories(callback)
    {
        let url = Config.API_HOST + "/itemsubcategory";
        console.log("URL: " + url)
        HttpClient.get( url, function(response)
        {
            if(response.success)
            {
                if(callback != null)
                    callback(response.payload);
            }
        } );   
    }

    displaySubCategories(itemSubCategories)
    {
        
        let itemSubCategoriesForRadioGroup = this.itemSubCategoriesToRadioGroup(itemSubCategories);

        if(this.props.item.subItemCategory == null)
        {
            this.props.item.subItemCategory = itemSubCategoriesForRadioGroup[0].text;
            this.props.item.subItemCategoryId = itemSubCategoriesForRadioGroup[0].value;
            this.handleItemSubCategoryTypes(itemSubCategoriesForRadioGroup[0].value)
        } 
        else
        {
            this.handleItemSubCategoryTypes(this.props.item.subItemCategoryId)
        }

        this.setState({
            ...this.state,
            itemSubCategories: itemSubCategories,
            itemSubCategoriesForRadioGroup: itemSubCategoriesForRadioGroup
        })
    }

    getAllSubCategorTypes(itemSubCategoryId, callback)
    {
        let url = Config.API_HOST + "/itemsubcategorytype/itemsubcategory/" + itemSubCategoryId;
        console.log(url)
        HttpClient.get( url, function(response)
        {
            if(response.success)
            {
                if(callback != null)
                    callback(response.payload);
            }
        } );   
    }

    displaySubCategoryTypes(itemSubCategoryTypes)
    {
        let itemSubCategoryTypesForRadioGroup = this.itemSubCategoryTypesToRadioGroup(itemSubCategoryTypes);

        this.setState({
            ...this.state,
            itemSubCategoryTypes: itemSubCategoryTypes,
            itemSubCategoryTypesForRadioGroup: itemSubCategoryTypesForRadioGroup
        })
    }

    itemSubCategoriesToRadioGroup(itemSubCategories)
    {
        let items = [];
        itemSubCategories.map((item, idx) => {
            items.push({ text: item.itemSubCategory, value: item.id, image: item.iconUrl })
        })

        return items;
    }

    itemSubCategoryTypesToRadioGroup(itemSubCategoryTypes)
    {
        let items = [];
        itemSubCategoryTypes.map((item, idx) => {
            items.push({ text: item.subCategoryType, value: item.id })
        })

        return items;
    }

    onItemSubCategorySelected(itemSubCategory)
    {
        this.state.item.subItemCategory = itemSubCategory.text;
        this.state.item.subItemCategoryId = itemSubCategory.value;
        this.setState({
            subItemCategory: itemSubCategory.text
        })

        this.handleItemSubCategoryTypes(itemSubCategory.value)
    }


    onItemSubCategoryTypeSelected(item)
    {
        this.state.item.quotaType = item.text;
        this.state.item.quotaTypeId = item.value;
        let selectedSubcategoryType = null;
        this.state.itemSubCategoryTypes.map((categoryType) => {
            if(item.value == categoryType.id)
                selectedSubcategoryType = categoryType;
        })

        let description = selectedSubcategoryType.description;
        if(description != null)
        {
            description = JSON.parse(description);
            this.state.quotaAppTypes = description;  
        }

        this.setState({
            item: this.state.item,
            quotaAppTypes: description
        })
    }

    setQuotaAppType()
    {
        let selectedSubcategoryType = null;
        this.state.itemSubCategoryTypes.map((categoryType) => {
            if(this.state.item.quotaTypeId == categoryType.id)
                selectedSubcategoryType = categoryType;
        })

        if(selectedSubcategoryType != null)
        {
            let description = selectedSubcategoryType.description;
            if(description != null)
            {
                description = JSON.parse(description);
                this.state.quotaAppTypes = description;  
            }
        }

        this.displayAppType();

    }

    onQuotaUsageSelected(item)
    {
        this.state.item.quotaUsage = item.value;
        this.setState({
            item: this.state.item
        })
    }



    setQuotaValidity(value)
    {
        this.setState(state => {
            state.item.quotaValidity = value;
            return state;
        });
    }

    setAdditionalNote(value)
    {
        this.setState(state => {
            state.item.additionalNote = value;
            return state;
        });

    }

 

    back(){
        Actions.pop();
    }


    validate()
    {
        let res = { success: true, message: ""};

        if(this.state.item.subItemCategory == null || this.state.item.subItemCategory == "")
            res = { success: false, message: "Harap isi sub kategori paket" }
        if(this.state.item.quotaType == null || this.state.item.quotaType == "")
            res = { success: false, message: "Harap isi tipe kuota" }
        if(this.state.item.quotaCategory == null || this.state.item.quotaCategory == "")
            res = { success: false, message: "Harap pilih kuota" }
        if(this.state.item.quotaCategory != null && this.state.item.quotaCategory.indexOf("unlimited") != -1)
            res = { success: false, message: "Harap isi kuota untuk paket tersebut" }

        return res;

    }

    isNumeric(n)
    {
        return !isNaN(parseFloat(n)) && isFinite(n);
    }

    ok()
    {
        let res = this.validate();
        if(res.success)
        {
            if(this.props.onAfterSaved != null)
            {
                this.props.onAfterSaved( this.state.item )
            }
            Actions.pop();
        }
        else
        {
            alert(res.message);
        }


    }

    onValidityValueChange(field, value)
    {
        this.state.item[field] = value;
    }

    onQuotaInputChanged(field, value)
    {
        console.log(field + " : " + value)
        this.state.item[field] = value;
    }

    onAppTypeSave(item)
    {
        console.log(item);
        if(this.state.item.appType == null)
            this.state.item.appType = JSON.stringify([]);

        if(item.tempid == null)
        {
            let r = Math.random().toString(36).substring(12);
            item.tempid = r;
        }

        let data = JSON.parse(this.state.item.appType)
        data.push(item);
        this.state.item.appType = JSON.stringify(data);
        console.log(this.state.item.appType)
        this.displayAppType();
        this.setState({
            tableData: this.state.tableData
        })
    }

    addAppType()
    {
        
        Actions.quotaAppPage({ quotaAppTypes: this.state.quotaAppTypes, onSave: this.onAppTypeSave.bind(this) } );
    }

    removeAppType(removedItem)
    {
        if(this.state.item.appType != null)
        {
            let sJson = this.state.item.appType;
            let appTypes = JSON.parse(sJson);
            let idx = 0;
            let selectedIdx = -1;
            appTypes.map((item) => {
                if(item.tempid == removedItem.tempid)
                    selectedIdx = idx;
                idx++;
            })
    
            if(selectedIdx != -1)
            {
                appTypes.splice(selectedIdx, 1);
                console.log(appTypes)
                this.state.item.appType = JSON.stringify(appTypes);
                this.displayAppType();
                this.setState({
                    tableData: this.state.tableData
                })
            }
        }

    }

    displayAppType()
    {
        let sJson = this.state.item.appType;
        if(sJson != null)
        {
            let appTypes = JSON.parse(sJson);
            let tableData = [];
            appTypes.map((item) => {
                tableData.push([ item.quotaAppType, item.appName, <TouchableOpacity onPress={this.removeAppType.bind(this, item)}><Image style={{width: 20, height: 20, alignSelf: 'center'}} source={require('./images/delete.png')} /></TouchableOpacity> ] )
            })
    
            /*
            this.setState({
                tableData: tableData
            })*/
    
            this.state.tableData = tableData;

        }

    }



    render() {

        this.setQuotaAppType()
        console.log("this.state.quotaAppType")
        console.log(this.state.quotaAppType)
        this.displayAppType();

        //console.log(this.state.quotaAppTypes.length)
        return(
            <Container>
            <Header style={{backgroundColor: '#AA2025'}}>
                <Body>
                <View  style={{flex: 1, flexDirection: 'row'}}>
                <TouchableOpacity onPress={()=> this.back()} style={{marginTop: '0%', padding: '4%'}} >
                    <Image style={{ width: 20, height: 20}} source={require('./images/back.png')}></Image>
                </TouchableOpacity>
                <Title style={{ marginTop: '3%' }}>{this.state.title} Sub Item</Title>
                </View>
                </Body>
            </Header>

            <Content padder>
                <View style={{ flex: 1, height: '100%', padding: '1%' }}>

                    <Item>
                        <RadioButtonGroup label="Sub Kategori Paket" items={this.state.itemSubCategoriesForRadioGroup} value={this.state.item.subItemCategoryId} onSelected={this.onItemSubCategorySelected.bind(this)}>

                        </RadioButtonGroup>
                    </Item>
                    <Item>
                        
                        <RadioButtonGroup label="Tipe Kuota" items={this.state.itemSubCategoryTypesForRadioGroup} value={this.state.item.quotaTypeId} onSelected={this.onItemSubCategoryTypeSelected.bind(this)}>

                        </RadioButtonGroup>
                    </Item>
                    {(this.state.quotaAppTypes != null && this.state.quotaAppTypes.length > 0) ?
                    <Item>
                            

                        <View>
                            <View style={{height: 20}}></View>
                            <Table borderStyle={{borderWidth: 2, borderColor: '#c8e1ff'}}>
                                <Row widthArr={this.state.widthArr}  data={this.state.tableHead} style={styles.head} textStyle={styles.text}/>
                                <Rows widthArr={this.state.widthArr}  data={this.state.tableData} textStyle={styles.text} style={styles.row}/>
                            </Table>
                            <View style={{height: 20}}></View>
                            <TouchableOpacity onPress={this.addAppType.bind(this)}>
                                <View style={{width: '30%', alignSelf: 'center', borderWidth: 0, borderColor: '#ccc', padding: 10, alignContent: 'center', alignItems: 'center', borderRadius: 10}}>
                                    <Image source={require('./images/plus.png')}></Image>
                                </View>
                            </TouchableOpacity><View style={{height: 20}}></View>
                        </View>
                    </Item>:  null}
                    <View style={{height: 10}}></View>
                    <Item >
                        
                        {(()=> {
                            console.log("quotatype")
                            console.log(this.state.item);
                            if(this.state.item.subItemCategory == "Internet") 
                                return (<InternetQuota item={this.state.item} onValueChange={this.onQuotaInputChanged.bind(this)}></InternetQuota>)
                            else if(this.state.item.subItemCategory == "Voice") 
                                return (<VoiceQuota item={this.state.item} onValueChange={this.onQuotaInputChanged.bind(this)}></VoiceQuota>)
                            else if(this.state.item.subItemCategory == "SMS") 
                                return (<SmsQuota item={this.state.item} onValueChange={this.onQuotaInputChanged.bind(this)}></SmsQuota>)
                        })()}
                        
                    </Item>
                    <View style={{height: 10}}></View>
                    <Item>
                        <ValidityView item={this.state.item} onValueChange={this.onValidityValueChange.bind(this)}></ValidityView>
                    </Item>
                    <View style={{height: 10}}></View>
                    <Item>
                        <RadioButtonGroup label="Waktu Pemakaian Kuota" items={this.state.quotaUsages} value={this.state.item.quotaUsage} onSelected={this.onQuotaUsageSelected.bind(this)}>

                        </RadioButtonGroup>
                    </Item>
                    <View style={{height: 10}}></View>

                    <Item floatingLabel>
                        <Label style={{ fontWeight: 'normal', paddingBottom: 4 }}>Catatan Tambahan</Label>
                        <Input value={this.state.item.additionalNote} onChangeText={this.setAdditionalNote.bind(this)}/>
                    </Item>

                    <View style={{marginTop: '10%'}}>
                        <Label>* Harus diisi</Label>
                    </View>


                </View>
            </Content>
            <Footer style={{backgroundColor: '#AA2025'}}>
                <TouchableOpacity onPress={this.ok.bind(this)} style={{marginTop: '0%', padding: '3%'}}>
                    <Image  onPress={this.ok.bind(this)} source={require('./images/ok_white.png')} />
                </TouchableOpacity>
            </Footer>
            </Container>
        );
    }
}