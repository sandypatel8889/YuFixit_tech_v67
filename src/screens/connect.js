import React, { Component } from "react";
import { View, Text, TouchableOpacity, Modal, Alert, ActivityIndicator } from "react-native";
import { scale, verticalScale } from "../components/helper/scaling";
import { Container, Tab, Tabs, TabHeading, Button } from "native-base";
import Tab1 from "./chats";
import Tab2 from "./calls";
import { connect } from "react-redux";
import { setPaymentModal } from "../redux/actions/index";
import Payment from "../components/common/payment";
import Purchases from "react-native-purchases";
import { mainColor } from "../components/helper/colors";
import { CheckBox, Avatar, Icon } from "react-native-elements";
import Modal1 from "react-native-modal";
import { ScrollView } from "react-native-gesture-handler";
import { Header } from "react-native-elements";
import { Platform } from "react-native";
import {
  updateProviderSubscriptionDate,
} from "../util/firestoreHandler";
import { strings, selection } from '../../locales/i18n';
class Connect extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      tab: 1,
      expired: false,
      PlanActive: false,
      isPayment: false,
      Offering: null,
      loading: false
    };
  }
  componentWillMount() {
    //   adding listner on did focus
    this.subs = [
      this.props.navigation.addListener("didFocus", this.componentDidFocus),
    ];
  }
  componentWillUnmount() {
    //   removing listner on did focus
    this.subs.forEach((sub) => sub.remove());
  }
  componentDidFocus = () => {
    if (
      !this.props.userData.personalInfo ||
      !this.props.userData.skills ||
      !this.props.userData.creditCardInfo
    ) {
      this.props.navigation.goBack();
      this.props.navigation.navigate("PersonalInformation", { params: "Profile" });
      return;
    }
    else {
      this.purchaserInfoUpdateListener = (info) => {
        this.SuccessPayment(info);
      };
      Purchases.addPurchaserInfoUpdateListener(this.purchaserInfoUpdateListener);


      let data = this.props.userData;
      Purchases.identify(data.email)
        .then((value) => {
          console.log("purchaseInfo: ", value)
          this.GetPurhcaseInfo()
        })
        .catch((reason) => {
          console.log("error identify purchase: ", reason)
        })

      Purchases.getOfferings()
        .then((value) => {
          this.setState({
            Offering: value,
          });
        })
        .catch((error) => {
          console.log("error: ", error)
        })
    }
    const data = this.props.navigation.getParam('notifyUser');
    if (data) {
      if (this.props.navigation.state.params.notifyUser) {
        if (!this.state.PlanActive) {
          this.setState({
            isPayment: true
          })
          this.props.navigation.setParams({ notifyUser: false })
        }
      }

    }
  };
  GetPurhcaseInfo = async () => {
    let purchaserInfo = await Purchases.getPurchaserInfo();
    if (typeof purchaserInfo.entitlements.active.chat !== "undefined") {
      this.setState({
        PlanActive: true
      })
      this.UpdateProviderSubcriptionDate(purchaserInfo.entitlements.active.chat.expirationDate)
    }
    else {
      this.setState({
        PlanActive: false
      })
      // this.UpdateProviderSubcriptionDate("")
    }
  }
  MakePayment = async (value) => {
    this.setState({ loading: true })
    let purchaserInfo = await Purchases.getPurchaserInfo();
    if (typeof purchaserInfo.entitlements.active.chat !== "undefined") {
      console.log("Unlock that great pro content")
      this.setState({ loading: false })
    }
    else {
      try {
        const aPackage = value.current.monthly;
        const { purchaserInfo, productIdentifier } = await Purchases.purchasePackage(aPackage);
        if (typeof purchaserInfo.entitlements.active.my_entitlement_identifier !== "undefined") {
          this.setState({ loading: false })
        }
      } catch (e) {
        if (!e.userCancelled) {
          Alert.alert(strings("Error"), strings("Error_Something_went"));
        }
        this.setState({ loading: false, isPayment: false })
      }
    }
  }
  SuccessPayment(Info) {
    if (typeof Info.entitlements.active.chat !== "undefined") {
      this.setState({ loading: false, isPayment: false, PlanActive: true })
      this.UpdateProviderSubcriptionDate(Info.entitlements.active.chat.expirationDate)
    }
    else {
      // this.UpdateProviderSubcriptionDate("")
    }
  }
  UpdateProviderSubcriptionDate(date) {
    var newdate = date;
    if (date == "") {
      newdate = new Date();
      newdate.setDate(newdate.getDate() - 1);
    }
    updateProviderSubscriptionDate(this.props.userData.id, newdate)
      .then((res) => {
        console.log("Success");
      })
      .catch((err) => {
        Alert.alert(strings("Error"), strings("Error_Something_went"));
      });
  }
  // showing warnings if the user didnot paid and using service free for 15 days
  renderChatWarnings = () => {
    if (this.state.PlanActive) {
      return (
        <View
          style={{
            backgroundColor: mainColor,
            padding: 10,
            borderRadius: 5,
            marginBottom: 10,
            position: "relative",
          }}>
          <Text style={{ fontSize: scale(14), textAlign: "center", color: "white", fontFamily: "Poppins-Regular" }}>
            {strings("pro_active")}
          </Text>
        </View>
      );
    }
    else {
      return (
        <TouchableOpacity
          onPress={() => {
            this.setState({ isPayment: true })
          }}
          style={{
            backgroundColor: "#FF8490",
            padding: 10,
            borderRadius: 5,
            marginBottom: 10,
            position: "relative",
          }}>
          <Text style={{ fontSize: scale(14), textAlign: "center", color: "black", fontFamily: "Poppins-Regular" }}>
            {strings("pro_expired")}
          </Text>
        </TouchableOpacity>
      );
    }
  };
  renderPaymentDataModal = () => {
    return (
      <Modal1
        style={{ margin: 0 }}
        animationType="slide"
        transparent={true}
        isVisible={this.state.isPayment}>
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <View height={"100%"} width={"100%"} justifyContent="center" alignItems="center" backgroundColor="white">
            <View style={{ padding: 20 }}>
              <View marginTop={0} height={scale(10)} />
              <Text style={{ fontSize: scale(18), padding: 8, textAlign: "center", justifyContent: "center", color: mainColor, fontFamily: "Poppins-SemiBold" }}>
                {strings("Subscribe")}</Text>
              <View marginTop={0} height={scale(10)} />
              <View flex={3}>
                <ScrollView flex={1}>
                  <Text style={{ fontSize: scale(12), textAlign: "center", color: "#242424", fontFamily: "Poppins-Regular" }}>
                    {strings("Subscription_Title1")}
                  </Text>
                  <View marginTop={0} height={scale(20)} />
                  <View justifyContent="center" alignItems="center">
                    <View height={scale(120)} width={scale(120)} backgroundColor={mainColor} borderRadius={5} justifyContent="center" alignItems="center">
                      <Text style={{ fontSize: scale(30), color: "white", fontFamily: "Poppins-SemiBold" }}>
                        $10
                      </Text>
                      {/* <View marginTop={0} height={verticalScale(10)} /> */}
                      <Text style={{ fontSize: scale(10), color: "white", fontFamily: "Poppins-Light", textAlign: "center" }}>
                        {strings("1_Month")}
                      </Text>
                      <Text style={{ fontSize: scale(10), color: "white", fontFamily: "Poppins-Light", textAlign: "center" }}>
                        {strings("3_days_trial")}
                      </Text>
                    </View>
                  </View>
                  <View marginTop={0} height={scale(10)} />
                  <View justifyContent="center" alignItems="center">
                    <View style={{ flexDirection: "row", justifyContent: "center", width: "80%" }}>
                      <View marginLeft={scale(-15)}>
                        <CheckBox
                          color={mainColor}
                          checked={true}
                          checkedColor={mainColor}
                          onPress={() => {
                            // this.setState({ chatting: !this.state.chatting });
                          }}
                        />
                      </View>
                      <View justifyContent="center" alignItems="center">
                        <Text style={{ fontSize: scale(13), color: "#242424", fontFamily: "Poppins-Regular" }}>
                          {strings("Text_Chatting")} <Text style={{ color: "#242424", fontSize: scale(13), fontFamily: "Poppins-Regular" }}>$10</Text>
                        </Text>
                      </View>
                    </View>
                  </View>
                </ScrollView>
              </View>

              {/* <View marginTop={0} height={verticalScale(10)} /> */}

              <View style={{ justifyContent: 'flex-end', flex: 0.7 }}>
                <Button
                  full
                  onPress={this.handlePayment}
                  style={{
                    backgroundColor: mainColor,
                    borderRadius: 5,
                    margin: scale(6),
                    padding: scale(6),
                    height: verticalScale(35)
                  }}
                >
                  {this.state.loading ? (
                    <ActivityIndicator color="white" size="small" />
                  ) : (
                    <Text
                      style={{
                        color: "white",
                        fontFamily: "Poppins-SemiBold",
                        fontSize: scale(16),
                      }}>
                      {strings("Subscribe")}
                    </Text>
                  )}
                </Button>
                <Button
                  full
                  onPress={async () => {
                    this.handlecancel()
                  }}
                  style={{
                    backgroundColor: "white",
                    borderRadius: 5,
                    borderWidth: 1,
                    borderColor: "#B5B5B5",
                    margin: scale(6),
                    padding: scale(6),
                    height: verticalScale(35)
                  }}>
                  <Text
                    style={{
                      color: "#B5B5B5",
                      // margin: 5,
                      fontFamily: "Poppins-SemiBold",
                      fontSize: scale(16),
                    }}>
                    {strings("Not_Now")}
                  </Text>
                </Button>
              </View>
            </View>
          </View>
        </View>
      </Modal1>
    );
  };
  handlePayment = () => {
    this.MakePayment(this.state.Offering)
  }
  handlecancel = () => {
    this.setState({ isPayment: false })
  }
  render() {
    return (
      <View style={{ flex: 1, backgroundColor: "white" }}>
        <Header
          containerStyle={[{
            alignItems: "center",
            backgroundColor: "white",
            borderBottomColor: "white",
            borderBottomWidth: 1,
            height: verticalScale(50)
          }, Platform.OS == "android" ? { paddingTop: 0 } : null]}
          screenOptions={{
            headerStyle: { elevation: 0 }
          }}
          centerComponent={
            <View style={{ flexDirection: "column", justifyContent: "center", alignItems: "center" }}>
              <Text style={{ fontSize: scale(18), color: mainColor, width: "100%", textAlign: "center", fontFamily: "Poppins-SemiBold" }}>{strings("Chat")}</Text>
            </View>
          }
        />
        <View style={{ paddingRight: scale(12), flex: 1 }}>
          {/* <Text style={{ fontSize: scale(18), color: mainColor, width: "100%", textAlign: "center", fontFamily: "Poppins-SemiBold" }}>Chat</Text> */}
          <View marginTop={0} height={verticalScale(10)} />
          <View marginLeft={scale(12)}>
            {this.state.tab === 1 &&
              this.props.userData.modules &&
              this.renderChatWarnings()}
          </View>
          <Tab1 nav={this.props.navigation} isPlanActive={this.state.PlanActive} expired={this.state.expired} />
        </View>
        {/* {this.props.modalData.show && (
          <Modal
            style={{ margin: 0 }}
            animationType="fade"
            isVisible={this.props.modalData.show}
            onRequestClose={() => {
              this.props.setPaymentModal(false);
            }}
          >
            <Payment />
          </Modal>
        )} */}
        {this.renderPaymentDataModal()}
      </View>
    );
  }
}

const MapStateToProps = (state) => {
  return {
    userData: state.userData,
    modalData: state.modalData,
  };
};

export default connect(MapStateToProps, { setPaymentModal })(Connect);
