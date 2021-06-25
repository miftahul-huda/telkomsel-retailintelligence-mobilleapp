import React, { Component } from 'react';
import { Image, TouchableOpacity } from 'react-native';
import { View, Container, Content, Text, Card, Header, Footer, Body, Title, 
    List,
    ListItem,
    Left,
    Item, CardItem, Icon, Button } from 'native-base';
  
import { Actions } from 'react-native-router-flux';

import Config from './config.json';
import HttpClient from './util/HttpClient';
GlobalSession = require( './GlobalSession');

import * as SQLite from "expo-sqlite";
import Sequelize from "rn-sequelize";

import UploadedFile from './model/UploadedFile';
import FilePackageItem from './model/FilePackageItem';

export default class ImageOrientationInputPage extends Component {
    constructor(props){
        super(props);

    }

    selectOrientation(value)
    {
        if(this.props.onSelectOrientation != null)
            this.props.onSelectOrientation(value);
    }

    back()
    {
        Actions.pop();
    }

    render() 
    {
        var me = this;
        return(
            <Container>
            <Header style={{backgroundColor: '#AA2025'}}>
              <Body>
                <View  style={{flex: 1, flexDirection: 'row'}}>
                <TouchableOpacity onPress={()=> this.back()} style={{marginTop: '0%', padding: '4%'}} >
                    <Image style={{ width: 20, height: 20}} source={require('./images/back.png')}></Image>
                </TouchableOpacity>
                <Title style={{ marginTop: '3%' }}>Orientation info</Title>
                </View>
              </Body>
            </Header>
            <Content padder>
                <View style={{ flex: 1, height: '100%', padding: '5%' }}>
                        <Text style={{ fontWeight: 'bold', paddingBottom: 4 }}>Orientation</Text>
                        <List>
                            <ListItem key={1} onPress={()=> me.selectOrientation('v')} >
                                    <Text>Vertical</Text>

                            </ListItem>
                            <ListItem key={2} onPress={()=> me.selectOrientation('h')} >
                                    <Text>Horizontal</Text>
                            </ListItem>
                        </List>

                </View>
            </Content>
            </Container>
        )

    }

}