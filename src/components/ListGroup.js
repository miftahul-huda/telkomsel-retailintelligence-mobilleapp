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
import Util from '../util/Util';

export default class ListGroup extends Component
{
    constructor(props)
    {
        super(props);
        this.state ={
            items: props.items,
            selecteditems: [],
            checkedGroups: [],
            prevItems:  null
        }
    }

    componentDidMount()
    {
        this.setState({
            items: this.props.items
        })
    }

    onSelect(item)
    {
        if(this.props.onSelected  != null)
            this.props.onSelected(item);
    }

    onItemChecked(item)
    {
        if(this.props.onItemChecked != null)
            this.props.onItemChecked(item);
    }

    

    getListItem(item)
    {
        let me = this;
        let uid = Util.makeid(10);
        return(
            <ListItem key={uid}>
                
                    <View style={Style.horizontalLayout}>
                        {
                            
                            <View style={{marginTop: 15, paddingRight: 10}}>
                                <CheckBox checked={item.checked}  onPress={()=> { 
                                    item.checked =  !item.checked;
                                    let checkedItems = me.getCheckedItems(); me.onItemChecked(checkedItems);  }}  color="#666"></CheckBox>
                            </View>

                        }
                        <View style={{padding: 1}}>
                            <Image source={{uri: "file://" + item.image}} style={{width:60, height: 60}}></Image>
                        </View>
                        <TouchableOpacity style={{width: '60%'}}  onPress={this.onSelect.bind(this, item)}>
                            <View style={{alignItems: 'flex-start', alignContent: 'flex-start', paddingLeft: 10}}>
                                <Text style={{ alignSelf: 'flex-start', fontWeight: 'bold' }}>
                                    {item.title}
                                </Text>
                                <Text style={{ alignSelf: 'flex-start', fontWeight: 'normal', fontSize: 14 }}>
                                    {item.subTitle}
                                </Text>
                                <Text style={Style.contentLight}>
                                    {item.content}
                                </Text>

                            </View>

                        </TouchableOpacity>
                       
                       { (item.showIndicator != null) ?
                        item.showIndicator : null}
                        
                    </View>

            </ListItem>
        )
    }

    getCheckedItems()
    {
        let checkedItems = [];

        this.props.items.map((item)=>{
            if(item.checked)
                checkedItems.push(item)
        })
        return checkedItems;
    }

    onStoreCheckboxPress(group, checked)
    {
        let checkedItems = [];
        this.state.checkedGroups[group] = !checked;

        this.props.items.map((item)=>
        {
            if(item.group == group) 
            {
                item.checked = !checked;
            }
        })

        this.setState({
            items: this.props.items,
            checkedGroups: this.state.checkedGroups
        })

        checkedItems = this.getCheckedItems();
        this.onItemChecked(checkedItems);
    }

    getList()
    {
        let groups = this.getGroups();
        let me = this;
        let controls = null;

        return(<View>
            {
                groups.map((group)=>{
                    let checked = false;
                    if(group in this.state.checkedGroups)
                        checked = this.state.checkedGroups[group];
                    let uid = Util.makeid(10);
                    return(<>
                    <View key={uid} style={{backgroundColor: '#eee', width: '100%', height: 50,  flex:1, flexDirection:'row', paddingTop: 15}}>
                        <View style={{height: 15, width: 40, marginLeft: 20}}>
                            <CheckBox checked={checked} color="#666" onPress={this.onStoreCheckboxPress.bind(this, group, checked)}></CheckBox>
                        </View>
                        <View>
                            <Text style={{fontWeight: 'bold', fontSize: 18, color: '#666'}}>{group}</Text>
                        </View>
                    </View>
                    <List>
                    {
                        me.props.items.map((item)=>{
                            if(item.group == group)
                            {
                                return me.getListItem(item);
                            }
                        })
                    }
                    </List>
                    </>)
                })
            }
        </View>)
    }

    getGroups()
    {
        let groups = [];
        //this.state.checkedGroups  = [];
        this.props.items.map((item)=>{
            if(groups.includes(item.group) == false)
                groups.push(item.group)
        })
        return groups;
    }

    render()
    {
        if(this.state.prevItems != this.props.items)
        {
            this.state.checkedGroups = [];
            this.state.prevItems = this.props.items;
        }
            

        return(this.getList());
    }
}