import React, { Component } from 'react';
import { Dimensions, StyleSheet, ActivityIndicator } from 'react-native';
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
import HttpClient from './util/HttpClient';
import GlobalSession from './GlobalSession';
import Style from './style';
import OptionButtons from './components/OptionButtons';
import LabelInput from './components/LabelInput';
import SharedPage from './SharedPage';

import Logging from './util/Logging';
import Util from './util/Util'

import FilePackageItem from './model/FilePackageItem';


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

export default class EditPackageItemPage extends SharedPage {


    constructor(props) {
        super(props);
        this.state = {
            ...this.state,
            file: props.file,
            title: (props.mode == "edit") ? "Ubah" : "Tambah",
            item: props.item,
            isIsiPulsa: false,
            categories: [ { text: "Acquisition", label: "Acquisition", value: "acquisition" }, { text: "Voucher", label: "Voucher", value: "voucher" } ],
            itemCategories: [ { image: Image.resolveAssetSource(rectred).uri, text: "Kartu Perdana", label: "Kartu Perdana", value: "kartuperdana" }, 
                              { image: Image.resolveAssetSource(rectgreen).uri,text: "Voucher Fisik",label: "Voucher Fisik", value: "voucherfisik" },
                              { image: Image.resolveAssetSource(rectyellow).uri,text: "Paket", label: "Paket",value: "paket" },
                              { image: Image.resolveAssetSource(rectblue).uri,text: "Isi Pulsa", label: "Isi Pulsa",value: "isipulsa" },
                            ],
            tableHead: ['Sub item', 'Tipe', 'Besaran', 'Validitas', ''],
            tableData: [['', '', '', '','']],
            widthArr: [ 100, 100, 80, 80, 40 ],
            removedItems: [],
            packages: [],
            packageNames: [],
            package_name: null,
            packageNameInfo: 'Pilih nama paket',
            showPackageNameManual: false,
            subItemCategories: [],
            filePackageSubItems: [],
            showIndicator: false,
            showButtons: false,
        }
    }

    async ok()
    {
        var res = this.validate();
        if(res.success)
        {

            await this.save();

            if(this.props.onAfterSaved != null)
                this.props.onAfterSaved(this.state.item);
            
            Actions.pop();
        }
        else
        {
            this.showDialog("Pengisian kurang lengkap.", res.message)
        }
    }

    async deleteItem()
    {
        if(this.state.file.isuploaded == 1)
        {
            this.deleteRemoteItem();
        }
        else
        {
            this.deleteLocalItem();
        }
    }

    async deleteLocalItem()
    {
        await FilePackageItem.destroy({ where:  { id: this.state.item.id } })
        await FilePackageSubItem.destroy({ where: { packageItemId: this.state.item.id } })
        if(this.props.onAfterSaved != null)
            this.props.onAfterSaved(this.state.item);
    
        Actions.pop();   
    }

    async deleteRemoteItem()
    {
        let me = this;
        let url = GlobalSession.GlobalSession.Config.API_HOST + "/filepackageitem/delete/" + this.state.item.id;
        //console.log(url);
        HttpClient.get(url, function(response){
            //console.log(response)

            url = GlobalSession.GlobalSession.Config.API_HOST + "/filepackagesubitem/delete-by-packageitem/" + me.state.item.id;
            HttpClient.get(url, function(){

                if(me.props.onAfterSaved != null)
                    me.props.onAfterSaved(me.state.item);
    
                Actions.pop();
            })

        })
    }


    setPackagePrice(value){
        this.state.item.price = value;
        this.setState({
            ...this.state,
            item: this.state.item
            
        })
    }

    setGbMain(value){
        this.state.item.gbmain = value;
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

    async save()
    {
        var me = this;
        let filePackageSubItems = this.state.item.filePackageSubItems;

        await this.savePackageItem(async function(newItem){

            me.state.item = newItem;
            me.state.item.filePackageSubItems = filePackageSubItems;
    
            await me.savePackageSubItems();
        });

    }

    async savePackageItem(callback)
    {
        if(this.state.file.isuploaded == 1)
            this.saveRemotePackageItem(callback);
        else
            this.saveLocalPackageItem(callback);
    }

    async saveLocalPackageItem(callback)
    {

        let newItem = null;
        this.state.item.upload_file_id = this.state.file.id;
        let toSaveItem = JSON.stringify(this.state.item);
        toSaveItem = JSON.parse(toSaveItem);

        if(this.state.item.id == null)
        {
            newItem = await FilePackageItem.create(toSaveItem);
        }
        else
        {
            await FilePackageItem.update(toSaveItem, { where: { id: toSaveItem.id } });
            newItem = toSaveItem;

            //newItem = newItem[0];
        }

        if(callback != null)
            callback(newItem);

        return newItem;
    }

    async saveRemotePackageItem(callback)
    {
        let me = this;
        let newItem = null;
        this.state.item.upload_file_id = this.state.file.id;
        let toSaveItem = JSON.stringify(this.state.item);
        toSaveItem = JSON.parse(toSaveItem);

        if(this.state.item.id == null)
        {
            let url = GlobalSession.Config.API_HOST + "/filepackageitem/create";
            HttpClient.post(url, toSaveItem, function(response){
                newItem = response.payload;
                if(callback != null)
                    callback(newItem);
            })
        }
        else
        {
            let url = GlobalSession.Config.API_HOST + "/filepackageitem/update/" + this.state.item.id;

            //console.log("update url");
            //console.log(url);

            HttpClient.post(url, toSaveItem, function(response){
                newItem = response.payload;
                if(callback != null)
                    callback(toSaveItem);
            })
        }
 

        return newItem;

    }

    async savePackageSubItems()
    {
        if(this.state.file.isuploaded == 1)
            this.saveRemotePackageSubItems();
        else
            this.saveLocalPackageSubItems();
    }

    async saveLocalPackageSubItems()
    {
        //console.log("filepackagesubitems")
        //console.log(this.state.item.filePackageSubItems)

        var me = this;
        this.state.item.filePackageSubItems.map(async (subItem)=>{
            

            let toSaveSubItem = JSON.stringify(subItem);
            toSaveSubItem = JSON.parse(toSaveSubItem);
            toSaveSubItem.packageItemId = me.state.item.id;

            //console.log("Saving subitem")
            //console.log(toSaveSubItem);

            if(subItem.id == null)
            {
                await FilePackageSubItem.create(toSaveSubItem);
            }
            else
            {
                await FilePackageSubItem.update(toSaveSubItem, { where: { id: toSaveSubItem.id } });
            }
        })

        this.saveRemovePackageSubItems();
    }

    async saveRemotePackageSubItems()
    {
        //console.log("filepackagesubitems")
       // console.log(this.state.item.filePackageSubItems)

        var me = this;
        this.state.item.filePackageSubItems.map(async (subItem)=>{
            

            let toSaveSubItem = JSON.stringify(subItem);
            toSaveSubItem = JSON.parse(toSaveSubItem);
            toSaveSubItem.packageItemId = me.state.item.id;

            //console.log("Saving subitem")
            //console.log(toSaveSubItem);

            if(subItem.id == null)
            {
                let url = GlobalSession.Config.API_HOST + "/filepackagesubitem/create";
                console.log(url)
                HttpClient.post(url, toSaveSubItem, function(response){
                    console.log("Response");
                    console.log(response);
                })
            }
            else
            {
                let url = GlobalSession.Config.API_HOST + "/filepackagesubitem/update/" + toSaveSubItem.id;
                console.log(url)
                HttpClient.post(url, toSaveSubItem, function(response){
                    console.log(response);
                })
            }
        })

        this.saveRemovePackageSubItems();
    }

    async saveRemovePackageSubItems()
    {
        if(this.state.file.isuploaded == 1)
            this.saveRemoteRemovePackageSubItems();
        else
            this.saveLocalRemovePackageSubItems();
    }

    async saveLocalRemovePackageSubItems()
    {
        this.state.removedItems.map(async (item)=>{
            if(item.id != null)
                await FilePackageSubItem.destroy({where: { id: item.id}})
        })
    }

    async saveRemoteRemovePackageSubItems()
    {
        this.state.removedItems.map(async (item)=>{
            if(item.id != null)
            {
                let url = GlobalSession.Config.API_HOST + "/filepackagesubitem/delete/" + item.id;
                HttpClient.get(url, function(response){

                })
            }
        })
    }

    

    componentDidMount(){
        let packes = [];
        let selectedPackage = null;
        //let operator_id = this.props.operator.value;
        var me = this;

        //console.log("editPackateIte.item");
       //console.log(this.state.item)

        //console.log("editPackateIte.item.filePackageSubItems");
       // console.log(this.state.item.filePackageSubItems)

        me.setState({
            showIndicator: true
        })
        this.loadPackageNames(function(){
            me.loadPackages(function()
            {
                me.loadSubItems(function(){
                    me.setState({
                        showIndicator: false
                    })
                });
            });
        });
        

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
            return { success: false, message: 'Mohon isi harga display'};

        if(this.state.item.transferPrice == 0)
            return { success: false, message: 'Mohon isi harga beli'};

        if(this.state.item.itemCategory == null || this.state.item.itemCategory == "")
        {
            return { success: false, message: 'Mohon pilih jenis paket'};
        }

        if(this.state.item.category == null || this.state.item.category == "")
        {
            return { success: false, message: 'Mohon pilih kategori paket (Acquisition/Voucher)'};
        }

        if(this.state.item.filePackageSubItems == null || this.state.item.filePackageSubItems.length == 0)
        {
            return { success: false, message: 'Mohon isi sub item'};
        }

        //if(this.state.item.filePackageSubItems == null || (this.state.item.filePackageSubItems != null && this.state.item.filePackageSubItems.length == 0))
        //    return { success: false, message: 'Isi Sub Item' }

        let res = this.validatePackageSubItems( this.state.item, this.state.item.filePackageSubItems);
        if(res.success == false)
        {
            return { success: false, message: res.message}
        }

        return { success: true }
    }

    validatePackageSubItems(packageItem, filePackageSubItems, callback, callbackError)
    {
        let result = { success: true };


        let subItemQuotaCounter = 0;
        filePackageSubItems.map((subItem)=>{

            let quotaCategory = subItem.quotaCategory + "";
            if(subItem.quota == null && quotaCategory.indexOf("unlimited") < 0)
            {
                subItemQuotaCounter++;
            }
        })
        //console.log("subItemQuotaCounter " + subItemQuotaCounter);
        //alert(subItemQuotaCounter)
        if(subItemQuotaCounter >= filePackageSubItems.length)
        {

            return { success: false, message: "Minimal satu quota sub item atau pilih unlimited untuk paket item " + packageItem.gbmain + " GB diisi." }
            
        }


        return result;
    }

    isNumeric(n)
    {
        return !isNaN(parseFloat(n)) && isFinite(n);
    }

    onItemCategorySelected(item)
    {
        this.state.item.itemCategory = item.value;
        this.state.item.itemCategoryText = item.text;

         if(item.value == "isipulsa")
            this.state.isIsiPulsa = true;
        else
            this.state.isIsiPulsa = false;
        
        this.setState({
            ...this.state,
            item: this.state.item
            
        })  
    }

    onAfterSaved(filePackageSubItem)
    {

        if(filePackageSubItem.id == null && filePackageSubItem.tempid == null)
        {
            let r = Util.makeid(10)
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

        //console.log("this.state.item.filePackageSubItems");
        //console.log(this.state.item.filePackageSubItems);
       //console.log("tableData")
        //console.log(tableData)
    }

    filePackageSubItemsToTable(filePackageSubItems)
    {
        let items = [];
        if(filePackageSubItems != null)
        {

            filePackageSubItems.map((item) => {
                let quota = item.quota;
                if(item.quotaCategory != null && item.quotaCategory.indexOf("unlimited") > -1)
                    quota = "Unlimited";

                items.push([ <TouchableOpacity><Text style={{fontWeight: 'bold', marginLeft: 5}} onPress={this.editSubItem.bind(this, item)}>{item.subItemCategory}</Text></TouchableOpacity>, 
                item.quotaType, quota, item.quotaValidity, 
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


    loadSubItemCategories(callback)
    {
        let url = GlobalSession.Config.API_HOST + "/itemsubcategory";
        console.log("subitemcategories.url")
        console.log(url)

        HttpClient.get(url, function(response){
            if(callback != null)
                callback(response.payload);
        })
    }

    mergeSubItemCategories(subitms, subItemCategories)
    {
        //console.log(subitms)
        //console.log(subItemCategories)
        let res = [];
        subItemCategories.map((itm)=>{
            subitms.map((itm2)=>{
                if(itm2 == itm.itemSubCategory)
                {
                    res.push({ label: itm.itemSubCategory, value: itm.id })
                }
            })
        })
        //console.log(res)
        return res;
    }

    addAutomaticSubItems(subitems)
    {
        let subitms = subitems.split(",");
        let me = this;

        me.state.item.filePackageSubItems.map((subItem)=>{
            me.state.removedItems.push(subItem);
        })
        me.state.item.filePackageSubItems = [];



        this.loadSubItemCategories(function(subItemCategories){
            let sbItmCats = me.mergeSubItemCategories(subitms, subItemCategories);

            
            sbItmCats.map((subitm)=>{
                let r = Util.makeid(10)
                me.state.item.filePackageSubItems.push({ tempid: r, subItemCategory: subitm.label, subItemCategoryId: subitm.value, quotaType: 'Kuota Utama', quotaTypeId: 1, quotaValidity: 0 })
            })

            console.log("sadfsadfa")
            console.log(me.state.item.filePackageSubItems);

            let tableData = me.filePackageSubItemsToTable(me.state.item.filePackageSubItems);
            //console.log("tableData")
            //console.log(tableData)
            me.setState({
                tableData: tableData
            })
        })

    }

    onPackageChange(item)
    {
        this.state.item.subitempackage = item.label;
        this.state.item.subitempackageitems = item.value;

        this.addAutomaticSubItems(item.value)
    }

    dbPackagesToCmbPackages(packages)
    {
        let cmbPackages = [];
        packages.map((item)=>{
            cmbPackages.push({ label: item.package_name, value: item.sub_items })
        })

        return cmbPackages;
    }

    dbPackageNamesToCmbPackages(packages)
    {
        let cmbPackages = [];
        packages.map((item)=>{
            cmbPackages.push({ label: item.package_name, value: item.package_name })
        })
        cmbPackages.push({ label: "... Tambah nama paket....", value: "addmanual" })
        return cmbPackages;
    }

    loadPackages(callback)
    {
        let me = this;
        let url = GlobalSession.Config.API_HOST + "/package/" + this.props.file.operator;
        console.log(url)
        HttpClient.get(url, function(response){
            if(response.success)
            {
                let packages = response.payload;
                packages = me.dbPackagesToCmbPackages(packages);
                //console.log(packages)
                me.setState({
                    packages: packages
                })

                if(callback != null)
                    callback()
            }

        });
    }

    async loadSubItems(callback)
    {
        if(this.state.file.isuploaded == 1)
        {
            this.loadRemoteSubItems(callback);
        }
        else
        {
            this.loadLocalSubItems(callback);
        }
    }

    async loadLocalSubItems(callback)
    {
        if(this.state.item.id != null)
        {
            console.log("this.state.item")
            console.log(this.state.item)
            let filePackageSubItems  = await FilePackageSubItem.findAll({where: { packageItemId: this.state.item.id }})
            console.log("filePackageSubItems");
            console.log(filePackageSubItems);
            this.state.item.filePackageSubItems = filePackageSubItems;
        }
        else
        {
            this.state.item.filePackageSubItems = [];
        }

        let tableData = this.filePackageSubItemsToTable(this.state.item.filePackageSubItems);
        this.setState({
            tableData: tableData
        })

        if(callback != null)
            callback();
    }

    async loadRemoteSubItems(callback)
    {
        var me =this;
        if(this.state.item.id != null)
        {
            let url = GlobalSession.Config.API_HOST + "/filepackagesubitem/packageitem/" + this.state.item.id;
            console.log(url)
            HttpClient.get(url, function(response){
                let filePackageSubItems = response.payload;
                //console.log("filePackageSubItems");
                //console.log(filePackageSubItems);
                me.state.item.filePackageSubItems = filePackageSubItems;

                let tableData = me.filePackageSubItemsToTable(me.state.item.filePackageSubItems);
                me.setState({
                    tableData: tableData
                })

                if(callback != null)
                    callback();
            })
            
        }
        else
        {
            this.state.item.filePackageSubItems = [];

            let tableData = this.filePackageSubItemsToTable(this.state.item.filePackageSubItems);
            this.setState({
                tableData: tableData
            })

            if(callback != null)
                callback();
        }
    }

    packageNameSamples(packages)
    {
        let pknames =  "";
        let counter = 0;
        packages.map((item)=>{
            if(counter < 6)
                pknames += item.package_name + ", ";
            counter++;
            
        })

        if(pknames.length > 0)
            pknames = pknames.substr(0, pknames.length - 1);
        
        return pknames;
    }

    async loadPackageNames(callback)
    {
        let me = this;
        let url = GlobalSession.Config.API_HOST + "/packagename/" + this.props.file.operator;
        console.log("loadPackageNames")
        console.log(url)
        HttpClient.get(url, function(response){
            if(response.success)
            {
                let packages = response.payload;
                let pknames = me.packageNameSamples(packages);
                packages = me.dbPackageNamesToCmbPackages(packages);
                //console.log(packages)
                let pckname = null;
                if(me.state.item.package_name != null && me.state.item.package_name.length > 0)
                    pckname = me.state.item.package_name;

                me.setState({
                    packageNames: packages,
                    package_name: pckname,
                    packageNameInfo: "Pilih nama paket (" + pknames + ", dll)"
                })

                if(callback != null)
                    callback()
            }

        });
    }

    packageNameSelected(item)
    {
        if(item.value != "addmanual")
        {
            this.state.item.package_name = item.value;
            this.setState({
                item: this.state.item,
                showPackageNameManual: false
            })
        }
        else
        {
            this.setState({
                showPackageNameManual: true
            })
        }
    }

    setPackageName(value)
    {
        this.state.item.package_name = value;
        this.setState({
            ...this.state,
            item: this.state.item
            
        })
    }

    isCloseToBottom({ layoutMeasurement, contentOffset, contentSize }) 
    {
        return layoutMeasurement.height + contentOffset.y >= contentSize.height - 1;
    }

    viewImage(){
        let file = this.props.file;
        this.state.selectedFile = file;

        Actions.viewImagePage({ editMode:true, file: file, onSaveCropImage: Util.onSaveCropImage.bind(this) })
    }

    

    render() {

        var me = this;
        //console.log("this.state.item")
        //console.log(this.state.item)
        if(me.state.showIndicator)
            return(
                <Container>
                    <Header style={{backgroundColor: '#FFF'}}>
                        <View  style={Style.headerHorizontalLayout}>
                                <TouchableOpacity onPress={()=> me.back()}>
                                    <Image style={Style.headerImage} resizeMode='contain' source={require('./images/back-dark.png')}></Image>
                                </TouchableOpacity>
                                <View style={{width: 10}}></View>
                                <Title style={Style.headerTitle}>{this.state.title} Item Paket</Title>
                        </View>
                    </Header>
                    <Content>
                        <ActivityIndicator size="large" color="red"></ActivityIndicator>
                    </Content>
                </Container>
                
            )
        else
            return(
            <Container>
            <Header style={{backgroundColor: '#FFF'}}>
                <View  style={Style.headerHorizontalLayout}>
                        <TouchableOpacity onPress={()=> me.back()}>
                            <Image style={Style.headerImage} resizeMode='contain' source={require('./images/back-dark.png')}></Image>
                        </TouchableOpacity>
                        <View style={{width: 10}}></View>
                        <Title style={Style.headerTitle}>{this.state.title} Item Paket</Title>
                </View>
            </Header>

            <Content style={{backgroundColor: '#eee'}} onScroll={({ nativeEvent }) => {
                if (this.isCloseToBottom(nativeEvent)) {
                    //console.warn("Reached end of page");
                    this.setState({
                        ...this.state,
                        showButtons: true
                    })
                }
                else
                {
                    this.setState({
                        ...this.state,
                        showButtons: false
                    })
                }
            }}>
                
                    <View style={{ display: 'none' }}>
                        <Button style = {{display: 'none', alignSelf: 'center', margin: 5, 
                        width: '100%', backgroundColor: '#AA2025', borderRadius: 10}}
                        onPress= {() => { this.openCatalog(); }}>

                            <View style={{flex: 1, flexDirection: 'row', width:'100%', alignSelf: 'center', alignItems:'center', justifyContent:'center',}}>
                                <Image source={require('./images/catalog-white.png')} />
                            <View style={{width: '2%'}}></View>
                            <Text style={{ color: '#ffffff'}}>Isi dari katalog produk</Text>
                            </View>
                        
                        </Button>
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
                                    Lihat Gambar
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                    <View style={{height: 15}}></View>
                    <View style={{height: 10}}></View>
                    {
                        this.getDialog()
                    }
                    <View style={{  width: '100%', padding: 20, backgroundColor: '#fff', height: 'auto'}}>
                        <View>
                            <Text style={Style.contentTitle}>Informasi umum detail produk</Text>
                        </View>
                        
                        


                        <View style={{height: 10}}></View>
                        <View>
                            <LabelInput text="Kategori produk *" subtext="Pilih kategori produk (Kartu perdana, voucher fisik, paket, isi pulsa)" link="1" onShowInfo={this.onShowInfo.bind(this)}></LabelInput>
                            <DropDownPicker
                                items={this.state.itemCategories}
                                defaultValue={this.state.item.itemCategory}
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
                                onChangeItem={this.onItemCategorySelected.bind(this)}
                                zIndex={1000}
                            />

                        </View>

                        <View style={{height: 10}}></View>
                        <View>
                            <LabelInput text="Nama paket *" subtext={this.state.packageNameInfo} link="1" onShowInfo={this.onShowInfo.bind(this)}></LabelInput>
                            <DropDownPicker
                                items={this.state.packageNames}
                                defaultValue={this.state.package_name}
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
                                onChangeItem={this.packageNameSelected.bind(this)}
                                zIndex={1000}
                            />
                        </View>

                        {(this.state.showPackageNameManual) ? 
                        <>
                            <View style={{height: 20}}></View>
                            <View>
                                <LabelInput text="Nama Paket" subtext="Isi nama paket yang tertera di poster jika ada"></LabelInput>
                                <TextInput style={Style.textInput}  value={this.state.item.package_name} onChangeText={this.setPackageName.bind(this)}></TextInput>
                            </View>
                        </>
                        :
                        null}

                        {
                        (this.state.isIsiPulsa) ? 
                        <View style={{display: 'none'}}>
                            <View style={{height: 10}}></View>
                            <Item floatingLabel>
                                <Label style={{ fontWeight: 'normal', paddingBottom: 4 }}>Besaran pulsa (Rp) *</Label>
                                <Input keyboardType="numeric"  value={this.state.item.price.toString()} onChangeText={this.setPackagePrice.bind(this)}/>
                            </Item>
                        </View> 
                            : null
                        }
                        <View style={{height: 20}}></View>
                        <View>
                            <LabelInput text="Besaran (GB) *" subtext="Isi besaran byte item yang tertera di poster"></LabelInput>
                            <TextInput style={Style.textInput} keyboardType="numeric"  value={this.state.item.gbmain.toString()} onChangeText={this.setGbMain.bind(this)}></TextInput>
                        </View>
                        <View style={{height: 20}}></View>
                        <View>
                            <LabelInput text="Harga Display/EUP (Rp)*" subtext="Isi harga yang ditampilkan di poster dari paket ini"></LabelInput>
                            <TextInput style={Style.textInput} keyboardType="numeric"  value={this.state.item.price.toString()} onChangeText={this.setPackagePrice.bind(this)}></TextInput>
                        </View>
                        <View style={{height: 20}}></View>
                        <View>
                            <LabelInput text="Harga Beli/TP (Rp)*" subtext="Isi harga beli/Transfer Price dari paket ini"></LabelInput>
                            <TextInput style={Style.textInput}  keyboardType="numeric"  value={this.state.item.transferPrice.toString()} onChangeText={this.setTransferPrice.bind(this)}></TextInput>
                        </View>
                        <View style={{height: 20}}></View>
                        <View>
                            <LabelInput text="Kategori *" subtext="Pilih kategori (Acquisition atau Voucher)"></LabelInput>
                            <OptionButtons items={this.state.categories}
                            selectedValue={this.state.item.category}
                            onSelectItem={this.onCategoryChange.bind(this)}></OptionButtons>
                        </View>
                        
                    </View>
                    
                    <View style={{height: 30}}></View>
                    <View  style={{  width: '100%', padding: 20, backgroundColor: '#fff', height: 'auto'}}>
                        <LabelInput text="Sub Item" subtext="Tambahkan subitem-subitem (subkategori paket: internet/voice/sms, tipe kuota, dll)"></LabelInput>
                        {
                            (this.state.packages != null && this.state.packages.length > 0) ?
                        
                        <DropDownPicker
                                items={this.state.packages}
                                defaultValue={this.state.item.subitempackageitems}
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
                                onChangeItem={this.onPackageChange.bind(this)}
                                zIndex={1000}
                            />
                            :
                            null
                        }

                        <View style={{height: 30}}></View>
                        <Table borderStyle={{borderWidth: 2, borderColor: '#c8e1ff'}}>
                            <Row widthArr={this.state.widthArr}  data={this.state.tableHead} style={styles.head} textStyle={styles.text}/>
                            <Rows widthArr={this.state.widthArr}  data={this.state.tableData} textStyle={styles.text} style={styles.row}/>
                            
                        </Table>

                        <View style={{height: 30}}></View>
                        <Button style={Style.button} onPress={()=>this.addSubItem()}>
                            <View style={{ alignItems: 'center', width: '100%' }}>
                                <Image source={require('./images/plus-no-round-dark.png')} resizeMode='contain' ></Image>
                            </View>
                        </Button>
                    </View>
                    
                    

                    <View style={{marginTop: '10%', marginLeft: '10%'}}>
                        <Label>* Harus diisi</Label>
                    </View>
                    <View style={{height: 140}}></View>

                    
                    
            </Content>

            {
                    (this.state.showButtons) ?
            <Footer style={{height: 200, borderColor: '#eee', borderWidth: 2}}>
                <View style={{padding: '5%', backgroundColor: '#fff'}}>
                        <Button style={Style.buttonRed} onPress={()=>this.ok()}>
                            <View style={{ alignItems: 'center', width: '100%' }}>
                                <Text>Ok</Text>
                            </View>
                        </Button>
                        {
                            (this.state.item.id != null) ?
                        
                        <Button style={Style.buttonDark} onPress={()=>this.deleteItem()}>
                            <View style={{ alignItems: 'center', width: '100%' }}>
                                <Text style={Style.textWhite}>Hapus</Text>
                            </View>
                        </Button> : null
                        }
                        <Button style={Style.button} onPress={()=>this.back()}>
                            <View style={{ alignItems: 'center', width: '100%' }}>
                                <Text style={Style.textDark}>Batal</Text>
                            </View>
                        </Button>
                </View>
            </Footer>: null}
            </Container>
        );
    }
}