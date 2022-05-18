import React, { Component } from 'react';
import { createStackNavigator, createBottomTabNavigator, createAppContainer, createSwitchNavigator } from 'react-navigation'
import CategorySelection from "../screens/CategorySelection";
import Home from "../screens/Home";
import PersonalInformation from "../screens/personalInformation";
import GoogleAddress from "../screens/GoogleAddress";

const HomeStack = createStackNavigator({
  Main: {
    screen: Home,
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
export default HomeStack;