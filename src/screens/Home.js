import React, { Component } from "react";
import {
  View,
  Text,
  Dimensions,
  TouchableOpacity,
  Image,
  Alert,
  Modal,
  TextInput,
  ActivityIndicator,
  TouchableWithoutFeedback,
  KeyboardAwareScrollView,
  FlatList,
  ImageBackground,
  Linking
} from "react-native";
import Icon from "react-native-vector-icons/Feather";
import { Header, Avatar } from "react-native-elements";
import {
  Switch,
  Button,
  Card,
  CardItem,
  Body,
  Form,
  Item as FormItem,
  Input,
  Label,
} from "native-base";
import { verticalScale, scale } from "../components/helper/scaling";
import { connect } from "react-redux";
import { StackActions, NavigationActions } from 'react-navigation';
import {
  handleOnlinOffline,
  getUserData,
  getBookingsCounts,
  addDeviceToken,
  addAmount,
} from "../util/firestoreHandler";
import { setUser } from "../redux/actions/index";
import MyStorage from "../util/MyStorage";
import messaging from "@react-native-firebase/messaging";
import MapViewScreen from "../screens/mapScreen";
import NotificationHandler from "../components/common/NotificationHandler";
import database from "@react-native-firebase/database";
import moment from "moment";
import NetInfo from "@react-native-community/netinfo";
import auth from "@react-native-firebase/auth";
import ExpandableComponent from "../components/common/ExpandableComponent";
import { mainColor } from "../components/helper/colors";
import Modal1 from "react-native-modal";
import { LayoutAnimation } from "react-native";
import Purchases from "react-native-purchases";
import { Platform } from "react-native";
import { strings, selection } from '../../locales/i18n';
const { height, width } = Dimensions.get("window");
class Home extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      online: false,
      someComponentHasError: false,
      bookingModal: false,
      pendingBookings: [],
      upcomings: 0,
      pendings: 0,
      comingJob: null,
      adding: false,
      DOB: "",
      isInternetAvilable: true,
      isInternetAlertOpne: false,
      isOpenCategory: false,
      Offering: null
    };
  }
  navigate = (url) => { // E
    const { navigate } = this.props.navigation;
    if (url) {
      console.log("url: " + url)
      const res = url.split(':')[0];
      const resetCode = url.split('/')[2];
      if (res === 'com.app.yufixitprotech') {
        this.props.navigation.navigate("Chat", {
          notifyUser: true,
        });
      }
    }
  }
  CALLMETHOD() {
    Linking.getInitialURL().then(url => {
      this.navigate(url);
    });
  }
  handleOpenURL = (event) => { // D
    // this.props.navigation.push("ForgetVC")
    this.navigate(event.url);
  }
  componentWillUnmount() {
    Linking.removeEventListener('url', this.handleOpenURL);
  }
  componentDidMount = async () => {
    if (Platform.OS === 'android') {
      setTimeout(() => { this.CALLMETHOD() }, 1000);
    }
    else {
      Linking.addEventListener('url', this.handleOpenURL);
      setTimeout(() => { this.CALLMETHOD() }, 1000);
    }

    let data = this.props.userData;
    Purchases.identify(data.email)
      .then((value) => {
        console.log("purchaseInfo: ", value)
      })
      .catch((reason) => {
        console.log("error identify purchase: ", reason)
      })



    const unsubscribe = NetInfo.addEventListener(state => {
      console.log("Connection type", state.type);
      console.log("Is connected?", state.isConnected);
      this.setState({ isInternetAvilable: state.isConnected });
      if (state.isConnected) {
        this.setState({ isInternetAlertOpne: true });
        this.initialDataLoad()

      }
      else {
        if (this.state.isInternetAlertOpne) {
          this.setState({ isInternetAlertOpne: false });
          Alert.alert(strings("Internet_Error"), strings("Internet_Error_Message"));
        }
      }
    });
  };
  initialDataLoad = async () => {
    //   getting the user data from asyncstorage
    getUserData(this.props.userData.id)
      .then((res) => {
        // console.log('user data is.....', res.id)
        let data = { ...res.data(), id: res.id };
        this.props.setUser(data);
        new MyStorage().setUserData(JSON.stringify(data));
        this.saveDeviceToken();
        let dateofbirth = new Date(this.props.userData.personalInfo.dob.toDate()).toDateString()
        this.setState({ DOB: dateofbirth + '' });
      })
      .catch((err) => { });


    let bookings = await getBookingsCounts(this.props.userData.id);
    console.log("bookings are: ", bookings);
    this.setState({
      pendings: bookings.pendings,
      upcomings: bookings.upcomings,
    });

    database()
      .ref("comings")
      .orderByChild("provider")
      .equalTo(this.props.userData.id)
      .on("value", (snapshot) => {
        if (snapshot.val()) {
          let data = { ...snapshot.val() };
          let keys = Object.keys(snapshot.val());
          this.setState({ comingJob: { ...data[keys[0]], id: keys[0] } });
        } else {
          this.setState({ comingJob: null });
        }
      });
    this.setState({ comingJob: null });
  }
  handleLogout = () => {
    new MyStorage().setUserData(JSON.stringify(null));
    new MyStorage().clearStorage();
    const resetAction = StackActions.reset({
      index: 0,
      actions: [NavigationActions.navigate({ routeName: 'Login' })],
    });
    this.props.navigation.dispatch(resetAction)
    // Purchases.reset()
    // const { dispatch } = this.props.navigation;
    // dispatch({
    //   type: "Navigation/RESET",
    //   actions: [
    //     {
    //       type: "Navigate",
    //       routeName: "Login",
    //     },
    //   ],
    //   index: 0,
    // });
  };
  // getting device token and saving then saving the token to the asyncstorage
  saveDeviceToken = () => {
    messaging()
      .getToken()
      .then((token) => {
        if (token) {
          addDeviceToken(this.props.userData.id, token).then((res) => {
            new MyStorage().setDeviceToken(token);
            let _data = { ...this.props.userData, deviceToken: token };
            this.props.setUser(_data);
          });
        }
      });
  };
  // checking the user if he is online or offline and saving in to the asyncstorage
  handleOnline = () => {
    let data = this.props.userData;
    let value = !data.isActive;
    data = { ...data, isActive: value };
    this.props.setUser(data);

    handleOnlinOffline(this.props.userData.id, value)
      .then((res) => {
        new MyStorage().setUserData(JSON.stringify(data));
      })
      .catch((err) => {
        console.log("error in going online is: ", err);
        data = { ...data, isActive: !value };
        this.props.setState(data);
        Alert.alert(strings("Error"), strings("Error_Something_went"));
      });
  };
  sortcategory(category) {
    if(category){
      category.sort((a, b) => a.categoryName.localeCompare(b.categoryName))
      .map((item, i) => console.log("data", item));
      return category
    }
    else{
      return category
    }
    
    
  }
  render_isOpenCategory = () => {
    return (
      <Modal1
        style={{ margin: 0 }}
        animationType="slide"
        transparent={true}
        isVisible={this.state.isOpenCategory}
        onRequestClose={() => {
          this.setState({ isOpenCategory: !this.state.isOpenCategory });
        }}>
        <View style={{ flex: 1, backgroundColor: "white", paddingHorizontal: scale(12) }}>
          <View
            style={{
              flex: 0.32,
              justifyContent: "flex-end",
              // backgroundColor: "red",
              // paddingBottom: verticalScale(6),
            }}>
            <Text
              style={{
                fontSize: scale(18),
                fontFamily: "Poppins-SemiBold",
                color: mainColor,
                alignSelf: "center",
                // paddingHorizontal: scale(32),
                textAlign: "center",
              }}>{strings("All_Services_Offered")}
            </Text>
          </View>
          <View marginTop={0} height={verticalScale(10)} />
          <View style={{ flex: 3, justifyContent: "center" }}>
            <FlatList
              data={this.sortcategory(this.props.userData.services)}
              renderItem={this.renderServices}
              keyExtractor={(item, index) => index.toString()}
              ListEmptyComponent={() => {
                return (
                  <View style={{ flex: 1, alignItems: "center" }}>
                    <Text style={{ color: "gray", fontWeight: "bold" }}>
                      {strings("No_Services_Added")}
                    </Text>
                  </View>
                );
              }}
            />
          </View>
          <View
            style={{
              flex: 0.4,
              marginHorizontal: scale(12),
              justifyContent: "center",
            }}>

            <View marginTop={0} height={verticalScale(10)} />
            <View style={{ justifyContent: "center" }}>
              <Button
                full
                onPress={() => {
                  this.setState({ isOpenCategory: false });
                }}
                disabled={this.state.addingAddress}
                style={{
                  backgroundColor: mainColor,
                  borderRadius: 5,
                  borderWidth: 1,
                  // borderColor: "#B5B5B5",
                  height: verticalScale(35)
                }}>
                <Text
                  style={{ fontSize: scale(16), color: "white", fontFamily: "Poppins-SemiBold" }}>
                  {strings("OK")}
                </Text>
              </Button>
            </View>
            <View marginTop={0} height={verticalScale(10)} />
          </View>
        </View>
      </Modal1>
    );
  };
  updateLayout = index => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    const array = [...this.props.userData.services];
    array[index]['isExpanded'] = !array[index]['isExpanded'];
    this.setState(() => {
      return {
        categories: array,
      };
    });
  };
  // /   render service
  renderServices = ({ item, index }) => {
    return (
      <>
        <ExpandableComponent
          key={index}
          item={item}
          onClickFunction={this.updateLayout.bind(this, index)}
          editMode={false}
        />
      </>
    );
  };
  showLogoutAlert(index) {
    Alert.alert(strings("Logout"),
      strings("logout_title"),
      [
        {
          text: strings("No"),
          style: "cancel"
        },
        {
          text: strings("Yes"),
          onPress: () => {
            this.handleLogout()
          }
        }
      ])
  }
  render() {
    return (
      <View style={{ flex: 1 }}>
        <Header
          containerStyle={[{
            alignItems: "center",
            backgroundColor: "white",
            borderBottomColor: "white",
            height: verticalScale(50)
          }, Platform.OS == "android" ? { paddingTop: 0 } : null]}
          rightComponent={
            <Icon
              onPress={() => {
                this.showLogoutAlert();
              }}
              type="Feather"
              size={verticalScale(20)}
              name="log-out"
              style={{ color: mainColor }}
            />
          }
        />
        <View
          style={{
            marginTop: verticalScale(5),
            paddingBottom: verticalScale(15),
            backgroundColor: "white",
            justifyContent: "center",
            alignItems: "center",
          }}>
          <ImageBackground
            style={{
              height: verticalScale(90), width: verticalScale(90),
              ...Platform.select({
                ios: {
                  shadowColor: 'gray',
                  shadowOffset: { width: 0, height: 1 },
                  shadowOpacity: 0.8,
                  shadowRadius: 1,

                },
                android: {
                  elevation: 5,
                },
              })
            }}
            imageStyle={{ borderRadius: verticalScale(45), borderColor: "white", borderWidth: verticalScale(2) }}
            imageStyle={{ borderRadius: verticalScale(45), borderColor: mainColor, borderWidth: verticalScale(2) }}
            source={
              require('../../assets/icon.png')
            }>
            {this.props.userData.personalInfo ? <Image
              style={{
                height: verticalScale(90), width: verticalScale(90), borderRadius: verticalScale(45), borderColor: mainColor, borderWidth: verticalScale(2)
              }}
              source={{ uri: this.props.userData.personalInfo.profileUrl }}
            /> : <View></View>}
          </ImageBackground>
          <View marginTop={0} height={verticalScale(10)} />
          <Text style={{ fontSize: scale(18), fontFamily: "Poppins-SemiBold", color: mainColor }}>
            {this.props.userData.name}
          </Text>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "center",
              alignItems: "center",
              marginTop: 5
            }}>
            <Text style={{ fontSize: scale(12), paddingRight: scale(6), color: "#B5B5B5", fontFamily: "Poppins-Medium" }}>
              {this.props.userData.isActive ? strings("Go_Offline") : strings("Go_Online")}
            </Text>
            <Switch
              style={{ transform: [{ scaleX: 1 }, { scaleY: 0.90 }] }}
              value={this.props.userData.isActive}
              onValueChange={() => {
                this.handleOnline();
              }}
            />
          </View>
        </View>
        <View style={{ flex: 1 }}>
          <View
            style={{
              flex: 1,
              borderColor: "lightgray",
              borderWidth: 0.5,
              borderRadius: 5
            }}>
            <MapViewScreen
              id={this.props.userData.id}
              comingJob={this.state.comingJob} />
            {this.props.userData.personalInfo ? <View height={verticalScale(75)} width={"100%"} position="absolute" justifyContent="center" alignItems="center" backgroundColor="transparent" >
              <View marginTop={0} height={verticalScale(20)} />
              <View flexDirection="row" width={"90%"} justifyContent="center" backgroundColor="white" style={{
                borderRadius: 5,
                ...Platform.select({
                  ios: {
                    shadowColor: 'gray',
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.8,
                    shadowRadius: 2,
                  },
                  android: {
                    elevation: 5,
                  },
                }),
              }}>
                <View width={"90%"} justifyContent="center" padding={10}>
                  <View style={{}}>
                    <Text style={{ fontSize: scale(11), color: "#B5B5B5", fontFamily: "Poppins-Medium" }}>{strings("Work_Location")}</Text>
                  </View>
                  {this.props.userData.personalInfo ? <View style={{ paddingTop: verticalScale(1) }}>
                    <Text numberOfLines={2} ellipsizeMode='tail' style={{ fontSize: scale(13), color: mainColor, fontFamily: "Poppins-SemiBold" }}>{this.props.userData.personalInfo.address + " " + this.props.userData.personalInfo.country}</Text>
                  </View> : console.log("")}

                  <View marginTop={0} height={verticalScale(1)} />

                  <View flexDirection="row" alignItems="center">
                    <View>
                      <Text style={{ fontSize: scale(13), color: "#242424", fontFamily: "Poppins-SemiBold" }}>{this.props.userData.services && this.props.userData.services.length > 0 ? this.props.userData.services[0].categoryName : ""}</Text>
                    </View>
                    {this.props.userData.personalInfo ? <View marginTop={0} height={verticalScale(1)} /> : console.log()}
                    <View marginTop={0} marginLeft={10} marginRight={10} height={"80%"} width={2} backgroundColor="#242424" />
                    {this.props.userData.skills ? <View>
                      <Text style={{ fontSize: scale(13), color: "#242424", fontFamily: "Poppins-SemiBold" }}>Rate:{this.props.userData.skills.hourlyRate ? this.props.userData.skills.hourlyRate.value : ""}</Text>
                    </View> : console.log("")}
                  </View>
                </View>
                <View width={"10%"} justifyContent="center" alignItems="center">
                  {this.props.userData.services ? this.props.userData.services.length > 1 ? <Icon
                    onPress={() => {
                      this.setState({ isOpenCategory: true });
                    }}
                    type="Feather"
                    size={scale(20)}
                    name="arrow-right-circle"
                    style={{ color: mainColor }}
                  /> : console.log("") : console.log("")}
                </View>
              </View>
            </View> : console.log("")}
          </View>
          <View style={{ flex: 0.3, flexDirection: "row", alignItems: "center", justifyContent: "center" }}>
            <View justifyContent="center" alignItems="center" height={verticalScale(45)} width={"40%"} backgroundColor="white" style={{
              borderRadius: 5,
              ...Platform.select({
                ios: {
                  shadowColor: 'gray',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.8,
                  shadowRadius: 2,
                },
                android: {
                  elevation: 5,
                },
              }),
            }}>
              <Text
                style={{
                  marginBottom: verticalScale(2),
                  color: "#B5B5B5",
                  fontSize: scale(11),
                  fontFamily: "Poppins-Medium"
                }}>
                {strings("Pending_Jobs")}
              </Text>
              <Text style={{ fontFamily: "Poppins-SemiBold", color: mainColor, fontSize: scale(13) }}>{this.state.pendings}</Text>
            </View>
            <View height={50} width={"5%"} backgroundColor="transparent">
            </View>
            <View justifyContent="center" alignItems="center" height={verticalScale(45)} width={"40%"} backgroundColor="white" style={{
              borderRadius: 5,
              ...Platform.select({
                ios: {
                  shadowColor: 'gray',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.8,
                  shadowRadius: 2,
                },
                android: {
                  elevation: 5,
                },
              }),
            }}>
              <Text
                style={{
                  marginBottom: verticalScale(2),
                  color: "#B5B5B5",
                  fontSize: scale(11),
                  fontFamily: "Poppins-Medium"
                }}
              >
                {strings("Upcomming_Jobs")}
              </Text>
              <Text style={{ fontFamily: "Poppins-SemiBold", color: mainColor, fontSize: scale(13) }}>{this.state.upcomings}</Text>
            </View>
          </View>
        </View>
        {/* component for notificaiton handling  */}
        <NotificationHandler navigation={this.props.navigation} />
        {this.render_isOpenCategory()}
      </View >
    );
  }
}
const MapStateToProps = (state) => {
  return {
    userData: state.userData,
  };
};
export default connect(MapStateToProps, { setUser })(Home);
