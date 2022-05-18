import React, { Component } from "react";
import {
  Image
} from "react-native";
import {
  createStackNavigator,
  createBottomTabNavigator,
  createAppContainer,
  createSwitchNavigator,
} from "react-navigation";
import SwiperScreen from "../screens/swiperScreen";
import Home from "../screens/Home";
import Login from "../screens/login";
import SignUp from "../screens/signUp";
import ForgetPassword from "../screens/forgetPassword";
import MobileNo from "../screens/verifyMobileNo";
import Connect from "../screens/connect";
import Bookings from "../screens/bookings";
import Profile from "../screens/profile";
import GoogleAddress from "../screens/GoogleAddress";

import Notifications from "../screens/notification";
import { scale, verticalScale } from "../components/helper/scaling";
import LoadingScreen from "../screens/LoadingScreen";
import chatMessage from "../screens/chatMessage";
import PersonalInformation from "../screens/personalInformation";
import CategorySelection from "../screens/CategorySelection";
import Welcome from "../screens/welcome";

import MapViewScreen from '../screens/mapScreenNew'
import { mainColor } from "../components/helper/colors";

import ProfileStack from '../routes/ProfileStack'
import HomeStack from '../routes/HomeStack'
import ConnectStack from '../routes/ConnectStack'
import NotificationStack from '../routes/NotificationStack'
import MoreStack from '../routes/MoreStack'
import { strings} from '../../locales/i18n';
const TabNav = createBottomTabNavigator(
  {
    Dashboard: {
      screen: HomeStack,
      navigationOptions: {
        tabBarLabel: strings("DASHBOARD"),
        tabBarIcon: ({ focused }) => {
          return (
            <Image source={require('../../assets/dashboard.png')} style={{ tintColor: focused ? mainColor : "#B5B5B5", resizeMode: 'contain', height: scale(22), width: scale(22), marginTop: scale(5) }} />
          );
        },
      },
      defaultNavigationOptions: {
        gesturesEnabled: false,
      }
    },
    // Booking: {
    //     screen: Bookings,
    //     navigationOptions: {
    //         tabBarIcon: ({ focused }) => {
    //             return (
    //                 <Icon type='EvilIcons' size={18} name='list-alt' style={{ color: focused ? mainColor : "gray" }} />
    //             );
    //         }
    //     }
    // },


    Notify: {
      screen: NotificationStack,
      navigationOptions: {
        tabBarLabel: strings("NOTIFY"),
        tabBarIcon: ({ focused }) => {
          return (
            <Image source={require('../../assets/tab_not.png')} style={{ tintColor: focused ? mainColor : "#B5B5B5", resizeMode: 'contain', height: scale(22), width: scale(22), marginTop: scale(5) }} />
            // <Icon
            //   type="EvilIcons"
            //   size={22}
            //   name="bell"
            //   style={{ color: focused ? mainColor : "gray" }}
            // />
          );
        },
      },
      defaultNavigationOptions: {
        gesturesEnabled: false,
      }
    },
    Chat: {
      screen: Connect,
      navigationOptions: {
        tabBarLabel: strings("CHAT"),
        tabBarIcon: ({ focused }) => {
          return (
            <Image source={require('../../assets/tab_chat.png')} style={{ tintColor: focused ? mainColor : "#B5B5B5", resizeMode: 'contain', height: scale(22), width: scale(22), marginTop: scale(5) }} />
          );
        },
      },
      defaultNavigationOptions: {
        gesturesEnabled: false,
      }
    },
    Account: {
      screen: ProfileStack,
      navigationOptions: {
        tabBarLabel: strings("ACCOUNT"),
        tabBarIcon: ({ focused }) => {
          return (
            <Image source={require('../../assets/tab_user.png')} style={{ tintColor: focused ? mainColor : "#B5B5B5", resizeMode: 'contain', height: scale(22), width: scale(22), marginTop: scale(5) }} />
          );
        },
      },
      defaultNavigationOptions: {
        gesturesEnabled: false,
      }
    },
    More: {
      screen: MoreStack,
      navigationOptions: {
        tabBarLabel: strings("MORE"),
        tabBarIcon: ({ focused }) => {
          return (
            <Image source={require('../../assets/tab_more.png')} style={{ tintColor: focused ? mainColor : "#B5B5B5", resizeMode: 'contain', height: scale(22), width: scale(22), marginTop: scale(5) }} />
          );
        },
      },
      defaultNavigationOptions: {
        gesturesEnabled: false,
      }
    },
  },
  {
    tabBarOptions: {
      activeTintColor: mainColor,
      upperCaseLabel: false,
      inactiveTintColor: "#B5B5B5",
      showIcon: true,
      labelStyle: {
        fontSize: scale(8),
        fontFamily: "Poppins-SemiBold",
        textTransform: "uppercase",
        paddingTop: scale(5)
      },
      style: {
        backgroundColor: "#FFF",
        paddingVertical: 10,
        height: scale(50),
        marginBottom: 0,
        shadowOpacity: 0.05,
        shadowRadius: 10,
        shadowColor: "#000",
        shadowOffset: { height: 0, width: 0 }
      }
    }
  }
);

const AppNavigator = createStackNavigator(
  {
    Loading: {
      screen: LoadingScreen,
    },
    SwiperScreen: {
      screen: SwiperScreen,
    },
    Login: {
      screen: Login,
    },
    Welcome: {
      screen: Welcome,
    },
    PersonalInformation: {
      screen: PersonalInformation,
    },
    CategorySelection: {
      screen: CategorySelection,
    },
    SignUp: {
      screen: SignUp,
    },
    GoogleAddress: {
      screen: GoogleAddress,
    },
    ForgetPassword: {
      screen: ForgetPassword,
    },
    MobileNo: {
      screen: MobileNo,
    },
    ChatMessage: {
      screen: chatMessage,
    },
    routeTwo: {
      screen: TabNav,
    },
    MapViewScreen: {
      screen: MapViewScreen
    },
  },
  {
    headerMode: "none",
    defaultNavigationOptions: {
      gesturesEnabled: false,
    },
  },
);

const MySwitchNavigator = createSwitchNavigator(
  {
    routeOne: AppNavigator,
    // routeTwo: TabNav,
  },
  {
    initialRouteName: "routeOne",
  }
);

const Root = createAppContainer(MySwitchNavigator);

export default Root;
