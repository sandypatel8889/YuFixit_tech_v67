import React, { Component } from 'react';
import { View, } from 'react-native'
import Icon from 'react-native-vector-icons/FontAwesome';
import { verticalScale, scale } from '../components/helper/scaling'
import { List, ListItem, Left, Body, Right, Thumbnail, Text } from 'native-base';
import { mainColor } from "../components/helper/colors"
export default class Calls extends React.Component {
    render() {
        return (
            <View style={{ flex: 1, }}>

                <List>
                    <ListItem avatar>
                        <Left>
                            <Thumbnail source={{ uri: 'https://api.adorable.io/avatars/400/38badb6842838b6c03c29ac2657d4013.png' }} />
                        </Left>
                        <Body>
                            <Text>Daniel Santio</Text>
                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                <Icon type='EvilIcons' size={20} name='phone' style={{ color: mainColor, paddingVertical: verticalScale(4) }} />
                                <Text style={{ color: mainColor, paddingLeft: scale(6) }}>{'Outgoing'}</Text>
                            </View>
                        </Body>
                        <Right>
                            <Text note>3:43 pm</Text>
                        </Right>
                    </ListItem>
                </List>
            </View>
        )
    };
}