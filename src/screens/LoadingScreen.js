import React, { Component } from "react";
import {
  View,
  Text,
  ImageBackground,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import MyStorage from "../util/MyStorage";
import { connect } from "react-redux";
import { setUser } from "../redux/actions/index";
import SplashScreen from "react-native-splash-screen";

class LoadingScreen extends React.Component {
  constructor(props) {
    super(props);
  }
  componentDidMount = () => {
    const { dispatch } = this.props.navigation;
    // first checking the user credentials if the creadential are in local storage then the user directly navigate to home screen otherwise to the swiper screen
    new MyStorage()
      .getUserData()
      .then((data) => {
        if (data) {
          const user = JSON.parse(data);
          this.props.setUser(user);
          // if (user.personalInfo && user.skills && user.creditCardInfo) {
          if (user.personalInfo && user.skills) {
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
          } else {
            dispatch({
              type: "Navigation/RESET",
              actions: [
                {
                  type: "Navigate",
                  // routeName: 'PersonalInformation'
                  routeName: "routeTwo",
                },
              ],
              index: 0,
            });
          }
        } else {
          dispatch({
            type: "Navigation/RESET",
            actions: [
              {
                type: "Navigate",
                routeName: "SwiperScreen",
              },
            ],
            index: 0,
          });
        }
      })
      .catch((err) => {
        console.log("error in fetching user data is: ", err);
        dispatch({
          type: "Navigation/RESET",
          actions: [
            {
              type: "Navigate",
              routeName: "SwiperScreen",
            },
          ],
          index: 0,
        });
      })
      .finally(() => {
        SplashScreen.hide()
      });
  };

  render() {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator color="black" size="large" />
      </View>
    );
  }
}

const MapStateToProps = (state) => {
  return {};
};
export default connect(MapStateToProps, { setUser })(LoadingScreen);
