import React, { Component } from 'react';
import { Container, Content, Text, Card, Header, Footer, Body, Title, 
  List,
  ListItem,
  Left,
  Item, CardItem, Icon, Button, Label, Input } from 'native-base';

import { Image, View, ScrollView, TouchableOpacity, ActivityIndicator, TextInput } from 'react-native';
import { Actions } from 'react-native-router-flux';
import HttpClient from './util/HttpClient';

import Logging from './util/Logging';
import GlobalSession from './GlobalSession';
import Style from './style';
import Util from './util/Util';
import {decode} from 'html-entities';


export default class SelectStorePage extends Component {
    constructor(props) {
        super(props);
        this.state = {
            stores: [],
            searchText: '',
            showIndicator: true,
            showSearch: false
        }
    }

    componentDidMount(){

        this.loadStores();
    }

    getStores(search){
        let promise = new Promise((resolve, reject)=>{
            let url = GlobalSession.Config.API_HOST + "/store/by-area/" + GlobalSession.currentUser.area;
            if(search != undefined && search.trim().length > 0)
                url = GlobalSession.Config.API_HOST + "/store/search/by-area/" + search + "/" + GlobalSession.currentUser.area;

            

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
        if(this.props.onBack != null)
        {

            this.props.onBack();
            Actions.pop();
        }
        else
            Actions.reset("homePage")
    }

    selectStore(value)
    {
        if(this.props.onAfterSelectStore != null)
            this.props.onAfterSelectStore(value);
        Actions.pop();
    }

    addStoreToDatabase(value)
    {
        let promise = new Promise((resolve, reject)=>{
            let url = GlobalSession.Config.API_HOST + "/store/add";
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

    openSearch()
    {
        this.setState({
            showSearch: true
        })


        if(this.searchInput != null)
            this.searchInput.focus();

    }

    getNotFound()
    {
        return (
            <View style={{padding: 20}}>
                <Text style={Style.contentTitleBold}>Hasil pencarian dari {decode("&ldquo;") + this.state.searchText + decode("&rdquo;")}</Text>
                <View style={{height: 30}}></View>
                <Text style={Style.contentSubTitle}>0 Outlet ditemukan</Text>
                <View style={{marginTop: '50%', alignSelf: 'center'}}>
                    <View>
                        <Image source={require('./images/qmark.png')} style={{alignSelf: 'center', width: 120, height:120}} resizeMode='contain'></Image>
                    </View>
                    <View style={Style.horizontalLayout}>
                        <Text style={Style.contentSubTitle}>Berada di outlet baru? </Text>
                        <TouchableOpacity onPress={this.addStore.bind(this)}>
                            <Text style={Style.contentSubTitleBlueBold}>Tambah outlet</Text>
                        </TouchableOpacity>
                    </View>
                    
                </View>
            </View>
        )
    }


    render(){
        var me = this;


        return(
          <Container>
            <Header style={{backgroundColor: '#FFF'}}>

                {(this.state.showSearch == false) ? 
                <View  style={Style.headerHorizontalLayout}>
                        <TouchableOpacity onPress={()=> me.back()}>
                            <Image style={Style.headerImage} resizeMode='contain' source={require('./images/back-dark.png')}></Image>
                        </TouchableOpacity>
                        <View style={{width: 10}}></View>
                        <Title style={Style.headerTitle}>Pilih Outlet</Title>
                        <View style={{width: '45%'}}></View>
                        <View style={{width: '10%'}}>
                            <TouchableOpacity onPress={this.openSearch.bind(this)}>
                                <Image source={require('./images/search-dark.png')} style={{width: '60%'}} resizeMode='contain'></Image>
                            </TouchableOpacity>
                        </View>
                        <View style={{width: '2%'}}></View>
                        <View style={{width: '10%', marginTop: -10}}>
                            <TouchableOpacity onPress={this.addStore.bind(this)}>
                                <Image source={require('./images/store-dark.png')} style={{width: '60%'}} resizeMode='contain'></Image>
                            </TouchableOpacity>
                        </View>
                </View>
                :
                <View  style={Style.headerHorizontalLayout}>
                        <TouchableOpacity onPress={()=> me.back()}>
                            <Image style={Style.headerImage} resizeMode='contain' source={require('./images/back-dark.png')}></Image>
                        </TouchableOpacity>
                        <View style={{width: 10}}></View>
                        <View style={{width: '90%', flex: 1, flexDirection: 'row'}}>
                            <Image source={require('./images/search-dark.png')} style={{ marginLeft: 20, width: 20, height: 20}} resizeMode="contain"></Image>
                            <TextInput  onChangeText={value => { console.log(value); this.search(value) }}  
                                ref={(input) => { this.searchInput = input; }} 
                                style={{ borderWidth: 1, borderRadius: 6, width: '95%',  borderColor: '#ccc', color: '#666', paddingLeft: 40, marginTop: -8, marginLeft: -30, height: 40}} 
                                placeholder="Cari nama outlet atau ID outlet"/>
                        </View>
                </View>
                }
            </Header>

            <Content style={{backgroundColor: '#eee'}} >
            { ( this.state.showIndicator ) ? 
                <View>
                    <ActivityIndicator size="large" color="#000"></ActivityIndicator>
                </View>
                :

                (this.state.stores.length > 0) ?
                <View style={{flex: 1, padding: 20, backgroundColor: "#fff"}}>
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

                        <List>
                            {
                                
                                this.state.stores.map(function(store) {
                                    let storeid = store.storeid;
                                    storeid = storeid.replace(/" "/gi, "");
                                    console.log(store);
                                    let r = Util.makeid(10);
                                    r = r + "-" + store.id;

                                    return (<ListItem key={r}>
                                        <TouchableOpacity onPress={()=> me.selectStore(store)} style={{width: '100%'}}>
                                            <View style={{width: '80%'}}>
                                                <Text style={Style.contentLight}>{storeid}</Text>
                                                <View style={{height: 10}}></View>
                                                <Text style={Style.contentSubTitle}>{store.store_name}</Text>
                                            </View>
                                            <View>
                                                <Text style={Style.contentLight}>{store.store_area}</Text>
                                            </View>
                                        </TouchableOpacity>
                                
                                    </ListItem>)
                                }) }
                        </List>
                    </ScrollView>
                </View>
                :
                this.getNotFound()
            }
            </Content>

          </Container>
        );
    }


}