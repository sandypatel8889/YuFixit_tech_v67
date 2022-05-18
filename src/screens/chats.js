import React, { Component } from "react";
import { View, TouchableOpacity, Image, ImageBackground } from "react-native";
import {
  Container,
  Header,
  Content,
  List,
  ListItem,
  Left,
  Body,
  Right,
  Thumbnail,
  Text,
  Button,
} from "native-base";
import { Alert, ScrollView } from "react-native";
import { connect } from "react-redux";
import { setUser } from "../redux/actions/index";
import database from "@react-native-firebase/database";
import MyStorage from "../util/MyStorage";
import { setPaymentModal } from "../redux/actions/index";
import NetInfo from "@react-native-community/netinfo";
import moment from "moment";
import { getUserData } from "../util/firestoreHandler";
import { mainColor } from "../components/helper/colors";
var PushNotification = require("react-native-push-notification");
import { scale, verticalScale } from "../components/helper/scaling";
import { strings, selection } from '../../locales/i18n';
class Chats extends React.Component {
  constructor() {
    super();
    this.state = {
      messages: [],
      isInternetAvilable: true,
      isInternetAlertOpne: false
    };
  }
  // refreshing data
  refreshData = () => {
    PushNotification.setApplicationIconBadgeNumber(0)
    getUserData(this.props.userData.id)
      .then((res) => {
        let data = { ...res.data(), id: res.id };
        console.log('user data is.....', data)
        this.props.setUser(data);
        new MyStorage().setUserData(JSON.stringify(data));
        let chats = data.chats ? data.chats : [];
        let messages = [];

        // fetching all chats

        var rowLen = 0
        chats.map((chatKey) => {
          database()
            .ref()
            .child(chatKey)
            .once("value")
            .then((res) => {
              let result = res.val();
              if (result) {
                let lastMessage = null;
                console.log('messages are: ', result)
                if (result.messages) {
                  let keys = Object.keys(result.messages);
                  keys.sort();
                  lastMessage = result.messages[keys[keys.length - 1]];
                }

                messages.push({
                  key: chatKey,
                  customer: result.customer,
                  lastMessage: lastMessage,
                });
              }

              const sortedActivities = messages.sort((a, b) => b.lastMessage.created_at - a.lastMessage.created_at)
              rowLen = rowLen + 1

              if (rowLen === chats.length) {
                this.setState({ messages: sortedActivities });
                this.saveToStorage(sortedActivities);
              } else {
                // not last one
              }
            });
        });
      })
      .catch((err) => {
        console.log("error: ", err)
      });

  };
  componentDidMount = () => {
    const unsubscribe = NetInfo.addEventListener(state => {
      console.log("Connection type", state.type);
      console.log("Is connected?", state.isConnected);
      this.setState({ isInternetAvilable: state.isConnected });
      if (state.isConnected) {
        this.setState({ isInternetAlertOpne: true });
      }
      else {
        if (this.state.isInternetAlertOpne) {
          this.setState({ isInternetAlertOpne: false });
        }
      }
    });
  };
  componentDidFocus = () => {
    this.refreshData();
  };
  componentWillMount() {
    // adding listner on did focus
    this.subs = [
      this.props.nav.addListener("didFocus", this.componentDidFocus),
    ];
  }
  componentWillUnmount() {
    // removing listner
    this.subs.forEach((sub) => sub.remove());
  }
  // saving the chatlist to the storage
  saveToStorage = (data) => {
    new MyStorage().setChatList(JSON.stringify(data));
  };
  convertdte(timestamp) {
    var newDate = moment(new Date(timestamp)).format('DD MMM, HH:mm a');
    return newDate
  }
  render() {
    return (
      <View style={{ flex: 1 }}>
        {this.state.messages.length > 0 ? (
          <ScrollView>
            <List>
              {this.state.messages.map((message, index) => (
                <ListItem
                  key={index}
                  onPress={() => {
                    if (this.props.isPlanActive) {
                      this.props.nav.navigate("ChatMessage", {
                        data: message.customer,
                        chatKey: message.key,
                      });
                    }
                    else {
                      Alert.alert("", strings("sub_expired"))
                    }
                  }}>
                  <Body>
                    <View flexDirection="row" justifyContent="space-between" alignItems="center">
                      <View>
                        <ImageBackground
                          style={{
                            height: verticalScale(50), width: verticalScale(50)
                          }}
                          imageStyle={{ borderRadius: verticalScale(25) }}
                          source={
                            require('../../assets/icon.png')
                          }>
                          <Image
                            style={{
                              height: verticalScale(50), width: verticalScale(50), borderRadius: verticalScale(25)
                            }}
                            source={{
                              uri: message.customer.profileUrl
                            }}
                          />
                        </ImageBackground>
                      </View>
                      <View justifyContent="center" width={"45%"}>
                        <Text numberOfLines={2} ellipsizeMode='tail' style={{ color: mainColor, fontSize: scale(14), fontFamily: "Poppins-Regular" }}>
                          {message.customer.name}
                        </Text>
                        {message.lastMessage.message != "" ? <Text numberOfLines={2} ellipsizeMode='tail' style={{ color: "#A7A8AB", fontSize: scale(11), fontFamily: "Poppins-Light" }}>
                          {message.lastMessage.message}
                        </Text> : <Text style={{ color: "#A7A8AB", fontSize: scale(11), fontFamily: "Poppins-Light" }}>{strings("Media_file")}</Text>}
                      </View>
                      <View justifyContent="center">
                        <Text style={{ color: "#A7A8AB", fontSize: scale(10), fontFamily: "Poppins-Regular" }}>
                          {this.convertdte(message.lastMessage.created_at)}
                        </Text>
                      </View>
                    </View>
                  </Body>
                  {/* <Right>
                  <Text note style={{ color: "gray" }}>
                    {this.convertdte(message.lastMessage.created_at)}
                  </Text>
                </Right> */}
                </ListItem>
              ))}
            </List>
          </ScrollView>
        ) : (
          <View
            style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
            <Text style={{ color: "#B5B5B5", fontSize: scale(14), fontFamily: "Poppins-Regular", textAlign: "center" }}>
              {strings("no_message")}
            </Text>
          </View>
        )}
      </View>
    );
  }
}
const MapStateToProps = (state) => {
  return {
    userData: state.userData,
  };
};
export default connect(MapStateToProps, { setPaymentModal, setUser })(Chats);
