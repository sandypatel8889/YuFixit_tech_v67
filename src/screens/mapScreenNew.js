import React, { Component } from "react";
import MapView, { PROVIDER_GOOGLE, Marker } from "react-native-maps";
import Geolocation from "@react-native-community/geolocation";
import { View, StyleSheet, Text, Dimensions } from "react-native";
import { verticalScale, scale } from "../components/helper/scaling";
import { Header, Avatar } from "react-native-elements";
import { Switch, Button } from "native-base";
import Icon from "react-native-vector-icons/FontAwesome";
import { GooglePlacesAutocomplete } from "react-native-google-places-autocomplete";
const { height, width } = Dimensions.get("window");
export default class MapViewScreen extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      longitude: 0,
      latitude: 0,
      initialRegion: {},
      name: "",
    };
  }

  handleSearch = () => {
    this.props.handleCallback(
      this.state.latitude,
      this.state.longitude,
      this.state.name
    );


    this.props.close();
  };
  componentDidMount = async () => {
    let initialRegion = {
      latitude: this.props.latitude,
      longitude: this.props.longitude,
      latitudeDelta: 0.0922,
      longitudeDelta: 0.0421,
    };
    this.setState({
      initialPosition: initialRegion,
      markerPosition: initialRegion,
      latitude: this.props.latitude,
      longitude: this.props.longitude,
    });
  };
  onRegionChange(region) {
    this.setState({ region });
  }
  // async request for location permissions
  async requestLocationPermission() {
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        {
          title: "Location Permission",
          message:
            "This App needs access to your location " +
            "so we can know where you are.",
        }
      );
      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        console.log("You can use locations ");
      } else {
        console.log("Location permission denied");
      }
    } catch (err) {
      console.warn(err);
    }
  }
  render() {
    return (
      // <SafeAreaView style={{ flex: 1, backgroundColor: 'white' }}>
      <View style={styles.container}>
        <View
          style={{
            flex: 0.2,
            position: "absolute",
            zIndex: 1,
            width: "100%",
            top: verticalScale(30),
            flexDirection: "column",
            justifyContent: "center",
            marginTop: verticalScale(10),
          }}
        >
          <View style={{ flex: 1, flexDirection: "row" }}>
            <View
              style={{
                flex: 1,
                justifyContent: "flex-end",
                alignItems: "flex-start",
              }}
            >
              <Icon
                onPress={() => {
                  // this.props.navigation.goBack()
                  this.props.close();
                }}
                color={"black"}
                style={{ paddingLeft: scale(12) }}
                name="chevron-left"
                type="entypo"
                size={20}
              />
            </View>
            <View
              style={{
                flex: 1,
                justifyContent: "flex-end",
                alignItems: "center",
              }}
            >
              <Text style={{ fontWeight: "bold", fontSize: 16 }}>
                {"Your Location"}
              </Text>
            </View>
            <View
              style={{
                flex: 1,
                justifyContent: "center",
                alignItems: "center",
              }}
            ></View>
          </View>
          <View style={{ paddingHorizontal: 15, marginTop: 15 }}>
            {/* google place autocomplete package */}
            <GooglePlacesAutocomplete
              placeholder="Search"
              onPress={(data, details = null) => {
                let initialRegion = {
                  latitude: details.geometry.location.lat,
                  longitude: details.geometry.location.lng,
                  latitudeDelta: 0.0922,
                  longitudeDelta: 0.0421,
                };
                this.setState({
                  latitude: details.geometry.location.lat,
                  longitude: details.geometry.location.lng,
                  name: details.formatted_address,
                  initialRegion: initialRegion,
                });
                this.map.animateToCoordinate(
                  {
                    latitude: this.state.latitude,
                    longitude: this.state.longitude,
                  },
                  1
                );
              }}
              autoFocus={false}
              returnKeyType={"default"}
              fetchDetails={true}
              query={{
                key: "AIzaSyC0gFTTXNp535E2IxoCHW13LwLkXxDUybA",
                language: "en",
              }}
              styles={{
                textInputContainer: {
                  backgroundColor: "rgba(0,0,0,0)",
                  borderTopWidth: 0,
                  borderBottomWidth: 0,
                },
                textInput: {
                  marginLeft: 0, 
                  includeFontPadding: false,
                  marginRight: 0,
                  height: 38,
                  color: "#5d5d5d",
                  fontSize: 16,
                  borderColor: "black",
                  borderWidth: 0.5,
                },
                listView: {
                  backgroundColor: "white",
                },
              }}
            />
          </View>
        </View>
        {/* Map View */}
        <MapView
          // provider={PROVIDER_GOOGLE} // remove if not using Google Maps
          style={styles.map}
          ref={(ref) => {
            this.map = ref;
          }}
          mapType={"terrain"}
          region={this.state.initialPosition}
          onRegionChangeComplete={this.handleRegionChange}
        >
          <Marker
            coordinate={{
              latitude: this.state.latitude,
              longitude: this.state.longitude,
            }}
            pinColor={"red"}
          ></Marker>
        </MapView>

        <View
          style={{
            position: "absolute",
            bottom: 20,
            left: 60,
            right: 60,
            zIndex: 2,
          }}
        >
          <Button
            full
            style={{ backgroundColor: mainColor, borderRadius: 5 }}
            onPress={this.handleSearch}
          >
            <Text style={{ fontSize: 15, color: "white", fontWeight: "bold" }}>
              {" "}
              Search{" "}
            </Text>
          </Button>
        </View>
      </View>
      // </SafeAreaView>
    );
  }
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: "relative",
  },
  map: {
    flex: 1,
  },
});
