import React, { Component } from 'react';
import { Dimensions, StyleSheet, TouchableHighlightBase } from 'react-native';
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


export default class QuotaAppPage extends Component
{
    constructor(props)
    {
        super(props);

        let config = {};
        if(props.config != null)
            config = props.config;
        this.state = {
            quotaAppTypes: props.quotaAppTypes,
            quotaAppType: config.quotaAppType,
            appName: config.quotaAppName

        }
    }

    componentDidMount()
    {

    }

    setAppName(text)
    {
        this.setState({
            appName: text
        })
    }

    back()
    {
        Actions.pop();
    }

    ok()
    {
        if(this.props.onSave != null)
        {
            this.props.onSave({ quotaAppType: this.state.quotaAppType, appName: this.state.appName })
        }
        Actions.pop();
    }

    render() {

        console.log(this.state.quotaAppTypes)
        return(
            <Container>
                <Header style={{backgroundColor: '#AA2025'}}>
                    <Body>
                        <View  style={{flex: 1, flexDirection: 'row'}}>
                            <TouchableOpacity onPress={()=> this.back()} style={{marginTop: '0%', padding: '4%'}} >
                                <Image style={{ width: 20, height: 20}} source={require('./images/back.png')}></Image>
                        </TouchableOpacity>
                        <Title style={{ marginTop: '3%' }}>Item Kuota</Title>
                        </View>
                    </Body>
                </Header>
                <Content padder>

                    <View>
                        <Item>
                            <RadioButtonGroup items={this.state.quotaAppTypes} value={this.state.quotaAppType} 
                                onSelected={(item) => { this.setState({ quotaAppType: item.value })  }}></RadioButtonGroup>
                        </Item>
                        <View style={{height: 20}}></View>
                        <Item floatingLabel>
                            <Label>Nama aplikasi (pisahkan dengan ',' jika lebih dari satu)</Label>
                            <Input value={this.state.appName} onChangeText={this.setAppName.bind(this)}/>
                        </Item>
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