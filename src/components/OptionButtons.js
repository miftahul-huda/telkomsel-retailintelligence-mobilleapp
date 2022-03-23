
import React, { Component } from 'react';
import { Dimensions } from 'react-native';
import { Container, Content, Text, Card, Header, Footer, Body, Title, 
  List,
  ListItem,
  Left,
  Item, CardItem, Icon, Button, CheckBox, Right, Radio, ActionSheet } from 'native-base';
import Style from '../style';

import { Image, View, ScrollView, TouchableOpacity, Alert, ActivityIndicator, ImageBackground } from 'react-native';

export default class OptionButtons extends Component
{
    constructor(props)
    {
        super(props);
        this.state = {
            selectedItem: {},
            selectedValue: props.selectedValue,
            items: props.items
        }

    }

    componentDidMount()
    {
        this.state.selectedValue = this.props.selectedValue;
        this.state.items = this.props.items;

        /*
        this.setState({
            items: this.props.items,
            selectedValue: this.props.selectedValue
        })
        */
        //this.setDefaultSelectedItem();
    }

    setDefaultSelectedItem()
    {
        if(this.state.selectedValue != null && this.state.items != null)
        {
            this.state.items.forEach((item)=>{
                if(item.value == this.state.selectedValue)
                {
                    this.setState({
                        selectedItem: item,
                        selectedValue: item.value
                    })
                }
            })
        }
    }

    selectItem(item)
    {

        this.setState({
            selectedItem: item,
            selectedValue: item.value
        })
        if(this.props.onSelectItem != null)
            this.props.onSelectItem(item);
    }


    render()
    {
        var me = this;
        
        return(<View  style={{ flex:1, flexDirection: 'row', height: 40, width: '80%', alignSelf: 'center'}}>
        {
            this.props.items.map((item)=>{

                let selectedStyle = Style.buttonOption;
                let selectedColor = "#666";
                if(item.value == me.state.selectedValue)
                {
                    selectedStyle = Style.buttonOptionSelected;
                    selectedColor = "#FFF";
                }
                return(
                    <TouchableOpacity key={item.value} style={{width: '50%', height: 40}} onPress= {() => { this.selectItem(item) }}>
                        <View style={selectedStyle}>
                            <View style={Style.buttonContent}>
                            <View style={{width: '2%'}}></View>
                            <Text style={{ color: selectedColor}}>{item.label}</Text>
                            </View>
                        </View>
                    </TouchableOpacity>)
            })
        }
        </View>)
    }
}