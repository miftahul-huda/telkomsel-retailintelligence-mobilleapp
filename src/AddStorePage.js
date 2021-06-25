import React, { Component } from 'react';
import { Container, Content, Text, Card, Header, Footer, Body, Title, 
  List,
  ListItem,
  Left,
  Item, CardItem, Icon, Button, Label, Input } from 'native-base';

import { Image, View, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Actions } from 'react-native-router-flux';
import DropDownPicker from 'react-native-dropdown-picker';

import Config from './config.json';
import HttpClient from './util/HttpClient';

import Logging from './util/Logging';
import GlobalSession, { currentUser } from './GlobalSession';


export default class AddStorePage extends Component {
    constructor(props) {
        super(props);
        this.state = {
            areas: [],
            store_name: '',
            store_id: '',
            store_area: '',
            selectedArea: null,
            showIndicator: false
        }
    }

    componentDidMount(){
        this.loadAreas();
    }

    back()
    {
        Actions.pop();
    }

    onAreaChange(item)
    {
        this.setState({
            selectedArea: item,
            store_area: item.area
        })
    }

    getAreas(){
        let promise = new Promise((resolve, reject)=>{
            let url = Config.API_HOST + "/store/area";
           
            console.log("get area url")
            console.log(url);
            try {
                HttpClient.get(url, function(res){
                    resolve(res.payload);
                }, function(e){
                    reject(e);
                });      
            }catch(e){
                reject(e);
            }

        });
        return promise;
    }

    loadAreas()
    {
        console.log(GlobalSession.currentUser);
        this.getAreas().then(areas => {
            
            let newAreas = [];
            let selectedArea = null;
            areas.forEach(area=>{
                if(area.area != null)
                    newAreas.push(area)
                if(GlobalSession.currentUser.area == area.area)
                    selectedArea = area;
            })

            this.setState({
                areas: newAreas,
                selectedArea: selectedArea
            })
        }).catch(err => {
            console.log(err);
        })
    }

    addStoreToDatabase(store_id, store_name, store_area)
    {
        let promise = new Promise((resolve, reject)=>{
            let url = Config.API_HOST + "/store/add";
            let store = {};
            store.store_name = store_name;
            store.storeid = store_id;
            store.store_area = store_area;
            try {
                HttpClient.post(url, store , function(res){
                    resolve(res.payload);
                }, function(e){
                    reject(e);
                });      
            }catch(e){
                reject(e);
            }

        });
        return promise;
    }

    addStore()
    {
        var me = this;

        if(me.validate())
        {
            let store_id = this.state.store_id.trim();
            let store_name = this.state.store_name.trim();
            let store_area = this.state.selectedArea.area.trim();
            this.setState({
                showIndicator: true
            })
            me.addStoreToDatabase(store_id, store_name, store_area).then(function (newStore){
                me.setState({
                    showIndicator: false
                })
                Actions.pop();
            }).catch(function(err){
                me.setState({
                    showIndicator: false
                })
                let s = JSON.stringify(err);
                alert("Error " + s);
                Logging.log(err, "error", "AddStorePage.addStore().me.addStoreToDatabase()")
            })
        }


    }

    validate()
    {
        if(this.state.store_id == null || this.state.store_id.trim().length == 0)
        {
            alert("Harap isi ID Outlet");
            return false;
        }
        else if(this.state.store_name == null || this.state.store_name.trim().length == 0)
        {
            alert("Harap isi Nama Outlet");
            return false;
        }
        else if(this.state.selectedArea.area.trim() == null || this.state.selectedArea.area.trim().length == 0)
        {
            alert("Harap isi Area Outlet");
            return false;
        }

        return true;
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
                <Title style={{ marginTop: '3%' }}>Tambah toko</Title>
                </View>
              </Body>
            </Header>

            <Content padder>
                <View style={{flex: 1}}>
                    
                    <ScrollView>
                        <Item>
                            <Label>ID outlet</Label>
                            <Input onChangeText={value => { this.setState({ store_id: value }) }}/>
                        </Item>

                        <Item>
                            <Label>Nama outlet</Label>
                            <Input onChangeText={value => { this.setState({ store_name: value }) }}/>
                        </Item>

                        <Item>
                            <View  style={{ width: '100%' }}>
                                <Text style={{ paddingBottom: 4 }}>Area</Text>
                                <List>
                                {
                                    me.state.areas.map(function(area) {
                                        return (<ListItem key={area.area}>
                                        <TouchableOpacity onPress={()=> me.onAreaChange(area)} style={{width: '80%', flex:1, flexDirection: 'row'}} >
                                            <Text style={{ marginLeft: '5%', fontSize: 15 }}>{area.area}</Text>
                                            {
                                                (me.state.selectedArea.area == area.area) ? 
                                                <Image style={{ marginLeft: '10%', width: 20, height: 20}} source={require('./images/check.png')}></Image> : null
                                            }
                                            
                                        </TouchableOpacity>
                                        </ListItem>)
                                    })
                                }
                                </List>
                            </View>
                        </Item>

                        <Item>

                                { ( this.state.showIndicator ) ? 
                                <View>
                                    <ActivityIndicator size="large" color="#000"></ActivityIndicator>
                                </View>
                                : null}

                        </Item>

                    </ScrollView>
                </View>
    
            </Content>
            <Footer style={{backgroundColor: '#AA2025', padding: '2%'}}>

                <TouchableOpacity onPress={this.addStore.bind(this)} >
                    <Image source={require('./images/save_white.png')} />
                </TouchableOpacity> 
            </Footer>

          </Container>
        );
    }


}