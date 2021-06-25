import React, { Component } from 'react';
import { Dimensions, Image, View } from 'react-native';
import { Container, Content, Text, Card, Header, Footer, Body, Title, 
  List,
  ListItem,
  Item, CardItem, Icon, Button, Input, Label, Radio, Right, Left, CheckBox } from 'native-base';
  import RadioButton from 'react-native-radio-button'

export default class ValidityView extends Component
{
    constructor(props)
    {
        super(props);
        this.state = {
            item: this.props.item
        }
    }


    setQuotaValidity(value)
    {
        this.setState(state => {
            state.item.quotaValidity = value
            return state
        })

        if(this.props.onValueChange != null)
            this.props.onValueChange('quotaValidity', value)
    }

    render()
    {
        return(
            <View>
                <View><Label style={{ fontWeight: 'normal', paddingBottom: 4 }}>Validitas</Label></View>
                
                <View style={{flex:1, flexDirection: 'row'}}>
                    <View style={{width: 80, height: 50}}>
                        <Input style={{width: '100%', borderWidth: 1, borderColor: '#cccccc'}} keyboardType="numeric"  value={this.state.item.quotaValidity.toString()} onChangeText={this.setQuotaValidity.bind(this)}/>
                    </View>
                    <View style={{width: 30}}></View>
                    <View style={{flex:1, flexDirection: 'row', marginTop: 10}}>
                        <View>
                            <RadioButton
                                animation={'bounceIn'}
                                isSelected={(this.state.item.validityType == "hari") ? true : false}
                                onPress={() =>{ 

                                    this.setState(state => {
                                        state.item.validityType = 'hari'
                                        return state
                                    })
                                    if(this.props.onValueChange != null)
                                        this.props.onValueChange('validityType', 'hari')
                                }}
                                />
                        </View>
                        <View style={{width: 60, marginLeft: 30}}>
                            <Label style={{marginTop: '2%'}}>Hari</Label>
                        </View>
                        <View style={{width: 30}}></View>
                        <View>
                            <RadioButton
                                animation={'bounceIn'}
                                isSelected={(this.state.item.validityType == "jam") ? true : false}
                                onPress={() =>{ 
                                    
                                    this.setState(state => {
                                        state.item.validityType = 'jam'
                                        return state
                                    })
                                    if(this.props.onValueChange != null)
                                        this.props.onValueChange('validityType', 'jam')
                            }}
                                />
                        </View>
                        <View style={{width: 60, marginLeft: 30}}>
                            <Label style={{marginTop: '2%'}}>Jam</Label>
                        </View>
                    </View>
                </View>
                <View style={{ height: 20}}></View>
            </View>
        )
    }
}