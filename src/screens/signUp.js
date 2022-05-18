import React, { Component } from "react";
import {
  View,
  Text,
  Image,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Linking,
  StyleSheet,
  Dimensions,
  TextInput,
  ImageBackground,
  ScrollView
} from "react-native";
import { moderateScale, scale, verticalScale } from "../components/helper/scaling";
import { SocialIcon, CheckBox, Avatar } from "react-native-elements";
import {
  Button,
  Form,
  Item as FormItem,
  Input,
  Label,
  Textarea,
} from "native-base";
import auth from "@react-native-firebase/auth";
import { registerUser, addProfileImage, getUserByEmail } from "../util/firestoreHandler";
import { Alert } from "react-native";
import { connect } from "react-redux";
import { setUser } from "../redux/actions/index";
import MyStorage from "../util/MyStorage";
import { v4 as uuidv4 } from "uuid";
import Modal from "react-native-modal";
import { mainColor } from "../components/helper/colors";
import { GoogleSignin } from "@react-native-community/google-signin";
import { AccessToken, LoginManager, GraphRequest, GraphRequestManager } from 'react-native-fbsdk';
import {
  addAddress,
  fetchCategories,
  addProviderToCategory,
  addName
} from "../util/firestoreHandler";

import PhoneInput from "react-native-phone-number-input";
import ModalPickerImage from "../components/common/modalPickerImage";
import NetInfo from "@react-native-community/netinfo";
import { strings, selection } from '../../locales/i18n';
const options = {
  title: strings("Select_Picture"),
  // quality: 1.0, maxWidth: 100, maxHeight: 100,
  storageOptions: {
    skipBackup: true,
    path: "images",
  },
};
class SignUp extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedCountry: "",
      email: "",
      password: "",
      name: "",
      firstName: "",
      lastName: "",
      zipCode: "",
      idNumber: "",
      agree: false,
      processing: false,
      profileUrl: "",
      selectCity: false,
      serviceModal: false,
      categories: [],
      serviceDetail: "",
      categoryName: strings("Select_Category"),
      categoryId: "",
      showHourlyrate: false,
      hourlyRate: "",
      selectedHourlyRate: "",
      selectedHourlyRateId: "",
      phoneNumber: "",
      pickerData: null,
      isInternetAvilable: true,
      isInternetAlertOpne: false
    };
  }
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

    // Fetch all Categories
    GoogleSignin.configure({
      webClientId:
        "51864905969-vpnmvi4378659ugm3etiqm1otedmu9k8.apps.googleusercontent.com",
    });

    // this.setState({
    //   pickerData: this.phone.getPickerData(),
    // });

    fetchCategories()
      .then((data) => {
        console.log("data of fetching categories are: ");
        let categories = data.docs.map((doc) => {
          return { ...doc.data(), id: doc.id };
        });

        this.setState({ categories: categories });
      })
      .catch((err) => {
        console.log("error in fetching category is: ", err);
      });
  };
  handleGoogleSignin = async () => {
    if (!this.state.isInternetAvilable) {
      Alert.alert(strings("Internet_Error"), strings("Internet_Error_Message"));
      return;
    }
    // Get the users ID token
    const { idToken } = await GoogleSignin.signIn();
    // Create a Google credential with the token
    const googleCredential = auth.GoogleAuthProvider.credential(idToken);
    auth()
      .signInWithCredential(googleCredential)
      .then((res) => {
        console.log("google sign is successfull with res is: ", res);
        let data = {
          name: res.user.displayName,
          email: res.user.email ? res.user.email : res.user.phoneNumber,
          phoneNumber: res.user.phoneNumber,
          profileUrl: res.user.photoURL,
          auth: "google",
        };
        this.handleFurtherLogin(data);
      })
      .catch((err) => {
        Alert.alert(strings("Error"), strings("Error_Something_went"));
      });
  };
  handleFurtherLogin = (data) => {
    this.setState({ processing: true });
    getUserByEmail(data.email)
      .then((res) => {
        if (res.docs.length > 0) {
          let data = { ...res.docs[0].data(), id: res.docs[0].id };
          this.props.setUser(data);
          new MyStorage().setUserData(JSON.stringify(data));
          const { dispatch } = this.props.navigation;
          this.setState({ processing: false });
          // if (data.personalInfo && data.skills && data.creditCardInfo) {
          if (data.personalInfo && data.skills) {
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
                  routeName: "Welcome",
                },
              ],
              index: 0,
            });
          }
        } else {
          registerUser(data)
            .then((res) => {
              let _data = { ...data, id: res.id };
              this.props.setUser(_data);
              new MyStorage().setUserData(JSON.stringify(_data));
              const { dispatch } = this.props.navigation;
              this.setState({ processing: false });
              // if (_data.personalInfo && _data.skills && _data.creditCardInfo) {
              if (_data.personalInfo && _data.skills) {
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
                      routeName: "Welcome",
                    },
                  ],
                  index: 0,
                });
              }
            })
            .catch((err) => {
              this.setState({ processing: false });
              Alert.alert(strings("Error"), strings("Error_Something_went"));
            });
        }
      })
      .catch((err) => {
        this.setState({ processing: false });
        Alert.alert(strings("Error"), strings("Error_Something_went"));
      });
  };

  handleFacebookSignin = async () => {
    if (!this.state.isInternetAvilable) {
      Alert.alert(strings("Internet_Error"), strings("Internet_Error_Message"));
      return;
    }
    const that = this;
    LoginManager.logInWithPermissions(['public_profile', 'email']).then(
      function (result) {
        console.log('result: ' + JSON.stringify(result))
        if (result.isCancelled) {
          // console.log('Login was cancelled');
          // that.setState({ isLoading: false })

        } else {
          AccessToken.getCurrentAccessToken()
            .then((data) => {
              console.log(data)
              // Create a graph request asking for user information with a callback to handle the response.
              const infoRequest = new GraphRequest(
                '/me',
                {
                  httpMethod: 'GET',
                  version: 'v2.9',
                  parameters: {
                    'fields': {
                      'string': 'id,name,email,picture.type(large)'
                    }
                  }
                },
                (error, result) => {
                  if (error) {
                    console.log("error:", error)
                  }
                  else {
                    let data = {
                      name: result.name,
                      email: result.email,
                      phoneNumber: "",
                      profileUrl: result.picture.data.url,
                      auth: "facebook",
                    };
                    that.handleFurtherLogin(data);

                  }
                },
              );
              // Start the graph request.
              new GraphRequestManager().addRequest(infoRequest).start();
            })
        }
      },
      function (error) {
        that.setState({ isLoading: false })
        alert(strings("Error1") + error);
      })
  };
  // Email validation
  validateEmail = (email) => {
    var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
  };
  // Signup handle
  handleSignup = () => {
    if (!this.state.isInternetAvilable) {
      Alert.alert(strings("Internet_Error"), strings("Internet_Error_Message"));
      return;
    }

    // console.log('validity is: ',)
    if (this.state.firstName == "") {
      Alert.alert(strings("First_Name_Error"), strings("Enter_firstname"));
      return;
    }
    if (this.state.lastName == "") {
      Alert.alert(strings("Last_Name_Error"), strings("Enter_LastName"));
      return;
    }
    if (!this.phone.isValidNumber(this.state.phoneNumber) || this.state.phoneNumber === "") {
      Alert.alert(strings("Mobile_Number"), strings("Mobile_notvalid"));
      return;
    }
    if (this.state.email === "") {
      Alert.alert(strings("Email_Error"), strings("Enter_email"));
      return;
    }
    if (!this.validateEmail(this.state.email)) {
      Alert.alert(strings("Invalid_Email"), strings("Enter_email"));
      return;
    }
    if (this.state.password === "") {
      Alert.alert(strings("Password_Error"), strings("Correct_Password"));
      return;
    }
    if (this.state.password.length < 6) {
      Alert.alert(strings("Password_Error"),strings("Password_digit"));
      return;
    }
    if (!this.state.agree) {
      Alert.alert(strings("Terms_of_Services"), strings("Select_terms"));
      return;
    }
    this.setState({ processing: true });
    // authentication with firebase
    auth()
      .createUserWithEmailAndPassword(this.state.email.toLowerCase(), this.state.password)
      .then(() => {
        console.log("User account created & signed in!");
        let data = {
          name: this.state.firstName + " " + this.state.lastName,
          email: this.state.email.toLowerCase(),
          isActive: false,
          mobileNumber: this.state.phoneNumber,
        };
        registerUser(data)
          .then((res) => {
            data = {
              ...data,
              id: res.id,
              mobileNumber: this.state.phoneNumber,
              name: this.state.firstName + " " + this.state.lastName
            };
            new MyStorage().setUserData(JSON.stringify(data));
            this.props.setUser(data);
            this.setState({ processing: false });
            const { dispatch } = this.props.navigation;
            dispatch({
              type: "Navigation/RESET",
              actions: [
                {
                  type: "Navigate",
                  routeName: "Welcome",
                },
              ],
              index: 0,
            });
          })
          .catch((err) => {
            Alert.alert(strings("Error"), strings("Error_Something_went"));
            this.setState({ processing: false });
          });
      })
      .catch((error) => {
        Alert.alert(strings("Error"), strings("User_already_exist"));
        this.setState({ processing: false });
      });
  };
  // Appear modal when the user upload image
  _renderModal = () => {
    return (
      <Modal
        animationType="slide"
        transparent={true}
        isVisible={this.state.processing}>
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
          }}>
          <View height={200} width={200} justifyContent="center" alignItems="center" backgroundColor="rgba(0,0,0,0.5)" borderRadius={10}>
            <ActivityIndicator color="white" size="large" />
            <Text style={{ color: "white", textAlign: "center", fontFamily: "Poppins-Regular", fontSize: scale(14) }}>
              {strings("Loading")}
            </Text>
          </View>
        </View>
      </Modal>
    );
  };
  onPressFlag = () => {
    this.myCountryPicker.open();
  };
  // selectCountry = (country) => {
  //   this.setState({ phoneNumber: country.dialCode });
  // };
  clickTermsandCondition() {
    Linking.canOpenURL("https://yufixit.co/terms-and-conditions-for-yufixit/").then(supported => {
      if (supported) {
        Linking.openURL("https://yufixit.co/terms-and-conditions-for-yufixit/");
      } else {
        console.log("Don't know how to open URI: " + "https://yufixit.co/terms-and-conditions-for-yufixit/");
      }
    });
  }
  render() {
    return (
      <View style={styles.MainContainer} >
        <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }}>
          < ImageBackground style={{ width: "100%", height: "100%", position: "absolute" }
          } resizeMode={"cover"} source={require("../../assets/mainbg.png")} />
          {/* <KeyboardAvoidingView behavior="padding" enabled keyboardVerticalOffset={Platform.select({ ios: Dimensions.get('window').height == 812 || Dimensions.get('window').width == 812 ? 85 : 64, android: -500 })}> */}
          {/* ------------------CenterView ----------------- */}
          <View style={styles.CenterView} >
            <View style={styles.cardView}>
              <Image style={{ height: verticalScale(120), width: verticalScale(120), resizeMode: 'contain', alignSelf: 'center', marginTop: verticalScale(-10) }} source={require('../../assets/logo.png')} />
              <View style={{ height: verticalScale(35), alignItems: "center", backgroundColor: "white", borderRadius: scale(20), flexDirection: "row", paddingLeft: scale(15), paddingRight: scale(15), marginTop: verticalScale(-10) }}>
                <TextInput
                  style={{ height: verticalScale(35), includeFontPadding: false, color: "#242424", paddingLeft: scale(5), width: "90%" }}
                  placeholder={strings("First_Name")}
                  onChangeText={(firstName) => this.setState({ firstName: firstName })}
                  fontSize={scale(13)}
                  returnKeyType='done'
                  autoCorrect={false}
                  fontFamily={"Poppins-Light"}/>
              </View>
              <View marginTop={0} height={verticalScale(10)} />
              <View style={{ height: verticalScale(35), alignItems: "center", backgroundColor: "white", borderRadius: scale(20), flexDirection: "row", paddingLeft: scale(15), paddingRight: scale(15) }}>
                <TextInput
                  style={{ height: verticalScale(35), includeFontPadding: false, color: "#242424", paddingLeft: scale(5), width: "90%" }}
                  placeholder={strings("Last_Name")}
                  onChangeText={(lastName) => this.setState({ lastName: lastName })}
                  fontSize={scale(13)}
                  returnKeyType='done'
                  autoCorrect={false}
                  fontFamily={"Poppins-Light"}
                />
              </View>
              <View marginTop={0} height={verticalScale(10)} />
              <View style={{ height: verticalScale(35), alignItems: "center", flexDirection: "row" }}>
                <View style={{ width: "100%" }}>
                  <PhoneInput
                    defaultValue={this.state.phoneNumber}
                    defaultCode={"CA"}
                    onChangeFormattedText={(value) => {
                      console.log("value", value)
                      this.setState({ phoneNumber: value });
                    }}
                    ref={(ref) => {
                      this.phone = ref;
                    }}
                    layout="second"
                    containerStyle={{ borderRadius: scale(20), backgroundColor: "white", alignSelf: "center", width: "100%" }}
                    textContainerStyle={{ borderBottomEndRadius: scale(20), borderTopEndRadius: scale(20), paddingVertical: moderateScale(5), backgroundColor: "#F4F4F4" }}
                    textInputStyle={{ paddingVertical: moderateScale(5) }}
                    withDarkTheme
                    withShadow
                    autoFocus
                  />
                  {/* <ModalPickerImage
                    ref={(ref) => {
                      this.myCountryPicker = ref;
                    }}
                    data={this.state.pickerData}
                    onChange={(country) => {
                      this.selectCountry(country);
                    }}
                    cancelText={strings("Cancel")}
                  /> */}
                </View>
              </View>
              <View marginTop={0} height={verticalScale(10)} />
              <View style={{ height: verticalScale(35), alignItems: "center", backgroundColor: "white", borderRadius: scale(20), flexDirection: "row", paddingLeft: scale(15), paddingRight: scale(15) }}>
                <TextInput
                  style={{ height: verticalScale(35), includeFontPadding: false, color: "#242424", paddingLeft: scale(5), width: "90%" }}
                  placeholder={strings("Email_Address")}
                  onChangeText={(email) => this.setState({ email: email })}
                  fontSize={scale(13)}
                  returnKeyType='done'
                  autoCorrect={false}
                  fontFamily={"Poppins-Light"}
                />
              </View>
              <View marginTop={0} height={verticalScale(10)} />
              <View style={{ height: verticalScale(35), backgroundColor: "white", borderRadius: scale(20), flexDirection: "row", paddingLeft: scale(15), paddingRight: scale(15) }}>
                <TextInput
                  style={{ height: verticalScale(35), includeFontPadding: false, color: "#242424", paddingLeft: scale(5), width: "90%" }}
                  placeholder={strings("Password")}
                  onChangeText={(password) => this.setState({ password: password })}
                  returnKeyType='done'
                  autoCorrect={false}
                  secureTextEntry={true}
                  fontSize={scale(13)}
                  fontFamily={"Poppins-Light"}
                />
              </View>
              {/* //Check Box Container */}
              <View style={{flexDirection: "row",alignItems: "center"}}>
                <CheckBox
                  left
                  checkedColor={"white"}
                  checked={this.state.agree}
                  onPress={() => {
                    this.setState({ agree: !this.state.agree });
                  }}
                />
                <Text style={{ marginLeft:scale(-15),fontSize: scale(12), color: "white", fontFamily: "Poppins-Medium" }}>
                  {strings("i_agree")}
                </Text>
                <TouchableOpacity
                  onPress={() => this.clickTermsandCondition()}
                  style={{
                    alignItems: "center",
                    justifyContent: "center",
                  }}>
                  <Text style={{ textDecorationLine: 'underline', fontSize: scale(12), color: "white", fontFamily: "Poppins-Medium" }}>{strings("Term_of_Service")}</Text>
                </TouchableOpacity>
              </View>
            </View>


            {/* //Sign Up button container */}
            <View width={"100%"} height={"14%"} justifyContent="center" alignItems="center">
              <View width={"25%"} height={"100%"} justifyContent="center" alignItems="center">
                <Button
                  full
                  disabled={this.state.processing}
                  style={{ backgroundColor: "transparent", elevation: 0, height: "100%" }}
                  onPress={() => {
                    this.handleSignup();
                  }}>
                </Button>
              </View>
            </View>
            <View marginTop={0} height={verticalScale(10)} />


            {/* //Sociale media container */}
            <View style={styles.HorizontalContainer}>
              <View style={styles.imageContainerview} />
              <View style={styles.imageContainerview} />
              {/* <TouchableOpacity onPress={() => this.handleFacebookSignin()} > */}
              {/* <Image style={styles.imageContainer} source={require('../../assets/fb.png')} /> */}
              {/* </TouchableOpacity> */}

              {/* ------------------ Google ----------------- */}
              {/* <TouchableOpacity onPress={() => this.handleGoogleSignin()} > */}
              {/* <Image style={styles.imageContainer} source={require('../../assets/gmail.png')} /> */}
              {/* </TouchableOpacity> */}
            </View>


            {/* //Bottom container */}
            <View style={styles.ViewContainer1}>
              <TouchableOpacity
                onPress={() => this.props.navigation.navigate("Login")}
                style={{ alignItems: "center", justifyContent: "center" }}>
                <Text style={{ fontSize: scale(12), color: "#1A1A1A", fontFamily: "Poppins-Medium" }}>{strings("have_account")}
                  <Text style={{ fontSize: scale(12), color: mainColor, fontFamily: "Poppins-SemiBold" }}>{strings("Sign_In")}</Text>
                </Text>
              </TouchableOpacity>
            </View>
          </View>
          <View marginTop={0} height={verticalScale(20)} />
          {this._renderModal()}
          {/* </KeyboardAvoidingView> */}
        </ScrollView>
      </View >

      
    );
  }
}
var styles = StyleSheet.create({
  MainContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  CenterView: {
    width: Dimensions.get('window').width,
    flex: 1,
    paddingLeft: scale(20),
    paddingRight: scale(20)
  },
  cardView: {
    margin: scale(6),
    flex: 1,
    padding: scale(10),
    // backgroundColor:"red"
  },
  ViewContainer1: {
    alignItems: 'center',
    justifyContent: "center",
    flexDirection: "row",
    marginTop: scale(5),
    marginBottom: scale(5),
    flex: 1,
    // backgroundColor:"red"
  },
  TextBlack1: {
    margin: scale(8),
    color: "white",
    fontSize: scale(12),
    textAlign: 'center'
  },
  HorizontalContainer: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: 'center',
    // backgroundColor: "red"
  },
  imageContainer: {
    height: verticalScale(26),
    width: verticalScale(26),
    resizeMode: 'contain',
    alignSelf: 'center',
    margin: scale(10),
    padding: scale(15),
    // borderRadius: verticalScale(13),
  },
  imageContainerview: {
    height: verticalScale(26),
    width: verticalScale(26),
    margin: scale(10),
    padding: scale(15),
    // borderRadius: verticalScale(13),
  },
  appleBtn: { height: verticalScale(60), width: scale(60), margin: scale(10) }
});

const MapStateToProps = (state) => {
  return {};
};

export default connect(MapStateToProps, { setUser })(SignUp);
