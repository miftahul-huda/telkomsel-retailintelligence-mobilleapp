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

export default class PosterStoreSelectPage extends Component {
    constructor(props)
    {
        super(props);
    }

    selectCategory(cat)
    {
        if(this.props.onAfterSelectImageCategory != null)
            this.props.onAfterSelectImageCategory(cat);
    }

    back()
    {
        Actions.pop();
    }

    render(){
        var me = this;

        return(
          <Container>
            <Header style={{backgroundColor: '#AA2025'}}>
              <Body>
                <View  style={{flex: 1, flexDirection: 'row'}}>
                <TouchableOpacity onPress={()=> me.back()} style={{marginTop: '0%', padding: '4%'}} >
                    <Image style={{ width: 20, height: 20}} source={require('./images/back.png')}></Image>
                </TouchableOpacity>
                <Title style={{ marginTop: '3%' }}>Pilih toko</Title>
                </View>
              </Body>
            </Header>

            <Content padder>
                <View style={{flex: 1}}>


                    <ScrollView>
                        <Text style={{ fontWeight: 'bold' }}>Pilih kategori</Text>
                        
                        <List>

                            <ListItem key={1} onPress={()=> me.selectCategory({value: 'poster', label: 'Poster'})}>
                                <Text style={{ marginLeft: '5%', fontWeight: 'normal' }}>Foto Poster</Text>
                            </ListItem>
                            <ListItem key={2} onPress={()=> me.selectCategory({value: 'storefront', label: 'Store Front'})}>
                                <Text style={{ marginLeft: '5%', fontWeight: 'normal' }}>Foto Tampak Depan</Text>
                            </ListItem>
  
                        </List>
                    </ScrollView>
                </View>
    
            </Content>

          </Container>
        );
    }
}