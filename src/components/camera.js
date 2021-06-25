import React, {PureComponent} from 'react';
import {RNCamera} from 'react-native-camera';
import {TouchableOpacity, Alert, StyleSheet, ActivityIndicator, View} from 'react-native';
import { Image } from 'react-native';
import { Text } from 'native-base';

export default class Camera extends PureComponent {  
    
    constructor(props) {
        super(props);
        this.state = {
            takingPic: false,
            opacity: 0.5,
            text: 'bbb'
        };
    }

    takePicture = async () => {
        if (this.camera && !this.state.takingPic) {
    
          let options = {
            quality: 0.15,
            fixOrientation: true,
            forceUpOrientation: true,
          };
    
          this.setState({takingPic: true});
    
          try {
             const data = await this.camera.takePictureAsync(options);
             this.setState({takingPic : false})
             if(this.props.onDoneTakePicture != null)
                this.props.onDoneTakePicture(data);
             
          } catch (err) {
            Alert.alert('Error', 'Failed to take picture: ' + (err.message || err));
            return;
          } finally {
            this.setState({takingPic: false});
          }
        }
    }

    onPress()
    {
        //this.setState({ opacity: 1 })
        this.takePicture();
    }

    render() {

        return (
            <RNCamera 
            ref={ref => {
                this.camera = ref;
            }}
            captureAudio={false}
            style={{flex: 1}}
            type={RNCamera.Constants.Type.back}
            androidCameraPermissionOptions={{
                title: 'Permission to use camera',
                message: 'We need your permission to use your camera',
                buttonPositive: 'Ok',
                buttonNegative: 'Cancel',
            }}>
                <TouchableOpacity onPress={this.onPress.bind(this)}
                style={{ position: 'absolute', top: '80%', width:'100%', opacity: this.state.opacity }} >
                    <View  style={{  flex:1, flexDirection: 'column', width:'100%', justifyContent: 'center',alignItems: "center"  }}>
                        <Image resizeMode="contain" style={{ width: '20%' }}  source={require('../images/camarabutton.png')}></Image>
                    </View>
                </TouchableOpacity>
            </RNCamera>
        );
        
    }
}