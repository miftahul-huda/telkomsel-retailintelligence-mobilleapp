import React, { Component } from 'react';
import { Dimensions, Image, View } from 'react-native';
import { Container, Content, Text, Card, Header, Footer, Body, Title, 
  List,
  ListItem,
  Item, CardItem, Icon, Button, Input, Label, Radio, Right, Left, CheckBox } from 'native-base';

  export default class RadioButtonGroup extends Component
  {
        constructor(props)
        {
            super(props);
        }

        componentDidMount()
        {
            let selectedItem = null;
            this.props.items.map((item)=>{
                if(this.props.value == item.value )
                    selectedItem = item;
            });
            if(this.props.onSelect != null)
                this.props.onSelect(selectedItem);
        }

      render()
      {
          return(<View style={{width: '100%'}}>
                <View style={{height: 10}}></View>
                <Text>{this.props.label}</Text>
                <List>
                    { this.props.items.map((item)=>
                        {
                            return (<ListItem key={item.value} onPress={this.props.onSelected.bind(this, item)} >
                                <Left>
                                    <View style={{ flex: 1, flexDirection: 'row' }}>
                                        { (item.image == null) ?
                                        <Image source={require('./images/rectangle-black.png')}></Image>
                                        :
                                        <Image style={{ width: 20, height: 20}} source={{ uri: item.image}}></Image>
                                        }
                                        <View style={{width: 20}}></View>
                                        <Text>{item.text}</Text>
                                    </View>
                                    
                                </Left>
                                <Right>
                                    {(this.props.value == item.value 
                                        || (this.props.selectedItem != null && this.props.selectedItem.value == item.value)  ) ? 
                                        <Image style={{ width: 20, height: 20 }} source={require('./images/check.png')}></Image> : null}
                                </Right>
                            </ListItem>)
                        })
                    }
                </List>
          </View>);
      }
  }