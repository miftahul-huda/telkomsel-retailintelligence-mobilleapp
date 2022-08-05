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
            voucherFisikItems:[],
            kartuPerdanaItems: [],
            rechargeItems: [],
            showIndicator: false,
            operators: []
        }
    }

    async validate()
    {
        let result = { valid: true }
        
        if(this.state.totalSales.isiUlang == null || this.state.totalSales.isiUlang.length == 0)
            result = { valid: false, message: 'Isi ulang tidak boleh kosong' }
        if(this.state.totalSales.paketPalingBanyakDibeli == null || this.state.totalSales.paketPalingBanyakDibeli.length == 0)
            result = { valid: false, message: 'Paket paling banyak dibeli tidak boleh kosong' }

        let existingTotalSales = await this.loadExistingTotalSales()
        let exists = this.checkOperators(existingTotalSales)
        if(exists == true)
            result = { valid: false, message: 'Operator \'' + this.state.totalSales.operator + '\' sudah ada/sudah diisi. Pilih operator yang lain.'}

        console.log(result)

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

   

    setKartuPerdana(value){
        this.state.totalSales.kartuPerdana = value;
        this.setState({
            ...this.state,
            totalSales: this.state.totalSales
            
        })
    }

    setVoucherFisik(value){
        this.state.totalSales.voucherFisik = value;
        this.setState({
            ...this.state,
            totalSales: this.state.totalSales
            
        })
    }

    setIsiUlang(value){
        this.state.totalSales.isiUlang = value;
        this.setState({
            ...this.state,
            totalSales: this.state.totalSales
            
        })
    }

    setPaketPalingBanyakDibeli(value){
        this.state.totalSales.paketPalingBanyakDibeli = value;
        this.setState({
            ...this.state,
            totalSales: this.state.totalSales
            
        })
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

    async saveTotalSales()
    {
        let promise = new Promise((resolve, reject)=>{
            this.state.totalSales.upload_file_id = this.state.file.id

            if(this.state.totalSales.id == null)
            {
                TotalSales.create(this.state.totalSales).then((res)=>{
                    console.log("TotalSales create saved!")
                    resolve(res);
                }).catch((err)=>{
                    console.log(err)
                    reject(err)
                })
            }
            else
            {
                let totSales = JSON.stringify(this.state.totalSales)
                totSales = JSON.parse(totSales)

                TotalSales.update(totSales, { where: { id: this.state.totalSales.id } }).then((res)=>{
                    console.log("TotalSales update saved!")
                    resolve(res);
                }).catch((err)=>{
                    console.log(err)
                    reject(err)
                })
            }

        })

        return promise;
    }

    

    componentDidMount(){
        let packes = [];
        let selectedPackage = null;
        //let operator_id = this.props.operator.value;
        var me = this;
        me.setState({
            showIndicator: true
        })

        console.log("componentDidMount")
        console.log(this.state.totalSales)

        me.loadOperators().then((result)=>{
            let operators = result.payload;
            operators = me.opeartors2DropdownList(operators)

            me.setState({
                showIndicator: false,
                operators: operators
            })
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

            <Content style={{backgroundColor: '#eee'}}>
                    {
                        this.getDialog()
                    }
                    <View style={{  width: '100%', padding: 20, backgroundColor: '#fff', height: 'auto'}}>
                        <View>
                            <Text style={Style.contentTitle}>Informasi umum detail produk</Text>
                        </View>
                        <View style={{height: 10}}></View>
                        <View>
                            <LabelInput text="Operator *" subtext="Pilih operator" link="1"></LabelInput>
                            <DropDownPicker
                                items={this.state.operators}
                                defaultValue={this.state.totalSales.operator}
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
                                onChangeItem={this.onOperatorSelected.bind(this)}
                                zIndex={1000}
                            />

                        </View>

                        <View style={{height: 20}}></View>
                        <View style={{height: 50}}>
                            <Text style={{fontSize: 20, fontWeight: 'bold'}}>Micro &lt;= 15K</Text>
                        </View>
                        <View>
                            <LabelInput text="Total Perdana" subtext="Isi rata-rata total penjualan perhari, format angka. Contoh: 10"></LabelInput>
                            <TextInput style={Style.textInput} keyboardType="numeric" value={this.state.totalSales.totalPenjualanKartuPerdanaMicro} onChangeText={this.totalPenjualanKartuPerdanaMicro.bind(this)}></TextInput>
                        </View>
                        <View>
                            <LabelInput text="Total Voucher Fisik" subtext="Isi rata-rata total penjualan perhari, format angka. Contoh: 10"></LabelInput>
                            <TextInput style={Style.textInput} keyboardType="numeric" value={this.state.totalSales.totalPenjualanVoucherFisikMicro} onChangeText={this.totalPenjualanVoucherFisikMicro.bind(this)}></TextInput>
                        </View>

                        
                        <View style={{height: 20}}></View>
                        <View style={{height: 50}}>
                            <Text style={{fontSize: 20, fontWeight: 'bold'}}>Low &lt;= 35K</Text>
                        </View>
                        <View>
                            <LabelInput text="Total Perdana" subtext="Isi rata-rata total penjualan perhari, format angka. Contoh: 10"></LabelInput>
                            <TextInput style={Style.textInput} keyboardType="numeric" value={this.state.totalSales.totalPenjualanKartuPerdanaLow} onChangeText={this.totalPenjualanKartuPerdanaLow.bind(this)}></TextInput>
                        </View>
                        <View>
                            <LabelInput text="Total Voucher Fisik" subtext="Isi rata-rata total penjualan perhari, format angka. Contoh: 10"></LabelInput>
                            <TextInput style={Style.textInput} keyboardType="numeric" value={this.state.totalSales.totalPenjualanVoucherFisikLow} onChangeText={this.totalPenjualanVoucherFisikLow.bind(this)}></TextInput>
                        </View>

                        <View style={{height: 20}}></View>
                        <View style={{height: 50}}>
                            <Text style={{fontSize: 20, fontWeight: 'bold'}}>Mid &lt;= 55K</Text>
                        </View>
                        <View>
                            <LabelInput text="Total Perdana" subtext="Isi rata-rata total penjualan perhari, format angka. Contoh: 10"></LabelInput>
                            <TextInput style={Style.textInput} keyboardType="numeric" value={this.state.totalSales.totalPenjualanKartuPerdanaMid} onChangeText={this.totalPenjualanKartuPerdanaMid.bind(this)}></TextInput>
                        </View>
                        <View>
                            <LabelInput text="Total Voucher Fisik" subtext="Isi rata-rata total penjualan perhari, format angka. Contoh: 10"></LabelInput>
                            <TextInput style={Style.textInput} keyboardType="numeric" value={this.state.totalSales.totalPenjualanVoucherFisikMid} onChangeText={this.totalPenjualanVoucherFisikMid.bind(this)}></TextInput>
                        </View>


                        <View style={{height: 20}}></View>
                        <View style={{height: 50}}>
                            <Text style={{fontSize: 20, fontWeight: 'bold'}}>High &gt; 55K</Text>
                        </View>
                        <View>
                            <LabelInput text="Total Perdana" subtext="Isi rata-rata total penjualan perhari, format angka. Contoh: 10"></LabelInput>
                            <TextInput style={Style.textInput} keyboardType="numeric" value={this.state.totalSales.totalPenjualanKartuPerdanaHigh} onChangeText={this.totalPenjualanKartuPerdanaHigh.bind(this)}></TextInput>
                        </View>
                        <View>
                            <LabelInput text="Total Voucher Fisik" subtext="Isi rata-rata total penjualan perhari, format angka. Contoh: 10"></LabelInput>
                            <TextInput style={Style.textInput} keyboardType="numeric" value={this.state.totalSales.totalPenjualanVoucherFisikHigh} onChangeText={this.totalPenjualanVoucherFisikHigh.bind(this)}></TextInput>
                        </View>
                        <View style={{height: 30}}>

                        </View>
                        <View style={{height: 2, backgroundColor: '#ccc'}}>

                        </View>
                        <View style={{height: 30}}>

                        </View>
                        <View>
                            <LabelInput text="Isi ulang paling banyak dibeli (Rp) *" subtext="Isi isi ulang dalam rupiah, format angka. Contoh: 100000"></LabelInput>
                            <TextInput style={Style.textInput} keyboardType="numeric" value={this.state.totalSales.isiUlang} onChangeText={this.setIsiUlang.bind(this)}></TextInput>
                        </View>
                        <View style={{height: 20}}></View>
                        <View>
                            <LabelInput text="Paket paling banyak dibeli *" subtext="Isi dengan format : <nama paket> <besaran>, contoh: Combo Sakti 26GB"></LabelInput>
                            <TextInput style={Style.textInput} value={this.state.totalSales.paketPalingBanyakDibeli} onChangeText={this.setPaketPalingBanyakDibeli.bind(this)}></TextInput>
                        </View>
                        <View style={{height: 20}}></View>
                    </View>
                    
                    <View style={{marginTop: '10%', marginLeft: '10%'}}>
                        <Label>* Harus diisi</Label>
                    </View>
                    <View style={{height: 10}}></View>

                    
                    
            </Content>
            <Footer style={{height: 200, borderColor: '#eee', borderWidth: 2}}>
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

                        
                </View>
            </Footer>
            </Container>
        );
    }
}