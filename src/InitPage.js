import React, { Component } from 'react';
import { Container, Content, Text, Card, Header, Body, Button, Title, 
  List,
  ListItem,
  Left,
  Item, CardItem, Icon, View } from 'native-base';
import { Image } from 'react-native';
import { Actions } from 'react-native-router-flux';
import UploadedFile from './model/UploadedFile';
import {Alert} from 'react-native';

import * as SQLite from "expo-sqlite";
import Sequelize from "rn-sequelize";
const Op = Sequelize.Op;
const Model = Sequelize.Model;

const sequelize = new Sequelize({
    dialectModule: SQLite,
    database: "retail-intelligence",
    storage: './data/retail-intelligence',
    dialectOptions: {
      version: "1.0",
      description: "Retail Intelligence"
      //size: 2 * 1024 * 1024
    }
  });

export default class InitPage extends Component {
    constructor(props) {
        super(props);
    }

    async initDatabase()
    {
        try {
            UploadedFile.initialize(sequelize);
            await sequelize.sync({
              //force: true
            });
     
          } catch (error) {
            console.log(error);
          }
        
    }

    back(){
        Actions.pop();
    }

    render(){
        return(
          <Container>
            <Header style={{backgroundColor: '#AA2025'}}>
              <Body>
                <Title>Initialization</Title>
              </Body>
            </Header>
            <Content padder>
            <List>
                <ListItem onPress={this.initDatabase.bind(this)}>
                  <Image source={require('./images/database-configuration.png')}></Image>
                  <Text style={{ marginLeft: '5%', fontWeight: 'bold' }}>Init database</Text>
                </ListItem>
            </List>
            <List>
                <ListItem onPress={this.back.bind(this)}>
                  <Image source={require('./images/undo.png')}></Image>
                  <Text style={{ marginLeft: '5%', fontWeight: 'bold' }}>Back</Text>
                </ListItem>
            </List>
    
            </Content>
          </Container>
        );
      }

    
}