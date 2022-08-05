import React, { Component } from 'react';
import { Container, Content, Text, Card, Header, Footer, Body, Title, 
  List,
  ListItem,
  Left,
  Item, CardItem, Icon, Button, Label, Input } from 'native-base';

import { Image, View, ScrollView, TouchableOpacity, ActivityIndicator, TextInput } from 'react-native';
import { Actions } from 'react-native-router-flux';
import DropDownPicker from 'react-native-dropdown-picker';

import Config from './config.json';
import HttpClient from './util/HttpClient';

import Logging from './util/Logging';
import GlobalSession, { currentUser } from './GlobalSession';
import Style from './style';
import LabelInput from './components/LabelInput';


export default class AddStorePage extends Component {
    constructor(props) {
        super(props);
        this.state = {
            areas: [],
            store_name: '',
            store_id: '',
            province: '',
            district: '',
            store_area: '',
            selectedArea: null,
            showIndicator: false
        }
    }

    componentDidMount(){
        this.loadAreas();
        this.setState({
            ...this.state,
            store_city: GlobalSession.currentUser.city
        })
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
            let url = GlobalSession.Config.API_HOST + "/store/area";
           
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
            let url = GlobalSession.Config.API_HOST + "/store/add";
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

    addStoreUserToDatabase(store_id, store_name, username, sfcode)
    {
        let promise = new Promise((resolve, reject)=>{
            let url = GlobalSession.Config.API_HOST + "/storeuser/add";

            console.log("Store user:")
            console.log(url)

            let storeUser = {};
            storeUser.store_name = store_name;
            storeUser.storeid = store_id;
            storeUser.username = username;
            storeUser.sfcode = sfcode;

            console.log(storeUser)
            try {
                HttpClient.post(url, storeUser , function(res){
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
                
                me.addStoreUserToDatabase(store_id, store_name, GlobalSession.currentUser.email, GlobalSession.currentUser.sfcode).then((response)=>{
                    me.setState({
                        showIndicator: false
                    })
                    alert("Data outlet berhasil disimpan")
                    if(me.props.onAfterSaveNewOutlet != null)
                        me.props.onAfterSaveNewOutlet(newStore);
                        
                    Actions.pop();
                }).catch((e)=>{
                    me.setState({
                        showIndicator: false
                    })
                    console.log(e)
                    alert("addStoreUserToDatabase: Simpan outlet gagal")
                })
                
            }).catch(function(err){
                me.setState({
                    showIndicator: false
                })
                let s = JSON.stringify(err);
                //alert("Error " + s);
                alert("addStoreToDatabase: Simpan outlet gagal")
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
        else if(this.state.store_city == null || this.state.store_city.trim().length == 0)
        {
            alert("Harap isi Kabupaten Outlet");
            return false;
        }

        return true;
    }

    render(){
        var me = this;

        return(
          <Container>
            <Header style={{backgroundColor: '#FFF'}}>
                <View  style={Style.headerHorizontalLayout}>
                        <TouchableOpacity onPress={()=> me.back()}>
                            <Image style={Style.headerImage} resizeMode='contain' source={require('./images/back-dark.png')}></Image>
                        </TouchableOpacity>
                        <View style={{width: 10}}></View>
                        <Title style={Style.headerTitle}>Tambah informasi outlet</Title>
                </View>
            </Header>

            <Content padder>
                <View style={{flex: 1, padding: 20}}>
                    

                        <View>
                            <LabelInput text="ID Outlet" subtext="Nomor identifikasi outlet"></LabelInput>
                            <TextInput style={Style.textInput} onChangeText={value => { this.setState({ store_id: value }) }}/>
                        </View>
                        <View style={{height: 20}}></View>
                        <View>
                            <LabelInput text="Nama outlet" subtext="Nama outlet, misal 'Toko Amir'"></LabelInput>
                            <TextInput style={Style.textInput} onChangeText={value => { this.setState({ store_name: value }) }}/>
                        </View>
                        <View style={{height: 20}}></View>
                        <View>
                            <LabelInput text="Branch" subtext="Branch tempat di mana outlet berada"></LabelInput>
                            <TextInput style={Style.textInput} onChangeText={value => { this.setState({ store_branch: value }) }}/>
                        </View>
                        <View style={{height: 20}}></View>
                        <View>
                            <LabelInput text="Region" subtext="Region tempat di mana outlet berada"></LabelInput>
                            <TextInput style={Style.textInput} onChangeText={value => { this.setState({ store_region: value }) }}/>
                        </View>
                        <View style={{height: 20}}></View>
                        <View>
                            <LabelInput text="Kabupaten/kota" subtext="Kabupaten/kota tempat di mana outlet berada"></LabelInput>
                            <TextInput value={this.state.store_city} style={Style.textInput} onChangeText={value => { this.setState({ store_city: value }) }}/>
                        </View> 
                        <View style={{height: 20}}></View>
                        <View>
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
                        </View>

                        <View>

                                { ( this.state.showIndicator ) ? 
                                <View>
                                    <ActivityIndicator size="large" color="#000"></ActivityIndicator>
                                </View>
                                : null}

                        </View>

                        <View style={{height: 20}}></View>
                        <View style={{padding: '2%'}}>
                            <Button style={Style.buttonRed} onPress={()=>this.addStore()}>
                                <View style={{ alignItems: 'center', width: '100%' }}>
                                    <Text style={{color: '#fff'}}>Tambah outlet</Text>
                                </View>
                            </Button>
                        </View>


                </View>
    
            </Content>
 

          </Container>
        );
    }


}