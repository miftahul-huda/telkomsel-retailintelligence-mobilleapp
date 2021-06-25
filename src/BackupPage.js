import React, { Component } from 'react';
import { Container, Content, Text, Card, Header, Body, Button, Title, 
  List,
  ListItem,
  Left,
  Item, CardItem, Icon, View } from 'native-base';

import { Image } from 'react-native';
import { Actions } from 'react-native-router-flux';

import * as RNFS from 'react-native-fs';
import Logging from './util/Logging';

const FILE_STORAGE_PATH = RNFS.DownloadDirectoryPath;

export default class BackupPage extends Component {


    backup()
    {
      var me  = this;
      RNFS.mkdir(FILE_STORAGE_PATH + "/retail-intelligence").then(function(){
        RNFS.copyFile("/data/data/com.telkomselretailintelligence/files/SQLite/retail-intelligence-v2", FILE_STORAGE_PATH + "/retail-intelligence/retail-intelligence-v2" ).then(() => {
          
          RNFS.copyFile("/data/data/com.telkomselretailintelligence/files/SQLite/retail-intelligence-v2-journal", FILE_STORAGE_PATH + "/retail-intelligence/retail-intelligence-v2-journal" ).then(()=>{
            //console.log("Copy " + RNFS.DownloadDirectoryPath + "/retail-intelligence/pics/ to " +  FILE_STORAGE_PATH + "/retail-intelligence/pics/");
            //me.copyRecursive(RNFS.DownloadDirectoryPath + "/retail-intelligence/pics", FILE_STORAGE_PATH + "/retail-intelligence/pics");
            alert("Backup success")
          });
  
          
        }).catch(err => {
            console.log(err);
        })
      })
    }
  
    restore()
    {
      RNFS.copyFile(FILE_STORAGE_PATH + "/retail-intelligence/retail-intelligence-v2" , "/data/data/com.telkomselretailintelligence/files/SQLite/retail-intelligence-v2" ).then(()=>{
  
        RNFS.copyFile(FILE_STORAGE_PATH + "/retail-intelligence/retail-intelligence-v2-journal", "/data/data/com.telkomselretailintelligence/files/SQLite/retail-intelligence-v2-journal").then(()=>{
          alert("Restore success")
        }).catch(err => {
          console.log(err);
        })
  
      }).catch(error => {
        console.log(error);
      });
    }


    render(){
        return(
            <Container>
            <Header style={{backgroundColor: '#AA2025'}}>
                <Body>
                <Title>Backup Existing Files</Title>
                </Body>
            </Header>
            <Content padder>

            <Button style = {{alignSelf: 'center', margin:5, 
          width: '100%', backgroundColor: '#AA2025'}}
            onPress= {() => { this.backup(); }}>
            <Text style={{ color: '#ffffff', width: '100%', textAlign: 'center' }}>Backup</Text>
          </Button>
          <Button style = {{alignSelf: 'center', margin: 5, 
          width: '100%', backgroundColor: '#AA2025'}}
            onPress= {() => { this.restore(); }}>
            <Text style={{ color: '#ffffff', width: '100%', textAlign: 'center' }}>Restore</Text>
          </Button>
            

            </Content>
            </Container>
        );
    }
}
