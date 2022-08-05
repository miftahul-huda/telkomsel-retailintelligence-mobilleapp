import React, { Component } from 'react';
import { Dimensions, StyleSheet, ActivityIndicator, TurboModuleRegistry } from 'react-native';
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

import TotalSales from './model/TotalSales';
import HttpClient from './util/HttpClient';
import GlobalSession from './GlobalSession';
import Style from './style';
import OptionButtons from './components/OptionButtons';
import LabelInput from './components/LabelInput';
import SharedPage from './SharedPage';
import KeyValueItemLogic from './actions/KeyValueItemLogic';
import OperatorLogic from  './actions/OperatorLogic';

import Logging from './util/Logging';
import Util from './util/Util'


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

export default class EditTotalSalesPage extends SharedPage {


    constructor(props) {
        super(props);
        this.state = {
            ...this.state,
            file: props.file,
            title: (props.mode == "edit") ? "Ubah" : "Tambah",
            totalSales: props.totalSales,
            isiUlang: 0,
            paketPalingBanyakDibeli: '',
            paketPalingBanyakDibeliNama: '',
            paketPalingBanyakDibeliBesaran: '0',
            voucherFisikItems:[],
            kartuPerdanaItems: [],
            rechargeItems: [],
            showIndicator: false,
            operators: [],
            totalPenjualanKartuPerdanaTelkomsel: '0',
            totalPenjualanVoucherFisikTelkomsel: '0',
            totalPenjualanKartuPerdanaIndosat: '0',
            totalPenjualanVoucherFisikIndosat: '0',
            totalPenjualanKartuPerdanaXL: '0',
            totalPenjualanVoucherFisikXL: '0',
            totalPenjualanKartuPerdanaSmartfren: '0',
            totalPenjualanVoucherFisikSmartfren: '0',
            totalPenjualanKartuPerdanaAxis: '0',
            totalPenjualanVoucherFisikAxis: '0',
            totalPenjualanKartuPerdanaTri: '0',
            totalPenjualanVoucherFisikTri: '0',
            showButtons: false,
        }
    }

    async validate()
    {
        let result = { valid: true }
        
        return result;
    }

    async loadExistingTotalSales()
    {
        let existingTotalSales = await TotalSales.findAll({ where: { upload_file_id: this.state.file.id } })
        return existingTotalSales;
    }


    checkOperators(existingTotalSales)
    {
        let exists = false;
        let opsel = "";
        for(var  i = 0; i < existingTotalSales.length; i++)
        {
            if(this.state.totalSales.operator == existingTotalSales[i].operator)
            {
                exists = true;
                break;
            }
        }

        return exists;
    }

    async ok()
    {
        var res = await this.validate();
        console.log(res)
        if(res.valid)
        {
            await this.save();
            if(this.props.onAfterSaved != null)
                this.props.onAfterSaved(this.state.totalSales);
            
            Actions.pop();
        }
        else
        {
            this.showDialog("Pengisian kurang lengkap.", res.message)
        }
    }

    async delete()
    {

        await TotalSales.destroy({ where: { id: this.state.totalSales.id } })

        if(this.props.onAfterSaved != null)
            this.props.onAfterSaved(this.state.totalSales);
    
        Actions.pop();
    }

   

    setIsiUlang(value){
        this.state.isiUlang = value;
        this.setState({
            ...this.state,
            isiUlang: this.state.isiUlang
            
        })
    }

    setPaketPalingBanyakDibeliNama(value){
        this.state.paketPalingBanyakDibeliNama = value;
        this.setState({
            ...this.state,
            paketPalingBanyakDibeliNama: this.state.paketPalingBanyakDibeliNama
            
        })
    }

    setPaketPalingBanyakDibeliBesaran(value){
        this.state.paketPalingBanyakDibeliBesaran = value;
        this.setState({
            ...this.state,
            paketPalingBanyakDibeliBesaran: this.state.paketPalingBanyakDibeliBesaran
            
        })
    }

    setPenjualanPerdanaTelkomsel(value){
        value = this.processValidation(value);
        this.state.totalPenjualanKartuPerdanaTelkomsel = value;
        this.setState({
            ...this.state,
            totalPenjualanKartuPerdanaTelkomsel: this.state.totalPenjualanKartuPerdanaTelkomsel
        })
    }

    setVoucherFisikTelkomsel(value){
        value = this.processValidation(value);
        this.state.totalPenjualanVoucherFisikTelkomsel = value;
        this.setState({
            ...this.state,
            totalPenjualanVoucherFisikTelkomsel: this.state.totalPenjualanVoucherFisikTelkomsel
        })
    }

    setPenjualanPerdanaIndosat(value){
        value = this.processValidation(value);
        this.state.totalPenjualanKartuPerdanaIndosat = value;
        this.setState({
            ...this.state,
            totalPenjualanKartuPerdanaIndosat: this.state.totalPenjualanKartuPerdanaIndosat
        })
    }


    setVoucherFisikIndosat(value){
        value = this.processValidation(value);
        this.state.totalPenjualanVoucherFisikIndosat = value;
        this.setState({
            ...this.state,
            totalPenjualanVoucherFisikIndosat: this.state.totalPenjualanVoucherFisikIndosat
        })
    }

    setPenjualanPerdanaXL(value){
        value = this.processValidation(value);
        this.state.totalPenjualanKartuPerdanaXL = value;
        this.setState({
            ...this.state,
            totalPenjualanKartuPerdanaXL: this.state.totalPenjualanKartuPerdanaXL
        })
    }

    setVoucherFisikXL(value){
        value = this.processValidation(value);
        this.state.totalPenjualanVoucherFisikXL = value;
        this.setState({
            ...this.state,
            totalPenjualanVoucherFisikXL: this.state.totalPenjualanVoucherFisikXL
        })
    }



    setPenjualanPerdanaSmartfren(value){
        value = this.processValidation(value);
        this.state.totalPenjualanKartuPerdanaSmartfren = value;
        this.setState({
            ...this.state,
            totalPenjualanKartuPerdanaSmartfren: this.state.totalPenjualanKartuPerdanaSmartfren
        })
    }

    setVoucherFisikSmartfren(value){
        value = this.processValidation(value);
        this.state.totalPenjualanVoucherFisikSmartfren = value;
        this.setState({
            ...this.state,
            totalPenjualanVoucherFisikSmartfren: this.state.totalPenjualanVoucherFisikSmartfren
        })
    }


    setPenjualanPerdanaAxis(value){
        value = this.processValidation(value);
        this.state.totalPenjualanKartuPerdanaAxis = value;
        this.setState({
            ...this.state,
            totalPenjualanKartuPerdanaAxis: this.state.totalPenjualanKartuPerdanaAxis
        })
    }

    setVoucherFisikAxis(value){
        value = this.processValidation(value);
        this.state.totalPenjualanVoucherFisikAxis = value;
        this.setState({
            ...this.state,
            totalPenjualanVoucherFisikAxis: this.state.totalPenjualanVoucherFisikAxis
        })
    }


    setPenjualanPerdanaTri(value){
        value = this.processValidation(value);
        this.state.totalPenjualanKartuPerdanaTri = value;
        this.setState({
            ...this.state,
            totalPenjualanKartuPerdanaTri: this.state.totalPenjualanKartuPerdanaTri
        })
    }

    setVoucherFisikTri(value){
        value = this.processValidation(value);
        this.state.totalPenjualanVoucherFisikTri = value;
        this.setState({
            ...this.state,
            totalPenjualanVoucherFisikTri: this.state.totalPenjualanVoucherFisikTri
        })
    }

    processValidation(value)
    {
        if(this.validateTotalSales(value) == false)
        {
            value = 0
            alert("Total penjualan tidak bisa melebihi 100 buah (maks. 100)")
        }

        return value;
    }

    validateTotalSales(totalSalesValue)
    {
        if(totalSalesValue > 100)
            return false;
        else
            return true;
    }



    back(){
        Actions.pop();
    }

    async save()
    {
        var me = this;
        if(this.state.file.isuploaded)
            return this.saveTotalSalesRemote();
        else
            return this.saveTotalSales();

    }

    async saveTotalSalesRemote()
    {
        let me = this;
        if(this.state.totalSales.id == null)
        {
            let promise = new Promise((resolve, reject)=>{
                me.state.totalSales.upload_file_id = me.state.file.id;
                let url = GlobalSession.Config.API_HOST + "/totalsales/add";
                HttpClient.post(url, me.state.totalSales, function(response){
                    console.log("Saved remote ")
                    console.log(response);
                    
                    resolve(response);
                }, function(err){
                    reject(err);
                })
            })
            return promise;
        }
        else 
        {
            let promise = new Promise((resolve, reject)=>{
                let url = GlobalSession.Config.API_HOST + "/totalsales/update/" + me.state.totalSales.id;
                HttpClient.post(url, me.state.totalSales, function(response){
                    console.log("Saved remote ")
                    console.log(response);
                    
                    resolve(response);
                }, function(err){
                    reject(err);
                })
            })
            return promise;
        }

    }

    createNewTotalSales()
    {
        let  paketPalingBanyakDibeli = this.state.paketPalingBanyakDibeliNama + " " + this.state.paketPalingBanyakDibeliBesaran + " GB"
        let totalSales = [];
        totalSales.push({ upload_file_id: this.state.file.id, operator: 'telkomsel', isiUlang: this.state.isiUlang, paketPalingBanyakDibeliNama: this.state.paketPalingBanyakDibeliNama, paketPalingBanyakDibeliBesaran: this.state.paketPalingBanyakDibeliBesaran, paketPalingBanyakDibeli: paketPalingBanyakDibeli, totalPenjualanPerdana: this.state.totalPenjualanKartuPerdanaTelkomsel,  totalPenjualanVoucherFisik: this.state.totalPenjualanVoucherFisikTelkomsel })
        totalSales.push({ upload_file_id: this.state.file.id, operator: 'indosat', isiUlang: this.state.isiUlang, paketPalingBanyakDibeliNama: this.state.paketPalingBanyakDibeliNama, paketPalingBanyakDibeliBesaran: this.state.paketPalingBanyakDibeliBesaran, paketPalingBanyakDibeli: paketPalingBanyakDibeli, totalPenjualanPerdana: this.state.totalPenjualanKartuPerdanaIndosat,  totalPenjualanVoucherFisik: this.state.totalPenjualanVoucherFisikIndosat })
        totalSales.push({ upload_file_id: this.state.file.id, operator: 'xl', isiUlang: this.state.isiUlang, paketPalingBanyakDibeliNama: this.state.paketPalingBanyakDibeliNama, paketPalingBanyakDibeliBesaran: this.state.paketPalingBanyakDibeliBesaran, paketPalingBanyakDibeli: paketPalingBanyakDibeli, totalPenjualanPerdana: this.state.totalPenjualanKartuPerdanaXL,  totalPenjualanVoucherFisik: this.state.totalPenjualanVoucherFisikXL })
        totalSales.push({ upload_file_id: this.state.file.id, operator: 'smartfren', isiUlang: this.state.isiUlang, paketPalingBanyakDibeliNama: this.state.paketPalingBanyakDibeliNama, paketPalingBanyakDibeliBesaran: this.state.paketPalingBanyakDibeliBesaran, paketPalingBanyakDibeli: paketPalingBanyakDibeli, totalPenjualanPerdana: this.state.totalPenjualanKartuPerdanaSmartfren,  totalPenjualanVoucherFisik: this.state.totalPenjualanVoucherFisikSmartfren })
        totalSales.push({ upload_file_id: this.state.file.id, operator: 'axis', isiUlang: this.state.isiUlang, paketPalingBanyakDibeliNama: this.state.paketPalingBanyakDibeliNama, paketPalingBanyakDibeliBesaran: this.state.paketPalingBanyakDibeliBesaran, paketPalingBanyakDibeli: paketPalingBanyakDibeli, totalPenjualanPerdana: this.state.totalPenjualanKartuPerdanaAxis,  totalPenjualanVoucherFisik: this.state.totalPenjualanVoucherFisikAxis })
        totalSales.push({ upload_file_id: this.state.file.id, operator: 'tri', isiUlang: this.state.isiUlang, paketPalingBanyakDibeliNama: this.state.paketPalingBanyakDibeliNama, paketPalingBanyakDibeliBesaran: this.state.paketPalingBanyakDibeliBesaran, paketPalingBanyakDibeli: paketPalingBanyakDibeli, totalPenjualanPerdana: this.state.totalPenjualanKartuPerdanaTri,  totalPenjualanVoucherFisik: this.state.totalPenjualanVoucherFisikTri })

        return totalSales;
    }

    async saveTotalSales()
    {
        let promise = new Promise(async (resolve, reject)=>{
            
            await TotalSales.destroy({ where: { upload_file_id: this.state.file.id } });
            let totalSales = this.createNewTotalSales();
            TotalSales.bulkCreate(totalSales).then((res)=>{
                this.state.totalSales = totalSales
                resolve(res)
            }).catch((err)=>{
                reject(err)
            })
            
        })

        return promise;
    }

    

    async componentDidMount(){
        let packes = [];
        let selectedPackage = null;
        //let operator_id = this.props.operator.value;
        var me = this;
        me.setState({
            showIndicator: true
        })

        console.log("componentDidMount")
        let totalSales = await TotalSales.findAll({ where: { upload_file_id: this.state.file.id }})

        console.log("totalSales");
        console.log(totalSales);

        totalSales.forEach(function (item){
            if(item.operator == "telkomsel")
            {
                me.state.totalPenjualanKartuPerdanaTelkomsel = item.totalPenjualanPerdana
                me.state.totalPenjualanVoucherFisikTelkomsel = item.totalPenjualanVoucherFisik
            }
            if(item.operator == "indosat")
            {
                me.state.totalPenjualanKartuPerdanaIndosat = item.totalPenjualanPerdana
                me.state.totalPenjualanVoucherFisikIndosat = item.totalPenjualanVoucherFisik
            }
            if(item.operator == "xl")
            {
                me.state.totalPenjualanKartuPerdanaXL = item.totalPenjualanPerdana
                me.state.totalPenjualanVoucherFisikXL = item.totalPenjualanVoucherFisik
            }
            if(item.operator == "smartfren")
            {
                me.state.totalPenjualanKartuPerdanaSmartfren = item.totalPenjualanPerdana
                me.state.totalPenjualanVoucherFisikSmartfren = item.totalPenjualanVoucherFisik
            }
            if(item.operator == "axis")
            {
                me.state.totalPenjualanKartuPerdanaAxis = item.totalPenjualanPerdana
                me.state.totalPenjualanVoucherFisikAxis = item.totalPenjualanVoucherFisik
            }
            if(item.operator == "tri")
            {
                me.state.totalPenjualanKartuPerdanaTri = item.totalPenjualanPerdana
                me.state.totalPenjualanVoucherFisikTri = item.totalPenjualanVoucherFisik
            }

            me.state.isiUlang = item.isiUlang
            me.state.paketPalingBanyakDibeliNama = item.paketPalingBanyakDibeliNama
            me.state.paketPalingBanyakDibeliBesaran = item.paketPalingBanyakDibeliBesaran
        })

        this.setState({
            ...this.state,
            showIndicator: false,
            isiUlang: this.state.isiUlang,
            paketPalingBanyakDibeliNama: this.state.paketPalingBanyakDibeliNama,
            paketPalingBanyakDibeliBesaran: this.state.paketPalingBanyakDibeliBesaran,
            totalPenjualanKartuPerdanaTelkomsel: this.state.totalPenjualanKartuPerdanaTelkomsel,
            totalPenjualanKartuPerdanaIndosat: this.state.totalPenjualanKartuPerdanaIndosat,
            totalPenjualanKartuPerdanaXL: this.state.totalPenjualanKartuPerdanaXL,
            totalPenjualanKartuPerdanaSmartfren: this.state.totalPenjualanKartuPerdanaSmartfren,
            totalPenjualanKartuPerdanaAxis: this.state.totalPenjualanKartuPerdanaAxis,
            totalPenjualanKartuPerdanaTri: this.state.totalPenjualanKartuPerdanaTri,
            totalPenjualanVoucherFisikTelkomsel: this.state.totalPenjualanVoucherFisikTelkomsel,
            totalPenjualanVoucherFisikIndosat: this.state.totalPenjualanVoucherFisikIndosat,
            totalPenjualanVoucherFisikXL: this.state.totalPenjualanVoucherFisikXL,
            totalPenjualanVoucherFisikSmartfren: this.state.totalPenjualanVoucherFisikSmartfren,
            totalPenjualanVoucherFisikAxis: this.state.totalPenjualanVoucherFisikAxis,
            totalPenjualanVoucherFisikTri: this.state.totalPenjualanVoucherFisikTri,
        })
        
    }

    objects2DropdownList(os)
    {
        let items = []
        os.forEach((item)=>{
            items.push({ label: item.value, value: item.key  })
        })

        return items;
    }

    opeartors2DropdownList(os)
    {
        let items = []
        os.forEach((item)=>{
            items.push({ label: item.operator_name, value: item.operator_value  })
        })

        return items;
    }

    async loadKeyValueItems(tagName)
    {
        let promise = new Promise((resolve, reject)=>{
            KeyValueItemLogic.getAll(tagName).then((result)=>{
                resolve(result);

            }).catch((error) => {
                reject(error);
            })
        })

        return promise;
    }


    async loadOperators()
    {
        let promise = new Promise((resolve, reject)=>{
            OperatorLogic.getAll().then((result)=>{
                resolve(result);

            }).catch((error) => {
                reject(error);
            })
        })

        return promise;        
    }
    

    


    onAfterSaved(filePackageSubItem)
    {

 
    }

    onKartuPerdanaSelected(item)
    {
        console.log(item)
        this.state.totalSales.kartuPerdana = item.value;
    }

    onVoucherFisikSelected(item)
    {
        console.log(item)
        this.state.totalSales.voucherFisik = item.value;
    }

    onOperatorSelected(item)
    {
        this.state.totalSales.operator = item.value;
    }



    totalPenjualanKartuPerdanaMicro(value)
    {
        this.state.totalSales.totalPenjualanKartuPerdanaMicro = value;
    }

    totalPenjualanKartuPerdanaLow(value)
    {
        this.state.totalSales.totalPenjualanKartuPerdanaLow = value;
    }

    totalPenjualanKartuPerdanaMid(value)
    {
        this.state.totalSales.totalPenjualanKartuPerdanaMid = value;
    }

    totalPenjualanKartuPerdanaHigh(value)
    {
        this.state.totalSales.totalPenjualanKartuPerdanaHigh = value;
    }

    totalPenjualanVoucherFisikMicro(value)
    {
        this.state.totalSales.totalPenjualanVoucherFisikMicro = value;
    }

    totalPenjualanVoucherFisikLow(value)
    {
        this.state.totalSales.totalPenjualanVoucherFisikLow = value;
    }

    totalPenjualanVoucherFisikMid(value)
    {
        this.state.totalSales.totalPenjualanVoucherFisikMid = value;
    }

    totalPenjualanVoucherFisikHigh(value)
    {
        this.state.totalSales.totalPenjualanVoucherFisikHigh = value;
    }

    isCloseToBottom({ layoutMeasurement, contentOffset, contentSize }) 
    {
        return layoutMeasurement.height + contentOffset.y >= contentSize.height - 1;
    }
    


    render() {

        var me = this;
        let footerHeight = 0;
        if(this.state.showButtons == true)
            footerHeight= 200;

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
                                <Title style={Style.headerTitle}>Tambah Informasi</Title>
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
                        <Title style={Style.headerTitle}>Tambah Informasi</Title>
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
                    {
                        this.getDialog()
                    }
                    <View style={{  width: '100%', padding: 20, backgroundColor: '#fff', height: 'auto'}}>
                        <View>
                            <Text style={Style.contentTitle}>Informasi umum detail produk</Text>
                        </View>
                        <View style={{height: 10}}></View>

                        <View>
                            <LabelInput bold={true} text="TELKOMSEL" subtext="Isi informasi untuk TELKOMSEL"></LabelInput>
                        </View>
                        <View style={{height: 20}}>
                        </View>
                        <View>
                            <LabelInput text="Total Penjualan Kartu Perdana/hari *" subtext="Isi dalam format angka. Contoh: 25"></LabelInput>
                            <TextInput style={Style.textInput} keyboardType="numeric" value={this.state.totalPenjualanKartuPerdanaTelkomsel} onChangeText={this.setPenjualanPerdanaTelkomsel.bind(this)}></TextInput>
                        </View>
                        <View style={{height: 20}}></View>
                        <View>
                            <LabelInput text="Total Penjualan Voucher Fisik/hari *" subtext="Isi dalam format angka. Contoh: 25"></LabelInput>
                            <TextInput style={Style.textInput} keyboardType="numeric" value={this.state.totalPenjualanVoucherFisikTelkomsel} onChangeText={this.setVoucherFisikTelkomsel.bind(this)}></TextInput>
                        </View>
                        <View style={{height: 30}}></View>

                        <View>
                            <LabelInput bold={true} text="INDOSAT" subtext="Isi informasi untuk INDOSAT"></LabelInput>
                        </View>
                        <View style={{height: 20}}>
                        </View>
                        <View>
                            <LabelInput text="Total Penjualan Kartu Perdana/hari *" subtext="Isi dalam format angka. Contoh: 25"></LabelInput>
                            <TextInput style={Style.textInput} keyboardType="numeric" value={this.state.totalPenjualanKartuPerdanaIndosat} onChangeText={this.setPenjualanPerdanaIndosat.bind(this)}></TextInput>
                        </View>
                        <View style={{height: 20}}></View>
                        <View>
                            <LabelInput text="Total Penjualan Voucher Fisik/hari *" subtext="Isi dalam format angka. Contoh: 25"></LabelInput>
                            <TextInput style={Style.textInput} keyboardType="numeric" value={this.state.totalPenjualanVoucherFisikIndosat} onChangeText={this.setVoucherFisikIndosat.bind(this)}></TextInput>
                        </View>
                        <View style={{height: 30}}></View>

                        <View>
                            <LabelInput  bold={true} text="XL" subtext="Isi informasi untuk XL"></LabelInput>
                        </View>
                        <View style={{height: 20}}>
                        </View>
                        <View>
                            <LabelInput text="Total Penjualan Kartu Perdana/hari *" subtext="Isi dalam format angka. Contoh: 25"></LabelInput>
                            <TextInput style={Style.textInput} keyboardType="numeric" value={this.state.totalPenjualanKartuPerdanaXL} onChangeText={this.setPenjualanPerdanaXL.bind(this)}></TextInput>
                        </View>
                        <View style={{height: 20}}></View>
                        <View>
                            <LabelInput text="Total Penjualan Voucher Fisik/hari *" subtext="Isi dalam format angka. Contoh: 25"></LabelInput>
                            <TextInput style={Style.textInput} keyboardType="numeric" value={this.state.totalPenjualanVoucherFisikXL} onChangeText={this.setVoucherFisikXL.bind(this)}></TextInput>
                        </View>
                        <View style={{height: 30}}></View>

                        <View>
                            <LabelInput bold={true} text="SMARTFREN" subtext="Isi informasi untuk SMARTFREN"></LabelInput>
                        </View>
                        <View style={{height: 20}}>
                        </View>
                        <View>
                            <LabelInput text="Total Penjualan Kartu Perdana/hari *" subtext="Isi dalam format angka. Contoh: 25"></LabelInput>
                            <TextInput style={Style.textInput} keyboardType="numeric" value={this.state.totalPenjualanKartuPerdanaSmartfren} onChangeText={this.setPenjualanPerdanaSmartfren.bind(this)}></TextInput>
                        </View>
                        <View style={{height: 20}}></View>
                        <View>
                            <LabelInput text="Total Penjualan Voucher Fisik/hari *" subtext="Isi dalam format angka. Contoh: 25"></LabelInput>
                            <TextInput style={Style.textInput} keyboardType="numeric" value={this.state.totalPenjualanVoucherFisikSmartfren} onChangeText={this.setVoucherFisikSmartfren.bind(this)}></TextInput>
                        </View>
                        <View style={{height: 30}}></View>

                        <View>
                            <LabelInput bold={true} text="AXIS" subtext="Isi informasi untuk AXIS"></LabelInput>
                        </View>
                        <View style={{height: 20}}>
                        </View>
                        <View>
                            <LabelInput text="Total Penjualan Kartu Perdana/hari *" subtext="Isi dalam format angka. Contoh: 25"></LabelInput>
                            <TextInput style={Style.textInput} keyboardType="numeric" value={this.state.totalPenjualanKartuPerdanaAxis} onChangeText={this.setPenjualanPerdanaAxis.bind(this)}></TextInput>
                        </View>
                        <View style={{height: 20}}></View>
                        <View>
                            <LabelInput text="Total Penjualan Voucher Fisik/hari *" subtext="Isi dalam format angka. Contoh: 25"></LabelInput>
                            <TextInput style={Style.textInput} keyboardType="numeric" value={this.state.totalPenjualanVoucherFisikAxis} onChangeText={this.setVoucherFisikAxis.bind(this)}></TextInput>
                        </View>
                        <View style={{height: 30}}></View>

                        <View>
                            <LabelInput  bold={true} text="TRI" subtext="Isi informasi untuk TRI"></LabelInput>
                        </View>
                        <View style={{height: 20}}>
                        </View>
                        <View>
                            <LabelInput text="Total Penjualan Kartu Perdana/hari *" subtext="Isi dalam format angka. Contoh: 25"></LabelInput>
                            <TextInput style={Style.textInput} keyboardType="numeric" value={this.state.totalPenjualanKartuPerdanaTri} onChangeText={this.setPenjualanPerdanaTri.bind(this)}></TextInput>
                        </View>
                        <View style={{height: 20}}></View>
                        <View>
                            <LabelInput text="Total Penjualan Voucher Fisik/hari *" subtext="Isi dalam format angka. Contoh: 25"></LabelInput>
                            <TextInput style={Style.textInput} keyboardType="numeric" value={this.state.totalPenjualanVoucherFisikTri} onChangeText={this.setVoucherFisikTri.bind(this)}></TextInput>
                        </View>
                        <View style={{height: 30}}>

                        </View>
                        <View style={{height: 2, backgroundColor: '#666'}}>

                        </View>
                        <View style={{height: 10}}>

                        </View>
                        <View>
                            <LabelInput bold={true} text="INFORMASI OUTLET" subtext="Isi informasi untuk outlet ini"></LabelInput>
                        </View>

                        <View>
                            <LabelInput text="Isi ulang paling banyak dibeli (Rp)/hari *" subtext="Isi ulang dalam rupiah, format angka. Contoh: 100000"></LabelInput>
                            <TextInput style={Style.textInput} keyboardType="numeric" value={this.state.isiUlang} onChangeText={this.setIsiUlang.bind(this)}></TextInput>
                        </View>
                        <View style={{height: 20}}></View>
                        <View>
                            <LabelInput text="Paket paling banyak dibeli/hari *" subtext="Isi nama paket, misal: 'Combo Sakti'"></LabelInput>
                            <TextInput style={Style.textInput} value={this.state.paketPalingBanyakDibeliNama} onChangeText={this.setPaketPalingBanyakDibeliNama.bind(this)}></TextInput>
                        </View>
                        <View style={{height: 20}}></View>
                        <View>
                            <LabelInput text="Besaran dari paket paling banyak dibeli (GB)/hari *" subtext="Isi dengan angka Gigabyte paket tersebut. Contoh: 10"></LabelInput>
                            <TextInput style={Style.textInput} keyboardType="numeric" value={this.state.paketPalingBanyakDibeliBesaran} onChangeText={this.setPaketPalingBanyakDibeliBesaran.bind(this)}></TextInput>
                        </View>


                    </View>
                    
                    <View style={{marginTop: '10%', marginLeft: '10%'}}>
                        <Label>* Harus diisi</Label>
                    </View>
                    <View style={{height: 120}}></View>

                    
                    
            </Content>

                    <Footer style={{height: footerHeight, borderColor: '#eee', borderWidth: 2}}>
                    {
                    (this.state.showButtons) ?
                        <View style={{padding: '5%', backgroundColor: '#fff'}}>
                                <Button style={Style.buttonRed} onPress={()=>this.ok()}>
                                    <View style={{ alignItems: 'center', width: '100%' }}>
                                        <Text>Ok</Text>
                                    </View>
                                </Button>
                                
                                <Button style={Style.button} onPress={()=>this.back()}>
                                    <View style={{ alignItems: 'center', width: '100%' }}>
                                        <Text style={Style.textDark}>Batal</Text>
                                    </View>
                                </Button>

                                <Button style={Style.button} onPress={()=>this.delete()}>
                                    <View style={{ alignItems: 'center', width: '100%' }}>
                                        <Text style={Style.textDark}>Hapus</Text>
                                    </View>
                                </Button>

                                
                        </View> : null}
                    </Footer>
            
            </Container>
        );
    }
}