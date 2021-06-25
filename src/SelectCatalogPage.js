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

export default class SelectCatalogPage extends Component {
    constructor(props) {
        super(props);
        this.state = {
            packageType: '',
            packageName: '',
            searchPackageType: '',
            searchPackageName: ''
        }
    }

    componentDidMount(){

        this.loadPackageTypes();
    }

    loadPackageTypes()
    {
        let url = Config.API_HOST + "/productcatalog/find-by-operator";
        HttpClient.get()
    }

    loadPackageName()
    {

    }

}