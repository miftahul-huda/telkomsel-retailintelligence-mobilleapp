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

import FilePackageSubItem from './model/FilePackageSubItem';

import Config from './config.json';
import HttpClient from './util/HttpClient';
GlobalSession = require( './GlobalSession');

import Logging from './util/Logging';

import rectred from './images/rectangle-red.png';
import rectgreen from './images/rectangle-green.png';
import rectyellow from './images/rectangle-yellow.png';
import rectblue from './images/rectangle-blue.png';

const styles = StyleSheet.create({
    container: { flex: 1, padding: 1, paddingTop: 12, backgroundColor: '#fff' },
    head: {  height: 40,  backgroundColor: '#f1f8ff'  },
    wrapper: { flexDirection: 'row' },
    title: { flex: 1, backgroundColor: '#f6f8fa' },
    row: {  height: 40  },
    text: { textAlign: 'center' }
  });

export default class EditPackageItemPage extends React.Component {


    constructor(props) {
        super(props);
        this.state = {
            file: props.file,
            title: (props.mode == "edit") ? "Edit" : "Add",
            item: props.item,
            isIsiPulsa: false,
            categories: [ { text: "Acquisition", value: "acquisition" }, { text: "Voucher", value: "voucher" } ],
            itemCategories: [ { image: Image.resolveAssetSource(rectred).uri, text: "Kartu Perdana", value: "kartuperdana" }, 
                              { image: Image.resolveAssetSource(rectgreen).uri,text: "Voucher Fisik", value: "voucherfisik" },
                              { image: Image.resolveAssetSource(rectyellow).uri,text: "Paket", value: "paket" },
                              { image: Image.resolveAssetSource(rectblue).uri,text: "Isi Pulsa", value: "isipulsa" },
                            ],
            tableHead: ['Sub item', 'Tipe', 'Besaran', 'Validitas', ''],
            tableData: [['', '', '', '','']],
            widthArr: [ 100, 100, 80, 80, 40 ],
            removedItems: []
        }
    }

    ok()
    {
        var res = this.validate();
        if(res.success)
        {
            console.log("ok()")
            console.log(this.state.item)
            if(this.props.onSave != null)
                this.props.onSave(this.state.item);
            
            Actions.pop();
        }
        else
        {
            Alert.alert(res.message);
        }
    }


    setPackagePrice(value){
        this.state.item.price = value;
        this.setState({
            ...this.state,
            item: this.state.item
            
        })
    }

    setTransferPrice(value){
        this.state.item.transferPrice = value;
        this.setState({
            ...this.state,
            item: this.state.item
            
        })
    }

    setCampaignTheme(value){
        this.state.item.campaignTheme = value;
        this.setState({
            ...this.state,
            item: this.state.item
            
        })
    }

    onCategoryChange(item)
    {
        this.state.item.category = item.value;
        this.setState({
            ...this.state,
            item: this.state.item
            
        })        
    }

    back(){
        Actions.pop();
    }

    componentDidMount(){
        let packes = [];
        let selectedPackage = null;
        let operator_id = this.props.operator.value;
        var me = this;

        console.log("editPackateIte.item");
        console.log(this.state.item)

        console.log("editPackateIte.item.filePackageSubItems");
        console.log(this.state.item.filePackageSubItems)

        let tableData = this.filePackageSubItemsToTable(this.state.item.filePackageSubItems);
        this.setState({
            tableData: tableData
        })
        /*this.getPackages(operator_id).then(function(packages){
            console.log("packages")
            console.log(packages);
            packages.forEach(function(item){
                packes.push({ label: item.package_name, value: item.id });
            })
            selectedPackage = packes[0];
            me.setState({
                ...me.state,
                packages : packes,
                selectedPackage: selectedPackage
            })
        })*/


    }

    validate()
    {
        if(this.state.item.transferPrice == "")
            this.state.item.transferPrice = 0;
        if(this.state.item.validity == "")
            this.state.item.validity = 0;
        if(this.state.item.price == "")
            this.state.item.price = 0;   
        if(this.state.item.gbmain == "")
            this.state.item.gbmain = 0;       

        if(!this.isNumeric(this.state.item.transferPrice))
            return { success: false, message: 'Harga beli harus angka'};
        
        if(!this.isNumeric(this.state.item.price))
            return { success: false, message: 'Harga harus angka'};
        
        if(this.state.item.price == 0)
            return { success: false, message: 'Harga harus diisi'};


        if(this.state.item.itemCategory == null || this.state.item.itemCategory == "")
        {
            return { success: false, message: 'Pilih kategori paket'};
        }

        if(this.state.item.filePackageSubItems == null || (this.state.item.filePackageSubItems != null && this.state.item.filePackageSubItems.length == 0))
            return { success: false, message: 'Isi Sub Item' }

        return { success: true }
    }

    isNumeric(n)
    {
        return !isNaN(parseFloat(n)) && isFinite(n);
    }

    onItemCategorySelected(item)
    {
        this.state.item.itemCategory = item.value;
        this.state.item.itemCategoryText = item.text;

        /* -- Temporary ---
         if(item.value == "isipulsa")
            this.state.isIsiPulsa = true;
        else
            this.state.isIsiPulsa = false;
        */
        this.setState({
            ...this.state,
            item: this.state.item
            
        })  
    }

    onAfterSaved(filePackageSubItem)
    {

        if(filePackageSubItem.id == null && filePackageSubItem.tempid == null)
        {
            let r = Math.random().toString(36).substring(12);
            filePackageSubItem.tempid = r;
            this.state.item.filePackageSubItems.push(filePackageSubItem);
        }
        else
        {
            let i = 0;
            let selIdx = -1;
            this.state.item.filePackageSubItems.map((item) => {
                if((item.id != null && item.id == filePackageSubItem.id) || (item.id == null && item.tempid == filePackageSubItem.tempid))
                    selIdx = i;
                i++;
            })

            
            this.state.item.filePackageSubItems[selIdx] = filePackageSubItem;

        }

        let tableData = this.filePackageSubItemsToTable(this.state.item.filePackageSubItems);
        this.setState({
            tableData: tableData
        })

        console.log("this.state.item.filePackageSubItems");
        console.log(this.state.item.filePackageSubItems);
        console.log("tableData")
        console.log(tableData)
    }

    filePackageSubItemsToTable(filePackageSubItems)
    {
        let items = [];
        if(filePackageSubItems != null)
        {

            filePackageSubItems.map((item) => {
                items.push([ <TouchableOpacity><Text style={{fontWeight: 'bold', marginLeft: 5}} onPress={this.editSubItem.bind(this, item)}>{item.subItemCategory}</Text></TouchableOpacity>, 
                item.quotaType, item.quota, item.quotaValidity, 
                <TouchableOpacity onPress={this.deleteSubItem.bind(this, item)}><Image style={{width:20, height:20, alignSelf: 'center'}} source={require('./images/delete.png')}></Image></TouchableOpacity> ])
            })
        }
        return items;
    }


    addSubItem()
    {
        Actions.editPackageSubItemPage({ item: { quota:0, quotaValidity: 0, quotaUsage: 'setiapsaat', fup:0, packageItemId: this.state.item.id }, onAfterSaved: this.onAfterSaved.bind(this) })
    }

    editSubItem(item)
    {
        Actions.editPackageSubItemPage({ item: item, onAfterSaved: this.onAfterSaved.bind(this) })
    }

    deleteSubItem(delItem)
    {
        
        let i = 0 ;
        let selIdx = 0;
        this.state.item.filePackageSubItems.map((item) => {
            if( (item.id != null && item.id == delItem.id) || (item.id == null && item.tempid == delItem.tempid))
                selIdx = i;
            i++;
        });

        let removedItem = this.state.item.filePackageSubItems[selIdx];
        this.state.removedItems.push(removedItem);
        this.state.item.removedPackageSubItems = this.state.removedItems;

        this.state.item.filePackageSubItems.splice(selIdx, 1);
        let tableData = this.filePackageSubItemsToTable(this.state.item.filePackageSubItems);
        this.setState({
            tableData: tableData
        })
    }

    openCatalog()
    {

    }



    render() {

        console.log("this.state.item")
        console.log(this.state.item)
        return(
            <Container>
            <Header style={{backgroundColor: '#AA2025'}}>
                <Body>
                <View  style={{flex: 1, flexDirection: 'row'}}>
                <TouchableOpacity onPress={()=> this.back()} style={{marginTop: '0%', padding: '4%'}} >
                    <Image style={{ width: 20, height: 20}} source={require('./images/back.png')}></Image>
                </TouchableOpacity>
                <Title style={{ marginTop: '3%' }}>{this.state.title} Paket</Title>
                </View>
                </Body>
            </Header>

            <Content padder>
                <View style={{ flex: 1, height: '100%', padding: '1%' }}>
                    <Item style={{ display: 'none' }}>
                        <Button style = {{display: 'none', alignSelf: 'center', margin: 5, 
                        width: '100%', backgroundColor: '#AA2025', borderRadius: 10}}
                        onPress= {() => { this.openCatalog(); }}>

                            <View style={{flex: 1, flexDirection: 'row', width:'100%', alignSelf: 'center', alignItems:'center', justifyContent:'center',}}>
                                <Image source={require('./images/catalog-white.png')} />
                            <View style={{width: '2%'}}></View>
                            <Text style={{ color: '#ffffff'}}>Isi dari katalog produk</Text>
                            </View>
                        
                        </Button>
                    </Item>
                    <Item>
                        <RadioButtonGroup label="Kategori paket" items={this.state.itemCategories} value={this.state.item.itemCategory} onSelected={this.onItemCategorySelected.bind(this)}>

                        </RadioButtonGroup>
                        
                    </Item>
                    {
                        (this.state.isIsiPulsa) ? 
                        <>
                        <View style={{height: 10}}></View>
                        <Item floatingLabel>
                            <Label style={{ fontWeight: 'normal', paddingBottom: 4 }}>Besaran pulsa (Rp) *</Label>
                            <Input keyboardType="numeric"  value={this.state.item.price.toString()} onChangeText={this.setPackagePrice.bind(this)}/>
                        </Item>
                        <View style={{height: 10}}></View>
                        <Item floatingLabel>
                            <Label style={{ fontWeight: 'normal', paddingBottom: 4 }}>Catatan Tambahan</Label>
                            <Input keyboardType="numeric"  value={this.state.item.price.toString()} onChangeText={this.setPackagePrice.bind(this)}/>
                        </Item></> : null
                    }
                    <View style={{height: 10}}></View>
                    <Item floatingLabel>
                        <Label style={{ fontWeight: 'normal', paddingBottom: 4 }}>Harga Display/EUP (Rp) *</Label>
                        <Input keyboardType="numeric"  value={this.state.item.price.toString()} onChangeText={this.setPackagePrice.bind(this)}/>
                    </Item>
                    <View style={{height: 10}}></View>
                    <Item floatingLabel>
                        <Label style={{ fontWeight: 'normal', paddingBottom: 4 }}>Harga Transfer/TP (Rp) *</Label>
                        <Input keyboardType="numeric"  value={this.state.item.transferPrice.toString()} onChangeText={this.setTransferPrice.bind(this)}/>
                    </Item>
                    <View style={{height: 10}}></View>
                    <View style={styles.container}>
                        <Table borderStyle={{borderWidth: 2, borderColor: '#c8e1ff'}}>
                            <Row widthArr={this.state.widthArr}  data={this.state.tableHead} style={styles.head} textStyle={styles.text}/>
                            <Rows widthArr={this.state.widthArr}  data={this.state.tableData} textStyle={styles.text} style={styles.row}/>
                            
                        </Table>

                        <View style={{height: 30}}></View>

                        <TouchableOpacity onPress={this.addSubItem.bind(this)}>
                            <View style={{width: '100%', borderWidth: 1, borderColor: '#ccc', padding: 10, alignContent: 'center', alignItems: 'center', borderRadius: 10}}>
                                <Image source={require('./images/plus.png')}></Image>
                            </View>
                        </TouchableOpacity>
                    </View>
                    <View style={{height: 10}}></View>
                    <RadioButtonGroup label="Category" items={this.state.categories} value={this.state.item.category} onSelected={this.onCategoryChange.bind(this)}>
                    </RadioButtonGroup>
                    <Item floatingLabel>
                        <Label style={{ fontWeight: 'normal', paddingBottom: 4 }}>Tema promosi</Label>
                        <Input value={this.state.item.campaignTheme} onChangeText={this.setCampaignTheme.bind(this)}/>
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