import React, { Component } from "react";
import {
  View,
  Text,
  Image,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  ImageBackground
} from "react-native";
import { scale, verticalScale } from "../components/helper/scaling";
import { strings, selection } from '../../locales/i18n';
export default class Welcome extends React.Component {
  CallSkip() {
    const { dispatch } = this.props.navigation;
    dispatch({
      type: "Navigation/RESET",
      actions: [
        {
          type: "Navigate",
          routeName: "routeTwo",
        },
      ],
      index: 0,
    });
  }
  CallNext() {
    const { dispatch } = this.props.navigation;
    dispatch({
      type: "Navigation/RESET",
      actions: [
        {
          type: "Navigate",
          routeName: "PersonalInformation",
        },
      ],
      index: 0,
    });
  }
  render() {
    return (
      <View style={{ flex: 1 }}>
        <ImageBackground source={require('../../assets/slide2.png')} resizeMode={'cover'} style={{ flex: 1 }}>
          <View backgroundColor="transparent" flex={1}>
          </View>
          <View flex={0.7}>
            <View flex={1} alignItems="center" justifyContent="center">
              <Text style={{ color: "black", fontSize: scale(20), fontFamily: "Poppins-Bold" }}>{strings("intro_slider_title1")}</Text>
              <Image source={require('../../assets/iconNew.png')} style={{ height: verticalScale(50), width: verticalScale(93) }} />{/* <Text style={{ color: "#6B6C6D", fontSize: scale(14) }}>{'Next'}</Text> */}
            </View>
            <View flex={0.7} alignItems="center" justifyContent="center">
              <Text style={{
                color: 'black',
                fontSize: scale(14),
                marginLeft: scale(10),
                marginRight: scale(10),
                alignSelf: 'center',
                textAlign: 'center',
                padding: scale(5),
                fontFamily: "Poppins-Regular"
              }}>{strings("welcome_text")}</Text>
            </View>
            <View flexDirection="row" justifyContent="space-between" flex={1} alignItems="center" marginLeft={scale(20)} marginRight={scale(20)}>
              <TouchableOpacity style={{ borderRadius: 5, justifyContent: "center", alignItems: "center" }} onPress={() => this.CallNext()}>
                <View justifyContent="center" alignItems="center">
                  <Image source={require('../../assets/blank.png')} style={{ height: verticalScale(65), width: verticalScale(65), }} />{/* <Text style={{ color: "#6B6C6D", fontSize: scale(14) }}>{'Next'}</Text> */}
                  <Text style={{ color: "white", position: "absolute", fontSize: scale(15), fontFamily: "Poppins-Regular" }}>{strings("next")}</Text>
                </View>
              </TouchableOpacity>
              <View marginTop={0} width={verticalScale(10)} />
              <TouchableOpacity style={{ borderRadius: 5, justifyContent: "center", alignItems: "center" }} onPress={() => this.CallSkip()}>
                <View justifyContent="center" alignItems="center">
                  <Image source={require('../../assets/blank.png')} style={{ height: verticalScale(65), width: verticalScale(65) }} />{/* <Text style={{ color: "#6B6C6D", fontSize: scale(14) }}>{'Next'}</Text> */}
                  <Text style={{ color: "white", position: "absolute", fontSize: scale(15), fontFamily: "Poppins-Regular" }}>{strings("skip")}</Text>
                </View>
              </TouchableOpacity>
            </View>
          </View>
        </ImageBackground>
      </View>
    );
  }
}
