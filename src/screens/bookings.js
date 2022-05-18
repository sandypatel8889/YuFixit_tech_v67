import React, { Component } from "react";
import { View, Text, Alert } from "react-native";
import { scale } from "../components/helper/scaling";
import { Container, Header, Tab, Tabs, TabHeading, Icon } from "native-base";
import BookingComponent from "../components/common/commonBookingComp";
import { connect } from "react-redux";
import { getBookings } from "../util/firestoreHandler";
import { mainColor } from "../components/helper/colors"

class Bookings extends React.Component {
  constructor() {
    super();
    this.state = {
      current: [],
      previous: [],
    };
  }
  componentDidMount = () => {
    let previous = [];
    let current = [];
    // getting the bookings
    getBookings(this.props.userData.id)
      .then((res) => {
        console.log("bookings are: ", res.docs.length);
        res.docs.map((doc) => {
          let data = { ...doc.data(), id: doc.id };
          if (data.status == "completed") previous.push(data);
          else {
            current.push(data);
            console.log("completed data is: ", current.length);
          }
        });

        current.sort((a, b) => {
          return b.date - a.date;
        });
        previous.sort((a, b) => {
          return b.date - a.date;
        });
        this.setState({ current: current, previous: previous });
      })
      .catch((err) => {
        console.log("error in getting bookings is: ", err);
        // Alert.alert("Error", "Internet issue / Error. Please try again");
        Alert.alert(
          "System Issue",
          "Something went wrong please try again"
        );
      });
  };
  //   if the theres any new booking the updating the state
  updateCurrent = (index, status) => {
    let data = Object.assign([], this.state.current);
    data[index].status = status;
    this.setState({ current: data });
  };
  updatePrevious = (index, status) => { };
  //   every time when the user come to this screen it will get all the booking
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

    let previous = [];
    let current = [];
    getBookings(this.props.userData.id)
      .then((res) => {
        console.log("bookings are: ", res.docs.length);
        res.docs.map((doc) => {
          let data = { ...doc.data(), id: doc.id };
          if (data.status == "completed") previous.push(data);
          else {
            current.push(data);
            console.log("completed data is: ", current.length);
          }
        });

        current.sort((a, b) => {
          return b.date - a.date;
        });
        previous.sort((a, b) => {
          return b.date - a.date;
        });
        this.setState({ current: current, previous: previous });
      })
      .catch((err) => {
        console.log("error in getting bookings is: ", err);
        // Alert.alert("Error", "Internet issue / Error. Please try again");
        Alert.alert(
          "System Issue",
          "Something went wrong please try again"
        );
      });
  };
  //   adding listner on did focus

  componentWillMount() {
    this.subs = [
      this.props.navigation.addListener("didFocus", this.componentDidFocus),
    ];
  }
  //   removing listner
  componentWillUnmount() {
    this.subs.forEach((sub) => sub.remove());
  }
  render() {
    return (
      <View style={{ flex: 1, backgroundColor: "white" }}>
        <View
          style={{
            flex: 1,
            justifyContent: "flex-end",
            paddingHorizontal: scale(12),
          }}
        >
          <Text style={{ fontSize: 30, color: "black", fontWeight: "bold" }}>
            Bookings
          </Text>
        </View>
        <View style={{ flex: 4 }}>
          <Tabs
            tabContainerStyle={{ borderTopWidth: 0, elevation: 0, opacity: 10 }}
            tabBarBackgroundColor={"white"}
            tabBarUnderlineStyle={{ backgroundColor: mainColor }}
          >
            <Tab
              style
              heading={
                <TabHeading style={{ backgroundColor: "white" }}>
                  <Text style={{ fontSize: scale(12) }}>Upcoming</Text>
                </TabHeading>
              }
            >
              {this.state.current.length ? (
                <BookingComponent
                  data={this.state.current}
                  update={this.updateCurrent}
                />
              ) : (
                <View
                  style={{
                    flex: 1,
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <Text style={{ fontSize: scale(12) }}>
                    {"Curently you dont have any bookings"}
                  </Text>
                </View>
              )}
            </Tab>
            <Tab
              heading={
                <TabHeading style={{ backgroundColor: "white" }}>
                  <Text style={{ fontSize: scale(12) }}>Previous</Text>
                </TabHeading>
              }
            >
              {this.state.previous.length ? (
                <BookingComponent
                  update={this.updatePrevious}
                  data={this.state.previous}
                />
              ) : (
                <View
                  style={{
                    flex: 1,
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <Text style={{ fontSize: scale(12) }}>
                    {"Curently you dont have any previous bookings"}
                  </Text>
                </View>
              )}
            </Tab>
          </Tabs>
        </View>
      </View>
    );
  }
}

const MapStateToProps = (state) => {
  return {
    userData: state.userData,
  };
};

export default connect(MapStateToProps, {})(Bookings);
