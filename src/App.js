import React, { Component } from 'react';
import Root from './routes/MyRoutes'
import Home from './screens/Home'
import { YellowBox, Platform, Alert, AsyncStorage } from 'react-native';
import SplashScreen from 'react-native-splash-screen'
import messaging from '@react-native-firebase/messaging';
import Purchases from 'react-native-purchases';
import { strings, selection } from '../locales/i18n';
import I18n from 'react-native-i18n';

export default class App extends React.Component {
    constructor(props) {
        super(props);
        console.disableYellowBox = true
        YellowBox.ignoreWarnings(['ViewPagerAndroid']);

        AsyncStorage.getItem("isEnglish").then((data) => {
            {
                if (JSON.parse(data) == "1") {

                    selection("en")
                    { this.Savedata('isEnglish', "1") }
                }
                else if (JSON.parse(data) == "0") {

                    selection("es")
                    { this.Savedata('isEnglish', "0") }
                }
                else {
                    const currentLocale = I18n.currentLocale();
                    const locale = I18n.locale;
                    if (locale == "en" || locale.startsWith("en")) {
                        selection("en")
                        { this.Savedata('isEnglish', "1") }
                    }
                    else {
                        selection("es")
                        { this.Savedata('isEnglish', "0") }
                    }

                }
            }
        })
    }
    Savedata(key, detail) {
        AsyncStorage.setItem(key, JSON.stringify(detail))
            .then(() => {
                console.log('data saved')
            })
    }
    componentDidMount = () => {
        if (Platform.OS == "ios")
            SplashScreen.hide()

        Purchases.setDebugLogsEnabled(true);
        Purchases.setup("TJhjXGnEEljRlXKoLlNwHvdKkDTbxncH");

        messaging().onMessage(async remoteMessage => {
            // Alert.alert('A new FCM message arrived!', JSON.stringify(remoteMessage));
        });
        messaging().setBackgroundMessageHandler(async remoteMessage => {
            console.log('Message handled in the background!', remoteMessage);
        });
    };

    render() {
        return (
            <Root />
        )
    }
}