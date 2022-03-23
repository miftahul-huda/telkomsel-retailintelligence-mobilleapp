import React, { Component } from 'react';
import { Image, TouchableOpacity } from 'react-native';
import { View, Container, Content, Text, Card, Header, Footer, Body, Title, 
    List,
    ListItem,
    Left,
    Item, CardItem, Icon, Button } from 'native-base';
  
import { Actions } from 'react-native-router-flux';
import Style from './style';
import HttpClient from './util/HttpClient';
import GlobalSession from './GlobalSession';

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
            <Header style={{backgroundColor: '#FFF'}}>
                <View  style={Style.headerHorizontalLayout}>
                        <TouchableOpacity onPress={()=> me.back()}>
                            <Image style={Style.headerImage} resizeMode='contain' source={require('./images/back-dark.png')}></Image>
                        </TouchableOpacity>
                        <View style={{width: 10}}></View>
                        <Title style={Style.headerTitle}>Orientasi</Title>
                </View>
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