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

import Style from './style';

import { BackHandler } from 'react-native';
import GlobalSession from './GlobalSession';
import { Accelerometer } from 'expo';

export default class SelectImageCategory extends Component {
    constructor(props)
    {
        super(props);
        this.backhandler = null;
    }



    componentDidMount() {
        //if(this.backhandler != null)

        this.backhandler = BackHandler.addEventListener('hardwareBackPress', this.back)
    }

    componentWillUnmount() {
        BackHandler.removeEventListener('hardwareBackPress', this.back)

        //BackHandler.removeEventListener(this.backhandler)
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
        /*if(this.props.onBack != null)
        {
            this.props.onBack();
            Actions.pop();
        }
        else
        */
        Actions.reset("loginPage")
        return true;
    }

    selectCategory(category)
    {
        GlobalSession.currentMenuGroup = category;
        Actions.reset("homePage");
    }

    render(){
        var me = this;

        return(
          <Container>
            <Content padder >
                <View>

                    <View  style={{ marginTop: '70%'}}>
                        <Button style = {Style.buttonRed}
                            onPress= {() => { this.selectCategory('av-index'); }}>

                            <View style={Style.buttonContentDark}>
                                <Text style={Style.textWhite}>Survey AV, Branding &  Sales Shares</Text>
                            </View>
                
                        </Button>
                        <View style={{height: 20}}></View>

                        <Button style = {Style.buttonNavy}
                            onPress= {() => { this.selectCategory('poster'); }}>

                            <View style={Style.buttonContentDark}>
                                <Text style={Style.textWhite}>Survey Pricing, Product, Program</Text>
                            </View>
                
                        </Button>
                    </View>
                    
                    
                </View>
    
            </Content>

          </Container>
        );
    }
}