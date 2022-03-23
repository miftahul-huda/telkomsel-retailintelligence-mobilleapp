
import React, { Component } from 'react';
import { Dimensions } from 'react-native';
import { Container, Content, Text, Card, Header, Footer, Body, Title, 
  List,
  ListItem,
  Left,
  Item, CardItem, Icon, Button, CheckBox, Right, Radio, ActionSheet } from 'native-base';
import Style from '../style';
import WebView from 'react-native-webview';

import { Image, View, ScrollView, TouchableOpacity, Alert, ActivityIndicator, ImageBackground } from 'react-native';
import Dialog, { DialogFooter, DialogButton, DialogContent } from 'react-native-popup-dialog';

export default class LabelInput extends Component
{
    constructor(props)
    {
        super(props);

    }

    showInfo(link)
    {
        if(this.props.onShowInfo != null)
        {
            this.props.onShowInfo(link);
        }
    }

    render()
    {
        return(
            <View style={{height: 'auto'}}>
                
                {
                    
                    (this.props.text != null  && this.props.text.length > 0) ? 
                    <View style={{height: 20}}>
                    <View style={{flex:1, flexDirection: 'row'}}>
                        <View>
                            <Text style={Style.Content}>{this.props.text}
                            </Text>
                        </View>
                        {(this.props.link != null) ?
                        <View>
                            <TouchableOpacity  style={{marginLeft: 10}} onPress={()=> { this.showInfo(this.props.link) }}>
                                <Image source={require('./images/info.png')} style={{width: 15, height:15}}></Image>
                            </TouchableOpacity></View> : null}
                    </View></View> : null
                }

                <View>
                    <Text style={Style.contentLight}>{this.props.subtext}</Text>
                </View>
                <View style={{height: 10}}></View>
            </View>
        )
    }
}