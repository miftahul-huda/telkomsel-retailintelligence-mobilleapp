import React, { Component } from 'react';
import { Container, Content, Text, Card, Header, Footer, Body, Button, Title, 
  List,
  ListItem,
  Left,
  Item, CardItem, Icon, View } from 'native-base';

import { Image, ImageBackground, ScrollView } from 'react-native';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { Actions } from 'react-native-router-flux';
import GlobalSession from './GlobalSession';
import UploadedFile from './model/UploadedFile';
import Style from './style';

export default class TakePictureBeforeAfterPage extends Component {
    constructor(props)
    {
        super(props)
        console.log(props)
    }

    async onAfterTakePicture(file)
    {

        console.log("onAfterTakePicture2")
        console.log(file);


        await UploadedFile.update({ store_id: this.props.store_id, store_name: this.props.store_name, 
            imageCategory: this.props.imageCategory, beforeAfterType: this.props.beforeAfterType, 
            beforeAfterID: this.props.beforeAfterID }, {where: {id:  file.id}})
        console.log("gere")
        let bFile = await UploadedFile.findAll({ where: { id: file.id  } });
        console.log("Newly bfile");
        console.log(bFile);

        if(file.imageCategory == "poster-before-after")
            Actions.reset("beforeAfterPosterHomePage", { beforeAfterID: this.props.beforeAfterID })
        else
            Actions.reset("beforeAfterStoreFrontHomePage", { beforeAfterID: this.props.beforeAfterID })
    }

    onAfterSelectStore(store)
    {
        var me = this;
        GlobalSession.currentStore = store;

        setTimeout(function(){
            Actions.cameraPage({ onBack: me.backFromTakePicture.bind(me), onAfterTakePicture: me.onAfterTakePicture.bind(me), crop: false });
        }, 100)
    }

    onAfterSelectImageCategory(cat)
    {
        GlobalSession.imageCategory  = cat;
        Actions.selectStorePage({ onBack: this.backFromOutletSelect.bind(this), onAfterSelectStore: this.onAfterSelectStore.bind(this) });
    }

    backFromPosterStoreFrontSelect()
    {
        Actions.reset("homePage")
    }

    backFromOutletSelect()
    {
        var me = this;
        setTimeout(function(){
            me.camera()
        }, 500)
        
    }

    backFromTakePicture()
    {
        Actions.pop();
    }

    camera()
    {
        Actions.posterStoreFrontSelectPage({ onBack: this.backFromPosterStoreFrontSelect.bind(this), onAfterSelectImageCategory : this.onAfterSelectImageCategory.bind(this)});
    }

    componentDidMount()
    {
        let me = this;
        GlobalSession.imageCategory = { value: this.props.imageCategory}
        GlobalSession.currentStore = { store_id: this.props.store_id, store_name: this.props.store_name }

        setTimeout(function(){
            Actions.cameraPage({ onBack: me.backFromTakePicture.bind(me), onAfterTakePicture: me.onAfterTakePicture.bind(me), crop: false });
        }, 100)
    }



    render()
    {
        return(<><Text></Text></>)
    }

}