import React, { Component } from 'react';
import { Container, Content, Text, Card, Header, Body, Button, Title, 
  List,
  ListItem,
  Left,
  Item, CardItem, Icon, View } from 'native-base';

import { Image, ImageBackground } from 'react-native';
import { Actions } from 'react-native-router-flux';
import GlobalSession from './GlobalSession';
import UploadedFile from './model/UploadedFile';
import Config from './config.json';

import Sequelize from "rn-sequelize";
const Op = Sequelize.Op;


export default class MenuPage extends Component {

  constructor(props){
    super(props);
    this.state = {
      totalPoster: 0,
      totalStoreFront: 0,
      interval: null
    }
  }

  componentDidMount()
  {
    this.setPhotoCount();
    this.state.interval = setInterval(this.setPhotoCount.bind(this ), 1000);
  }

  componentWillUnmount(){
    if(this.state.interval != null)
      clearInterval(this.state.interval)
  }

  setPhotoCount()
  {
    var me = this;
    var totalPoster = 0;
    var totalStoreFront = 0;
    me.getPhotoCount("poster").then((c) => {
      totalPoster = c;
      //console.log("totalPster");
      c//onsole.log(totalPoster);
      me.getPhotoCount("storefront").then((c) => {
        totalStoreFront = c;
        //console.log("totalStoreFront");
        //console.log(totalStoreFront);
        me.setState({ 
          totalPoster: totalPoster,
          totalStoreFront: totalStoreFront
        })
      })
    })
  }

  getPhotoCount(imageCategory)
  {
    let promise = new Promise((resolve, reject)=>{
      UploadedFile.count({             
        where:{
          [Op.and]:
          {
              imageCategory: imageCategory,
              picture_taken_by: GlobalSession.currentUser.email,
              isuploaded: 0
          }
        }

      }).then((c) => {
        resolve(c);
      }).catch((err) => {
        reject(err);
      })
    });

    return promise;
  }

  onAfterTakePicture(file)
  {
    Actions.pop();
    Actions.pop();
  }

  onAfterSelectImageCategory(imageCategory)
  {
    GlobalSession.imageCategory = imageCategory;
    Actions.cameraPage({ onAfterTakePicture: this.onAfterTakePicture.bind(this), crop: false });
  }

  onAfterSelectStore(store)
  {
    GlobalSession.currentStore = store;
    Actions.posterStoreFrontSelectPage({ onAfterSelectImageCategory: this.onAfterSelectImageCategory.bind(this) });
    //Actions.cameraPage({ onAfterTakePicture: this.onAfterTakePicture.bind(this) });
  }

  render(){
    return(
      <Container>
        <Header style={{backgroundColor: '#AA2025'}}>
          <Body>
            <Title>Menu {Config.ENVIRONMENT}</Title>
          </Body>
        </Header>
        <Content padder>
        <ImageBackground source={require('./images/background.png')} style={{ width: '100%', height: '100%' }}>
          <List>
              <ListItem onPress= {() => {Actions.selectStorePage({ onAfterSelectStore: this.onAfterSelectStore.bind(this) }); }}>
                <View style={{ height:200, width:'100%', flex:1, flexDirection: 'column', width:'100%', justifyContent: 'center',alignItems: "center" }} >
                  <Image style={{ width: 150, height: 150 }} source={require('./images/camera.png')}></Image>
                  <Text style={{  fontWeight: 'bold' }}>{"\n"}Ambil Foto</Text>
                </View>
              </ListItem>
              <ListItem onPress={() => Actions.uploadPage({ imageCategory: "poster"}) }>
                <Image source={require('./images/poster.png')}></Image>
                <Text style={{ marginLeft: '5%', fontWeight: 'bold' }}>Upload Foto Poster ({this.state.totalPoster})</Text>
              </ListItem>
              <ListItem onPress={() => Actions.uploadPage({ imageCategory: "storefront"}) }>
                <Image source={require('./images/store-front.png')}></Image>
                <Text style={{ marginLeft: '5%', fontWeight: 'bold' }}>Upload Foto Tampak Depan ({this.state.totalStoreFront})</Text>
              </ListItem>
              <ListItem onPress={() => Actions.uploadHistoryPage() } >
                <Image source={require('./images/history.png')}></Image>
                <Text style={{ marginLeft: '5%', fontWeight: 'bold' }}>Foto yang sudah diupload</Text>
              </ListItem>
              <ListItem onPress={() => Actions.profilePage() }>
                <Image source={require('./images/profile.png')}></Image>
                <Text style={{ marginLeft: '5%', fontWeight: 'bold' }}>Profil</Text>
              </ListItem>
            </List>
            <View style={{ height: 400 }}>

            </View>
          </ImageBackground>
        </Content>
      </Container>
    );
  }
}
