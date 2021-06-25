import React, { Component } from 'react';
import { ActivityIndicator, Dimensions } from 'react-native';
import { Container, Content, Text, Card, Header, Footer, Body, Title, 
  List,
  ListItem,
  Item, CardItem, Icon, Button, Input, Label, Radio, Right, Left, CheckBox } from 'native-base';


import { Image, View, ScrollView, TouchableOpacity, Alert, TextInput } from 'react-native';
import { Actions } from 'react-native-router-flux';
import UploadedFile from './model/UploadedFile';
import DropDownPicker from 'react-native-dropdown-picker';

import Config from './config.json';
import HttpClient from './util/HttpClient';
GlobalSession = require( './GlobalSession');

import Logging from './util/Logging';

export default class EditStoreFrontItemPage extends React.Component {


    constructor(props) {
        super(props);
        this.state = {
            file: props.file,
            title: (props.mode == "edit") ? "Edit" : "Add",
            item: props.item,
            operators: [{ value: '0', label: ''}],
            showIndicator: false,
            selectedOperator: { value: '0', label: ''}
        }
    }

    getOperators(){
        let promise = new Promise((resolve, reject)=>{
            let url = Config.API_HOST + "/operator";
            
            HttpClient.get(url, function(res){
                
                resolve(res.payload);
            }, function(res){
                reject(res);
            });
        });
        return promise;
    }

    async displayOperators(operators)
    {
        var me = this;
        this.setState({
            showIndicator: true
        })
        try
        {
            var operators = await this.getOperators();
            console.log(operators);

            var operatorItems = [];
            let counter = 0;
            let selectedOperator = null;
            operators.forEach(function(item, index){
                let it = { value: item.operator_value, label: item.operator_name };
                operatorItems.push( it );
                if(counter == 0 || (me.state.item.operator != null && item.operator_name.toLowerCase().trim() == me.state.item.operator.toLowerCase().trim()))
                {
                    selectedOperator = it;
                    if(me.state.item.operator == null)
                    {
                        //alert("ehre")
                        me.state.item.operator = it.label;
                        //alert(me.state.item.operator)
                    }
                        
                }
                counter++;
            });

            this.state.operators = operatorItems;
            this.setState({
                operators: operatorItems,
                selectedOperator: selectedOperator,
                showIndicator: false
            })
        }
        catch(err)
        {
            alert("Fail to get operators")
            this.setState({
                showIndicator: false
            })

            Logging.log(err, "error", "EditStoreFrontItemPage.displayOperators().this.getOperators()")
        }
    }

    getSelectedOperator(label)
    {
        let selectedOperator = null;
        console.log("OPERATORRSSSSSS")
        console.log(this.state.operators);
        this.state.operators.map(function(item, index){

            if(item.label.toLowerCase().trim().indexOf(label.toLowerCase().trim()) > -1)
            {

                selectedOperator = item;
            }
        })

        return selectedOperator;
    }

    ok()
    {
        var res = this.validate();
        if(res.success)
        {
            if(this.props.onSave != null)
                this.props.onSave(this.state.item);
            
            Actions.pop();
        }
        else
        {
            Alert.alert(res.message);
        }
    }

    setPackageName(value){

        this.state.item.package_name = value;

        this.setState({
            ...this.state,
            item: this.state.item
            
        })
    }

    setPercentage(value){

        this.state.item.percentage = value;

        this.setState({
            ...this.state,
            item: this.state.item
            
        })
    }

    setProductHero(value){

        this.state.item.productHero = value;

        this.setState({
            ...this.state,
            item: this.state.item
            
        })
    }

    setPackageGB(value){

        this.state.item.gbmain = value;

        this.setState({
            ...this.state,
            item: this.state.item
            
        })
    }

    setPackagePrice(value){
        this.state.item.price = value;
        this.setState({
            ...this.state,
            item: this.state.item
            
        })
    }

    setValidity(value){
        this.state.item.validity = value;
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

    onCategoryChange(value)
    {
        this.state.item.category = value;
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

        console.log("item");
        console.log(this.state.item)

        this.displayOperators();

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
        
        if(this.state.item.percentage == "")
            this.state.item.percentage = 0;

        if(!this.isNumeric(this.state.item.transferPrice))
            return { success: false, message: 'Harga beli harus angka'};
        
        if(!this.isNumeric(this.state.item.validity))
            return { success: false, message: 'Masa berlaku harus angka'};

        if(!this.isNumeric(this.state.item.price))
            return { success: false, message: 'Harga harus angka'};
        
        if(!this.isNumeric(this.state.item.gbmain))
            return { success: false, message: 'Kuota harus angka'};

        
        if(!this.isNumeric(this.state.item.percentage))
            return { success: false, message: 'Persentase harus angka'};
        
        if(this.state.item.gbmain == 0)
            return { success: false, message: 'Kuota harus diisi'};
        
        if(this.state.item.price == 0)
            return { success: false, message: 'Harga harus diisi'};

        return { success: true }
    }

    isNumeric(n)
    {
        return !isNaN(parseFloat(n)) && isFinite(n);
    }

    onOperatorChanged(item)
    {
        this.state.item.operator = item.label;
        this.setState({
            ...this.state,
            item: this.state.item
            
        })  
    }

 
 
    render() {
        return(
            <Container>
            <Header style={{backgroundColor: '#AA2025'}}>
                <Body>
                <View  style={{flex: 1, flexDirection: 'row'}}>
                <TouchableOpacity onPress={()=> this.back()} style={{marginTop: '0%', padding: '4%'}} >
                    <Image style={{ width: 20, height: 20}} source={require('./images/back.png')}></Image>
                </TouchableOpacity>
                <Title style={{ marginTop: '3%' }}>{this.state.title} Item Tampak Depan</Title>
                </View>
                </Body>
            </Header>

            <Content padder>
                <View style={{ flex: 1, height: '100%', padding: '5%' }}>
                    <View>
                        <Label style={{ fontWeight: 'bold', paddingBottom: 4 }}>Operator</Label>
                        {(this.state.showIndicator) ? 
                        <ActivityIndicator size="large" color="#000"></ActivityIndicator>
                        :
                        <DropDownPicker
                            items={this.state.operators}
                            defaultValue={this.state.selectedOperator.value}
                            containerStyle={{height: 60}}
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
                        />}
                    </View>
                    <View style={{height: 10}}></View>
                    <Item floatingLabel>
                        <Label style={{ fontWeight: 'normal', paddingBottom: 4 }}>Persentase</Label>
                        <Input keyboardType="numeric" value={this.state.item.percentage.toString()} onChangeText={this.setPercentage.bind(this)}/>
                    </Item>
                    <View style={{height: 10}}></View>
                    <Item floatingLabel>
                        <Label style={{ fontWeight: 'normal', paddingBottom: 4 }}>Produk Terlaris</Label>
                        <Input value={this.state.item.productHero} onChangeText={this.setProductHero.bind(this)}/>
                    </Item>
                    <View style={{height: 10}}></View>
                    <Item floatingLabel>
                        <Label style={{ fontWeight: 'normal', paddingBottom: 4 }}>Kuota (GB) *</Label>
                        <Input keyboardType="numeric"  value={this.state.item.gbmain.toString()} onChangeText={this.setPackageGB.bind(this)}/>
                    </Item>
                    <View style={{height: 10}}></View>
                    <Item floatingLabel>
                        <Label style={{ fontWeight: 'normal', paddingBottom: 4 }}>Harga (Rp) *</Label>
                        <Input keyboardType="numeric"  value={this.state.item.price.toString()} onChangeText={this.setPackagePrice.bind(this)}/>
                    </Item>
                    <View style={{height: 10}}></View>
                    <Item floatingLabel>
                        <Label style={{ fontWeight: 'normal', paddingBottom: 4 }}>Masa aktif paket (hari)</Label>
                        <Input keyboardType="numeric"  value={this.state.item.validity.toString()} onChangeText={this.setValidity.bind(this)}/>
                    </Item>
                    <View style={{height: 10}}></View>
                    <Item floatingLabel>
                        <Label style={{ fontWeight: 'normal', paddingBottom: 4 }}>Harga beli (Rp)</Label>
                        <Input keyboardType="numeric"  value={this.state.item.transferPrice.toString()} onChangeText={this.setTransferPrice.bind(this)}/>
                    </Item>
                    <View style={{height: 10}}></View>
                    <Label>Category</Label>
                    <List>
                        <ListItem>
                            <Left>
                                <Text>Akuisisi</Text>
                            </Left>
                            <Right>
                                <Radio onPress={this.onCategoryChange.bind(this, 'acquisition')} selected={(this.state.item.category == "acquisition" ) ? true : false} />
                            </Right>
                        </ListItem>
                        <ListItem>
                            <Left>
                                <Text>Voucher data</Text>
                            </Left>
                            <Right>
                                <Radio onPress={this.onCategoryChange.bind(this, 'voucher')}  selected={(this.state.item.category == "voucher" ) ? true : false} />
                            </Right>
                        </ListItem>
                    </List>

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