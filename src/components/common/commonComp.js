import React, { Component } from 'react';
import { Text, View, FlatList, TouchableOpacity, Image, Platform } from "react-native";
import Icon from "react-native-vector-icons/Feather";
import { scale, verticalScale } from '../helper/scaling';
import { mainColor } from "../helper/colors";

export default class CommonComponent extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
        }
    }
    renderData = ({ item, index }) => {
        console.log('here i am in renderData ', item)
        return (
            <View style={{
                backgroundColor: "white", flexDirection: "row", alignItems: "center", padding: 10, marginLeft: 1, marginRight: 1, borderRadius: 5, marginVertical: verticalScale(4), ...Platform.select({
                    ios: {
                        shadowColor: 'gray',
                        shadowOffset: { width: 0, height: 1 },
                        shadowOpacity: 0.8,
                        shadowRadius: 1,
                      },
                      android: {
                        elevation: 5,
                      },
                }),
            }}>
                <View style={{ flex: 1 }}>
                    {item.name || item.categoryName ? <View>
                        <Text style={{ color: '#B5B5B5', fontSize: scale(11), fontFamily: "Poppins-Medium" }}>
                            {item.name || item.categoryName}
                        </Text>
                    </View>
                        :
                        null
                    }
                    {item.detail ? <View>
                        <Text style={{ fontSize: scale(13), color: "#242424", fontFamily: "Poppins-SemiBold" }}>
                            {item.detail}
                        </Text>
                    </View>
                        :
                        null
                    }
                    {item.value ? <View>
                        <Text style={{ fontSize: scale(13), color: "#242424", fontFamily: "Poppins-SemiBold" }}>
                            {item.value.name}
                        </Text>
                    </View>
                        :
                        null}
                    {item.value1 ? <View>
                        <Text style={{ fontSize: scale(13), color: "#242424", fontFamily: "Poppins-SemiBold" }}>
                            {item.value1}
                        </Text>
                    </View>
                        :
                        null}

                </View>
                {!this.props.firstItemEditable && index == 0 ?
                    null :
                    <TouchableOpacity
                        onPress={this.props.onEdit(item, index)} style={{ marginEnd: 10 }}>

                        <View height={verticalScale(16)} width={verticalScale(16)} borderRadius={verticalScale(8)} backgroundColor="#F4F4F4" justifyContent="center" alignItems="center">
                            <Image source={require('../../../assets/edit1.png')} style={{ height: verticalScale(8), width: verticalScale(8) }} />
                        </View>

                        {/* <Icon
                            type="Feather"
                            size={scale(15)}
                            name="edit"
                            style={{ color: "#B5B5B5" }}
                        /> */}
                    </TouchableOpacity>}

                {index == 0 ?
                    null :
                    <TouchableOpacity
                        onPress={this.props.onRemove(item, index)}
                    // style={{ marginStart: 10 }}
                    >
                        <Icon
                            type="Feather"
                            size={scale(15)}
                            name="x"
                            style={{ color: "#B5B5B5" }}
                        />
                    </TouchableOpacity>}
            </View>
        )
    }
    render() {
        return (
            <View style={{
                flex: 1, paddingBottom: verticalScale(2), flexDirection: 'column', justifyContent: 'space-around', ...Platform.select({
                    ios: {
                        shadowColor: 'gray',
                        shadowOffset: { width: 0, height: 1 },
                        shadowOpacity: 0.8,
                        shadowRadius: 1,
                      },
                      android: {
                        elevation: 5,
                      },
                }),
            }}>
                {/* <View style={{ height: verticalScale(20), justifyContent: 'center' }}>
                    <Text style={{ fontSize: scale(12), }}>
                        {this.props.title}
                    </Text>
                </View> */}
                {this.props.data ?
                    <View style={{ flex: 1, }}>
                        <FlatList
                            showsVerticalScrollIndicator={false}
                            data={this.props.data}
                            keyExtractor={(item, index) => index.toString()}
                            renderItem={this.renderData}
                        />
                    </View>
                    : null}
            </View>
        )
    }
}