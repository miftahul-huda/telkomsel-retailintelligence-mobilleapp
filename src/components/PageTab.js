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

export default class PageTab extends Component
{
    constructor(props)
    {
        super(props);
        this.state={
            selectedValue: props.selectedValue,
            items: props.items,
        }
    }

    onSelect(item)
    {
        this.state.selectedValue = item.value;
        this.setState({
            selectedValue: item.value
        })

        if(this.props.onSelected != null)
            this.props.onSelected(item);
    }

    getTab(item)
    {
        let w = 100;
        if(this.state.items.length > 0)
            w = 100/this.state.items.length;
        
        let color = "#fff";
        let fontColor = "#666";
        let fontWeight= 'normal';
        if(item.value == this.state.selectedValue)
        {
            color = "#CF2B1E";
            fontWeight= 'bold';
            fontColor= "#CF2B1E";
        }
            

        return(<View key={item.value} style={{alignItems: 'center', width: w + '%', borderWidth: 0, padding: 2}}>
            <TouchableOpacity onPress={this.onSelect.bind(this, item)} style={{width: '100%'}}>
                <View style={{height: '5%'}}></View>
                <View style={{height: '55%', width: '100%', alignItems: 'center'}}>
                    <Text style={{color: fontColor, fontWeight: fontWeight}}>
                        {item.label}
                    </Text>
                </View>
                <View style={{height: '35%'}}></View>
                <View style={{height: '5%', width:'100%', backgroundColor: color, borderWidth:0}}>

                </View>
            </TouchableOpacity>
        </View>)
    }

    getTabs()
    {
        var me  = this;
        return(<View style={{ flex: 1,flexDirection: 'row',borderWidth: 0, height: 100, borderWidth: 0 }}>
            {
                
                this.state.items.map((item)=>{
                    return me.getTab(item)
                })
            }
        </View>);
    }

    render()
    {
        return(this.getTabs());
    }
}