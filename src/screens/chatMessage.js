import React, { Component, Fragment } from "react";
import {
  Platform,
  StyleSheet,
  Dimensions,
  Text,
  View,
  Modal,
  TouchableOpacity,
  TextInput,
  ScrollView,
  FlatList,
  Alert,
  ActivityIndicator,
  BackHandler,
  Keyboard,
  Image,
  ImageBackground,
  KeyboardAvoidingView,
  PermissionsAndroid
} from "react-native";
import Video from "react-native-video";
import { v4 as uuidv4 } from "uuid";
import { Rating, AirbnbRating } from 'react-native-ratings';
// import Icon from 'react-native-vector-icons/Feather';
import Icon1 from "react-native-vector-icons/Feather";
import { Header, Avatar, Icon } from "react-native-elements";
import { Switch, Button, Form} from "native-base";
import { connect } from "react-redux";
import MapScreen from "./mapScreenNew";
import moment from "moment";
import {
  getChatKey,
  sendMessageToCustomer,
  addMessageMedia,
  notifyUser,
  addNotification,
  getCustomerData,
  addRating,
  findRated
} from "../util/firestoreHandler";
import database from "@react-native-firebase/database";
import { setUser } from "../redux/actions/index";
import MyStorage from "../util/MyStorage";
import EmojiSelector, { Categories } from "react-native-emoji-selector";
import VideoPlayer from "../components/common/videoPlayer";
import VideoPlayerNew from "../components/common/VideoPlayerNew";

import { launchCamera, launchImageLibrary } from "react-native-image-picker";
import Icon2 from "react-native-vector-icons/AntDesign";
import { AudioRecorder, AudioUtils } from "react-native-audio";

const { height, width } = Dimensions.get("window");
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";

import Geolocation from "@react-native-community/geolocation";
import Geocoder from "react-native-geocoding";
Geocoder.init("AIzaSyC0gFTTXNp535E2IxoCHW13LwLkXxDUybA");
import NetInfo from "@react-native-community/netinfo";
import Modal1 from "react-native-modal";
import { ImageViewer } from "react-native-image-zoom-viewer";
import { moderateScale, scale, verticalScale } from '../components/helper/scaling';
import RNFetchBlob from 'rn-fetch-blob'
import { mainColor } from "../components/helper/colors"
import { strings, selection } from '../../locales/i18n';
const videoSizeLimit = 52428800

const options = {
  title: strings("Select_Picture1"),
  mediaType: "photo",
  storageOptions: {
    skipBackup: true,
    path: 'images'
  },
};
const videoOptions = {
  title: strings("Select_Video"),
  mediaType: "video",
  videoQuality: "medium",
  durationLimit: 30,
  storageOptions: {
    skipBackup: true,
    path: 'images'
  },
};
var customer
var provider
var ratingValue
class ChatMessage extends Component {
  constructor(props) {
    super(props);
    customer = this.props.navigation.state.params.data;
    console.log("props: ", customer)
    this.state = {
      ratedState: false,
      conversation: [],
      message: "",
      chatKey: null,
      searching: "",
      messages: [],
      emojis: false,
      containerHeight: 300,
      hasPermission: null,
      recording: false,
      searchModal: false,
      showImagePicker: false,
      showVideoPicker: false,
      latitude: 0,
      longitude: 0,
      location: "",
      isInternetAvilable: true,
      isInternetAlertOpne: false,
      isopenimage: false,
      selectedImage: "",
      showVideoModal: false,
      videoUrl: "",
      isActive: null,
      isFirtime: true,
      isOpenRating: false,
      RatingCount: 0,
      Rating: []
    };
  }
  showRating = () => {
    if(!this.state.ratedState && this.state.messages.length >= 3){
          this.setState({
            isOpenRating: true,
          })
      }
      this.backAction();
  }
  feedback = () => {
    findRated(this.props.navigation.state.params.data.chatKey).then(documentSnapshot => {
      let ratings = documentSnapshot.data().ratings
      console.log("howmany" + ratings)
      if(ratings.length == 0 ){
        this.setState({ ratedState: false});
      }
      else {
        this.setState({ ratedState: true});
      }
    });
} 
  //   closing search modal
  closeModal = () => {
    this.setState({ searchModal: false });
  };
  // handle call back for map and setting the lat and lng state
  handleCallback = (lat, long, name = this.state.location) => {
    this.setState({ latitude: lat, longitude: long, message: name });
  };
  //   search modal
  renderSearchModal = () => {
    return (
      <Modal
        isVisible={this.state.searchModal}
        style={{
          flex: 1,
        }}
        animationInTiming={500}
        animationOutTiming={500}
        onRequestClose={() => {
          this.setState({ searchModal: false });
        }}
      >
        <View style={{ flex: 1, backgroundColor: "white" }}>
          <MapScreen
            handleCallback={this.handleCallback}
            latitude={this.state.latitude}
            close={this.closeModal}
            longitude={this.state.longitude}
          />
        </View>
      </Modal>
    );
  };
  
  closePicker = () => {
    this.setState({ showImagePicker: false, showVideoPicker: false })
  }

  _renderImagePicker = () => {
    return (
      <Modal
          visible={this.state.showImagePicker}
          style={{ margin: 0 }}
          transparent={true}
          animationType="fade"
          onRequestClose={() => this.closePicker()} >
          <View style={{ flex: 1, justifyContent: 'center', backgroundColor: "rgba(10, 10, 10, 0.7)" }}>
              <View style={{ backgroundColor: "white", height: 200, width: Dimensions.get("window").width / 1.3, alignSelf: "center", borderRadius: moderateScale(10) }}>
                  <View style={{ backgroundColor: "black", padding: moderateScale(12), borderTopEndRadius: moderateScale(10), borderTopStartRadius: moderateScale(10) }}>
                      <Text style={{ color: "white", alignSelf: "center", fontSize: moderateScale(16) }}>Choose Option</Text>
                      <Icon2
                          name="closecircle"
                          size={moderateScale(25)}
                          color={"white"}
                          onPress={() => {
                              this.closePicker()
                          }}
                          style={{ position: "absolute", end: 6, top: 6, bottom: 0, alignItems: "center", justifyContent: "center" }}
                      />
                  </View>
                  <View style={{ padding: moderateScale(20), flex: 1 }}>
                      <TouchableOpacity
                        style={{ flex: 1 }}
                        onPress={() => {
                          setTimeout(() => {
                              this.showCamera(1)
                              this.closePicker()
                          }, 500);
                        }}
                      >
                        <Text style={{ fontSize: scale(16), alignSelf: "center", color: "black", fontFamily: "Poppins-Medium" }}>
                          Take Photo
                        </Text>
                      </TouchableOpacity>
                      <View height={verticalScale(18)} />
                      <TouchableOpacity
                        style={{ flex: 1 }}
                        onPress={() => {
                          setTimeout(() => {
                              this.showCamera(2)
                              this.closePicker()
                          }, 500);
                        }}
                      >
                        <Text style={{ fontSize: scale(16), alignSelf: "center", color: "black", fontFamily: "Poppins-Medium" }}>
                          Choose from gallery
                        </Text>
                      </TouchableOpacity>
                  </View>
              </View>
          </View>
      </Modal>
    )
  }

  _renderVideoPicker = () => {
    return (
      <Modal
          style={{ margin: 0 }}
          visible={this.state.showVideoPicker}
          transparent={true}
          animationType="fade"
          onRequestClose={() => this.closePicker()} >
          <View style={{ flex: 1, justifyContent: 'center', backgroundColor: "rgba(10, 10, 10, 0.7)" }}>
              <View style={{ backgroundColor: "white", height: 200, width: Dimensions.get("window").width / 1.3, alignSelf: "center", borderRadius: moderateScale(10) }}>
                  <View style={{ backgroundColor: "black", padding: moderateScale(12), borderTopEndRadius: moderateScale(10), borderTopStartRadius: moderateScale(10) }}>
                      <Text style={{ color: "white", alignSelf: "center", fontSize: moderateScale(16) }}>Choose Option</Text>
                      <Icon2
                          name="closecircle"
                          size={moderateScale(25)}
                          color={"white"}
                          onPress={() => {
                              this.closePicker()
                          }}
                          style={{ position: "absolute", end: 6, top: 6, bottom: 0, alignItems: "center", justifyContent: "center" }}
                      />
                  </View>
                  <View style={{ padding: moderateScale(20), flex: 1 }}>
                      <TouchableOpacity
                        style={{ flex: 1 }}
                        onPress={() => {
                          setTimeout(() => {
                              this.showCamera(3)
                              this.closePicker()
                          }, 500);
                        }}
                      >
                        <Text style={{ fontSize: scale(16), alignSelf: "center", color: "black", fontFamily: "Poppins-Medium" }}>
                          {strings("Record_Video")}
                        </Text>
                      </TouchableOpacity>
                      <View height={verticalScale(18)} />
                      <TouchableOpacity
                        style={{ flex: 1 }}
                        onPress={() => {
                          setTimeout(() => {
                              this.showCamera(4)
                              this.closePicker()
                          }, 500);
                        }}
                      >
                        <Text style={{ fontSize: scale(16), alignSelf: "center", color: "black", fontFamily: "Poppins-Medium" }}>
                          {strings("Choose_from_Library")}
                        </Text>
                      </TouchableOpacity>
                  </View>
              </View>
          </View>
      </Modal>
    )
  }
  
  showCamera = (value) => {
    if (Platform.OS == "android") {
        PermissionsAndroid.requestMultiple([
            PermissionsAndroid.PERMISSIONS.CAMERA,
            PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
        ]).then((result) => {
            console.log("result", result)
            if (result['android.permission.CAMERA'] == "granted" &&
                result['android.permission.WRITE_EXTERNAL_STORAGE'] == "granted") {
                if (value == 1 || value == 3) {
                    this.openCamera(value)
                } else {
                    this.openGallery(value)
                }
            } else {
                Alert.alert("Please grant all permission to access this feature")
            }
        }).catch((reason) => {
            console.log("reason", reason)
        })
    } else {
        if (value == 1 || value == 3) {
            this.openCamera(value)
        } else {
            this.openGallery(value)
        }
    }
  }

  openCamera = (value) => {
      launchCamera({
          mediaType: value == 1 ? "photo" : "video",
          maxHeight: 300,
          maxWidth: 300,
          durationLimit: 240,
          quality: 0.5,
      }, (response) => {
          console.log("response", response)
          if (response.errorCode) return
          if (response.didCancel) return

          if (value == 1) {
            this.uploadImages(response.assets[0].uri)
          } else {
            this.preUploadVideo(response.assets[0].uri)
          }
      })
  }

  openGallery = (value) => {
      launchImageLibrary({
          mediaType: value == 2 ? "photo" : "video",
          maxHeight: 300,
          maxWidth: 300,
          quality: 0.5,
          selectionLimit: 1
      }, (response) => {
          console.log("response", response)
          if (response.errorCode) return
          if (response.didCancel) return

          if (value == 2) {
            this.uploadImages(response.assets[0].uri)
          } else {
            this.preUploadVideo(response.assets[0].uri)
          }
      })
  }

  uploadImages = (uri) => {
    const ext = uri.split(".").pop(); // Extract image extension
    const filename = `${uuidv4()}.${ext}`;
    let message = {
      type: "IMAGE",
      url: uri,
      message: this.state.message,
      senderId: this.props.user.id,
      senderName: this.props.user.name,
    };
    this.setState({
      messages: [...this.state.messages, { ...message, loading: true }],
    });
    addMessageMedia(uri, filename, (status, profileUrl) => {
      if (status) {
        message = { ...message, url: profileUrl };
        this.handleMediaMessage(message);
      } else {
        Alert.alert(strings("Error"), strings("Error_Something_went"));
      }
    });
  }

  preUploadVideo = (uri) => {
    var filename = uri.replace('file:', '')
    RNFetchBlob.fs.stat(filename)
      .then((stats) => {
        console.log("stats: ", stats)
        if (stats.size > videoSizeLimit) {
          Alert.alert(strings("Video_size"))
        } else {
          this.uploadVideo(uri)
        }
      }).catch((error) => {
        console.log("error: ", error)
      })
  }

  // function for listening if thers any message related to that user
  listen = () => {
    this.setState({ isFirtime: true })
    setTimeout(() => { this.setState({ isFirtime: false }) }, 2000)

    if (this.state.chatKey) {
      database()
        .ref()
        .child(this.state.chatKey)
        .on("value", (snapshot) => {
          if (snapshot.val().messages) {
            let temp = snapshot.val().messages;
            let keys = Object.keys(temp);
            keys.reverse();
            let messages = keys.map((key) => {
              return temp[key];
            });
            messages.sort((a, b) => {
              return a.created_at - b.created_at;
            });
            this.setState({ messages: messages });
          }
        });
    }
  };

  //   Recording path

  prepareRecordingPath = () => {
    AudioRecorder.prepareRecordingAtPath(
      `${AudioUtils.DocumentDirectoryPath}/${uuidv4()}.aac`,
      {
        SampleRate: 22050,
        Channels: 1,
        AudioQuality: "Low",
        AudioEncoding: "aac",
        AudioEncodingBitRate: 32000,
      }
    );
  };
  componentWillMount = () => {
    provider = this.props.navigation.state.params.data;
  }
  componentDidMount = () => {
    this.feedback;
    const unsubscribe = NetInfo.addEventListener(state => {
      console.log("Connection type", state.type);
      console.log("Is connected?", state.isConnected);
      this.setState({ isInternetAvilable: state.isConnected });
      if (state.isConnected) {
        // this.getLocation();
        this.setState({ isInternetAlertOpne: true });
      }
      else {
        if (this.state.isInternetAlertOpne) {
          this.setState({ isInternetAlertOpne: false });
          // Alert.alert("Internet Error", "No internet connection available. Please check your connection.");
        }

      }
    });


    this.backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      () => {
        if(!this.state.ratedState && this.state.messages.length >= 3){
          this.setState({
            isOpenRating: true,
          })
      }
      this.backAction();
      }
    );
    this.keyboardDidShowListener = Keyboard.addListener(
      "keyboardDidShow",
      this._keyboardDidShow
    );
    if (this.props.navigation.state.params.chatKey) {
      this.setState(
        { chatKey: this.props.navigation.state.params.chatKey },
        () => {
          this.listen();
        }
      );
    } else {
      let ids = [
        this.props.user.id,
        this.props.navigation.state.params.data.id,
      ];
      ids.sort();
      let searching = `${ids[0]}-${ids[1]}`;
      this.setState({ searching: searching });
      getChatKey(searching).then((res) => {
        if (res.val()) {
          // console.log('res is: ',res.val())
          let keys = Object.keys(res.val());
          this.setState({ chatKey: `chattings/${keys[0]}` }, () => {
            this.listen();
          });
        }
      });
    }

    AudioRecorder.requestAuthorization().then((isAuthorised) => {
      this.setState({ hasPermission: isAuthorised });

      if (isAuthorised) {
        this.prepareRecordingPath();
      }
    });
    AudioRecorder.onFinished = (data) => {
      // Android callback comes in the form of a promise instead.
      if (Platform.OS === 'ios') {
        this.sendRecording(data.audioFileURL);
        this.prepareRecordingPath();
      }
    };
  };

  //   getting user geolocation method
  // getGeoLocation = () => {
  //   if (!this.state.isInternetAvilable) {
  //     // Alert.alert("Internet Error", "No internet connection available. Please check your connection.");
  //     return;
  //   }
  //   Geolocation.getCurrentPosition(
  //     (position) => {
  //       const lat = parseFloat(position.coords.latitude);
  //       const long = parseFloat(position.coords.longitude);
  //       this.setState({ latitude: lat, longitude: long }, () => {
  //         Geocoder.from(lat, long)
  //           .then((json) => {
  //             try {
  //               var addressComponent = json.results[0].address_components[2].short_name;
  //               this.setState({ location: addressComponent });
  //             } catch (err) {
  //               Alert.alert("", "Error in getting location is, Please select your location manually.")
  //               var addressComponent = json.results[0].address_components[0].short_name;
  //               this.setState({ location: addressComponent });
  //             }
  //             // console.log('adddd is: ',addressComponent);
  //           })
  //           .catch((error) => Alert.alert("", "Error in getting location is, Please select your location manually."));
  //       });
  //       // console.log('props should be: ',lat,long)
  //     },
  //     (error) => {
  //       Alert.alert("", "Error in getting location is, Please select your location manually.")
  //       console.log("error in getting location is: ", error);
  //       console.log(error.code, error.message);
  //     }
  //   );
  // };
  // //   async getting user get location method
  // async getLocation() {
  //   if (!this.state.isInternetAvilable) {
  //     // Alert.alert("Internet Error", "No internet connection available. Please check your connection.");
  //     return;
  //   }
  //   try {
  //     if (Platform.OS === "ios") {
  //       // your code using Geolocation and asking for authorisation with
  //       Geolocation.requestAuthorization();
  //       this.getGeoLocation();
  //     } else {
  //       // ask for PermissionAndroid as written in your code
  //       const granted = await PermissionsAndroid.request(
  //         PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
  //         {
  //           title: "Location Permission",
  //           message:
  //             "Allow the app to use location " +
  //             "so we can know where you are.",
  //         }
  //       );
  //       if (granted === PermissionsAndroid.RESULTS.GRANTED) {
  //         this.getGeoLocation();
  //       }
  //     }
  //   } catch (err) {
  //     Alert.alert("Error", "Something went wrong please try again");
  //     console.log("error in gettng location is: ", err);
  //   }
  // }


  _keyboardDidShow = (e) => {
    this.setState({ containerHeight: e.endCoordinates.height, emojis: false });
    if (this.list)
      this.list.scrollToEnd({ animated: true })
  };

  backAction = () => {
    if (this.state.emojis) {
      this.setState({ emojis: false });
      return true;
    } else {
      return false;
    }
  };

  //get chat data of the active request
  componentWillMount = () => {
    // console.log('active request is: ', this.props.acceptedRequests[0])


    var customerId = ""
    if (this.props.navigation.state.params.sender_id) {
      customerId = this.props.navigation.state.params.sender_id
    }
    else {
      customerId = customer.id
    }

    getCustomerData(customerId)
      .then((res) => {
        // console.log('user data is.....', res.id)
        let data = { ...res.data(), id: res.id };
        customer = data
        console.log("customer data: ", customer)
      })
      .catch((err) => {
        console.log("error getting customer: ", err)
      });
  };
  componentWillUnmount = () => {
    this.keyboardDidShowListener.remove();
    this.backHandler.remove();
    console.log("component will unmount called");
    // this.chatRef.off('value', this.valueChange)

    this.stop();
  };
  
  start = async () => {
    if (this.state.hasPermission) {
      try {
        const filePath = await AudioRecorder.startRecording();
        this.setState({ recording: true });
      } catch (error) {
        console.error(error);
      }
    } else {
      this.prepareRecordingPath();
    }
  };

  sendRecording = (path) => {
    // const ext = response.uri.split(".").pop(); // Extract image extension
    const filename = `${uuidv4()}.aac`;
    let message = {
      type: "AUDIO",
      url: path,
      message: this.state.message,
      senderId: this.props.user.id,
      senderName: this.props.user.name,
    };
    this.setState({
      messages: [...this.state.messages, { ...message, loading: true }],
    });
    // adding and sending media message to the customer
    addMessageMedia(path, filename, (status, _url) => {
      if (status) {
        message = { ...message, url: _url };
        if (!this.state.chatKey) {
          Alert.alert(strings("Error"), strings("Error_Something_went"));
          return;
        }
        sendMessageToCustomer(this.state.chatKey, message)
          .then((res) => {
            if (res.data) {
              this.setState({ message: "" });
            } else {
              Alert.alert(strings("Error"), strings("Error_Something_went"));
            }
          })
          .catch((err) => {
            Alert.alert(strings("Error"), strings("Error_Something_went"));
            console.log("Error in sending message is: ", err);
          });

        let title = "New " + message.type.toLowerCase() + " message from " + this.props.user.name
        this.sendChatNotification(title, message.message)
      } else {
        Alert.alert(strings("Error"), strings("Error_Something_went"));
      }
    });
  };
  //   stopping the audio recording
  stop = async () => {
    if (this.state.recording) {
      try {
        const filePath = await AudioRecorder.stopRecording();
        this.setState({ recording: false }, () => {
          if (Platform.OS === 'android') {
            this.sendRecording(filePath);
            this.prepareRecordingPath();
          }
        });
      } catch (error) {
        console.error(error);
      }
    }
  };

  valueChange = (data) => {
    console.log("data is: ", data, data.val());
  };

  //   getting the video from gallery or recording video from the camera
  handleVideo = () => {

    if (!this.state.isInternetAvilable) {
      Alert.alert(strings("Internet_Error"), strings("Internet_Error_Message"));
      return;
    }

    this.setState({ showVideoPicker: true })

  };
  uploadVideo(path) {
    const ext = path.split(".").pop(); // Extract image extension
    const filename = `${uuidv4()}.${ext}`;
    let message = {
      type: "VIDEO",
      url: path,
      message: this.state.message,
      senderId: this.props.user.id,
      senderName: this.props.user.name,
    };
    this.setState({
      messages: [...this.state.messages, { ...message, loading: true }],
    });
    addMessageMedia(path, filename, (status, profileUrl) => {
      if (status) {
        message = { ...message, url: profileUrl };
        if (!this.state.chatKey) {
          Alert.alert(strings("Error"), strings("Error_Something_went"));
          return;
        }
        sendMessageToCustomer(this.state.chatKey, message)
          .then((res) => {
            if (res.data) {
              this.setState({ message: "" });
            } else {
              Alert.alert(strings("Error"), strings("Error_Something_went"));
            }
          })
          .catch((err) => {
            Alert.alert(strings("Error"), strings("Error_Something_went"));
          });

        let title = "New " + message.type.toLowerCase() + " message from " + this.props.user.name
        this.sendChatNotification(title, message.message)
      } else {
        Alert.alert(strings("Error"), strings("Error_Something_went"));
      }
    });
  }
  //   getting the images from gallery or taking picture from camera
  handleImages = () => {
    this.setState({ showImagePicker: true })
  };
  // textbox for texting message
  _renderTextBox = () => {
    return (
      <View
        style={{
          flexDirection: "row",
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "white",
          marginBottom: 5,
          marginTop: 5
        }}
      >
        <TouchableOpacity
          onPress={this.handleImages}
          style={{ flex: 0.2, justifyContent: "center", alignItems: "center" }}
        >
          <Image source={require('../../assets/file.png')} style={{ height: scale(25), width: scale(25) }} />
        </TouchableOpacity>
        <View
          style={{
            flex: 1,
            flexDirection: "row",
            borderRadius: 20,
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: "white",
            marginRight: 5,
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
          }}
        >
          <TextInput
            placeholder={strings("Write_message")}
            style={{ width: "100%", includeFontPadding: false, fontFamily: "Poppins-Light", fontSize: scale(12), color: "#4C5264", flex: 1, marginLeft: 5, marginRight: 5, maxHeight: 150, marginTop: scale(5), marginBottom: scale(5) }}
            multiline={true}
            onChangeText={(txt) => {
              this.setState({ message: txt });
              this.list.scrollToEnd({ animated: true })
            }}
            underlineColorAndroid="transparent"
            value={this.state.message}
          />
        </View>

        <TouchableOpacity
          style={{ flex: 0.2, justifyContent: "center", alignItems: "center" }}
        >
          {this.state.message === "" && !this.state.recording && (
            <Avatar
              rounded
              size={scale(30)}
              icon={{ name: "mic", type: "Feather", color: "white" }}
              overlayContainerStyle={{ backgroundColor: mainColor }}
              onPress={this.start}
            />
          )}
          {this.state.message !== "" && !this.state.recording && (
            <Avatar
              rounded
              size={scale(30)}
              icon={{ name: "send", type: "Feather" }}
              overlayContainerStyle={{ backgroundColor: mainColor }}
              onPress={this.handleMessage}
            />
          )}

          {this.state.recording && (
            <Avatar
              rounded
              size={scale(30)}
              icon={{ name: "stop", type: "font-awesome", color: "red" }}
              overlayContainerStyle={{ backgroundColor: mainColor }}
              onPress={this.stop}
            />
          )}
        </TouchableOpacity>
      </View>
    );
  };
  // textbox for texting message
  _renderAutoResponderBox = () => {
    return (
      <View
        style={{
          justifyContent: "center",
          // alignItems: "center",
          // backgroundColor: "gray",
          // margin: moderateScale(5),
          height: moderateScale(80)
        }}>
          < View
          style={{
            backgroundColor: 'white',
            width: "100%",
            height: 1,
            ...Platform.select({
              ios: {
                shadowColor: 'gray',
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.9,
                shadowRadius: 1,
              },
              android: {
                elevation: 5,
              },
            }),
          }}
        />
        <Text style={{marginLeft:moderateScale(10),marginTop:moderateScale(5), fontFamily: "Poppins-SemiBold", fontSize: scale(10), color: "#AFAFAF" }}>
          {strings("SUGGESTED_AUTO_REPLY")}
        </Text>
        <FlatList style={{marginLeft:moderateScale(5)}}
          horizontal
          data={this.props.user.replys}
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item, index) => index.toString()}
          renderItem={this.renderSuggestion}
        />
      </View>
    );
  };
  // showing all of the conversion
  _renderConversation = () => {
    return (
      <View style={{ flex: 1 }}>
        <ScrollView
          ref={(ref) => {
            this.list = ref;
          }}
          style={{ flex: 1 }}
          onContentSizeChange={() => this.list.scrollToEnd({ animated: this.state.isFirtime ? false : true })}>
          <FlatList
            data={this.state.messages}
            extraData={this.state}
            contentContainerStyle={{ flex: 1, marginVertical: 10 }}
            showsVerticalScrollIndicator={false}
            keyExtractor={(item, index) => index.toString()}
            renderItem={this._renderItem}
            initialNumToRender={this.state.messages.length}
          />
        </ScrollView>
      </View>
    );
  };
  renderSuggestion = ({ item, index }) => {
    return (
      <View
        style={{
          backgroundColor: "lightgray", flexDirection: "row", alignItems: "center", justifyContent: "center", marginTop: moderateScale(10),marginBottom: moderateScale(10),marginLeft: moderateScale(5),marginRight: moderateScale(5), padding: moderateScale(5), borderRadius: 15, ...Platform.select({
            ios: {
              shadowColor: 'gray',
              shadowOffset: { width: 0, height: 1 },
              shadowOpacity: 0.9,
              shadowRadius: 1,
            },
            android: {
              elevation: 5,
            },
          }),
        }}>
        <TouchableOpacity
          onPress={() => this.setState({ message: item })}>
          <Text style={{ fontSize: moderateScale(12), color: "#242424", fontFamily: "Poppins-Regular" }}>
            {item}
          </Text>
        </TouchableOpacity>
      </View >

    );
  };

  _renderItem = ({ item }) => (
    <View style={{ marginHorizontal: 20, marginVertical: 5 }}>
      {item.senderId == this.props.user.id ? (
        <View><View style={styles.customerContainer}>
          {item.loading && (
            <View
              style={{
                paddingRight: 10,
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <ActivityIndicator size="small" color="black" />
            </View>
          )}
          {/* <Text style={{ fontSize: 20, color: 'black' }} >{item.message}</Text> */}
          {item.type === "TEXT" && this._renderTextMessage(item)}
          {item.type === "IMAGE" && this._renderImage(item)}
          {item.type === "VIDEO" && this._renderVideo(item)}
          {item.type === "AUDIO" && this._renderAudio(item)}

          {/* <View style={styles.customerMsgArrow}></View> */}
        </View>
          <View style={styles.customerContainer1}>
            {item.created_at ? <Text style={{ color: "#AFAFAF", margin: 5, fontSize: scale(10), fontFamily: "Poppins-Light" }}>{this.convertdte(item.created_at)}</Text> : console.log("")}
          </View>
        </View>
      ) : (
        <View><View style={styles.seekerContainer}>
          {item.type === "TEXT" && this._renderTextMessage(item)}
          {item.type === "IMAGE" && this._renderImage(item)}
          {item.type === "VIDEO" && this._renderVideo(item)}
          {item.type === "AUDIO" && this._renderAudio(item)}
          {/* <Text style={{ fontSize: 20, color: "green" }}>{item.message}</Text> */}
          {/* <View style={styles.seekerMsgArrow}></View> */}
        </View>
          {item.created_at ? <Text style={{ color: "#AFAFAF", margin: 5, fontSize: scale(10), fontFamily: "Poppins-Light" }}>{this.convertdte(item.created_at)}</Text> : console.log("")}
        </View>
      )}
    </View>
  );
  convertdte(timestamp) {
    var newDate = moment(new Date(timestamp)).format('DD MMM, HH:mm a');
    return newDate
  }
  //   open modal for video player
  openModal = (item) => {
    console.log("here iam in modal");
    this.setState({
      videoUrl: item,
      showVideoModal: true,
    });
  };
  showVideoModal = () => {
    return (
      <Modal1
        style={{
          alignSelf: "center",
          // justifyContent: "flex-end",
          // marginTop: verticalScale(130),
          maxHeight: "100%",
          marginHorizontal: scale(5),
        }}
        width="auto"
        height="100%"
        transparent={true}
        animationInTiming={500}
        animationOutTiming={500}
        isVisible={this.state.showVideoModal}
      >
        <View
          style={{
            // flex: 1,
            height: "95%",
            backgroundColor: "white",
            borderRadius: 10
          }}
        >
          <View
            style={{
              flex: 0.3,
              flexDirection: "row",
              width: "100%",
              backgroundColor: mainColor,
              justifyContent: "flex-end",
              paddingBottom: verticalScale(6),
              borderTopLeftRadius: 10,
              borderTopRightRadius: 10
            }}
          >
            <View style={{ flex: 0.2 }}></View>
            <View
              style={{
                flex: 1,
                justifyContent: "flex-end",
                alignItems: "center",
              }}
            >
              <Text
                style={{
                  fontSize: scale(18),
                  fontFamily: "Poppins-SemiBold",
                  color: "white",
                  alignSelf: "center",
                  paddingHorizontal: scale(32),
                  textAlign: "center",
                }}
              >
                {strings("VIDEO_PLAYER")}
              </Text>
            </View>
            <View
              style={{
                flex: 0.2,
                justifyContent: "flex-end",
                alignItems: "center",
                marginTop: 5
              }}
            >
              <Icon1
                onPress={() => {
                  this.setState({
                    showVideoModal: false,
                  });
                }}
                type="feather"
                size={verticalScale(25)}
                name="x"
                style={{ color: "white" }}
              />
            </View>
          </View>
          <View style={{ flex: 3 }}>
            {Platform.OS == "android" ? <VideoPlayer videoUrl={this.state.videoUrl} /> : <VideoPlayerNew videoUrl={this.state.videoUrl} />}
          </View>
        </View>
      </Modal1>
    );
  };
  //   showing vide with video player in the conversion
  _renderVideo = (item) => {
    if (Platform.OS == "android") {
      return (
        <TouchableOpacity
          onPress={() => this.openModal(item.url)}>
          <View style={{ height: 200, width: 200 }}>
            <VideoPlayer videoUrl={item.url} playerHeight={200} playerWidth={200} />
          </View>
        </TouchableOpacity>
      );
    }
    else {
      return (
        // <TouchableOpacity
        //   onPress={() => this.openModal(item.url)}>
        <View style={{ height: 200, width: 200 }}>
          <VideoPlayerNew videoUrl={item.url} playerHeight={200} playerWidth={200} />
        </View>
        // </TouchableOpacity>
      );
    }

  };

  ViewImage(item) {
    this.setState({
      isopenimage: true,
      selectedImage: item
    })
  }
  //   showing image in the conversion
  _renderImage = (item) => {
    // console.log("image item is: ", item.url);
    return (
      <TouchableOpacity
        onPress={() => this.ViewImage(item.url)}>

        <ImageBackground
          style={{
            height: 200, width: 200,
          }}
          imageStyle={{ resizeMode: "cover", borderRadius: 5 }}
          source={
            require('../../assets/picture.png')
          }>
          <Image
            style={{
              height: 200, width: 200, resizeMode: "cover"
            }}
            source={{
              uri: item.url
            }}
          />
        </ImageBackground>


        {/* <Image defaultSource={require('../../assets/picture.png')}
          source={{ uri: item.url }}
          style={{ height: 200, width: 200 }} /> */}

      </TouchableOpacity>
      // <ImageBackground
      //   source={{ uri: item.url }}
      //   style={{ height: 200, width: 230 }}
      //   imageStyle={{ resizeMode: "contain" }}
      // ></ImageBackground>
    );
  };
  // showing text message in the conversion
  _renderTextMessage = (item) => {
    return item.senderId == this.props.user.id ? <Text style={{ fontSize: scale(12), color: "white", fontFamily: "Poppins-Regular" }}>{item.message}</Text> : <Text style={{ fontSize: scale(12), color: "#4C5264", fontFamily: "Poppins-Regular" }}>{item.message}</Text>;
  };
  _renderAudio = (item) => {
    return (
      <View style={{ height: 40, width: 200, paddingTop: 19 }}>
        <VideoPlayer
          videoUrl={item.url}
          audioOnly={true}
          playerHeight={25}
          playerWidth={200}
        />
      </View>
    );
  };
  // send message function
  sendMessage = () => {
    var msg = this.state.message;
    this.setState({ message: "" });

    let message = {
      type: "TEXT",
      message: msg,
      senderId: this.props.user.id,
      senderName: this.props.user.name,
    };

    this.setState({
      messages: [...this.state.messages, { ...message, loading: false }],
    });
    this.setState({
      RatingCount: this.state.RatingCount + 1
    })
    
    if (this.state.Rating && this.state.Rating.length > 0) {
      let find = this.findArrayElementByTitle(this.state.Rating, this.state.chatKey)
      if (this.state.RatingCount == 19 && !find) {
        this.setState({
          isOpenRating: true
        })
      }
    }
    if (this.state.RatingCount == 19) {
      this.setState({
        isOpenRating: true
      })
    }
    this.setState({ message: "" });
    sendMessageToCustomer(this.state.chatKey, message)
      .then((res) => {
        if (res.data) {
          this.setState({ message: "", loading: false });
        } else {
          Alert.alert(strings("Error"), strings("Error_Something_went"));
        }
      })
      .catch((err) => {
        Alert.alert(strings("Error"), strings("Error_Something_went"));
      });

    let title = "New message from " + this.props.user.name
    this.sendChatNotification(title, msg)
  };

  // handling the sending message
  handleMessage = () => {
    if (this.state.message == "") {
      Alert.alert(strings("enter_message"));
      return;
    }
    if (this.state.chatKey) {
      this.sendMessage();
    } else {
      Alert.alert(strings("Error"), strings("Error_Something_went"));
    }
    this.showRating();
  };

  ratingCompleted(rating) {
  ratingValue = rating
}
addProviderRating() {
  let ratings = provider.ratings
    ? [...provider.ratings, ratingValue]
    : [ratingValue];
  addRating(provider.id, ratings)
    .then((res) => {
      if (this.state.Rating && this.state.Rating.length > 0) {
        let arrrating = this.state.Rating
        arrrating.push(this.state.chatKey + '')
        { this.Savedata('Rating', arrrating) }
        this.setState({
          Rating: arrrating,
          ratedState: true
        })
      }
      else {
        let arrrating = []
        arrrating.push(this.state.chatKey + '')
        { this.Savedata('Rating', arrrating) }
        this.setState({
          Rating: arrrating
        })
        this.setState({ratedState: true});
      }
      this.getAllProviders()
    })
    .catch((err) => {
      Alert.alert(strings("Error"), strings("Error_Something_went"));
    });
}

  sendChatNotification(title, msg) {
    let deviceToken = customer.deviceToken
    if (deviceToken) {
      console.log("deviceToken: ", deviceToken)
      let tokens = [];
      tokens.push(deviceToken)
      notifyUser(tokens, title, msg)
    }

    let uniqueKey = customer.email + "_" + this.props.user.email
    console.log("uniqueKey: ", uniqueKey)
    let notifData = {
      to: customer.id,
      body: title + " - " + msg,
      badge: '1',
      sound: 'default',
      booking: {
        update_at: parseInt(new Date().getTime() / 1000),
        providerProfileUrl: this.props.user.personalInfo.profileUrl,
        chatKey: this.state.chatKey,
        sender_id: this.props.user.id,
      }
    }

    addNotification(uniqueKey, notifData)
  }

  render() {
    // const customer = {name: 'Mubashir Ali', isActive: false }
    return (
      <KeyboardAvoidingView style={styles.container} keyboardVerticalOffset={Platform.select({ ios: 0, android: -500 })} behavior="padding" enabled>
        <View style={styles.container}>
          <Header
            containerStyle={[{
              backgroundColor: "white",
              height: verticalScale(85),
              borderBottomColor: "white",
              borderBottomWidth: 1,
              alignContent: "center"
            }, Platform.OS == "android" ? { paddingTop: 0 } : null]}
            leftComponent={
              <Icon
                onPress={() => {
                  // this.props.navigation.navigate("Chat");
                  this.props.navigation.navigate("Chat", {
                    notifyUser: false,
                  });
                }}
                type="FontAwesome"
                size={40}
                name="chevron-left"
                color={mainColor}
              />
            }
            centerComponent={
              <View flexDireaction="row" justifyContent="center" alignItems="center">
                <ImageBackground
                  style={{
                    height: verticalScale(40), width: verticalScale(40)
                  }}
                  imageStyle={{ borderRadius: verticalScale(20), borderColor: mainColor, borderWidth: 1 }}
                  source={
                    require('../../assets/icon.png')
                  }>
                  <Image
                    style={{
                      height: verticalScale(40), width: verticalScale(40), borderRadius: verticalScale(20), borderColor: mainColor, borderWidth: 1
                    }}
                    source={{
                      uri: customer.profileUrl
                    }}
                  />
                </ImageBackground>


                {/* {customer.profileUrl ? <Image defaultSource={require('../../assets/icon.png')} source={{
                  uri: customer.profileUrl
                }} style={{ height: verticalScale(40), width: verticalScale(40), borderRadius: verticalScale(20), borderColor: mainColor, borderWidth: 1 }} /> : <Image source={require('../../assets/icon.png')} style={{ height: verticalScale(40), width: verticalScale(40), borderRadius: verticalScale(20), borderColor: mainColor, borderWidth: 1 }} />} */}

                <View style={{ flexDirection: "column", justifyContent: "center", alignItems: "center" }}>
                  <Text
                    style={{ fontSize: scale(14), fontFamily: "Poppins-SemiBold", color: mainColor }}>{customer.name}</Text>
                  {/* <Text style={{ fontSize: scale(10), color: mainColor }}>
                    Online
                  </Text> */}
                </View>
              </View>
            }
            rightComponent={
              <View style={{ flexDirection: "row" }}>
                <View>
                  <Icon
                    type="MaterialIcons"
                    onPress={() => {
                      this.handleVideo()
                    }}
                    size={30}
                    name="videocam"
                    color={mainColor}
                  />
                </View>
                <View marginLeft={10} justifyContent="center">
                  <Icon
                    type="FontAwesome"
                    onPress={() => {
                      Alert.alert("coming soon")
                    }}
                    size={22}
                    name="phone"
                    color={mainColor}
                  />
                </View>
              </View>
            }
          />

          {this.state.showVideoModal && this.showVideoModal()}
          {this._renderConversation()}
          {this.props.user.isEnable ? this._renderAutoResponderBox() : console.log("")}

          {this._renderTextBox()}
          {this.state.searchModal && this.renderSearchModal()}

          {this._renderImagePicker()}
          {this._renderVideoPicker()}

          {/* {this.state.emojis && (
            <View style={{ height: this.state.containerHeight }}>
              <EmojiSelector
                onEmojiSelected={(emoji) => {
                  this.setState({ message: `${this.state.message}${emoji}` });
                }}
              />
            </View>
          )} */}


<Modal1
            animationType="slide"
            transparent={true}
            isVisible={this.state.isOpenRating}>
            <View
              style={{
                flex: 1,
                justifyContent: "center",
              }}>
              <Form style={{ backgroundColor: "white", margin: 15, padding: 15, borderRadius: 10 }}>
                <View alignItems="center" justifyContent="center">
                  <Image source={require('../../assets/mainstar.png')} style={{}} />
                </View>
                <View marginTop={0} height={verticalScale(10)} />
                <Text style={{ fontSize: scale(15), color: "#242424", fontFamily: "Poppins-Bold", textAlign: "center" }}>{strings("share_feedback")}</Text>
                <Text style={{ fontSize: scale(12), color: "#8A8A8A", fontFamily: "Poppins-Regular", textAlign: "center" }}>{strings("rate")}</Text>
                {/* <View marginTop={0} height={verticalScale(10)} /> */}
                <AirbnbRating
                  count={5}
                  reviews={["", "", "", "", ""]}
                  defaultRating={0}
                  size={moderateScale(40)}
                  onFinishRating={this.ratingCompleted}
                />
                <View
                  style={{
                    marginTop: 10,
                    justifyContent: "center",
                    alignItems: "center",
                  }}>
                  <Button
                    full
                    style={{
                      backgroundColor: "white",
                      borderRadius: 5,
                      borderWidth: 1,
                      borderColor: "white",
                      height: verticalScale(35)
                    }}
                    onPress={() => {
                      this.setState({
                        isOpenRating: false
                      });
                      this.addProviderRating()
                    }}>
                    <Text style={{ fontSize: scale(14), fontFamily: "Poppins-SemiBold", color: "#3E62C9" }}>{strings("Save")}</Text>
                  </Button>
                  <Button
                    full
                    style={{
                      backgroundColor: "white",
                      borderRadius: 5,
                      borderWidth: 1,
                      borderColor: "white",
                      height: verticalScale(35)
                    }}
                    onPress={() => {
                      this.setState({
                        isOpenRating: false,
                        RatingCount: 0,
                        ratedState: true,
                      });
                    }}>
                    <Text style={{ fontSize: scale(14), fontFamily: "Poppins-SemiBold", color: "#3E62C9" }}>{strings("Later")}</Text>
                  </Button>
                </View>
              </Form>
            </View>
          </Modal1>
        </View>
      </KeyboardAvoidingView>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
    // paddingBottom: (Dimensions.get('window').width) > 375 || (Dimensions.get('window').height) > 675 ? 20 : 0,
    paddingBottom: (Dimensions.get('window').height) > 812 ? 20 : 0,
  },
  seekerContainer: {
    padding: 10,
    borderTopRightRadius: 20,
    borderTopLeftRadius: 20,
    // borderBottomLeftRadius: 5,
    borderBottomRightRadius: 20,
    minWidth: 100,
    maxWidth: 300,
    alignSelf: "flex-start",
    backgroundColor: "white",
    position: "relative",
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
  },
  seekerMsgArrow: {
    position: "absolute",
    top: 0,
    left: -10,
    zIndex: 2,
    width: 0,
    height: 0,
    backgroundColor: "transparent",
    borderStyle: "solid",
    borderTopWidth: 5,
    borderBottomWidth: 5,
    borderRightWidth: 10,
    borderTopColor: "#EFEEF7",
    borderBottomColor: "transparent",
    borderRightColor: "#EFEEF7",
  },
  customerContainer: {
    padding: 10,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderBottomLeftRadius: 20,
    // borderBottomRightRadius: 5,
    minWidth: 100,
    maxWidth: 300,
    alignSelf: "flex-end",
    backgroundColor: mainColor,
    position: "relative",
    flexDirection: "row",
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
  },
  customerContainer1: {
    borderTopLeftRadius: 5,
    borderBottomLeftRadius: 5,
    borderBottomRightRadius: 5,
    // minWidth: 100,
    // maxWidth: 300,
    alignSelf: "flex-end",
    // backgroundColor: "#009E9D",
    // position: "relative",
    // flexDirection: "row",
  },
});

const mapStateToProps = (state) => {
  return {
    user: state.userData,
  };
};
export default connect(mapStateToProps, { setUser })(ChatMessage);
