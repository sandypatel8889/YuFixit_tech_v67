import React, { Component } from "react";
import MapView, { PROVIDER_GOOGLE, Marker } from "react-native-maps";
import Geolocation from "@react-native-community/geolocation";
import {
  View,
  StyleSheet,
  Text,
  Dimensions,
  PermissionsAndroid,
  Platform
} from "react-native";
import { setLocation } from "../util/firestoreHandler";
import MapViewDirections from "react-native-maps-directions";
import { mainColor } from "../components/helper/colors"
import { strings } from "../../locales/i18n";

const { height, width } = Dimensions.get("window");
export default class extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      longitude: 0,
      latitude: 0,
      initialRegion: {},
      // initialPosition: { latitude: 40.7590403, longitude: -74.0392717, latitudeDelta: 0.0922, longitudeDelta: 0.0421 },
      watchID: null,
    };
  }

  componentWillUnmount() {
    if (this.state.watchID) Geolocation.clearWatch(this.state.watchID);
  }
  componentDidMount = async () => {
    // request for permission function call
    await this.requestLocationPermission();
    let watchID = Geolocation.watchPosition(
      (position) => {
        const lat = parseFloat(position.coords.latitude);
        const long = parseFloat(position.coords.longitude);
        let initialRegion = {
          latitude: lat,
          longitude: long,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        };
        this.setState({ initialPosition: initialRegion });
        this.setState({ markerPosition: initialRegion });

        this.setState({ latitude: lat, longitude: long }, () => {
          console.log("id is:", this.props.id);
          setLocation(this.props.id, this.state.latitude, this.state.longitude);
        });
      },
      (error) => {
        console.log(error.code, error.message);
      }
    );
    this.setState({ watchID: watchID });
  };

  onRegionChange(region) {
    this.setState({ region });
  }

  //   request permission for location
  async requestLocationPermission() {
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        {
          title: strings("Location_Permission"),
          message:strings("Location_Permission1")
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
      <View style={styles.container}>

        <MapView
          // provider={PROVIDER_GOOGLE} // remove if not using Google Maps
          style={styles.map}
          mapType={Platform.OS == "ios" ? "standard" : "terrain"}
          ref={(ref) => {
            this.map = ref;
          }}
          region={this.state.initialPosition}
          onRegionChangeComplete={this.handleRegionChange}>
          <Marker
            coordinate={{
              latitude: this.state.latitude,
              longitude: this.state.longitude,
            }}
            pinColor={"red"}
          ></Marker>
          {/* {this.props.comingJob ? (
            //     <Marker
            //     coordinate={{ latitude: this.props.comingJob.address.value.latitude, longitude: this.props.comingJob.address.value.longitude }}
            //     pinColor={'red'}
            // >
            // </Marker>
            <MapViewDirections
              origin={{
                latitude: this.state.latitude,
                longitude: this.state.longitude,
              }}
              destination={{
                latitude: this.props.comingJob.address.value.latitude,
                longitude: this.props.comingJob.address.value.longitude,
              }}
              resetOnChange={true}
              apikey={"AIzaSyAxKINHrqEIn5fErMJa_irrffrnnInSoNU"}
              mode="DRIVING"
              strokeColor={mainColor}
              strokeWidth={3}
            />
          ) : (
            <Marker
              coordinate={{
                latitude: this.state.latitude,
                longitude: this.state.longitude,
              }}
              pinColor={"red"}
            ></Marker>
          )} */}
        </MapView>
      </View>
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
