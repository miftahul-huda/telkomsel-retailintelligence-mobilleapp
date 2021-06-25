import React, { Component } from 'react';
import { Dimensions, Image, View } from 'react-native';
import { Container, Content, Text, Card, Header, Footer, Body, Title, 
  List,
  ListItem,
  Item, CardItem, Icon, Button, Input, Label, Radio, Right, Left, CheckBox } from 'native-base';
  import RadioButton from 'react-native-radio-button'

export default class InternetQuota extends Component
{
    constructor(props)
    {
        super(props);
        this.state = {
            item: this.props.item
        }
    }

    setFup(value)
    {
        this.setState(state => {
            state.item.fup = value
            return state
        })

        if(this.props.onValueChange != null)
            this.props.onValueChange('fup', value)
    }

    setQuota(value)
    {
        this.setState(state => {
            state.item.quota = value
            return state
        })
        if(this.props.onValueChange != null)
            this.props.onValueChange('quota', value)
    }

    render()
    {
        return(
            <View>
                <View><Label style={{ fontWeight: 'normal', paddingBottom: 4 }}>Kuota *</Label></View>
                <View style={{flex:1, flexDirection: 'row'}}>
                    <RadioButton
                        animation={'bounceIn'}
                        isSelected={(this.state.item.quotaCategory == "internet-gb") ? true : false}
                        onPress={() =>{  
                            this.setState(state => {
                                state.item.quotaCategory = "internet-gb"
                                return state
                            })
                            if(this.props.onValueChange != null)
                                this.props.onValueChange('quotaCategory', 'internet-gb')
                        }}
                        />
                    <View style={{width: 20}}></View>
                    <Text style={{marginTop: '2%'}}>GB</Text>
                </View>
                {
                    (this.state.item.quotaCategory == "internet-gb") ?
                        <View style={{marginLeft: '25%'}}>
                            <Label>Besar Kuota</Label>
                            <Input style={{width: '100%', borderWidth: 1, borderColor: '#cccccc'}} keyboardType="numeric"  value={this.state.item.quota.toString()} onChangeText={this.setQuota.bind(this)}/>
                        </View>
                        :
                        null
                }
                <View style={{height: 20}}></View>
                <View style={{flex:1, flexDirection: 'row'}}>
                    <RadioButton
                        animation={'bounceIn'}
                        isSelected={(this.state.item.quotaCategory == "internet-unlimited") ? true : false}
                        onPress={() =>{ 
                            
                            this.setState(state => {
                                state.item.quotaCategory = "internet-unlimited"
                                return state
                            })
                            if(this.props.onValueChange != null)
                                this.props.onValueChange('quotaCategory', 'internet-unlimited')
                        }}
                        />
                    <View style={{width: 20}}></View>
                    <Text style={{marginTop: '2%'}}>Unlimited</Text>
                </View>
                {
                    (this.state.item.quotaCategory == "internet-unlimited") ?
                        <View style={{marginLeft: '25%'}}>
                            <Label>FUP GB</Label>
                            <Input style={{width: '100%', borderWidth: 1, borderColor: '#cccccc'}} keyboardType="numeric"  value={this.state.item.fup.toString()} onChangeText={this.setFup.bind(this)}/>
                        </View>
                        :
                        null
                }

                <View style={{height:20}}></View>


            </View>
        )
    }
}