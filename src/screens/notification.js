import React, { Component } from "react";
import { View, Text, ScrollView, Dimensions, Image, ImageBackground } from "react-native";
import { scale, verticalScale } from "../components/helper/scaling";
import Icon from "react-native-vector-icons/FontAwesome";
import { connect } from "react-redux";
import { getNotifications } from "../util/firestoreHandler";
var PushNotification = require("react-native-push-notification");
import { mainColor } from "../components/helper/colors";
import moment from "moment";
import { Header } from "react-native-elements";
import Purchases from "react-native-purchases";
import {
  Container,
  Content,
  List,
  ListItem,
  Left,
  Body,
  Right,
  Thumbnail,
} from "native-base";
import { Alert } from "react-native";
import { Platform } from "react-native";
import { strings, selection } from '../../locales/i18n';
class Notifications extends React.Component {
  constructor() {
    super();
    this.state = {
      notifications: [
        {
          temp: true,
        },
      ],
      PlanActive: false,
    };
  }
  componentWillUnmount() {
    // removing listner
    this.subs.forEach((sub) => sub.remove());

  }
  componentWillMount() {
    // listner for did focus
    this.subs = [
      this.props.navigation.addListener("didFocus", this.componentDidFocus),
    ];
  }
  componentDidFocus = () => {
    PushNotification.setApplicationIconBadgeNumber(0)
    if (
      !this.props.userData.personalInfo ||
      !this.props.userData.skills ||
      !this.props.userData.creditCardInfo
    ) {
      this.props.navigation.goBack();
      this.props.navigation.navigate("PersonalInformation", { params: "Profile" });
      return;
    }


    let data = this.props.userData;
    Purchases.identify(data.email)
      .then((value) => {
        console.log("purchaseInfo: ", value)
        this.GetPurhcaseInfo()
      })
      .catch((reason) => {
        console.log("error identify purchase: ", reason)
      })



    // getting all the mnotifications
    getNotifications(this.props.userData.id)
      .then((res) => {
        if (res.docs.length > 0) {
          let temp = res.docs.map((item) => {
            return { ...item.data(), id: item.id };
          });
          temp.sort((a, b) => {
            return b.booking.update_at - a.booking.update_at;
          });
          this.setState({ notifications: temp });
        } else {
          this.setState({ notifications: [] });
        }
      })
      .catch((err) => {
        Alert.alert(strings("Error"), strings("Error_Something_went"));
      });
  };
  GetPurhcaseInfo = async () => {
    let purchaserInfo = await Purchases.getPurchaserInfo();
    if (typeof purchaserInfo.entitlements.active.chat !== "undefined") {
      this.setState({
        PlanActive: true
      })
    }
    else {
      this.setState({
        PlanActive: false
      })
    }
  }
  // getting time from selected date
  getTimeFromDate = (timestamp) => {
    var newDate = moment(new Date(timestamp * 1000)).format('DD MMM, HH:mm a');
    return newDate
  };
  pad = (num) => {
    return ("0" + num).slice(-2);
  };
  render() {
    return (
      <View style={{ flex: 1 }}>
        <Header
          containerStyle={[{
            alignItems: "center",
            backgroundColor: "white",
            borderBottomColor: "white",
            borderBottomWidth: 1,
            height: verticalScale(50)
          }, Platform.OS == "android" ? { paddingTop: 0 } : null]}
          screenOptions={{
            headerStyle: { elevation: 0 }
          }}
          centerComponent={
            <View style={{ flexDirection: "column", justifyContent: "center", alignItems: "center" }}>
              <Text style={{ fontSize: scale(18), color: mainColor, width: "100%", textAlign: "center", fontFamily: "Poppins-SemiBold" }}>{strings("Notifications")}</Text>
            </View>
          }
        />
        <View style={{ paddingRight: scale(12), flex: 1 }}>
          {this.state.notifications.length > 0 ? <ScrollView>
            <List>
              {this.state.notifications.map((notification) => {
                if (notification.temp) {
                  return (
                    <ListItem>
                      <Body
                        style={{ backgroundColor: "white", height: 60 }}
                      ></Body>
                    </ListItem>
                  );
                } else {
                  return (
                    <ListItem
                      onPress={() => {
                        if (notification.booking.notifyUser) {
                          this.props.navigation.navigate("Chat", {
                            notifyUser: true,
                          });
                        }
                        else if (this.state.PlanActive) {
                          if (notification.booking.chatKey) {
                            this.props.navigation.navigate("ChatMessage", {
                              data: "",
                              chatKey: notification.booking.chatKey,
                              sender_id: notification.booking.sender_id,
                            });
                          }
                          else {
                            Alert.alert(strings("Error"), strings("no_chatkey"));
                          }
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
                                  uri: notification.booking.customerProfileUrl
                                }}
                              />
                            </ImageBackground>
                          </View>
                          <View justifyContent="center" width={"45%"}>
                            <Text numberOfLines={3} ellipsizeMode='tail' style={{ color: mainColor, fontSize: scale(14), fontFamily: "Poppins-Regular" }}>
                              {notification.body.split("-")[0]}
                            </Text>
                          </View>
                          <View justifyContent="center">
                            <Text style={{ color: "#A7A8AB", fontSize: scale(10), fontFamily: "Poppins-Regular" }}>
                              {this.getTimeFromDate(
                                notification.booking.update_at
                              )}
                            </Text>
                          </View>
                        </View>
                      </Body>
                    </ListItem>
                  );
                }
              })}
            </List>
          </ScrollView> : <View
            style={{
              height: Dimensions.get('window').height,
              alignSelf: "center",
              justifyContent: "center",
              alignItems: "center",
              position: "absolute",
            }}>
            <Text style={{ color: "#B5B5B5", fontSize: scale(14), fontFamily: "Poppins-Regular", textAlign: "center" }}>
              {strings("No_notification")}
            </Text>
          </View>}
        </View>
      </View>
    );
  }
}
const MapStateToProps = (state) => {
  return {
    userData: state.userData,
  };
};
export default connect(MapStateToProps, {})(Notifications);
