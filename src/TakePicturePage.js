import React, { Component } from 'react';
import { Container, Content, Text, Card, Header, Footer, Body, Button, Title, 
  List,
  ListItem,
  Left,
  Item, CardItem, Icon, View } from 'native-base';

import { Image, ImageBackground, ScrollView } from 'react-native';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { Actions } from 'react-native-router-flux';
import GlobalSession, { imageCategory } from './GlobalSession';
import UploadedFile from './model/UploadedFile';
import Config from './config.json';
import Style from './style';
import Util from './util/Util';

export default class TakePicturePage extends Component {
    constructor(props)
    {
        super(props)
        console.log(props)
        this.state = {
            beforeAfterType: 'before',
        }
    }

    async onAfterTakePicture(file)
    {
        //Actions.pop();
        //Actions.pop();
        //Actions.reset("uploadPage", { imageCategory: file.imageCategory} )
        //Actions.uploadPage({ imageCategory: file.imageCategory});

        console.log("onAfterTakePicture")
        console.log(file);


        

        if(file.imageCategory == "poster")
            Actions.reset("imageHomePage", { file: file })
        else if(file.imageCategory == "storefront")
            Actions.reset("imageHomeStoreFrontPage", { file: file })
        else if(file.imageCategory == "poster-before-after")
        {
            let uid = Util.makeid(20);
            await UploadedFile.update({ beforeAfterType: "before", beforeAfterID:  uid  },
            {where:{ id: file.id}});
            

            Actions.reset("beforeAfterPosterHomePage", { beforeAfterID: uid })
        }
        else if(file.imageCategory == "storefront-before-after")
        {
            let uid = Util.makeid(20);
            await UploadedFile.update({ beforeAfterType: "before", beforeAfterID:  uid  },
            {where:{ id: file.id}});
            

            Actions.reset("beforeAfterStoreFrontHomePage", { beforeAfterID: uid })
        }
        else if(file.imageCategory == "etalase")
            Actions.reset("imageHomeEtalasePage", { file: file })
        else if(file.imageCategory == "total-sales")
            Actions.reset("imageHomeTotalSalesPage", { file: file })
            
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

        console.log("GlobalSession.imageCategory")
        console.log(GlobalSession.imageCategory)
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
        this.camera();
    }



    render()
    {
        return(<><Text></Text></>)
    }

}