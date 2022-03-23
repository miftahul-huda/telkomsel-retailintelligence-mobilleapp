import React, { Component } from 'react';
import { Dimensions, ImageBackground } from 'react-native';
import { Container, Content, Text, Card, Header, Footer, Body, Title, 
  List,
  ListItem,
  Left,
  Item, CardItem, Icon, Button } from 'native-base';


import { Image, View, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Actions } from 'react-native-router-flux';
import UploadedFile from './model/UploadedFile';
import FilePackageItem from './model/FilePackageItem';
import DropDownPicker from 'react-native-dropdown-picker';


import Config from './config.json';
import HttpClient from './util/HttpClient';
GlobalSession = require( './GlobalSession');

import Style from './style';

export default class PosterStoreSelectPage extends Component {
    constructor(props)
    {
        super(props);
    }

    selectCategory(cat)
    {
        Actions.pop();
        if(this.props.onAfterSelectImageCategory != null)
            this.props.onAfterSelectImageCategory(cat);
        
    }

    back()
    {
        //Actions.pop();
        //Actions.refresh({ data: "back"});
        if(this.props.onBack != null)
        {
            this.props.onBack();
            Actions.pop();
        }
        else
            Actions.reset("homePage")
    }

    render(){
        var me = this;

        return(
          <Container>
            <Header style={{backgroundColor: '#FFF'}}>
              <Body>
                <View  style={Style.headerHorizontalLayout}>
                    <TouchableOpacity onPress={()=> me.back()} >
                        <Image style={Style.headerImage} source={require('./images/back-dark.png')} resizeMode='contain'></Image>
                    </TouchableOpacity>
                    <View style={{width: 10}}></View>
                    <Title style={Style.headerTitle}>Pilih kategori foto</Title>
                </View>
              </Body>
            </Header>

            <Content padder>
                <View style={{flex: 1}}>
                    <ScrollView>
                        <List>

                            <ListItem key={1}>
                                <TouchableOpacity style={{width: '100%'}} onPress={()=> me.selectCategory({value: 'poster', label: 'Poster'})}>
                                    <Text style={{ marginLeft: '5%', fontWeight: 'normal', alignSelf: 'flex-start' }}>Foto Poster</Text>
                                </TouchableOpacity>
                            </ListItem>
                            <ListItem key={2} >
                                <TouchableOpacity style={{width: '100%'}} onPress={()=> me.selectCategory({value: 'storefront', label: 'Store Front'})}>
                                    <Text style={{ marginLeft: '5%', fontWeight: 'normal', alignSelf: 'flex-start' }}>Foto Tampak Depan</Text>
                                </TouchableOpacity>
                            </ListItem>
                            <ListItem key={3} >
                                <TouchableOpacity style={{width: '100%'}} onPress={()=> me.selectCategory({value: 'poster-before-after', label: 'Foto Poster Sebelum/Sesudah'})}>
                                    <Text style={{ marginLeft: '5%', fontWeight: 'normal', alignSelf: 'flex-start' }}>Foto Poster Sebelum/Sesudah</Text>
                                </TouchableOpacity>
                            </ListItem>
                            <ListItem key={4} >
                                <TouchableOpacity style={{width: '100%'}} onPress={()=> me.selectCategory({value: 'storefront-before-after', label: 'Foto Tampak Depan Sebelum/Sesudah'})}>
                                    <Text style={{ marginLeft: '5%', fontWeight: 'normal', alignSelf: 'flex-start' }}>Foto Tampak Depan Sebelum/Sesudah</Text>
                                </TouchableOpacity>
                            </ListItem>
                            <ListItem key={5} >
                                <TouchableOpacity style={{width: '100%'}} onPress={()=> me.selectCategory({value: 'etalase', label: 'Foto Etalase'})}>
                                    <Text style={{ marginLeft: '5%', fontWeight: 'normal', alignSelf: 'flex-start' }}>Foto Etalase</Text>
                                </TouchableOpacity>
                            </ListItem>
                            <ListItem key={6} >
                                <TouchableOpacity style={{width: '100%'}} onPress={()=> me.selectCategory({value: 'total-sales', label: 'Foto Etalase'})}>
                                    <Text style={{ marginLeft: '5%', fontWeight: 'normal', alignSelf: 'flex-start' }}>Total Penjualan</Text>
                                </TouchableOpacity>
                            </ListItem>
  
                        </List>
                    </ScrollView>
                </View>
    
            </Content>

          </Container>
        );
    }
}