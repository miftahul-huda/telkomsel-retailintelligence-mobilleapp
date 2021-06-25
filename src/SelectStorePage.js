import React, { Component } from 'react';
import { Container, Content, Text, Card, Header, Footer, Body, Title, 
  List,
  ListItem,
  Left,
  Item, CardItem, Icon, Button, Label, Input } from 'native-base';

import { Image, View, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Actions } from 'react-native-router-flux';

import Config from './config.json';
import HttpClient from './util/HttpClient';

import Logging from './util/Logging';
import GlobalSession from './GlobalSession';


export default class SelectStorePage extends Component {
    constructor(props) {
        super(props);
        this.state = {
            stores: [],
            searchText: '',
            showIndicator: true
        }
    }

    componentDidMount(){

        this.loadStores();
    }

    getStores(search){
        let promise = new Promise((resolve, reject)=>{
            let url = Config.API_HOST + "/store/by-area/" + GlobalSession.currentUser.area;
            if(search != undefined && search.trim().length > 0)
                url = Config.API_HOST + "/store/search/by-area/" + search + "/" + GlobalSession.currentUser.area;

            

            console.log("get store url")
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

    loadStores(search){
        let me = this;

        this.setState({
            showIndicator: true
        })
        me.getStores(search).then(function(stores){
            me.setState({
                ...me.state,
                stores: stores,
                showIndicator: false
            })

        }).catch(function(err){
            alert("Error : " + err.message);
            Logging.log(err, "error", "SelectStorePage.loadStores().me.getStores()")
        })
    }

    search(value)
    {
        this.setState({
            ...this.state,
            searchText: value
        })
        console.log(value);
        this.loadStores(value);
    }



    back()
    {
        Actions.pop();
    }

    selectStore(value)
    {
        if(this.props.onAfterSelectStore != null)
            this.props.onAfterSelectStore(value);
    }

    addStoreToDatabase(value)
    {
        let promise = new Promise((resolve, reject)=>{
            let url = Config.API_HOST + "/store/add";
            let store = {};
            store.store_name = value;
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
        /*var me = this;
        let store_name = this.state.searchText.trim();
        me.addStoreToDatabase(store_name).then(function (newStore){
            me.loadStores(me.state.searchText.trim());
        }).catch(function(err){
            let s = JSON.stringify(err);
            Alert.alert("Error " + s);
            Logging.log(err, "error", "SelectStorePage.addStore().me.addStoreToDatabase()")
        })*/

        Actions.addStorePage();
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
                    { (GlobalSession.currentStore != null) ? 
                    <List>
                        <Text style={{ fontWeight: 'bold' }}>Terakhir dipilih</Text>
                        <ListItem key={GlobalSession.currentStore.id}>
                            <TouchableOpacity onPress={()=> me.selectStore(GlobalSession.currentStore)} style={{flex:1, flexDirection: 'row'}} >
                                <Text style={{ marginLeft: '5%', fontWeight: 'normal' }}>{GlobalSession.currentStore.store_name}</Text>
                            </TouchableOpacity>
                        </ListItem>
                    </List>
                    :
                    null}
                    <View style={{ height: 20 }}></View>

                    <ScrollView>
                        <Text style={{ fontWeight: 'bold' }}>Pilih toko</Text>
                        
                        <Item floatingLabel>
                            <Label>Ketik untuk mencari nama toko</Label>
                            <Input onChangeText={value => { console.log(value); this.search(value) }}/>
                        </Item>

                        <View style={{ height: 20 }}></View>
                        <TouchableOpacity onPress={()=> me.addStore()} style={{flex:1, flexDirection: 'row'}} >
                                <Image source={require('./images/plus.png')}></Image>
                        </TouchableOpacity>

     

                        { ( this.state.showIndicator ) ? 
                        <View>
                            <ActivityIndicator size="large" color="#000"></ActivityIndicator>
                        </View>
                        : 
                        <List>
                            {
                                
                                this.state.stores.map(function(store) {
                                    return (<ListItem key={store.id} onPress={()=> me.selectStore(store)}>
                                
                                        <Text style={{ marginLeft: '5%', fontWeight: 'normal' }}>{store.storeid} - {store.store_name}</Text>
                                
                                    </ListItem>)
                                }) }
                        </List>}
                    </ScrollView>
                </View>
    
            </Content>

          </Container>
        );
    }


}