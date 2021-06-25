import React from 'react';
import { StatusBar, StyleSheet, View, Image, Alert, ActivityIndicator} from 'react-native';
import { Container, Content, Text, Card, Header, Body, Button, Title, 
    CardItem, Left, Item, Input, Form, Label } from 'native-base';
import {CropView} from 'react-native-image-crop-tools';
import {Dimensions } from "react-native";
import { Actions } from 'react-native-router-flux';

const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#000'
    },
    cropView: {
      flex: 1,
      backgroundColor: '#000'
    },
});
  

export default class ImageCropperPage extends React.Component {
  state = {
    image: null,
    crop: { x: 0, y: 0 },
    zoom: 1,
    aspect: 4 / 3,
  }

  constructor(props) {
    super(props);
    this.state.image  = props.filename;
    this.state.loading = false;
    this.cropViewRef = React.createRef();
  }

  makeid(length) {
    var result           = '';
    var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for ( var i = 0; i < length; i++ ) {
       result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
  }


  renderImageCrop()
  {
      console.log(this.state.image);
      
      return (<View style={styles.container}>
        <CropView
        sourceUrl={this.state.image}
        style={styles.cropView}
        ref={this.cropViewRef}
        onImageCrop={(res) => 
          {
            res.originalFile = this.state.image.replace("file://", "");
            console.log(res)
            Actions.pop();
            this.props.onSaveImage(res);
          }
        }
        >   
            
        </CropView>
        { (this.state.loading) ? 
        <ActivityIndicator size="large"></ActivityIndicator>
        :
        null}
        <Button style = {{alignSelf: 'center', margin: 30, 
            width: '80%', backgroundColor: '#AA2025'}}
                onPress= {() => {
                    this.setState({
                      loading: true
                    })
                    this.cropViewRef.current.saveImage(true, 100);
                    
                }}>
                <View style={{flex: 1, flexDirection: 'row', width:'90%', alignSelf: 'center', alignItems:'center', justifyContent:'center',}}>
                  <Image source={require('./images/save_white.png')} />
                  <View style={{width: '2%'}}></View>
                  <Text style={{ color: '#ffffff'}}>Simpan</Text>
                </View>
        </Button>
        </View>);
  }

  renderImageView()
  {
      console.log(this.state.image)
      const screenWidth = Math.round(Dimensions.get('window').width);
      const screenHeight = Math.round(Dimensions.get('window').height);
      //return ''
      return (<View style={{backgroundColor:'#000'}}>
                <Image style={{width: screenWidth, height: screenHeight}} resizeMode={'stretch'} source={{ uri:  this.state.image }}></Image>
                <Button title="Edit"></Button>
            </View>)
  }
 
  render() {
    
    if(this.state.image !== null)
    {
        return this.renderImageCrop();
    }
    else 
        return <Text></Text>
  }
}