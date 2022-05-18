import React, { Component } from 'react';
import { createStackNavigator, createBottomTabNavigator, createAppContainer, createSwitchNavigator } from 'react-navigation'
import CategorySelection from "../screens/CategorySelection";
import Profile from "../screens/profile";
import PersonalInformation from "../screens/personalInformation";
import GoogleAddress from "../screens/GoogleAddress";

const ProfileStack = createStackNavigator({
  Main: {
    screen: Profile,
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
export default ProfileStack;