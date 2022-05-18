import React, { Component } from "react";
import { Platform, StyleSheet, Text, View, Linking } from "react-native";
import { Button, Form, Item as FormItem, Input, Label } from "native-base";
import PhoneInput from "react-native-phone-number-input";
import ModalPickerImage from "../components/common/modalPickerImage";
import { moderateScale, scale, verticalScale } from "../components/helper/scaling";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import auth from "@react-native-firebase/auth";
import NetInfo from "@react-native-community/netinfo";
import { mainColor } from "../components/helper/colors";

export default class MobileNo extends Component {
  constructor() {
    super();
    this.state = {
      pickerData: null,
      phone: "",
      verifyCodeScreen: false,
      confirmation: null,
      code: "",
      isInternetAvilable: true,
      isInternetAlertOpne: false
    };
  }

  componentDidMount() {
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
          // Alert.alert("Internet Error", "No internet connection available. Please check your connection.");
        }

      }
    });

    // this.setState({
    //   pickerData: this.phone.getPickerData(),
    // });
  }
  onPressFlag = () => {
    this.myCountryPicker.open();
  };
  // Select Country

  selectCountry = (country) => {
    this.setState({ phone: country.callingCode[0] });
    this.phone.selectCountry(country.iso2);
    // this.setState({phone:country.dialCode})
    // console.log('selected country is: ',country)
  };

  //   After entering code then verify it function

  verifyCode = async () => {

    if (!this.state.isInternetAvilable) {
      Alert.alert("Internet Error", "No internet connection available. Please check your connection.");
      return;
    }


    try {
      await this.state.confirmation.confirm(this.state.code);
      this.props.navigation.navigate("routeTwo");
    } catch (error) {
      console.log("Invalid code.", error);
    }
  };

  // section to verify code screen

  verifyCodeScreen = () => {
    return (
      <View
        style={{
          flex: 1,
          paddingHorizontal: scale(12),
          marginTop: verticalScale(50),
        }}
      >
        <View style={{ flex: 1, justifyContent: "flex-end" }}>
          <Text style={{ fontSize: 30, fontWeight: "bold", color: "black" }}>
            {"Verifying \nyour number"}
          </Text>
          <Text style={{ color: "gray", fontSize: 20, marginTop: scale(20) }}>
            {`We have sent your verification code to ${this.state.phone}`}
          </Text>
        </View>
        <View style={{ paddingBottom: scale(20), flex: 3 }}>
          <Form>
            <FormItem floatingLabel last style={{ borderBottomColor: "gray" }}>
              <Label style={{ fontSize: 15, color: "black" }}>Enter Code</Label>
              <Input onChangeText={(code) => this.setState({ code: code })} />
            </FormItem>
          </Form>
          <Button
            full
            style={{
              backgroundColor: mainColor,
              borderRadius: scale(5),
              marginVertical: scale(20),
            }}
            onPress={() => {
              this.verifyCode();
            }}
          >
            <Text style={{ fontSize: 15, color: "white", fontWeight: "bold" }}>
              {" "}
              Verify{" "}
            </Text>
          </Button>
          <View
            style={{ flexDirection: "row", justifyContent: "space-between" }}
          >
            <Text style={{ fontWeight: "bold" }}>{"Resend Code"}</Text>
            <Text style={{ color: "gray" }}>{"1:20 min left"}</Text>
          </View>
        </View>
      </View>
    );
  };

  //  rednerAll phone number section

  _renderPhoneNumber = () => {
    return (
      <View>
        <PhoneInput
          defaultValue={this.state.phone}
          defaultCode={"CA"}
          onChangeFormattedText={(value) => {
            console.log("value", value)
            this.setState({ phone: value });
          }}
          ref={(ref) => {
            this.phone = ref;
          }}
          layout="second"
          containerStyle={{ backgroundColor: "white", alignSelf: "center", width: "96%" }}
          textContainerStyle={{ paddingVertical: moderateScale(5), backgroundColor: "#F4F4F4" }}
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
          cancelText="Cancel"
        /> */}
      </View>
    );
  };
  // Sending code

  sendCode = async () => {
    if (!this.state.isInternetAvilable) {
      Alert.alert("Internet Error", "No internet connection available. Please check your connection.");
      return;
    }

    const confirmation = await auth().signInWithPhoneNumber(this.state.phone);
    // console.log("phone number is: ",confirmation)
    // setConfirm(confirmation);
    this.setState({
      verifyCodeScreen: true,
      confirmation: confirmation,
    });
  };

  render() {
    return (
      <>
        <KeyboardAwareScrollView>
          {this.state.verifyCodeScreen ? (
            this.verifyCodeScreen()
          ) : (
            <View
              style={{
                flex: 1,
                paddingHorizontal: scale(12),
                marginTop: verticalScale(50),
              }}
            >
              <View style={{ flex: 1, justifyContent: "flex-end" }}>
                <Text
                  style={{ fontSize: 30, fontWeight: "bold", color: "black" }}
                >
                  {"Verifying \nyour number"}
                </Text>
                <Text
                  style={{ color: "gray", fontSize: 20, marginTop: scale(20) }}
                >
                  {"Please enter phone number we will send you the verify code"}
                </Text>
              </View>
              <View style={{ paddingVertical: scale(20), flex: 3 }}>
                {this._renderPhoneNumber()}

                <Button
                  full
                  style={{
                    backgroundColor: mainColor,
                    borderRadius: scale(5),
                    marginVertical: scale(20),
                  }}
                  onPress={() => {
                    this.sendCode();
                  }}
                >
                  <Text
                    style={{ fontSize: 15, color: "white", fontWeight: "bold" }}
                  >
                    {" "}
                    Send Code{" "}
                  </Text>
                </Button>
              </View>
            </View>
          )}
        </KeyboardAwareScrollView>
      </>
    );
  }
}
