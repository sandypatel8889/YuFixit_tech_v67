import React, { Component } from 'react';
import { createStackNavigator, createBottomTabNavigator, createAppContainer, createSwitchNavigator } from 'react-navigation'
import CategorySelection from "../screens/CategorySelection";
import Connect from "../screens/connect";
import PersonalInformation from "../screens/personalInformation";
import GoogleAddress from "../screens/GoogleAddress";
const ConnectStack = createStackNavigator({
  Main: {
    screen: Connect,
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
},
  {
    headerMode: 'none',
    defaultNavigationOptions: {
      gesturesEnabled: false,
    }
  }
);
export default ConnectStack;