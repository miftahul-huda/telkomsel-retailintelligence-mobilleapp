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
import HttpClient from './util/HttpClient';
import GlobalSession from './GlobalSession';

import Style from './style';
import LabelInput from './components/LabelInput';
import SharedPage from './SharedPage';
import OptionButtons from './components/OptionButtons';
import StoreFrontItem from './model/StoreFrontItem';

import Logging from './util/Logging';

export default class EditStoreFrontItemPage extends SharedPage {


    constructor(props) {
        super(props);
        this.state = {
            ...this.state,
            file: props.file,
            title: (props.mode == "edit") ? "Edit" : "Add",
            item: props.item,
            operators: [],
            showIndicator: false,
            selectedOperator: {},
            categories: [{ label: 'Akuisisi', value: 'acquisition' }, { label: 'Voucher', value: 'voucher' }]
        }
    }

    getOperators(){
        let promise = new Promise((resolve, reject)=>{
            let url = GlobalSession.Config.API_HOST + "/operator";
            
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

    async ok()
    {
        var res = this.validate();
        let me = this;
        if(res.success)
        {
            await this.saveStoreFrontItem(function(){
                if(me.props.onAfterSaved != null)
                    me.props.onAfterSaved();

                Actions.pop();
            });
            

        }
        else
        {
            this.showDialog("Pengisian kurang lengkap", res.message)
        }
    }

    async saveStoreFrontItem(callback)
    {
        if(this.state.file.isuploaded)
            this.saveRemoteStoreFrontItem(callback);
        else
            this.saveLocalStoreFrontItem(callback);
    }

    async saveLocalStoreFrontItem(callback)
    {
        let newItem = JSON.stringify(this.state.item);
        newItem = JSON.parse(newItem);
        newItem.upload_file_id = this.state.file.id;

        console.log("new StoreFrontItem")
        console.log(newItem)

        if(this.state.item.id == null)
            await StoreFrontItem.create(newItem);
        else
            await StoreFrontItem.update(newItem, {where: { id: this.state.item.id}})
        
        if(callback != null)
            callback();
    }

    saveRemoteStoreFrontItem(callback)
    {

        let me =  this;
        me.state.item.upload_file_id = me.state.file.id;

        let url = GlobalSession.Config.API_HOST + "/storefrontitem/create";

        if(me.state.item.id != null)
            url = GlobalSession.Config.API_HOST + "/storefrontitem/update/" + me.state.item.id;

        console.log(url);
        HttpClient.post(url, me.state.item, function(response)
        {
            console.log("Response")
            console.log(response);

            if(callback != null)
                callback();

        })
    }


    async deleteItem()
    {
        if(this.state.file.isuploaded)
            this.deleteRemoteItem();
        else
            this.deleteLocalItem();
    }

    async deleteLocalItem()
    {
        try
        {
            await StoreFrontItem.destroy({where: { id: this.state.item.id}});
            
            if(this.props.onAfterSaved != null)
                this.props.onAfterSaved();  
            Actions.pop();
        }
        catch(err)
        {
            console.log("deleteItem Error")
            console.log(err)
        }
    }

    deleteRemoteItem()
    {
        let me = this;
        let url = GlobalSession.Config.API_HOST + '/storefrontitem/delete/' + me.state.item.id;
        console.log(url);

        HttpClient.get(url, function(response){
            if(me.props.onAfterSaved != null)
                me.props.onAfterSaved();  
            Actions.pop();
        })
    }



    back(){
        Actions.pop();
    }

    async getDbItem(callback)
    {
        if(this.state.file.isuploaded)
            this.getRemoteItem(callback);
        else
            this.getLocalItem(callback);
    }

    async getLocalItem(callback)
    {
        let dbItem = this.state.item;
        if(this.state.item.id != null)
            dbItem = await StoreFrontItem.findByPk(dbItem.id)
        
        if(callback != null)
            callback(dbItem);

        return dbItem;
    }

    async getRemoteItem(callback)
    {
        let dbItem = this.state.item;
        if(this.state.item.id != null)
        {
            let url = GlobalSession.Config.API_HOST + "/storefrontitem/get/" + this.state.item.id;
            console.log(url);
            HttpClient.get(url, function(response){

                console.log("Response")
                console.log(response);
                dbItem = response.payload;
                                
                if(callback != null)
                    callback(dbItem);

            }) 
        }
        else
        {
            if(callback != null)
                callback(dbItem);
        }


        return dbItem;
    }

    dbOperatorToCmbOperators(dboperators)
    {
        let ops = [];
        dboperators.map((op)=>{
            ops.push({ label: op.operator_name, value: op.operator_value });
        })
        return ops;
    }

    async componentDidMount(){
        let packes = [];
        let selectedPackage = null;
        var me = this;

        console.log("item");
        console.log(this.state.item)

        let operators = await this.getOperators()
        operators = this.dbOperatorToCmbOperators(operators);
        this.getDbItem(function(item){

            let selectedOperator = null;
            if(item.operator != null && item.operator.length > 0)
                selectedOperator = { label: item.operatorText, value: item.operator };
            else
                selectedOperator = operators[0];
    
            console.log(operators)
            console.log(selectedOperator)
    
            me.state.item.operatorText = selectedOperator.label;
            me.state.item.operator = selectedOperator.value;
            me.state.selectedOperator = selectedOperator;

            console.log("item 2");
            console.log(me.state.item)
            
            me.setState({
                operators: operators
            })

        });

    }


    isNumeric(n)
    {
        return !isNaN(parseFloat(n)) && isFinite(n);
    }

    onOperatorChanged(item)
    {
        this.state.item.operatorText = item.label;
        this.state.item.operator = item.value;
        this.setState({
            ...this.state,
            item: this.state.item
            
        })  
    }

    setPercentage(value)
    {
        this.state.item.percentage = value;
        this.setState({
            ...this.state,
            item: this.state.item
            
        })  
    }

    validate()
    {
        let res = { success: true}
         res = (this.state.item.operator == null || this.state.item.operator.length == 0) ? { success: false, message: "Mohon pilih operator" } : res;
         res = (this.state.item.percentage == null || this.state.item.percentage.length == 0) ? { success: false, message: "Mohon isi kira-kira prosentase luas operator tersebut di gambar." } : res;
        return res;
    }

 
 
    render() {
        var me = this;


        return(
            <Container>
            <Header style={{backgroundColor: '#FFF'}}>
                <View  style={Style.headerHorizontalLayout}>
                        <TouchableOpacity onPress={()=> me.back()}>
                            <Image style={Style.headerImage} resizeMode='contain' source={require('./images/back-dark.png')}></Image>
                        </TouchableOpacity>
                        <View style={{width: 10}}></View>
                        <Title style={Style.headerTitle}>Item tampak depan</Title>
                </View>
            </Header>

            <Content  style={{backgroundColor: '#eee'}}>
                <View style={{ flex: 1, height: '100%', padding: '5%', backgroundColor: '#ffffff' }}>
                    {
                        this.getDialog()
                    }
                    <View>
                        <LabelInput text="Operator *" subtext="Operator yang terlihat di tampak depan"></LabelInput>
                        {(this.state.showIndicator) ? 
                        <ActivityIndicator size="large" color="#000"></ActivityIndicator>
                        :
                        (this.state.operators != null && this.state.operators.length > 0) ?
                        <DropDownPicker
                            items={this.state.operators}
                            defaultValue={this.state.item.operator}
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
                        />: null}
                    </View>
                    <View style={{height: 20}}></View>
                    <View>
                        <LabelInput text="Persentase *" subtext="Presentase kira-kira dari operator tersebut di tampak depan"></LabelInput>
                        <TextInput style={Style.textInput} keyboardType="numeric" value={this.state.item.percentage.toString()} onChangeText={this.setPercentage.bind(this)}/>
                    </View>
                    <View style={{height: 20}}></View>


                    <View style={{marginTop: '10%'}}>
                        <Label>* Harus diisi</Label>
                    </View>


                </View>
                <View style={{height: 30}}>
                </View>
                
            </Content>
            <Footer style={{height: 200, borderColor: '#eee', borderWidth: 2}}>
                <View style={{padding: '5%', backgroundColor: '#ffffff'}}>
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
            </Footer>

            </Container>
        );
    }
}