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
            showIndicator: false,
        }
    }

    validate()
    {
        let result = { valid: true }
        if(this.state.totalSales.kartuPerdana == null || this.state.totalSales.kartuPerdana.length == 0)
            result = { valid: false, message: 'Kartu perdana tidak boleh kosong' }
        if(this.state.totalSales.voucherFisik == null || this.state.totalSales.voucherFisik.length == 0)
            result = { valid: false, message: 'Voucher fisik tidak boleh kosong' }
        if(this.state.totalSales.isiUlang == null || this.state.totalSales.isiUlang.length == 0)
            result = { valid: false, message: 'Isi ulang tidak boleh kosong' }
        if(this.state.totalSales.paketPalingBanyakDibeli == null || this.state.totalSales.paketPalingBanyakDibeli.length == 0)
            result = { valid: false, message: 'Paket paling banyak dibeli tidak boleh kosong' }

        return result;
    }

    async ok()
    {
        var res = this.validate();
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
        return this.saveTotalSales();

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

        me.loadKeyValueItems("total-sales-kartu-perdana").then((result)=>{
            let kartuPerdanaItems = result.payload;
            me.loadKeyValueItems("total-sales-voucher-fisik").then((result)=>{
                let voucherFisikItems = result.payload;

                kartuPerdanaItems = me.objects2DropdownList(kartuPerdanaItems)
                voucherFisikItems = me.objects2DropdownList(voucherFisikItems)

                me.setState({
                    showIndicator: false,
                    kartuPerdanaItems: kartuPerdanaItems,
                    voucherFisikItems: voucherFisikItems
                })
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
                            <LabelInput text="Kartu perdana *" subtext="Pilih kartu perdana" link="1" onShowInfo={this.onShowInfo.bind(this, "total-sales-kartu-perdana")}></LabelInput>
                            <DropDownPicker
                                items={this.state.kartuPerdanaItems}
                                defaultValue={this.state.totalSales.kartuPerdana}
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
                                onChangeItem={this.onKartuPerdanaSelected.bind(this)}
                                zIndex={1000}
                            />

                        </View>

                        <View style={{height: 10}}></View>
                        <View>
                            <LabelInput text="Voucher fisik *" subtext="Pilih voucher fisik" link="1" onShowInfo={this.onShowInfo.bind(this, "total-sales-voucher-fisik")}></LabelInput>
                            <DropDownPicker
                                items={this.state.voucherFisikItems}
                                defaultValue={this.state.totalSales.voucherFisik}
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
                                onChangeItem={this.onVoucherFisikSelected.bind(this)}
                                zIndex={1000}
                            />
                        </View>
                        <View style={{height: 20}}></View>
                        <View>
                            <LabelInput text="Isi Ulang *" subtext="Isi besaran isi ulang"></LabelInput>
                            <TextInput style={Style.textInput} value={this.state.totalSales.isiUlang} onChangeText={this.setIsiUlang.bind(this)}></TextInput>
                        </View>
                        <View style={{height: 20}}></View>
                        <View>
                            <LabelInput text="Paket paling banyak dibeli *" subtext="Isi dengan nama paket yang paling banyak dibeli"></LabelInput>
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
                </View>
            </Footer>
            </Container>
        );
    }
}