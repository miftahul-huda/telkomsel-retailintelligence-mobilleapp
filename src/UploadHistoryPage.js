import React, { Component } from 'react';
import { Container, Content, Text, Card, Header, Footer, Body, Title, 
  List,
  ListItem,
  Left,
  Item, CardItem, Icon, Button } from 'native-base';

import { Image, View, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Actions } from 'react-native-router-flux';
import UploadedFile from './model/UploadedFile';
import * as RNFS from 'react-native-fs';
import DropDownPicker from 'react-native-dropdown-picker';

import Logging from './util/Logging';
import GlobalSession from './GlobalSession';
import HttpClient from './util/HttpClient';
import Config from './config.json';
import fileType from 'react-native-file-type';
import DateTimePicker from '@react-native-community/datetimepicker';

import Util from './util/Util';



export default class UploadHistoryPage extends Component {
    constructor(props) {
        super(props);
        this.state = {
            files: [],
            options: [
                { label: 'Poster', value: 'poster' },
                { label: 'Store Front', value: 'storefront' }
            ],
            selectedOption: { label: 'Poster', value: 'poster' },
            limit: 10,
            offset: 0,
            totalAllData: 0,
            showLoading: false,
            selectedDate: new Date(),
            selectedDateAll: true,
            showDate: false,
            selectedOutlet: { store_name: "*", storeid: "*"}
        }
    }

    componentDidMount(){
        var me = this;
        me.loadFiles();

    }

    loadFiles() {
        
        if(this.state.selectedOption.value == "poster")
            this.loadPosterFiles();
        else
            this.loadStoreFrontFiles();
    }

    loadPosterFiles()
    {
        let me = this;
        let url = Config.API_HOST + "/report/posters/byuploader/" + GlobalSession.currentUser.email + "/" + this.state.offset + "/" + this.state.limit;
        console.log(url);

        let dt = this.state.selectedDate;

        if(this.state.selectedDateAll)
            dt = "*";

        me.setState({
            showLoading: true
        })
        HttpClient.post(url, { outlet: this.state.selectedOutlet.storeid, date: dt  }, function(response){

            let files = response.payload;
            console.log(files);
            files.map(file => {
                file.selected = false
            });

            if(files != null)
            {
                me.setState({
                    files: files,
                    totalAllData: response.allTotal[0].total,
                    showLoading: false
                })
            }
            
            me.setState({
                showLoading: false
            })
        })

    }

    loadStoreFrontFiles()
    {
        let me = this;
        let url = Config.API_HOST + "/report/storefronts/byuploader/" + GlobalSession.currentUser.email + "/" + this.state.offset + "/" + this.state.limit;

        me.setState({
            showLoading: true
        })

        let dt = this.state.selectedDate;
        if(this.state.selectedDateAll)
            dt = "*";

        HttpClient.post(url, { outlet: this.state.selectedOutlet.storeid, date: dt  }, function(response){
            let files = response.payload;
            console.log(files);
            files.map(file => {
                file.selected = false
            });

            if(files != null)
            {
                me.setState({
                    files: files,
                    totalAllData: response.allTotal[0].total,
                    showLoading: false
                })
            }

            me.setState({
                showLoading: false
            })
        })

    }


    loadLocalFiles(){
        let me = this;
        UploadedFile.findAll({
            where:{
                isuploaded : 1,
                picture_taken_by: GlobalSession.currentUser.email
            }
            ,
            order: [
                ['uploaded_id', 'DESC']
            ]
        }).then((files) => {
            console.log(files);
            files.map(file => {
                file.selected = false
            });

            if(files != null)
            {
                me.setState({
                    files: files
                })
            }
        }).catch((err) =>{
            Logging.log(err, "error", "UploadHistoryPage.loadFiles().UploadedFile.findAll()")
        })
    }



    selectAll(){
        this.state.files.map(file => {
            file.selected = true;
        })

        this.setState({
            files:  this.state.files
        })
    }

    deselectAll(){
        this.state.files.map(file => {
            file.selected = false;
        })

        this.setState({
            files:  this.state.files
        })
    }

    deleteSelected(){
        var me = this;
        this.state.files.map(function(file) {
            if(file.selected){
                RNFS.unlink(file.filename).then(function(result) {
                    console.log("unlink result");
                    console.log(result);
                    UploadedFile.destroy({
                        where: { id: file.id }
                    }).then(function(result) {
                        console.log("destroy result");
                        console.log(result)
                        me.loadFiles();
                        return true;
                    }).catch(function(err) {
                        console.log("err destroy result");
                        console.log(err)
                        Logging.log(err, "error", "UploadHistoryPage.deleteSelected().UploadedFile.destroy()")
                    })

                    return true;
                }).catch(function(err) {
                    console.log("err unlink result");
                    console.log(err)
                    //Logging.log(err, "error", "UploadHistoryPage.deleteSelected().RNFS.unlink()")
                    UploadedFile.destroy({
                        where: { id: file.id }
                    }).then(function(result) {
                        console.log("destroy result");
                        console.log(result)
                        me.loadFiles();
                        return true;
                    }).catch(function(err) {
                        console.log("err destroy result");
                        console.log(err)
                        Logging.log(err, "error", "UploadHistoryPage.deleteSelected().UploadedFile.destroy()")
                    })
                })
            }
        });
    }

    selectDeselect(file, value){
        file.selected = value;
        this.setState({
            files:  this.state.files
        })      
    }

    back()
    {
        Actions.pop();
    }

    onOptionChange(item)
    {
        this.state.selectedOption = item;
        this.state.offset = 0;
        this.loadFiles(); 
    }

    async loadRemoteFile(file)
    {
        let me = this;
        let promise = new Promise((resolve, reject) => {
            let url = Config.API_HOST + "/uploadfile/get/" + file.id;
            HttpClient.get(url, function(response){
                resolve(response.payload)
            }, function (error){
                reject(error)
            })
        })

        return promise;
    }

    viewImage(file){

        this.loadRemoteFile(file).then((file) => {
            //alert(JSON.stringify(file));
            Actions.viewImagePage({ editMode: true, file: file })
        }).catch((err) => {
            Logging.log(err, "error", "UploadHistoryPage.viewImage().loadRemoteFile()")
            console.log(err)
            alert("Cannot load file " + file.id)
        })
        
    }

    previous()
    {
        this.state.offset = this.state.offset - this.state.limit;
        if(this.state.offset < 0)
            this.state.offset = 0;

        this.loadFiles();
    }

    next()
    {
        
        if(this.state.offset < this.state.totalAllData)
            this.state.offset = this.state.offset + this.state.limit;
 
        this.setState({
            offset : this.state.offset
        })
        this.loadFiles();   
    }

    getExt(path)
    {
        let ps = path.split(".");
        if(ps.length > 0)
            return ps[ps.length - 1];
        else
            return "";
    }

    onAfterSelectStore(store)
    {
        Actions.pop();
        this.setState({
            selectedOutlet: store
        })
    }

    selectStore(item)
    {
        console.log(item)
        if(item == null)
        {

            Actions.selectStorePage({ onAfterSelectStore: this.onAfterSelectStore.bind(this) })
        }
        else
        {
            this.setState({
                selectedOutlet: item
            })
        }
    }

    selectDate(dt)
    {
        if(dt == null || dt == undefined)
        {
            this.setState({
                showDate: true
            })
        }
        else
        {
            this.setState({
                selectedDateAll: true,
                showDate: false
            })
        }

    }

    onDateChange(evt, dt)
    {   

        this.setState({
            selectedDate: dt,
            selectedDateAll: false,
            showDate: false
        })

    }

    onAfterSelectImageCategory(imageCategory)
    {
        console.log(imageCategory);
        this.setState({
            selectedOption: imageCategory
        });
        Actions.pop();
    }

    selectJenis()
    {
        Actions.posterStoreFrontSelectPage({ onAfterSelectImageCategory: this.onAfterSelectImageCategory.bind(this)});
    }

    display()
    {
        this.state.offset = 0;
        this.loadFiles();
    }

    getDate(dt)
    {
        return (new Date()).toISOString().slice(0, 10)
    }

    getDateDisplay(dt)
    {
        return (new Date()).toISOString().slice(0, 10)
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
                <Image style={{ width: 30, height: 30, top: '2%'}} source={require('./images/upload_white.png')}></Image>
                <Title style={{ marginLeft: '2%', marginTop: '3%' }}>Daftar history upload</Title>
                </View>
              </Body>
            </Header>

            <Content padder>


                <View style={{height: 10}}></View>
                <View>
                    <Text style={{ fontWeight: 'bold' }}>Outlet : {this.state.selectedOutlet.storeid} - {this.state.selectedOutlet.store_name}</Text>
                    <View style={{height:3}}></View>
                    <View style={{flex:1, flexDirection: 'row'}}>
                        <Button style = {{alignSelf: 'flex-start', margin: 0, 
                            width: '40%', backgroundColor: '#e3b520', borderStyle: 'solid', borderRadius: 1}}
                                onPress={() => this.selectStore()}>
                                <View style={{flex: 1, flexDirection: 'row', width:'90%', alignSelf: 'center', alignItems:'center', justifyContent:'center',}}>
                                <Image source={require('./images/store.png')} />
                                <View style={{width: '2%'}}></View>
                                <Text style={{ color: '#ffffff'}}>Pilih Outlet</Text>
                                </View>
                        </Button>
                        <View style={{width: 3}}></View>
                        <Button style = {{alignSelf: 'flex-start', margin: 0, 
                            width: '40%', backgroundColor: '#e3b520', borderStyle: 'solid', borderRadius: 1}}
                                onPress={() => this.selectStore({ storeid: '*', store_name: 'Semua'})}>
                                <View style={{flex: 1, flexDirection: 'row', width:'90%', alignSelf: 'center', alignItems:'center', justifyContent:'center',}}>
                                <Image source={require('./images/store.png')} />
                                <View style={{width: '2%'}}></View>
                                <Text style={{ color: '#ffffff'}}>Semua</Text>
                                </View>
                        </Button>
                    
                    </View>

                </View>   
                <View style={{height: 10}}></View>
                <View>
                    <Text style={{ fontWeight: 'bold' }}>Tanggal : {(this.state.selectedDateAll) ? "*" : Util.getDisplayDate(new Date(this.state.selectedDate))}</Text>
                    <View style={{height:3}}></View>
                    <View style={{flex:1, flexDirection: 'row'}}>
                        <Button style = {{alignSelf: 'flex-start', margin: 0, 
                            width: '40%', backgroundColor: '#e3b520', borderStyle: 'solid', borderRadius: 1}}
                                onPress={() => this.selectDate()}>
                                <View style={{flex: 1, flexDirection: 'row', width:'90%', alignSelf: 'center', alignItems:'center', justifyContent:'center',}}>
                                <Image source={require('./images/calendar.png')} />
                                <View style={{width: '2%'}}></View>
                                <Text style={{ color: '#ffffff'}}>Pilih Tanggal</Text>
                                </View>
                        </Button>
                        <View style={{width: 3}}></View>
                        <Button style = {{alignSelf: 'flex-start', margin: 0, 
                            width: '40%', backgroundColor: '#e3b520', borderStyle: 'solid', borderRadius: 1}}
                                onPress={() => this.selectDate("*")}>
                                <View style={{flex: 1, flexDirection: 'row', width:'90%', alignSelf: 'center', alignItems:'center', justifyContent:'center',}}>
                                <Image source={require('./images/calendar.png')} />
                                <View style={{width: '2%'}}></View>
                                <Text style={{ color: '#ffffff'}}>Semua</Text>
                                </View>
                        </Button>
                    
                    </View>
                    {(this.state.showDate) ? 
                    <DateTimePicker
                        testID="dateTimePicker"
                        value={this.state.selectedDate}
                        mode="date"
                        is24Hour={true}
                        display="default"
                        onChange={this.onDateChange.bind(this)}
                        /> : null
                    }
                </View>
                <View style={{height: 10}}></View>
                <View>
                    <Text style={{ fontWeight: 'bold' }}>Jenis foto : {this.state.selectedOption.label}</Text>
                    <View style={{height: 3}}></View>
                    <Button style = {{alignSelf: 'flex-start', margin: 0, 
                        width: '40%', backgroundColor: '#e3b520', borderStyle: 'solid', borderRadius: 1}}
                            onPress={this.selectJenis.bind(this)}>
                            <View style={{flex: 1, flexDirection: 'row', width:'90%', alignSelf: 'center', alignItems:'center', justifyContent:'center',}}>
                            <Image source={require('./images/category.png')} />
                            <View style={{width: '2%'}}></View>
                            <Text style={{ color: '#ffffff'}}>Pilih Jenis Foto</Text>
                            </View>
                    </Button>

                </View>

                <View style={{ height: 20 }}></View>

                <Button style = {{alignSelf: 'flex-start', margin: 0, 
                        width: '100%', backgroundColor: '#AA2025', borderStyle: 'solid', borderRadius: 1}}
                            onPress={this.display.bind(this)}>
                            <View style={{flex: 1, flexDirection: 'row', width:'90%', alignSelf: 'center', alignItems:'center', justifyContent:'center',}}>
                            <Image source={require('./images/view.png')} />
                            <View style={{width: '2%'}}></View>
                            <Text style={{ color: '#ffffff'}}>Tampilkan</Text>
                            </View>
                    </Button>

                
                <View style={{ flex: 1, flexDirection: 'row', paddingTop: 20, height: 50 }}>
                    {
                        (this.state.offset > 0) ?
                    
                    <TouchableOpacity onPress={this.previous.bind(this)} style={{ width: '50%', alignItems: 'flex-start'}}>
                            <Image source={require('./images/previous.png')} style={{ marginLeft: 20 }} />
                    </TouchableOpacity> : <View style={{ width: '50%', alignItems: 'center'}}></View>
                    }
                    {
                        (this.state.offset < this.state.totalAllData - this.state.limit) ?
                    
                    <TouchableOpacity onPress={this.next.bind(this)} style={{ width: '50%', alignItems: 'flex-end'}}>
                        <Image source={require('./images/next.png')} style={{ marginRight: 20 }}/>
                    </TouchableOpacity> : <View style={{ width: '50%', alignItems: 'center'}}></View>}
                </View>

                <View>
                    <Text>Total: {this.state.totalAllData}</Text>
                </View>
                <View style={{ height: 10}}></View>

                <ScrollView style={{flex: 1, borderWidth: 1, borderRadius: 10, borderColor: '#999999', padding: 15}}>
                        {
                            (this.state.showLoading) ? <ActivityIndicator  color="#000" style={{ width: '100%', height: 40 }} size="large"></ActivityIndicator> : null
                        }
                        <List style={{ height: '100%' }}>
                            {
                                
                             this.state.files.map(function(file) {
                                let filename = file.uploaded_filename.split("/");
                                filename = filename[filename.length  -1];
                                let prefix_url = file.uploaded_filename.replace(filename, "");

                                let uploaded_filename = prefix_url + "thumbnail_"  + filename;

                                let url = "";
                                if(uploaded_filename != null)
                                    url = uploaded_filename.replace("gs://", "https://storage.googleapis.com/");
                                
                                
                                return (<ListItem key={file.id}>
                                        <TouchableOpacity onPress={()=> me.viewImage(file)} style={{width: '100%', flex:1, flexDirection: 'row', textAlign: 'left'}} >
                                            <Image style={{ width: 60, height: 60, marginLeft: -15 }} source={{ uri: url}}></Image>
                                            <View style={{ flex:1, textAlign: 'left', flexDirection: 'column'}}>
                                                <Text style={{ marginLeft: '15%', width: '100%', fontWeight: 'normal', textAlign: 'left' }}>Outlet: {file.store_id} {file.store_name}</Text>
                                                <Text style={{ marginLeft: '15%', width: '100%',fontWeight: 'bold', textAlign: 'left' }}>Tanggal Upload: {Util.getDisplayDate(new Date(file.upload_date))}</Text>
                                                <Text style={{ marginLeft: '15%', width: '100%',fontWeight: 'bold', textAlign: 'left' }}>{filename}</Text>
                                                <Text style={{ marginLeft: '15%', width: '100%',fontWeight: 'normal', textAlign: 'left' }}>Total Package Items: {file.total}</Text>
                                            </View>
                                            
                                        </TouchableOpacity>
                                    </ListItem>)
                                }) 
                            }
                        </List>
                        

                </ScrollView>
                <View style={{ flex: 1, flexDirection: 'row', paddingTop: 20, height: 50 }}>
                    {
                        (this.state.offset > 0) ?
                    
                    <TouchableOpacity onPress={this.previous.bind(this)} style={{ width: '50%', alignItems: 'flex-start'}}>

                            <Image source={require('./images/previous.png')} style={{ marginLeft: 20 }}/>
                    </TouchableOpacity> : <View style={{ width: '50%', alignItems: 'center'}}></View>
                    }
                    {
                        (this.state.offset < this.state.totalAllData - this.state.limit) ?
                    
                    <TouchableOpacity onPress={this.next.bind(this)} style={{ width: '50%', alignItems: 'flex-end'}}>
                        <Image source={require('./images/next.png')} style={{ marginRight: 20 }}/>
                    </TouchableOpacity> : <View style={{ width: '50%', alignItems: 'center'}}></View>}
                </View>

    
            </Content>
          </Container>
        );
      }


}