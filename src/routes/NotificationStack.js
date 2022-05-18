import React, { Component } from 'react';
import { createStackNavigator, createBottomTabNavigator, createAppContainer, createSwitchNavigator } from 'react-navigation'
import CategorySelection from "../screens/CategorySelection";
import Notifications from "../screens/notification";
import PersonalInformation from "../screens/personalInformation";
import GoogleAddress from "../screens/GoogleAddress";
import Connect from "../screens/connect";

const NotificationStack = createStackNavigator({
  Main: {
    screen: Notifications,
    navigationOptions: ({ navigation }) => ({

    })
  },
  CategorySelection: {
    screen: CategorySelection,
  },
  PersonalInformation: {
    screen: PersonalInformation,
  },
  GoogleAddress: {
    screen: GoogleAddress,
  },
  
  Connect: {
    screen: Connect,
  },


},
  {
    headerMode: 'none',
    defaultNavigationOptions: {
      gesturesEnabled: false,
    }
  }
);
export default NotificationStack;