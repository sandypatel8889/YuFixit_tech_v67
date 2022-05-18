import React, { Component } from "react";
import { Modal, Text, View, Alert, ActivityIndicator } from "react-native";
import messaging from "@react-native-firebase/messaging";
import { mainColor } from "../helper/colors";
import {
  List,
  ListItem,
  Left,
  Body,
  Right,
  Thumbnail,
  Card,
  CardItem,
  Button,
} from "native-base";
import { verticalScale, scale } from "../helper/scaling";
import {
  getBooking,
  rejectByProvider,
  acceptByProvider,
} from "../../util/firestoreHandler";
import { connect } from "react-redux";
import Toast from 'react-native-toast-message';
class NotificationHandler extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      showModal: false,
      booking: null,
      rejectedLoading: false,
      acceptedLoading: false,
    };
  }

  componentDidMount = () => {
    this.onMessage = messaging().onMessage(async (remoteMessage) => {
      
      if (remoteMessage.data.type == "newBooking") {
        this.setState({
          booking: JSON.parse(remoteMessage.data.booking),
          showModal: true,
        });
      }
      else {
        if (remoteMessage.data.notifyUser) {
          Toast.show({
            type: 'info',
            // position: 'top | bottom',
            text1: 'YUFIXITPROTECH',
            text2: remoteMessage.notification.title,
            visibilityTime: 2000,
            autoHide: true,
            topOffset: 30,
            bottomOffset: 40,
            onShow: () => { },
            onHide: () => { },
            onPress: () => {
              this.props.navigation.navigate("Chat", {
                notifyUser: true,
              });
            }
          });
        }
        else {
          Toast.show({
            type: 'info',
            // position: 'top | bottom',
            text1: 'YUFIXITPROTECH',
            text2: remoteMessage.notification.title,
            visibilityTime: 2000,
            autoHide: true,
            topOffset: 30,
            bottomOffset: 40,
            onShow: () => { },
            onHide: () => { },
            onPress: () => {
              this.props.navigation.navigate("Chat", {
                notifyUser: false,
              });
            }
          });
        }


      }

    });
    this.setBackgroundMessageHandler = messaging().setBackgroundMessageHandler(
      async (remoteMessage) => {
        // console.log('Message handled in the background!', remoteMessage);
        if (remoteMessage.data.type == "newBooking") {
          // console.log('data is: ',remoteMessage.data.booking)
          this.setState({
            booking: JSON.parse(remoteMessage.data.booking),
            showModal: true,
          });
        }
        else {
          this.props.navigation.navigate("Chat", {
            notifyUser: false,
          });
        }
      }
    );
    this.getInitialNotification = messaging()
      .getInitialNotification()
      .then((notification) => {
        // console.log('notification is: ',notification)
        if (notification) {
          if (notification.data.type == "newBooking") {
            // console.log('data is: ',remoteMessage.data.booking)
            this.setState({
              booking: JSON.parse(notification.data.booking),
              showModal: true,
            });
          }
        }
      });
  };
  componentWillUnmount = () => {
    if (typeof this.onMessage === "function") this.onMessage();
    if (typeof this.setBackgroundMessageHandler === "function")
      this.setBackgroundMessageHandler();
    if (typeof this.getInitialNotification === "function")
      this.getInitialNotification();
  };

  // handleNewBooking = (data)=>{
  //     getBooking(data.bookingId)
  //     .then(res=>{
  //         if(res.data()){
  //             this.setState({booking:{id:res.id,...res.data()},showModal:true})
  //         }
  //         else{
  //             Alert.alert('Error','Error in getting request detail. Please visit booking section')
  //         }

  //     })
  //     .catch(err=>{
  //         console.log('error in getting booking is: ',err)
  //         Alert.alert('Error','Error in getting request detail. Please visit booking section')
  //     })
  // }

  handleAccept = () => {
    this.setState({ acceptedLoading: true });
    acceptByProvider(
      this.state.booking.id,
      this.props.userData.name,
      this.props.userData.id,
      this.state.booking.customerName,
      this.state.booking.customerId
    )
      .then((res) => {
        if (res.data) {
          //  this.props.update(this.state.index,'accepted')
          this.setState({
            showModal: false,
            booking: null,
            acceptedLoading: false,
          });
        } else {
          this.setState({ acceptedLoading: false });
          // Alert.alert("Error", "Something went wrong please try again");
        }
      })
      .catch((err) => {
        this.setState({ acceptedLoading: false });
        console.log("error in accepting request is: ", err);
        // Alert.alert("Error", "Something went wrong please try again");
      });
  };
  handleReject = () => {
    this.setState({ rejectedLoading: true });
    rejectByProvider(
      this.state.booking.id,
      this.props.userData.name,
      this.props.userData.id,
      this.state.booking.customerName,
      this.state.booking.customer
    )
      .then((res) => {
        if (res.data) {
          //  this.props.update(this.state.index,'rejected')
          this.setState({
            showModal: false,
            booking: null,
            rejectedLoading: false,
          });
        } else {
          this.setState({ rejectedLoading: false });
          // Alert.alert("Error", "Something went wrong please try again");
        }
      })
      .catch((err) => {
        this.setState({ rejectedLoading: false });
        console.log("error in accepting request is: ", err);
        // Alert.alert("Error", "Something went wrong please try again");
      });
  };

  renderModal = () => {
    return (
      <Modal
        style={{ margin: 0 }}
        animationType="fade"
        style={{ height: 100 }}
        // transparent={true}
        isVisible={this.state.showModal}
        onRequestClose={() => {
          // if(!this.state.acceptedLoading && !this.state.rejectedLoading && !this.state.startedLoading)
          this.setState({ showModal: !this.state.showModal });
        }}>
        <View style={{ flex: 1, backgroundColor: "white" }}>
          <View style={{ flex: 0.7, paddingTop: 60, paddingHorizontal: 20 }}>
            <Text
              style={{
                fontSize: scale(23),
                fontWeight: "bold",
                textAlign: "center",
              }}
            >
              {"Job Request"}
            </Text>

            <View style={{ paddingVertical: 20, alignItems: "center" }}>
              <View
                style={{
                  height: 140,
                  width: 140,
                  borderRadius: 70,
                  borderWidth: 8,
                  borderColor: mainColor,
                  justifyContent: "center",
                }}
              >
                <Text style={{ textAlign: "center", fontSize: 25 }}>
                  {this.state.booking.time}
                </Text>
              </View>
            </View>

            <View style={{ paddingHorizontal: 20, paddingTop: 20 }}>
              <Card>
                <CardItem>
                  <Body>
                    <Text
                      style={{
                        fontWeight: "bold",
                        textAlign: "center",
                        width: "100%",
                        fontSize: 16,
                      }}
                    >
                      Customer
                    </Text>
                    <Text
                      style={{
                        textAlign: "center",
                        width: "100%",
                        fontSize: 14,
                      }}
                    >
                      {this.state.booking.customerName}
                    </Text>
                    <Text
                      style={{
                        fontWeight: "bold",
                        textAlign: "center",
                        width: "100%",
                        fontSize: 16,
                        paddingTop: 20,
                      }}
                    >
                      Address
                    </Text>
                    <Text
                      style={{
                        textAlign: "center",
                        width: "100%",
                        fontSize: 14,
                      }}
                    >
                      {this.state.booking.address &&
                        this.state.booking.address.value.name}
                    </Text>
                  </Body>
                </CardItem>
              </Card>
            </View>
          </View>
          <View style={{ flex: 0.3, paddingHorizontal: 40 }}>
            {this.state.booking.status == "pending" && (
              <View style={{ justifyContent: "center", flex: 1 }}>
                <Button
                  full
                  style={{
                    backgroundColor: "red",
                    borderRadius: scale(5),
                    marginBottom: 20,
                  }}
                  disabled={this.state.rejectedLoading}
                  onPress={() => {
                    this.handleReject();
                  }}
                >
                  {this.state.rejectedLoading ? (
                    <ActivityIndicator size="small" color="white" />
                  ) : (
                    <Text
                      style={{
                        fontSize: 15,
                        color: "white",
                        fontWeight: "bold",
                      }}
                    >
                      {" "}
                      Reject{" "}
                    </Text>
                  )}
                </Button>
                <Button
                  full
                  disabled={this.state.acceptedLoading}
                  onPress={() => {
                    this.handleAccept();
                  }}
                  style={{ backgroundColor: mainColor, borderRadius: scale(5) }}
                >
                  {/* <Text style={{ fontSize: 15, color: 'white', fontWeight: 'bold' }}> Accept </Text> */}
                  {this.state.acceptedLoading ? (
                    <ActivityIndicator size="small" color="white" />
                  ) : (
                    <Text
                      style={{
                        fontSize: 15,
                        color: "white",
                        fontWeight: "bold",
                      }}
                    >
                      {" "}
                      Accept{" "}
                    </Text>
                  )}
                </Button>
              </View>
            )}

            {this.state.booking.status == "accepted" && (
              <View style={{ justifyContent: "center", flex: 1 }}>
                <Button
                  full
                  onPress={() => {
                    // this.handleAccept()
                  }}
                  disabled={this.state.startedLoading}
                  style={{ backgroundColor: mainColor, borderRadius: scale(5) }}
                >
                  <Text
                    style={{ fontSize: 15, color: "white", fontWeight: "bold" }}
                  >
                    {" "}
                    Start{" "}
                  </Text>
                  {/* {this.state.startedLoading?
                                <ActivityIndicator size='small' color='white'/>
                                :<Text style={{ fontSize: 15, color: 'white', fontWeight: 'bold' }}> Start </Text>
                                } */}
                </Button>
              </View>
            )}
          </View>
        </View>
      </Modal>
    );
  };

  render() {
    console.log("show alert is: ", this.state.showModal);
    return (
      <Toast ref={(ref) => Toast.setRef(ref)} />
      // <View>
      //   {this.state.showModal && this.state.booking && this.rendeårModal()}
      //   <Toast ref={(ref) => Toast.setRef(ref)} />
      //   {/* {this.state.showAlert && !this.state.booking && this._renderAlert()} */}
      // </View>
    );
  }
}

const MapStateToProps = (state) => {
  return {
    userData: state.userData,
  };
};

export default connect(MapStateToProps, {})(NotificationHandler);
