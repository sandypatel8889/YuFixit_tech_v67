import React, { Component } from "react";
import {
  View,
  Text,
  Dimensions,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Alert,
  Image,
  Platform,
  Keyboard,
  TouchableWithoutFeedback,
  Linking,
  TextInput,
  ImageBackground,
  PermissionsAndroid
} from "react-native";
import Icon from "react-native-vector-icons/Feather";
import Modal from "react-native-modal";
import { Header, Avatar, colors, CheckBox } from "react-native-elements";
const { height, width } = Dimensions.get("window");
import { verticalScale, scale, moderateScale } from "../components/helper/scaling";
import CommonComponent from "../components/common/commonComp";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { StackActions, NavigationActions } from 'react-navigation';
import { ImageViewer } from "react-native-image-zoom-viewer";
import { launchCamera, launchImageLibrary } from "react-native-image-picker";
import Icon2 from "react-native-vector-icons/AntDesign";
import { strings, selection } from '../../locales/i18n';
import {
  addAddress,
  fetchCategories,
  addService,
  addProfileImage,
  uploadVideo,
  uploadImage,
  updateProviderName,
  updateProviderSubscriptionDate,
  updateProviderSubscriptionDate_call,
  updateProviderSkills,
  addVideo,
  addProviderToCategory,
  deleteVideo,
  updatePersonalInfo,
  addToCategory,
  addImages,
  addMessageMedia
} from "../util/firestoreHandler";
import ImagePicker from "react-native-image-picker";
import { v4 as uuidv4 } from "uuid";
import { connect } from "react-redux";
import { setUser } from "../redux/actions/index";
import Play from "../../assets/play.png";
import { GooglePlacesAutocomplete } from "react-native-google-places-autocomplete";
import { Button, Form, Item as FormItem, Input, Label, Textarea } from "native-base";
import MyStorage from "../util/MyStorage";
import VideoPlayer from "../components/common/videoPlayer";
import VideoPlayerNew from "../components/common/VideoPlayerNew";
import { mainColor } from "../components/helper/colors";
import NetInfo from "@react-native-community/netinfo";
import { ScrollView } from "react-native";
import ExpandableComponent from "../components/common/ExpandableComponent";
import RNFetchBlob from 'rn-fetch-blob'
import { LayoutAnimation } from "react-native";
import auth from "@react-native-firebase/auth";
import Purchases from "react-native-purchases";

const options = {
  title: strings("Select_Profile_Image"),
  quality: 0.5, maxWidth: 1000, maxHeight: 1000,
  storageOptions: {
    skipBackup: true,
    path: "images",
  },
};
const optionsVideo = {
  title: strings("Select_Video"),
  mediaType: "video",
  storageOptions: {
    skipBackup: true,
    path: "images",
  },
};
const videoSizeLimit = 52428800
class Profile extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      addModal: false,
      addressName: "",
      newAddressValue: {
        latitude: 0,
        longitude: 0,
        name: "",
      },
      uploading: false,
      addingAddress: false,
      showImagePicker: false,
      showVideoPicker: false,
      isEditAddress: false,
      addressIndex: -1,
      categories: [],
      proCategories: [],
      addServiceModal: false,
      serviceDetail: "",
      categoryName: strings("Select_Category"),
      categoryId: "",
      addingService: false,
      isEditService: false,
      serviceIndex: -1,
      editNameDialog: false,
      newName: "",
      editSkillDetailsDialog: false,
      newSkillDetails: "",
      uploadingVideo: false,
      deleting: false,
      showVideoModal: false,
      videoUrlData: "",
      DOB: "",
      ContactNumber: "",
      CardNumber: "",
      CardDate: "",
      CardCVV: "",
      isInternetAvilable: true,
      isInternetAlertOpne: false,
      ischangePassword: false,
      Password: "",
      ConfirmPassword: "",
      processing: false,
      Loading: false,
      isRestore: false,
      PlanActive: false,
      isPayment: false,
      isPayment_call: false,
      PlanActive_call: false,
      Offering: null,
      loading: false,
      isUploadImages: false,
      isopenimage: false,
      selectedImage: "",
    };
  }
  // check different firestore methods
  componentDidMount = () => {
    console.log("userid", this.props.userData.id)
    this.setState({ newName: this.props.userData ? this.props.userData.name : "" });
    // fetching all categories
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
    fetchCategories()
      .then((data) => {
        let categories = data.docs.map((doc) => {
          return { ...doc.data(), id: doc.id };
        });
        this.setState({ categories: categories });
        let dateofbirth = new Date(this.props.userData.personalInfo.dob.toDate()).toDateString()
        this.setState({
          DOB: dateofbirth + ''
        });
      })
      .catch((err) => {
        console.log("error in fetching category is: ", err);
      });

    let data = this.props.userData.services ? this.props.userData.services : [];
    this.setState({ proCategories: data })





    // let date1 = new Date();
    // date1.setDate(date1.getDate() - 1);
    // let Expiry_call = this.props.userData.Expirydate_call ? this.props.userData.Expirydate_call : date1

    // var ChatExpiryDate_call = Expiry_call;
    // var CurrentDate = new Date();
    // ChatExpiryDate_call = new Date(ChatExpiryDate_call);

    // if (ChatExpiryDate_call > CurrentDate) {
    //   this.setState({
    //     PlanActive_call: true
    //   })
    // }
    // else {
    //   this.setState({
    //     PlanActive_call: false
    //   })
    // }




  };

  renderProfileAddressData = () => {

    let data = this.props.userData.addresses ? this.props.userData.addresses : [];
    return <CommonComponent title={"Address"} data={data} firstItemEditable={true}
      onEdit={(item, index) => () => {
        console.log("index", index)
        this.setState({
          addressName: item.name,
          newAddressValue: item.value,
          isEditAddress: true,
          addressIndex: index,
          addModal: true
        })
      }}
      onRemove={(item, index) => () => {
        console.log("index", index)
        this.showRemoveAddressAlert(index)
      }}
    />;
    // }
  };

  updateLayout = index => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    const array = [...this.state.proCategories];
    array[index]['isExpanded'] = !array[index]['isExpanded'];
    this.setState(() => {
      return {
        proCategories: array,
      };
    });
  };

  renderProfileServicesData = () => {
    return <ScrollView>
      {this.state.proCategories.map((item, key) => (
        <ExpandableComponent
          key={item.id}
          item={item}
          onClickFunction={this.updateLayout.bind(this, key)}
          editMode={false}
          deleteMode
          data={this.state.proCategories}
          onDelete={() => {
            this.showRemoveServiceAlert(key)
          }}
        />
      ))}
    </ScrollView>
  };

  closePicker = () => {
    this.setState({ showImagePicker: false, showVideoPicker: false })
  }

  _renderImagePicker = () => {
    return (
      <Modal
          style={{ margin: 0 }}
          visible={this.state.showImagePicker}
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
          visible={this.state.showVideoPicker}
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

    this.setState({ uploading: true });
    const ext = uri.split(".").pop(); // Extract image extension
    // const filename = `${this.props.userData.id}.${ext}`;
    const filename = `${uuidv4()}.${ext}`;
    // addProfileImage(path, filename, (status, profileUrl) => {
    addMessageMedia(uri, filename, (status, profileUrl) => {
      if (status) {
        if (this.state.isUploadImages) {
          let images = this.props.userData.images
            ? [...this.props.userData.images, profileUrl]
            : [profileUrl];
          let data = this.props.userData;
          data = { ...data, images: images };
          addImages(this.props.userData.id, images)
            .then((res) => {
              this.props.setUser(data);
              new MyStorage().setUserData(JSON.stringify(data));
              this.setState({ uploading: false });
            })
            .catch((err) => {
              this.setState({ uploading: false });
              Alert.alert(strings("Error"), strings("Error_Something_went"));
            });
        }
        else {
          let data = this.props.userData;
          let temp = data.personalInfo;
          temp.profileUrl = profileUrl;
          updatePersonalInfo(this.props.userData.id, temp)
            .then((res) => {
              data = { ...data, personalInfo: temp };
              this.props.setUser(data);
              new MyStorage().setUserData(JSON.stringify(data));
              setTimeout(() => {
                this.setState({ uploading: false });
              }, 200);
            })
            .catch((err) => {
              this.setState({ uploading: false });
              Alert.alert(strings("Error"), strings("Error_Something_went"));
            });
        }
      }
      else {
        this.setState({ uploading: false });
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

  uploadImage = (uri) => {
    this.setState({ uploading: true });
    const ext = uri.split(".").pop(); // Extract image extension
    // const filename = `${this.props.userData.id}.${ext}`;
    const filename = `${uuidv4()}.${ext}`;
    // addProfileImage(path, filename, (status, profileUrl) => {
    addMessageMedia(path, filename, (status, profileUrl) => {
      if (status) {
        if (this.state.isUploadImages) {
          let images = this.props.userData.images
            ? [...this.props.userData.images, profileUrl]
            : [profileUrl];
          let data = this.props.userData;
          data = { ...data, images: images };
          addImages(this.props.userData.id, images)
            .then((res) => {
              this.props.setUser(data);
              new MyStorage().setUserData(JSON.stringify(data));
              this.setState({ uploading: false });
            })
            .catch((err) => {
              this.setState({ uploading: false });
              Alert.alert(strings("Error"), strings("Error_Something_went"));
            });
        }
        else {
          let data = this.props.userData;
          let temp = data.personalInfo;
          temp.profileUrl = profileUrl;
          updatePersonalInfo(this.props.userData.id, temp)
            .then((res) => {
              data = { ...data, personalInfo: temp };
              this.props.setUser(data);
              new MyStorage().setUserData(JSON.stringify(data));
              setTimeout(() => {
                this.setState({ uploading: false });
              }, 200);
            })
            .catch((err) => {
              this.setState({ uploading: false });
              Alert.alert(strings("Error"), strings("Error_Something_went"));
            });
        }
      }
      else {
        this.setState({ uploading: false });
        Alert.alert(strings("Error"), strings("Error_Something_went"));
      }
    });
  }

  showRemoveAddressAlert(index) {
    Alert.alert(strings("Delete_Address"),
      strings("delete_address"),
      [
        {
          text: strings("No"),
          style: "cancel"
        },
        {
          text: strings("Yes"),
          onPress: () => {
            this.removeAddress(index)
          }
        }
      ])
  }
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

  removeAddress(index) {
    this.setState({ deleting: true })
    let addresses = this.props.userData.addresses
    if (addresses) {
      addresses.splice(index, 1);
    } else {
      addresses = []
    }

    console.log("addresses:", addresses)

    addAddress(this.props.userData.id, addresses)
      .then((res) => {
        let data = { ...this.props.userData, addresses: addresses };
        this.props.setUser(data);
        new MyStorage().setUserData(JSON.stringify(data));
        this.setState({ deleting: false })
      })
      .catch((err) => {
        Alert.alert(strings("Error"), strings("Error_Something_went"));
        this.setState({ deleting: false });
      });
  }

  // Add Address to the user profile
  handleAddAddress = () => {
    if (!this.state.isInternetAvilable) {
      Alert.alert(strings("Internet_Error"), strings("Internet_Error_Message"));
      return;
    }

    if (this.state.addressName == "") {
      Alert.alert(strings("Mising_Data"), strings("please_add_name"));
      return;
    }

    if (this.state.newAddressValue.name === "") {
      Alert.alert(strings("Mising_Data"), strings("Plese_add_address"));
      return;
    }
    this.setState({ addingAddress: true });
    let address = {
      name: this.state.addressName,
      value: this.state.newAddressValue,
    };

    let addresses = this.props.userData.addresses
      ? this.props.userData.addresses
      : [];

    if (this.state.isEditAddress) {
      addresses[this.state.addressIndex] = address
    } else {
      addresses = [
        ...addresses,
        address,
      ];
    }
    console.log("addresses:", addresses)

    addAddress(this.props.userData.id, addresses)
      .then((res) => {
        let data = { ...this.props.userData, addresses: addresses };

        this.props.setUser(data);
        new MyStorage().setUserData(JSON.stringify(data));
        this.setState({
          addingAddress: false,
          addModal: false,
          addressName: "",
          newAddressValue: "",
        });
      })
      .catch((err) => {
        Alert.alert(strings("Error"), strings("Error_Something_went"));
        this.setState({ addingAddress: false });
      });
  };
  // Showing Modal for adding Address
  renderAdd_Address = () => {
    return (
      <View>
        <Modal
          style={{ margin: 0 }}
          animationType="slide"
          transparent={true}
          isVisible={this.state.addModal}
          onRequestClose={() => {
            this.setState({ addModal: !this.state.addModal });
          }}>

          <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
            <View style={{ flex: 1, backgroundColor: "white" }}>
              <View
                style={{
                  flex: 0.35,
                  justifyContent: "flex-end",
                  // backgroundColor: "red",
                  // paddingBottom: verticalScale(6),
                }}
              >
                <Text
                  style={{
                    fontSize: scale(18),
                    fontFamily: "Poppins-SemiBold",
                    color: mainColor,
                    alignSelf: "center",
                    textAlign: "center",
                  }}
                >
                  {!this.state.isEditAddress ? strings("Add_Address") : strings("Edit_Address")}
                </Text>
              </View>
              <View style={{ flex: 3, justifyContent: "center" }}>
                <KeyboardAwareScrollView keyboardShouldPersistTaps="always">
                  {/* <Form> */}
                  <View margin={scale(10)}>
                    <View marginTop={0} height={verticalScale(5)} />
                    <Text style={{ fontSize: scale(12), color: "#B5B5B5", fontFamily: "Poppins-SemiBold" }}>
                      {strings("Name")}
                    </Text>
                    <View marginTop={0} height={verticalScale(5)} />
                    <View height={verticalScale(35)} backgroundColor="#F4F4F4" borderRadius={5}>
                      <TextInput
                        style={{ height: verticalScale(35), includeFontPadding: false, color: "#242424", paddingLeft: scale(5) }}
                        placeholder={strings("Name")}
                        value={this.state.addressName}
                        onChangeText={(addressName) => this.setState({ addressName: addressName })}
                        fontSize={scale(13)}
                        returnKeyType='done'
                        autoCorrect={false}
                        fontFamily="Poppins-SemiBold"
                      />
                    </View>
                  </View>


                  <View margin={scale(10)}>
                    <View marginTop={0} height={verticalScale(5)} />
                    <Text style={{ fontSize: scale(12), color: "#B5B5B5", fontFamily: "Poppins-SemiBold" }}>
                      {strings("Address")}
                    </Text>
                    <View marginTop={0} height={verticalScale(5)} />
                    <View backgroundColor="#F4F4F4" borderRadius={5}>
                      <GooglePlacesAutocomplete
                        placeholder={!this.state.isEditAddress ? strings("Search_Location") : this.state.newAddressValue.name}
                        onPress={(data, details = null) => {
                          // 'details' is provided when fetchDetails = true
                          console.log("details", details.formatted_address);
                          let newAddressData = {
                            latitude: details.geometry.location.lat,
                            longitude: details.geometry.location.lng,
                            name: details.formatted_address
                          };

                          let initialRegion = {
                            latitude: details.geometry.location.lat,
                            longitude: details.geometry.location.lng,
                            latitudeDelta: 0.0922,
                            longitudeDelta: 0.0421,
                          };
                          this.setState({
                            newAddressValue: newAddressData,
                            latitude: details.geometry.location.lat,
                            longitude: details.geometry.location.lng,
                            name: details.name,
                            initialRegion: initialRegion,
                          });
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
                            margin: (Dimensions.get('window').width) > 375 || (Dimensions.get('window').height) > 675 ? verticalScale(4) : 0,
                          },
                          textInput: {
                            marginTop: 5,
                            marginBottom: 5,
                            includeFontPadding: false,
                            marginLeft: -5,
                            color: "#242424",
                            fontSize: scale(14),
                            borderColor: "transparent",
                            borderWidth: 0.5,
                            backgroundColor: "transparent",
                            fontFamily: "Poppins-SemiBold",
                            height: 35,
                            // backgroundColor: "red"
                          },
                          listView: {
                            backgroundColor: "lightgray",
                          },
                        }}
                      />
                    </View>
                    <View marginTop={0} height={verticalScale(5)} />
                  </View>
                  {/* </Form> */}
                </KeyboardAwareScrollView>
              </View>

              <View
                style={{
                  flex: 1,
                  marginHorizontal: scale(12),
                  justifyContent: "center",
                }}>
                <View marginTop={0} height={verticalScale(10)} />
                <View style={{ justifyContent: "center" }}>
                  <Button
                    full
                    onPress={() => {
                      this.handleAddAddress();
                    }}
                    disabled={this.state.addingAddress}
                    style={{ backgroundColor: mainColor, borderRadius: 5, height: verticalScale(35) }}>
                    {this.state.addingAddress ? (
                      <ActivityIndicator color="white" size="small" />
                    ) : (
                      <Text
                        style={{
                          fontSize: scale(16),
                          color: "white",
                          fontFamily: "Poppins-SemiBold"
                        }}>
                        {!this.state.isEditAddress ? strings("Add_Address") : strings("Edit_Address")}
                      </Text>
                    )}
                  </Button>
                </View>
                <View marginTop={0} height={verticalScale(10)} />
                <View style={{ justifyContent: "center" }}>
                  <Button
                    full
                    onPress={() => {
                      this.setState({
                        addModal: false,
                        isEditAddress: false,
                        addressName: ""
                      });
                    }}
                    disabled={this.state.addingAddress}
                    style={{
                      backgroundColor: "white",
                      borderRadius: 5,
                      borderWidth: 1,
                      borderColor: "#B5B5B5",
                      height: verticalScale(35)
                    }}>
                    <Text
                      style={{ fontSize: scale(14), color: "#B5B5B5", fontFamily: "Poppins-SemiBold" }}>
                      {strings("Cancel")}
                    </Text>
                  </Button>
                </View>
                <View marginTop={0} height={verticalScale(10)} />
              </View>
            </View>
          </TouchableWithoutFeedback>
        </Modal>
      </View >
    );
  };
  //   modal appear whent the use upload new profile picture
  _renderImageUploadModal = () => {
    return (
      <Modal
        animationType="slide"
        transparent={true}
        isVisible={this.state.uploading}>
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center"
          }}>
          <View height={200} width={200} justifyContent="center" alignItems="center" backgroundColor="rgba(0,0,0,0.5)" borderRadius={10}>
            <ActivityIndicator color="white" size="large" />
            {this.state.isUploadImages ? <Text style={{ color: "white", textAlign: "center", fontFamily: "Poppins-Regular", fontSize: scale(14) }}>
              {strings("Uploading_picture")}
            </Text> : <Text style={{ color: "white", textAlign: "center", fontFamily: "Poppins-Regular", fontSize: scale(14) }}>
              {strings("Uploading_profile_picture")}
            </Text>}
          </View>
        </View>
      </Modal>
    );
  };
  _renderVideoUploadModal = () => {
    return (
      <Modal
        animationType="slide"
        transparent={true}
        isVisible={this.state.uploadingVideo}>
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
          }}>
          <View height={200} width={200} justifyContent="center" alignItems="center" backgroundColor="rgba(0,0,0,0.5)" borderRadius={10}>
            <ActivityIndicator color="white" size="large" />
            <Text style={{ color: "white", textAlign: "center", fontFamily: "Poppins-Regular", fontSize: scale(14) }}>
              {strings("Uploading_Video")}
            </Text>
          </View>
        </View>
      </Modal>
    );
  };
  _renderDeleteModal = () => {
    return (
      <Modal
        animationType="slide"
        transparent={true}
        isVisible={this.state.deleting}>
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
          }}>
          <View height={200} width={200} justifyContent="center" alignItems="center" backgroundColor="rgba(0,0,0,0.5)" borderRadius={10}>
            <ActivityIndicator color="white" size="large" />
            <Text style={{ color: "white", textAlign: "center", fontFamily: "Poppins-Regular", fontSize: scale(14) }}>
              {strings("Deleting")}
            </Text>
          </View>
        </View>
      </Modal>
    );
  };
  // Showing Modal for adding Address
  handlePassword = () => {
    // var reg = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/;
    if (this.state.Password === "") {
      Alert.alert(strings("Password_Error"), strings("enter_Password"));
      return;
    }
    if (this.state.ConfirmPassword === "") {
      Alert.alert(strings("Password_Error"), strings("enter_confirmPassword"));
      return;
    }
    if (this.state.ConfirmPassword != this.state.Password) {
      Alert.alert(strings("Password_Error"), strings("password_diff"));
      return;
    }
    if (this.state.Password.length < 6) {
      Alert.alert(
        strings("Password_Error"),
        strings("Password_digit")
      );
      return;
    }
    this.setState({ processing: true });
    this.changePassword("", this.state.Password)
  }
  setPasswordsucess() {
    this.handleLogout()
    this.setState({ processing: false, ischangePassword: false, Password: "", ConfirmPassword: "" });
  }
  changePassword = (currentPassword, newPassword) => {
    var user = auth().currentUser;
    user.updatePassword(newPassword).then(() => {
      Alert.alert(
        strings("Set_Password"),
        strings("Password_reset"),
        [
          { text: strings("OK"), onPress: () => this.setPasswordsucess() },
        ],
        { cancelable: false })
    }).catch((error) => {
      this.setState({ processing: false, Password: "", ConfirmPassword: "" });
      Alert.alert(strings("Error"), strings("Error_Something_went"));
    });
  }
  render_CHANGEPASSWORD = () => {
    return (
      <Modal
        style={{ margin: 0 }}
        animationType="slide"
        transparent={true}
        isVisible={this.state.ischangePassword}
        onRequestClose={() => {
          this.setState({ ischangePassword: !this.state.ischangePassword });
        }}>
        <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
          <View style={{ flex: 1, backgroundColor: "white" }}>
            <View
              style={{
                flex: 0.35,
                justifyContent: "flex-end",
                // backgroundColor: "red",
                // paddingBottom: verticalScale(6),
              }}>
              <Text
                style={{
                  fontSize: scale(18),
                  color: mainColor,
                  alignSelf: "center",
                  textAlign: "center",
                  fontFamily: "Poppins-SemiBold"
                }}>
                {strings("Password")}
              </Text>
            </View>
            <View style={{ flex: 3, justifyContent: "center" }}>
              <KeyboardAwareScrollView keyboardShouldPersistTaps="always">
                <View margin={scale(10)}>
                  <View marginTop={0} height={verticalScale(5)} />
                  <Text style={{ fontSize: scale(12), color: "#B5B5B5", fontFamily: "Poppins-SemiBold" }}>
                    {strings("New_password")}
                  </Text>
                  <View marginTop={0} height={verticalScale(5)} />
                  <View height={verticalScale(35)} backgroundColor="#F4F4F4" borderRadius={5}>
                    <TextInput
                      style={{ height: verticalScale(35), includeFontPadding: false, color: "#242424", paddingLeft: scale(5) }}
                      placeholder={strings("Enter_New_password")}
                      value={this.state.Password}
                      onChangeText={(Password) => this.setState({ Password: Password })}
                      fontSize={scale(13)}
                      returnKeyType='done'
                      autoCorrect={false}
                      secureTextEntry={true}
                      fontFamily="Poppins-SemiBold"
                    />
                  </View>
                </View>

                <View margin={scale(10)}>
                  <View marginTop={0} height={verticalScale(5)} />
                  <Text style={{ fontSize: scale(12), color: "#B5B5B5", fontFamily: "Poppins-SemiBold" }}>
                    {strings("Repeat_New_password")}
                  </Text>
                  <View marginTop={0} height={verticalScale(5)} />
                  <View height={verticalScale(35)} backgroundColor="#F4F4F4" borderRadius={5}>
                    <TextInput
                      style={{ height: verticalScale(35), includeFontPadding: false, color: "#242424", paddingLeft: scale(5) }}
                      placeholder={strings("enter_repeat_pass")}
                      value={this.state.ConfirmPassword}
                      onChangeText={(ConfirmPassword) => this.setState({ ConfirmPassword: ConfirmPassword })}
                      fontSize={scale(13)}
                      returnKeyType='done'
                      autoCorrect={false}
                      secureTextEntry={true}
                      fontFamily="Poppins-SemiBold" />
                  </View>
                </View>
              </KeyboardAwareScrollView>
            </View>
            <View
              style={{
                flex: 1,
                marginHorizontal: scale(12),
                justifyContent: "center",
              }}>
              <View marginTop={0} height={verticalScale(10)} />
              <View style={{ justifyContent: "center" }}>
                <Button
                  full
                  onPress={() => {
                    this.handlePassword();
                  }}
                  style={{
                    backgroundColor: mainColor,
                    borderRadius: 5,
                    height: verticalScale(35)
                  }}>
                  {this.state.processing ? (
                    <ActivityIndicator color="white" size="small" />
                  ) : (
                    <Text
                      style={{
                        fontSize: scale(16),
                        color: "white",
                        fontFamily: "Poppins-SemiBold"
                      }}>
                      {strings("Change_password")}
                    </Text>
                  )}
                </Button>
              </View>
              <View marginTop={0} height={verticalScale(10)} />
              <View style={{ justifyContent: "center" }}>
                <Button
                  full
                  onPress={() => {
                    this.setState({
                      ischangePassword: false,
                    })
                  }}
                  disabled={this.state.addingAddress}
                  style={{
                    backgroundColor: "white",
                    borderRadius: 5,
                    borderWidth: 1,
                    borderColor: "#B5B5B5",
                    height: verticalScale(35)
                  }}>
                  <Text
                    style={{ fontSize: scale(16), color: "#B5B5B5", fontFamily: "Poppins-SemiBold" }}>
                    {strings("Cancel")}
                  </Text>
                </Button>
              </View>
              <View marginTop={0} height={verticalScale(10)} />
            </View>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    );
  };
  componentWillMount() {
    this.subs = [
      this.props.navigation.addListener("didFocus", this.componentDidFocus),
    ];
  }
  componentWillUnmount() {
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
        this.SuccessPayment_call(info);
      };
      Purchases.addPurchaserInfoUpdateListener(this.purchaserInfoUpdateListener);
      this.GetPurhcaseInfo()
      this.GetPurhcaseInfo_call()


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
  };
  //uploading video function
  handleAddVideo = () => {
    if (!this.state.isInternetAvilable) {
      Alert.alert(strings("Internet_Error"), strings("Internet_Error_Message"));
      return;
    }
    
    this.setState({ showVideoPicker: true })

  };

  showRemoveVideoAlert(value) {
    Alert.alert(strings("Delete_Video"),
      strings("delete_video_msg"),
      [
        {
          text: strings("No"),
          style: "cancel"
        },
        {
          text: strings("Yes"),
          onPress: () => {
            this.deleteVideo(value)
          }
        }
      ])
  }
  showRemoveImageAlert(value) {
    Alert.alert(strings("Delete_Picture"),
      strings("delete_picture_msg"),
      [
        {
          text: strings("No"),
          style: "cancel"
        },
        {
          text: strings("Yes"),
          onPress: () => {
            this.deletePicture(value)
          }
        }
      ])
  }
  deleteVideo(value) {
    this.setState({ deleting: true });
    deleteVideo(value, (status, videoUrl) => {
      if (status) {
        let videos = this.props.userData.videos
        var index = videos.indexOf(videoUrl)
        if (videos) {
          if (index !== -1) {
            videos.splice(index, 1);
          }
        } else {
          videos = []
        }
        let data = this.props.userData;
        data = { ...data, videos: videos };
        addVideo(this.props.userData.id, videos)
          .then((res) => {
            this.props.setUser(data);
            new MyStorage().setUserData(JSON.stringify(data));
            this.setState({ deleting: false });
          })
          .catch((err) => {
            this.setState({ deleting: false });
            Alert.alert(strings("Error"), strings("Error_Something_went"));
          });
      } else {
        this.setState({ deleting: false });
        Alert.alert(strings("Error"), strings("Error_Something_went"));
      }
    });
  }
  deletePicture(value) {
    this.setState({ deleting: true });
    let images = this.props.userData.images
    var index = images.indexOf(value)

    if (images) {
      if (index !== -1) {
        images.splice(index, 1);
      }
    } else {
      images = []
    }
    let data = this.props.userData;
    data = { ...data, images: images };


    addImages(this.props.userData.id, images)
      .then((res) => {
        this.props.setUser(data);
        new MyStorage().setUserData(JSON.stringify(data));
        this.setState({ deleting: false });
      })
      .catch((err) => {
        this.setState({ deleting: false });
        Alert.alert(strings("Error"), strings("Error_Something_went"));
      });
  }
  ViewImage(item) {
    this.setState({
      isopenimage: true,
      selectedImage: item
    })
  }

  uploadVideo(value) {
    this.setState({ uploadingVideo: true });
    const ext = value.split(".").pop(); // Extract image extension
    const filename = `${uuidv4()}.${ext}`;
    uploadVideo(value, filename, (status, videoUrl) => {
      if (status) {
        let videos = this.props.userData.videos
          ? [...this.props.userData.videos, videoUrl]
          : [videoUrl];
        let data = this.props.userData;
        data = { ...data, videos: videos };
        addVideo(this.props.userData.id, videos)
          .then((res) => {
            this.props.setUser(data);
            new MyStorage().setUserData(JSON.stringify(data));
            this.setState({ uploadingVideo: false });
          })
          .catch((err) => {
            this.setState({ uploadingVideo: false });
            Alert.alert(strings("Error"), strings("Error_Something_went"));
          });
      } else {
        this.setState({ uploadingVideo: false });
        Alert.alert(strings("Error"), strings("Error_Something_went"));
      }
    });
  }
  //   uploading image function
  handlePictureUpload = () => {
    if (!this.state.isInternetAvilable) {
      Alert.alert(strings("Internet_Error"), strings("Internet_Error_Message"));
      return;
    }
    
    this.setState({ showImagePicker: true })

  };
  //   function for open modal
  openModal = (item) => {
    this.setState({
      videoUrlData: item,
      showVideoModal: true,
    });
  };
  //   Showing Video player modal
  showVideoModal = () => {
    return (
      <Modal
        style={{
          alignSelf: "center",
          maxHeight: "100%",
          marginHorizontal: scale(5),
        }}
        width="auto"
        height="100%"
        transparent={true}
        animationInTiming={500}
        animationOutTiming={500}
        isVisible={this.state.showVideoModal}>
        <View
          style={{
            // flex: 1,
            height: "94%",
            backgroundColor: "white",
            borderRadius: 10
          }}>
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
            }}>
            <View style={{ flex: 0.2 }}></View>
            <View
              style={{
                flex: 1,
                justifyContent: "flex-end",
                alignItems: "center",
              }}>
              <Text
                style={{
                  fontSize: scale(18),
                  fontFamily: "Poppins-SemiBold",
                  color: "white",
                  alignSelf: "center",
                  paddingHorizontal: scale(32),
                  textAlign: "center",
                }}>
                {strings("VIDEO_PLAYER")}
              </Text>
            </View>
            <View
              style={{
                flex: 0.2,
                justifyContent: "flex-end",
                alignItems: "center",
                marginTop: 5
              }}>
              <Icon
                onPress={() => {
                  this.setState({
                    showVideoModal: false,
                  });
                }}
                type="feather"
                size={25}
                name="x"
                style={{ color: "white" }}
              />
            </View>
          </View>
          <View style={{ flex: 3 }}>
            {Platform.OS == "android" ? <VideoPlayer videoUrl={this.state.videoUrlData} /> : <VideoPlayerNew videoUrl={this.state.videoUrlData} />}
          </View>
        </View>
      </Modal>
    );
  };
  handleLogout = () => {
    new MyStorage().setUserData(JSON.stringify(null));
    new MyStorage().clearStorage();
    // Purchases.reset()
    // this.props.navigation.navigate("Login");
    const resetAction = StackActions.reset({
      index: 0,
      actions: [NavigationActions.navigate({ routeName: 'Login' })],
    });
    this.props.navigation.dispatch(resetAction)
  };
  ChangePassword = () => {
    this.setState({
      ischangePassword: true,
    });
  };
  //   showing all videos modal
  renderVideos = ({ item, index }) => {
    if (item.plusImage) {
      return (
        <TouchableOpacity
          onPress={() => {
            this.handleAddVideo();
          }}
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            paddingRight: scale(12),
          }}>
          <View
            style={{
              justifyContent: "center",
              alignItems: "center", height: scale(75), width: scale(75), backgroundColor: mainColor, margin: 5, borderRadius: 10, ...Platform.select({
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
            <Icon name="plus" type="Feather" size={scale(30)} style={{ color: "white" }} />
            <Text style={{ fontSize: scale(14), color: "white", fontFamily: "Poppins-SemiBold" }}>
              {strings("ADD")}
            </Text>
          </View>
        </TouchableOpacity>
      );
    }
    else {
      return (
        <TouchableOpacity
          onPress={() => {
            this.openModal(item);
          }}
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            paddingRight: scale(12),
          }}>
          <View
            style={{
              backgroundColor: "white", margin: 5, borderRadius: 10, ...Platform.select({
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
            <Image
              style={{ height: scale(75), width: scale(100), tintColor: "#B5B5B5" }}
              resizeMode={"contain"}
              source={Play} />
            <Icon
              onPress={() => {
                this.showRemoveVideoAlert(item)
              }}
              type="feather"
              size={scale(15)}
              name="x"
              style={{ position: "absolute", alignSelf: "flex-end", color: "#B5B5B5" }} />
          </View>
        </TouchableOpacity>
      );
    }
  };
  renderImages = ({ item, index }) => {
    if (item.plusImage) {
      return (
        <TouchableOpacity
          onPress={() => {
          }}
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            paddingRight: scale(12),
          }}>
          <View
            style={{
              justifyContent: "center",
              alignItems: "center", height: scale(75), width: scale(75), backgroundColor: mainColor, margin: 5, borderRadius: 10, ...Platform.select({
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
            <Icon name="plus" type="Feather" size={scale(30)} style={{ color: "white" }} onPress={() => {
              this.setState({
                isUploadImages: true
              })
              this.handlePictureUpload();
            }} />
            <Text style={{ fontSize: scale(14), color: "white", fontFamily: "Poppins-SemiBold" }}>
              {strings("ADD")}
            </Text>
          </View>
        </TouchableOpacity>
      );
    }
    else {
      return (
        <TouchableOpacity
          onPress={() => {
            this.ViewImage(item)
          }}
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            paddingRight: scale(12),
          }}>
          <View
            style={{
              backgroundColor: "white", margin: 5, borderRadius: 10, ...Platform.select({
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
            <ImageBackground
              style={{
                height: scale(75), width: scale(75)
              }}
              imageStyle={{ borderRadius: 10 }}
              resizeMode={"cover"}
              source={
                require('../../assets/icon.png')
              }>
              <Image
                resizeMode={"cover"}
                style={{
                  height: scale(75), width: scale(75), borderRadius: 10, ...Platform.select({
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
                source={{ uri: item }}
              />
            </ImageBackground>
            <Icon
              onPress={() => {
                this.showRemoveImageAlert(item)
              }}
              type="feather"
              size={scale(15)}
              name="x"
              style={{ position: "absolute", alignSelf: "flex-end", color: "#B5B5B5" }}
            />
          </View>
        </TouchableOpacity>
      );
    }
  };
  showRemoveServiceAlert(index) {
    Alert.alert(strings("Delete_Service"),
      strings("delete_services"),
      [
        {
          text: strings("No"),
          style: "cancel"
        },
        {
          text: strings("Yes"),
          onPress: () => {
            this.removeService(index)
          }
        }
      ])
  }
  removeService(index) {
    this.setState({ deleting: true })
    let categories = this.props.userData.services ? this.props.userData.services : [];
    categories.splice(index, 1)
    this.refreshCategories(categories)
  }
  refreshCategories(services) {
    addService(this.props.userData.id, services)
      .then((res) => {
        services.map((value) => {
          addToCategory(this.props.userData.id, value.categoryId);
        })
        this.setState({ proCategories: services })
        let data = this.props.userData;
        data = { ...data, services };
        this.props.setUser(data);
        new MyStorage().setUserData(JSON.stringify(data));
        this.setState({ deleting: false })
      })
      .catch((err) => {
        Alert.alert(strings("Error"), strings("Error_Something_went"));
        this.setState({ deleting: false })
        console.log("error in refreshing service is: ", err);
      });
  }
  showEditNameDialog = () => {
    return (
      <Modal
        animationType="slide"
        transparent={true}
        isVisible={this.state.editNameDialog}>
        <View
          style={{
            flex: 1,
            justifyContent: "center",
          }}>
          <Form style={{ backgroundColor: "white", padding: 15, borderRadius: 10 }}>
            <Text style={{ fontSize: scale(18), color: mainColor, fontFamily: "Poppins-SemiBold", textAlign: "center" }}>{strings("Enter_your_name")}</Text>
            <View marginTop={0} height={verticalScale(10)} />
            <View>
              <View height={verticalScale(35)} backgroundColor="#F4F4F4" borderRadius={5}>
                <TextInput
                  style={{ height: verticalScale(35), includeFontPadding: false, color: "#242424", paddingLeft: scale(5) }}
                  placeholder={strings("Enter_your_name")}
                  value={this.state.newName}
                  onChangeText={(newName) => this.setState({ newName: newName })}
                  fontSize={scale(13)}
                  returnKeyType='done'
                  autoCorrect={false}
                  fontFamily="Poppins-SemiBold"
                />
              </View>
              <View marginTop={0} height={verticalScale(10)} />
            </View>
            <View
              style={{
                // flexDirection: "row",
                height: verticalScale(90),
                marginTop: 10,
                justifyContent: "center",
                alignItems: "center",
                // backgroundColor: "red"
              }}>
              <Button
                full
                style={{ backgroundColor: mainColor, borderRadius: 5, height: verticalScale(35) }}
                onPress={() => {
                  if (this.state.newName !== "") {
                    this.setState({
                      editNameDialog: false
                    }, () => this.editProviderName());
                  } else {
                    Alert.alert(strings("enter_name"))
                  }
                }}>
                <Text
                  style={{ fontSize: scale(16), fontFamily: "Poppins-SemiBold", color: "white" }}>
                  {strings("Submit")}
                </Text>
              </Button>
              <View height={verticalScale(10)} />
              <Button
                full
                style={{
                  backgroundColor: "white",
                  borderRadius: 5,
                  borderWidth: 1,
                  borderColor: "#B5B5B5",
                  height: verticalScale(35)
                }}
                onPress={() => {
                  this.setState({
                    // newName: "",
                    editNameDialog: false
                  });
                }}>
                <Text style={{ fontSize: scale(14), fontFamily: "Poppins-SemiBold", color: "#B5B5B5" }}>{strings("Cancel")}</Text>
              </Button>
            </View>
          </Form>
          {/* </KeyboardAwareScrollView> */}
        </View>
      </Modal>
    )
  }
  editProviderName() {
    updateProviderName(this.props.userData.id, this.state.newName)
      .then((res) => {
        let _data = { ...this.props.userData, name: this.state.newName };
        this.props.setUser(_data);
        new MyStorage().setUserData(JSON.stringify(_data));
      })
      .catch((err) => {
        Alert.alert(strings("Error"), strings("Error_Something_went"));
      });
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
  UpdateProviderSubcriptionDate_call(date) {
    var newdate = date;
    if (date == "") {
      newdate = new Date();
      newdate.setDate(newdate.getDate() - 1);
    }
    updateProviderSubscriptionDate_call(this.props.userData.id, newdate)
      .then((res) => {
        let _data = { ...this.props.userData, Expirydate_call: newdate };
        this.props.setUser(_data);
        new MyStorage().setUserData(JSON.stringify(_data));
      })
      .catch((err) => {
        Alert.alert(strings("Error"), strings("Error_Something_went"));
      });
  }
  showEditSkillDetailsDialog = () => {
    return (
      <View>
        <Modal
          style={{ margin: 0 }}
          animationType="slide"
          transparent={true}
          isVisible={this.state.editSkillDetailsDialog}
          onRequestClose={() => {
            this.setState({ addModal: !this.state.editSkillDetailsDialog });
          }}>
          <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
            <View style={{ flex: 1, backgroundColor: "white" }}>
              <View
                style={{
                  flex: 0.35,
                  justifyContent: "flex-end",
                }}>
                <Text
                  style={{
                    fontSize: scale(18),
                    fontWeight: "500",
                    color: mainColor,
                    alignSelf: "center",
                    textAlign: "center",
                    fontFamily: "Poppins-SemiBold"
                  }}>
                  {strings("Skills")}
                </Text>
              </View>
              <View style={{ flex: 3, justifyContent: "center" }}>
                <KeyboardAwareScrollView keyboardShouldPersistTaps="always">
                  <View margin={scale(10)}>
                    <View marginTop={0} height={verticalScale(5)} />
                    <Text style={{ fontSize: scale(12), color: "#B5B5B5", fontFamily: "Poppins-SemiBold" }}>
                      {strings("Skills")}
                    </Text>
                    <View marginTop={0} height={verticalScale(5)} />
                    <View>
                      <Textarea
                        style={{ fontSize: scale(14), fontFamily: "Poppins-Light", borderRadius: 5, color: "#242424", borderColor: "#B5B5B5", borderWidth: 1 }}
                        maxLength={500}
                        rowSpan={10}
                        value={this.state.newSkillDetails}
                        bordered
                        placeholder={strings("Enter_skills")}
                        placeholderTextColor={"#B5B5B5"}
                        onChangeText={(newSkillDetails) => {
                          this.setState({ newSkillDetails: newSkillDetails })
                        }}
                      />
                    </View>
                  </View>
                </KeyboardAwareScrollView>
              </View>
              <View
                style={{
                  flex: 1,
                  marginHorizontal: scale(12),
                  justifyContent: "center",
                }}>
                <View marginTop={0} height={verticalScale(10)} />
                <View style={{ justifyContent: "center" }}>
                  <Button
                    full
                    onPress={() => {
                      if (this.state.newSkillDetails.trim() !== "") {
                        this.setState({
                          editSkillDetailsDialog: false
                        }, () => this.editSkillDetails());
                      } else {
                        Alert.alert("Missing Data", "Please enter your Skill Details!");
                      }
                    }}
                    style={{
                      backgroundColor: mainColor,
                      borderRadius: 5,
                      height: verticalScale(35)
                    }}>
                    {this.state.processing ? (
                      <ActivityIndicator color="white" size="small" />
                    ) : (
                      <Text
                        style={{
                          fontSize: scale(16),
                          color: "white",
                          fontFamily: "Poppins-SemiBold"
                        }}>
                        {strings("Submit")}
                      </Text>
                    )}
                  </Button>
                </View>
                <View marginTop={0} height={verticalScale(10)} />
                <View style={{ justifyContent: "center" }}>
                  <Button
                    full
                    onPress={() => {
                      this.setState({
                        newSkillDetails: "",
                        editSkillDetailsDialog: false
                      });
                    }}
                    disabled={this.state.addingAddress}
                    style={{
                      backgroundColor: "white",
                      borderRadius: 5,
                      borderWidth: 1,
                      borderColor: "#B5B5B5",
                      height: verticalScale(35)
                    }}>
                    <Text
                      style={{ fontSize: scale(14), color: "#B5B5B5", fontFamily: "Poppins-SemiBold" }}>
                      {strings("Cancel")}
                    </Text>
                  </Button>
                </View>
                <View marginTop={0} height={verticalScale(10)} />
              </View>
            </View>
          </TouchableWithoutFeedback>
        </Modal>
      </View>
    );
  };
  showEditSkillDetailsDialog1 = () => {
    return (
      <Modal
        animationType="slide"
        transparent={true}
        isVisible={this.state.editSkillDetailsDialog}>
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            // padding: 10,
            // backgroundColor: "rgba(0, 0, 0, 0.5)",
          }}
        >
          {/* <KeyboardAwareScrollView keyboardShouldPersistTaps="always"> */}
          <Form style={{ backgroundColor: "white", padding: 15, borderRadius: 10 }}>
            <Text style={{ fontSize: 22, }}>{strings("enter_skills")}</Text>
            <FormItem
              floatingLabel
              style={{
                borderBottomColor: "gray",
                marginBottom: 12,
                marginRight: scale(12),
              }}>
              {/* <Label style={{ fontSize: 15, color: "black" }}>Skill Details</Label> */}
              <Input
                multiline
                maxLength={500}
                onChangeText={(name) =>
                  this.setState({ newSkillDetails: name })
                }
                value={this.state.newSkillDetails}
              />
            </FormItem>
            <View
              style={{
                flexDirection: "row",
                height: 50,
                marginTop: 10,
                justifyContent: "center",
              }}>
              <Button
                full
                style={{ backgroundColor: mainColor, flex: 1, borderRadius: scale(5) }}
                onPress={() => {
                  if (this.state.newSkillDetails.trim() !== "") {
                    this.setState({
                      editSkillDetailsDialog: false
                    }, () => this.editSkillDetails());
                  } else {
                    Alert.alert(strings("enter_skills1"))
                  }
                }}>
                <Text
                  style={{ fontSize: 14, fontWeight: "600", color: "white" }}>
                  {strings("Submit")}
                </Text>
              </Button>
              <View width={10} />
              <Button
                full
                style={{ backgroundColor: mainColor, flex: 1, borderRadius: scale(5) }}
                onPress={() => {
                  this.setState({
                    newSkillDetails: "",
                    editSkillDetailsDialog: false
                  });
                }}>
                <Text
                  style={{ fontSize: 14, fontWeight: "600", color: "white" }}>
                  {strings("Cancel")}
                </Text>
              </Button>
            </View>
          </Form>
          {/* </KeyboardAwareScrollView> */}
        </View>
      </Modal>
    )
  }
  editSkillDetails() {
    this.props.userData.skills.details
    let skills = this.props.userData.skills
    skills.details = this.state.newSkillDetails
    updateProviderSkills(this.props.userData.id, skills)
      .then((res) => {
        let _data = { ...this.props.userData, skills };
        this.props.setUser(_data);
        new MyStorage().setUserData(JSON.stringify(_data));
      })
      .catch((err) => {
        Alert.alert(strings("Error"), strings("Error_Something_went"));
      });
  }
  restorePurchase = async () => {
    try {
      this.setState({ Loading: true })
      const info = await Purchases.restoreTransactions();
      this.handleInfo(info);
    } catch (e) {
      this.setState({ Loading: false })
      // eslint-disable-next-line no-console
      console.log(JSON.stringify(e));
    }
  }
  handleInfo(info) {
    this.setState({ Loading: false })
    const isPro = typeof info.entitlements.active.chat !== "undefined";
    if (isPro) {
      this.GetPurhcaseInfo()
    }
    else {
      // this.UpdateProviderSubcriptionDate("")
      // Alert.alert(strings("Error"), strings("Error_Something_went"));
    }
  }
  GetPurhcaseInfo = async () => {
    let purchaserInfo = await Purchases.getPurchaserInfo();
    if (typeof purchaserInfo.entitlements.active.chat !== "undefined") {
      this.setState({
        isRestore: false,
        PlanActive: true
      })
      this.UpdateProviderSubcriptionDate(purchaserInfo.entitlements.active.chat.expirationDate)
    }
    else {
      this.setState({
        isRestore: true,
        PlanActive: false
      })
      // this.UpdateProviderSubcriptionDate("")
    }
  }
  GetPurhcaseInfo_call = async () => {
    let purchaserInfo = await Purchases.getPurchaserInfo();
    if (typeof purchaserInfo.entitlements.active.call !== "undefined") {
      this.setState({
        isPayment_call: false,
        PlanActive_call: true
      })
      this.UpdateProviderSubcriptionDate_call(purchaserInfo.entitlements.active.call.expirationDate)
    }
    else {
      this.setState({
        PlanActive_call: false
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
          // this.handleDataUpload()
        }
      } catch (e) {
        if (!e.userCancelled) {
          Alert.alert(strings("Error"), strings("Error_Something_went"));
        }
        this.setState({ loading: false, isPayment: false })
      }
    }
  }
  MakePayment_call = async () => {
    this.setState({ loading: true })
    let purchaserInfo = await Purchases.getPurchaserInfo();
    if (typeof purchaserInfo.entitlements.active.call !== "undefined") {
      this.setState({ loading: false })
    }
    else {
      try {
        let valuenew = this.state.Offering
        const aPackage = valuenew.all.Default1.monthly;
        const { purchaserInfo, productIdentifier } = await Purchases.purchasePackage(aPackage);
        if (typeof purchaserInfo.entitlements.active.my_entitlement_identifier !== "undefined") {
          this.setState({ loading: false })
        }
      } catch (e) {
        if (!e.userCancelled) {
          Alert.alert(strings("Error"), strings("Error_Something_went"));
        }
        this.setState({ loading: false, isPayment_call: false, })
      }
    }
  }

  SuccessPayment(Info) {
    if (typeof Info.entitlements.active.chat !== "undefined") {
      this.setState({ loading: false, isPayment: false, PlanActive: true, isRestore: false })
      this.UpdateProviderSubcriptionDate(Info.entitlements.active.chat.expirationDate)
    }
    else {
      // this.UpdateProviderSubcriptionDate("")
    }
  }
  SuccessPayment_call(Info) {
    if (typeof Info.entitlements.active.call !== "undefined") {
      this.setState({ loading: false, isPayment_call: false, PlanActive_call: true })
      this.UpdateProviderSubcriptionDate_call(Info.entitlements.active.call.expirationDate)
    }
    else {
      // this.UpdateProviderSubcriptionDate_call("")
    }
  }
  clickTermsandCondition() {
    Linking.canOpenURL("https://yufixit.co/terms-and-conditions-for-yufixit/").then(supported => {
      if (supported) {
        Linking.openURL("https://yufixit.co/terms-and-conditions-for-yufixit/");
      } else {
        console.log("Don't know how to open URI:");
      }
    });
  }
  clickPrivacyPolicy() {
    Linking.canOpenURL("https://yufixit.co/privacy-policy/").then(supported => {
      if (supported) {
        Linking.openURL("https://yufixit.co/privacy-policy/");
      } else {
        console.log("Don't know how to open URI:");
      }
    });
  }
  openSocialeMediaLink(url) {
    Linking.canOpenURL(url).then(supported => {
      if (supported) {
        Linking.openURL(url);
      } else {
        Alert.alert(strings("Valid_link"))
      }
    });
  }

  renderPaymentDataModal = () => {
    return (
      <Modal
        style={{ margin: 0 }}
        animationType="slide"
        transparent={true}
        isVisible={this.state.isPayment}>
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
          }}>
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
              <View style={{ justifyContent: 'center', flex: 0.7 }}>
                <Button
                  full
                  onPress={this.handlePayment}
                  disabled={this.state.loading}
                  style={{
                    backgroundColor: mainColor,
                    borderRadius: 5,
                    margin: scale(6),
                    padding: scale(6),
                    height: verticalScale(35)
                  }}>
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
                  // disabled={this.state.loading}
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
      </Modal >
    );
  };
  renderPaymentDataModal_call = () => {
    return (
      <Modal
        style={{ margin: 0 }}
        animationType="slide"
        transparent={true}
        isVisible={this.state.isPayment_call}>
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
          }}>
          <View height={"100%"} width={"100%"} justifyContent="center" alignItems="center" backgroundColor="white">
            <View style={{ padding: 20 }}>
              <View marginTop={0} height={scale(10)} />
              <Text style={{ fontSize: scale(18), padding: 8, textAlign: "center", justifyContent: "center", color: mainColor, fontFamily: "Poppins-SemiBold" }}>
                {strings("Subscribe")}</Text>
              <View marginTop={0} height={scale(10)} />
              <View flex={3}>
                <ScrollView flex={1}>
                  <Text style={{ fontSize: scale(12), textAlign: "center", color: "#242424", fontFamily: "Poppins-Regular" }}>
                    {strings("Subscription_Title2")}
                  </Text>
                  <View marginTop={0} height={scale(20)} />
                  <View justifyContent="center" alignItems="center">
                    <View height={scale(120)} width={scale(120)} backgroundColor={mainColor} borderRadius={5} justifyContent="center" alignItems="center">
                      <Text style={{ fontSize: scale(30), color: "white", fontFamily: "Poppins-SemiBold" }}>
                        $1.99
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
                          {strings("Text_Chatting1")}
                        </Text>
                      </View>
                    </View>
                  </View>
                </ScrollView>
              </View>
              <View style={{ justifyContent: 'center', flex: 0.7 }}>
                <Button
                  full
                  onPress={this.handlePayment_call}
                  disabled={this.state.loading}
                  style={{
                    backgroundColor: mainColor,
                    borderRadius: 5,
                    margin: scale(6),
                    padding: scale(6),
                    height: verticalScale(35)
                  }}>
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
                    this.handlecancel_callPayment()
                  }}
                  // disabled={this.state.loading}
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
      </Modal >
    );
  };
  handlePayment = () => {
    this.MakePayment(this.state.Offering)
  }
  handlePayment_call = () => {
    this.MakePayment_call()
  }
  handlecancel = () => {
    this.setState({ isPayment: false })
  }
  handlecancel_callPayment = () => {
    this.setState({ isPayment_call: false })
  }
  render() {
    return (
      <View style={{ flex: 1 }}>
        <ImageBackground
          style={{
            flex: 1
          }}
          source={
            require('../../assets/profile_bg.png')
          }>
          <Header
            containerStyle={[{
              alignItems: "center",
              backgroundColor: "clear",
              borderBottomColor: "clear",
              borderBottomWidth: 0,
              height: verticalScale(50)
            }, Platform.OS == "android" ? { paddingTop: 0 } : null]}
            screenOptions={{
              headerStyle: { elevation: 0 }
            }}
            centerComponent={
              <Text style={{ fontSize: scale(15), color: "white", fontFamily: "Poppins-Bold" }}>
                {strings("Profile")}
              </Text>
            }
            rightComponent={
              <View flexDirection="row">
                {this.props.userData.auth == "facebook" || this.props.userData.auth == "google" ? console.log("") :
                  <Icon
                    onPress={() => {
                      this.ChangePassword();
                    }}
                    type="Feather"
                    size={scale(20)}
                    name="key"
                    style={{ color: "white" }}
                  />}
                <Icon
                  onPress={() => {
                    this.showLogoutAlert()
                  }}
                  type="Feather"
                  size={scale(20)}
                  name="log-out"
                  style={{ color: "white", marginLeft: 20 }}
                />
              </View>
            } />
          {this.showVideoModal()}
          {this.renderAdd_Address()}
          {/* {this._renderServiceModal()} */}
          {this.render_CHANGEPASSWORD()}
          {this.showEditSkillDetailsDialog()}
          {this._renderImagePicker()}
          {this._renderVideoPicker()}

          <View marginTop={0} height={verticalScale(20)} />
          <View
            style={{
              // flex: 1,
              backgroundColor: "clear",
              alignItems: "center",
              justifyContent: "center"
            }}>
            <View style={{ alignItems: "center" }}>
              <TouchableOpacity
                onPress={() => {
                  this.setState({
                    isUploadImages: false
                  })
                  this.handlePictureUpload();
                }}>
                <View>
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
                    source={
                      require('../../assets/icon.png')
                    }>
                    {this.props.userData.personalInfo ? <Image
                      style={{
                        height: verticalScale(90), width: verticalScale(90), borderRadius: verticalScale(45), borderColor: "white", borderWidth: verticalScale(2)
                      }}
                      source={{ uri: this.props.userData.personalInfo.profileUrl }}
                    /> : <View></View>}
                  </ImageBackground>
                  {/* {this.props.userData.personalInfo ? <Image defaultSource={require('../../assets/icon.png')} source={{ uri: this.props.userData.personalInfo ? this.props.userData.personalInfo.profileUrl : require('../../assets/icon.png') }} style={{ height: verticalScale(70), width: verticalScale(70), borderRadius: verticalScale(35), borderColor: "white", borderWidth: verticalScale(2) }} />
                  : <Image source={require('../../assets/icon.png')} style={{ height: verticalScale(70), width: verticalScale(70), borderRadius: verticalScale(35), borderColor: "white", borderWidth: verticalScale(2) }} />} */}
                  <View position="absolute" justifyContent="flex-end" alignItems="flex-end" height={"100%"} width={"100%"}>
                    <View height={verticalScale(20)} width={verticalScale(20)} borderRadius={verticalScale(10)} backgroundColor="white" justifyContent="center" alignItems="center" style={{
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
                    }}>
                      <Image source={require('../../assets/edit1.png')} style={{ height: verticalScale(10), width: verticalScale(10) }} />
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
            </View>
            <View marginTop={0} height={verticalScale(10)} />

            {!this.state.PlanActive ? <View flexDirection="row" alignItems="center" justifyContent="center" marginBottom={scale(5)}>
              <View backgroundColor={mainColor} borderRadius={10} width={"45%"} alignItems="center" justifyContent="center">
                <TouchableOpacity flex={1}
                  onPress={() => {
                    this.restorePurchase()
                  }}>
                  <Text
                    numberOfLines={2} ellipsizeMode='tail'
                    style={{
                      fontSize: scale(11),
                      color: "white",
                      margin: 2,
                      textAlign: "center",
                      fontFamily: "Poppins-SemiBold",
                      width: "95%",
                      paddingBottom: scale(5),
                      paddingTop: scale(5)
                    }}>
                    {strings("Restore_Subscription")}
                  </Text></TouchableOpacity>
              </View>
              <View marginLeft={10} backgroundColor="white" borderRadius={10} borderColor={mainColor} borderWidth={1} width={"45%"} alignItems="center" justifyContent="center">
                <TouchableOpacity flex={1}
                  onPress={() => {
                    if (this.state.PlanActive) {
                      Alert.alert(strings("plan_activated"))
                    }
                    else {
                      this.setState({ isPayment: true })
                    }
                  }}>
                  <Text
                    numberOfLines={2} ellipsizeMode='tail'
                    style={{
                      fontSize: scale(11),
                      color: mainColor,
                      margin: 2,
                      textAlign: "center",
                      fontFamily: "Poppins-SemiBold",
                      width: "95%",
                      paddingBottom: scale(5),
                      paddingTop: scale(5)

                    }}>
                    {strings("Purchase_Subcription")}
                  </Text>
                </TouchableOpacity>
              </View>
            </View> : console.log("")}



            {/* {!this.state.PlanActive ? <View flexDirection="row" alignItems="center" justifyContent="center">
              <Button
                full
                onPress={async () => {
                  try {
                    this.setState({ Loading: true })
                    const info = await Purchases.restoreTransactions();
                    this.handleInfo(info);
                  } catch (e) {
                    this.setState({ Loading: false })
                    // eslint-disable-next-line no-console
                    console.log(JSON.stringify(e));
                  }
                }}
                disabled={this.state.Loading}
                style={{
                  backgroundColor: mainColor,
                  borderRadius: 10,
                  borderWidth: 1,
                  borderColor: "white",
                  margin: scale(5),
                  padding: scale(5),
                  // height: verticalScale(60),
                  width: "45%",
                }}
              >
                {this.state.Loading ? (
                  <ActivityIndicator color="white" size="small" />
                ) : (
                  <Text
                    numberOfLines={1} ellipsizeMode='tail'
                    style={{
                      fontSize: scale(11),
                      color: "white",
                      margin: 2,
                      textAlign: "center",
                      fontFamily: "Poppins-SemiBold",
                      width: "95%",
                    }}>
                    {strings("Restore_Subscription")}
                  </Text>
                )}
              </Button>
              <Button
                full
                onPress={async () => {
                  if (this.state.PlanActive) {
                    Alert.alert(strings("plan_activated"))
                  }
                  else {
                    this.setState({ isPayment: true })
                  }
                }}
                // disabled={this.state.Loading}
                style={{
                  backgroundColor: "white",
                  borderRadius: 10,
                  borderWidth: 1,
                  borderColor: mainColor,
                  margin: scale(5),
                  padding: scale(5),
                  // height: verticalScale(60),
                  width: "45%",
                }}>
                <Text
                  numberOfLines={1} ellipsizeMode='tail'
                  style={{
                    fontSize: scale(11),
                    color: mainColor,
                    margin: 2,
                    textAlign: "center",
                    fontFamily: "Poppins-SemiBold",
                    width: "95%",

                  }}>
                  {strings("Purchase_Subcription")}
                </Text>
              </Button>
            </View> : console.log("")} */}



          </View>


          <View style={{ flex: 1.2, paddingHorizontal: scale(12) }}>
            <ScrollView
              showsVerticalScrollIndicator={false}
              showsHorizontalScrollIndicator={false}>
              <View marginTop={0} height={verticalScale(10)} />
              {/* Name Details******** */}
              <View padding={1}>
                <View height={moderateScale(45)} flexDirection="row" justifyContent="space-between" alignItems="center" style={{
                  backgroundColor: "white", padding: 10, borderRadius: 5, ...Platform.select({
                    ios: {
                      shadowColor: 'gray',
                      shadowOffset: { width: 0, height: 1 },
                      shadowOpacity: 0.8,
                      shadowRadius: 1,

                    },
                    android: {
                      elevation: 5,
                    },
                  }),
                }}>
                  <View flex={1}>
                    <Text style={{ fontSize: scale(12), color: "#B5B5B5", fontFamily: "Poppins-SemiBold" }}>
                      {strings("Name")}
                    </Text>
                    <Text style={{ fontSize: scale(12), color: "#242424", fontFamily: "Poppins-SemiBold" }}>
                      {this.props.userData.name}
                    </Text>
                  </View>
                  <TouchableOpacity
                    onPress={() => {
                      this.setState({
                        editNameDialog: true,
                        newName: this.props.userData.name
                      })
                    }}>
                    <View height={verticalScale(16)} width={verticalScale(16)} borderRadius={verticalScale(8)} backgroundColor="#F4F4F4" justifyContent="center" alignItems="center">
                      <Image source={require('../../assets/edit1.png')} style={{ height: verticalScale(8), width: verticalScale(8) }} />
                    </View>
                  </TouchableOpacity>
                </View>
                <View marginTop={0} height={verticalScale(10)} />
                <View height={moderateScale(45)} flexDirection="row" justifyContent="space-between" alignItems="center" style={{
                  backgroundColor: "white", padding: 10, borderRadius: 5, ...Platform.select({
                    ios: {
                      shadowColor: 'gray',
                      shadowOffset: { width: 0, height: 1 },
                      shadowOpacity: 0.8,
                      shadowRadius: 1,
                    },
                    android: {
                      elevation: 5,
                    },
                  }),
                }}>
                  <View flex={1}>
                    <Text style={{ fontSize: scale(12), color: "#B5B5B5", fontFamily: "Poppins-SemiBold" }}>
                      {strings("TEL")}
                    </Text>
                    <Text style={{ fontSize: scale(12), color: "#242424", fontFamily: "Poppins-SemiBold" }}>
                      {this.props.userData.mobileNumber ? this.props.userData.mobileNumber : "N/A"}
                    </Text>
                  </View>

                  {!this.state.PlanActive_call ? <View flex={0.7}>
                    <TouchableOpacity
                      onPress={() => {
                        this.setState({ isPayment_call: true })
                      }}>
                      <View flexDirection="row" height={verticalScale(30)} borderRadius={verticalScale(15)} backgroundColor="#F4F4F4" justifyContent="center" alignItems="center">
                        <Icon active size={15} color="black" name="lock" />
                        <Text style={{ marginLeft: 5, fontSize: scale(10) }}>{strings("Enable_CTC")}</Text>
                      </View>
                    </TouchableOpacity>
                  </View> : console.log("")}

                </View>
                <View marginTop={0} height={verticalScale(10)} />
                <View height={moderateScale(45)} flexDirection="row" justifyContent="space-between" alignItems="center" style={{
                  backgroundColor: "white", padding: 10, borderRadius: 5, ...Platform.select({
                    ios: {
                      shadowColor: 'gray',
                      shadowOffset: { width: 0, height: 1 },
                      shadowOpacity: 0.8,
                      shadowRadius: 1,
                    },
                    android: {
                      elevation: 5,
                    },
                  }),
                }}>
                  <View flex={1}>
                    <Text style={{ fontSize: scale(12), color: "#B5B5B5", fontFamily: "Poppins-SemiBold" }}>
                      {strings("EMAIL")}
                    </Text>
                    <Text style={{ fontSize: scale(12), color: "#242424", fontFamily: "Poppins-SemiBold" }}>
                      {this.props.userData.email}
                    </Text>
                  </View>
                </View>
                <View marginTop={0} height={verticalScale(10)} />
                {this.state.DOB == "" ? console.log("") :
                  <View>
                    <View height={moderateScale(45)} flexDirection="row" justifyContent="space-between" alignItems="center" style={{
                      backgroundColor: "white", padding: 10, borderRadius: 5, ...Platform.select({
                        ios: {
                          shadowColor: 'gray',
                          shadowOffset: { width: 0, height: 1 },
                          shadowOpacity: 0.8,
                          shadowRadius: 1,

                        },
                        android: {
                          elevation: 5,
                        },
                      }),
                    }}>
                      <View flex={1}>
                        <Text style={{ fontSize: scale(12), color: "#B5B5B5", fontFamily: "Poppins-SemiBold" }}>
                          {strings("Birthdate")}
                        </Text>
                        <Text style={{ fontSize: scale(12), color: "#242424", fontFamily: "Poppins-SemiBold" }}>
                          {this.state.DOB}
                        </Text>
                      </View>
                    </View>
                    <View marginTop={0} height={verticalScale(10)} />
                  </View>
                }
                {/* Services******** */}
                <View style={{ flex: 1 }}>
                  <View height={verticalScale(30)} flexDirection="row" justifyContent="space-between" alignItems="center">
                    <Text style={{ fontSize: scale(12), paddingTop: 4, paddingBottom: 4, color: "black", fontFamily: "Poppins-SemiBold" }}>
                      {strings("Services")}
                    </Text>
                    <TouchableOpacity
                      onPress={() => {
                        // this.props.navigation.navigate('CategorySelection', {
                        //   onGoBack: (value) => this.refreshCategories(value),
                        //   selectedCategories: this.props.userData.services
                        // });
                        this.props.navigation.push("CategorySelection", { onGoBack: (value) => this.refreshCategories(value), selectedCategories: this.props.userData.services, Profile: this })
                      }}>
                      <View height={verticalScale(16)} width={verticalScale(16)} borderRadius={verticalScale(8)} backgroundColor="#F4F4F4" justifyContent="center" alignItems="center">
                        <Image source={require('../../assets/edit1.png')} style={{ height: verticalScale(8), width: verticalScale(8) }} />
                      </View>
                    </TouchableOpacity>
                    {/* <Icon name="edit" type="Feather" size={scale(15)} style={{ color: "#B5B5B5" }} onPress={() => {
                  this.props.navigation.navigate('CategorySelection', {
                    onGoBack: (value) => this.refreshCategories(value),
                    selectedCategories: this.props.userData.services
                  });
                }} /> */}
                  </View>
                  <View style={{ flex: 1 }}>{this.renderProfileServicesData()}</View>
                </View>
                <View marginTop={0} height={verticalScale(10)} />
                <View height={verticalScale(30)} flexDirection="row" justifyContent="space-between" alignItems="center">
                  <Text style={{ fontSize: scale(12), paddingTop: 4, paddingBottom: 4, color: "black", fontFamily: "Poppins-SemiBold" }}>
                    {strings("About_Us")}
                  </Text>
                  <TouchableOpacity
                    onPress={() => {
                      this.setState({
                        editSkillDetailsDialog: true,
                        newSkillDetails: this.props.userData.skills.details
                      })
                    }}>
                    <View height={verticalScale(16)} width={verticalScale(16)} borderRadius={verticalScale(8)} backgroundColor="#F4F4F4" justifyContent="center" alignItems="center">
                      <Image source={require('../../assets/edit1.png')} style={{ height: verticalScale(8), width: verticalScale(8) }} />
                    </View>
                  </TouchableOpacity>
                </View>
                {this.props.userData.skills ? <TouchableOpacity
                  disabled={!this.props.userData.skills.details || this.props.userData.skills.details == ""}
                  onPress={() => Alert.alert(strings("Skill_Details"), this.props.userData.skills.details)}>
                  <View flexDirection="row" justifyContent="space-between" alignItems="center" style={{
                    backgroundColor: "white", padding: 12, borderRadius: 5, ...Platform.select({
                      ios: {
                        shadowColor: 'gray',
                        shadowOffset: { width: 0, height: 1 },
                        shadowOpacity: 0.8,
                        shadowRadius: 1,

                      },
                      android: {
                        elevation: 5,
                      },
                    }),
                  }}>
                    <Text numberOfLines={4} style={{ flex: 1, fontSize: scale(13), color: "#242424", fontFamily: "Poppins-SemiBold" }}>
                      {this.props.userData.skills.details == "" ? strings("enter_skill") : this.props.userData.skills.details}
                    </Text>
                  </View>
                </TouchableOpacity> : console.log("")}
              </View>
              <View marginTop={0} height={verticalScale(10)} />
              {this.props.userData && (this.props.userData.facebookLink || this.props.userData.instaLink || this.props.userData.twitterLink || this.props.userData.tiktokLink) ? <View height={verticalScale(30)} flexDirection="row" justifyContent="space-between" alignItems="center">
                <Text style={{ fontSize: scale(12), paddingTop: 4, paddingBottom: 4, color: "black", fontFamily: "Poppins-SemiBold" }}>
                  {strings("Social_Media")}
                </Text>
              </View> : console.log("")}
              <View flexDirection="row">
                {this.props.userData && this.props.userData.facebookLink ? <TouchableOpacity onPress={() => this.openSocialeMediaLink(this.props.userData.facebookLink)}><Image source={require('../../assets/fb.png')} style={{ height: verticalScale(30), width: verticalScale(30) }} /></TouchableOpacity> : console.log("")}
                {this.props.userData && this.props.userData.instaLink ? <TouchableOpacity onPress={() => this.openSocialeMediaLink(this.props.userData.instaLink)}><Image source={require('../../assets/insta.png')} style={{ height: verticalScale(30), width: verticalScale(30), marginLeft: moderateScale(15) }} /></TouchableOpacity> : console.log("")}
                {this.props.userData && this.props.userData.twitterLink ? <TouchableOpacity onPress={() => this.openSocialeMediaLink(this.props.userData.twitterLink)}><Image source={require('../../assets/twitter.png')} style={{ height: verticalScale(30), width: verticalScale(30), marginLeft: moderateScale(15) }} /></TouchableOpacity> : console.log("")}
                {this.props.userData && this.props.userData.tiktokLink ? <TouchableOpacity onPress={() => this.openSocialeMediaLink(this.props.userData.tiktokLink)}><Image source={require('../../assets/tiktok.png')} style={{ height: verticalScale(30), width: verticalScale(30), marginLeft: moderateScale(15) }} /></TouchableOpacity> : console.log("")}
              </View>
              <View marginTop={0} height={verticalScale(10)} />
              {/* Address******** */}
              <View style={{ flex: 1 }}>
                <View height={verticalScale(30)} flexDirection="row" justifyContent="space-between" alignItems="center">
                  <Text style={{ fontSize: scale(12), paddingTop: 4, paddingBottom: 4, color: "black", fontFamily: "Poppins-SemiBold" }}>
                    {strings("Address")}
                  </Text>
                  <Icon name="plus" type="Feather" size={scale(15)} style={{ color: "#B5B5B5" }} onPress={() => {
                    this.setState({
                      addModal: !this.state.addModal,
                      newAddressName: "",
                      newAddressValue: "",
                      isEditAddress: false,
                      addressIndex: -1,
                    });
                  }} />
                </View>
                <View style={{ flex: 1 }}>{this.renderProfileAddressData()}</View>
              </View>
              <View marginTop={0} height={verticalScale(10)} />
              {/* Videos******** */}
              <View style={{ flex: 1 }}>
                <View height={verticalScale(30)} flexDirection="row" justifyContent="space-between" alignItems="center">
                  <Text style={{ fontSize: scale(12), paddingTop: 4, paddingBottom: 4, color: "black", fontFamily: "Poppins-SemiBold" }}>
                    {strings("Videos")}
                  </Text>
                </View>
                <View
                  style={{
                    flex: 1,
                    justifyContent: "center",
                    alignItems: "flex-start"
                  }}>
                  <View>
                    {this.props.userData && this.props.userData.videos ? (
                      <FlatList
                        // data={this.props.userData.videos}
                        data={this.props.userData.videos.length > 9 ? this.props.userData.videos : [...this.props.userData.videos, { plusImage: true }]}
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        keyExtractor={(item) => item.id}
                        renderItem={this.renderVideos}
                      />
                    ) : (
                      <FlatList
                        data={[{ plusImage: true }]}
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        keyExtractor={(item) => item.id}
                        renderItem={this.renderVideos}
                      />
                    )}
                  </View>
                </View>
                <View marginTop={0} height={verticalScale(10)} />
              </View>

              {/* picture******** */}
              <View style={{ flex: 1 }}>
                <View height={verticalScale(30)} flexDirection="row" justifyContent="space-between" alignItems="center">
                  <Text style={{ fontSize: scale(12), paddingTop: 4, paddingBottom: 4, color: "black", fontFamily: "Poppins-SemiBold" }}>
                    {strings("Pictures")}
                  </Text>

                  {/* {this.props.userData && this.props.userData.images && this.props.userData.images.length > 9 ? console.log("") : <Icon name="plus" type="Feather" size={scale(15)} style={{ color: "#B5B5B5" }} onPress={() => {
                    this.setState({
                      isUploadImages: true
                    })
                    this.handlePictureUpload();
                  }} />} */}
                </View>
                <View
                  style={{
                    flex: 1,
                    justifyContent: "center",
                    alignItems: "flex-start",
                  }}>
                  <View>
                    {this.props.userData && this.props.userData.images ? (
                      <FlatList
                        data={this.props.userData.images.length > 9 ? this.props.userData.images : [...this.props.userData.images, { plusImage: true }]}
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        keyExtractor={(item) => item.id}
                        renderItem={this.renderImages}
                      />
                    ) :
                      <FlatList
                        data={[{ plusImage: true }]}
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        keyExtractor={(item) => item.id}
                        renderItem={this.renderImages}
                      />
                    }
                  </View>
                </View>
                <View marginTop={0} height={verticalScale(10)} />
              </View>
            </ScrollView>
          </View>
          <Modal
            style={{ margin: 0 }}
            animationType="slide"
            transparent={true}
            isVisible={this.state.isopenimage}
            onRequestClose={() => {
              this.setState({ isopenimage: !this.state.isopenimage });
            }}
          >
            <View style={{ flex: 1 }}>
              <View backgroundColor="white" height={Dimensions.get('window').height} width={"100%"} borderRadius={5}>
                <ImageViewer
                  backgroundColor="white"
                  style={{ height: "100%", width: "100%", resizeMode: "contain", backgroundColor: "white" }}
                  imageUrls={[{ url: this.state.selectedImage }]}
                  failImageSource={require('../../assets/picture.png')}
                  loadingRender={() => {
                    return (
                      <ActivityIndicator style={{ alignSelf: 'center', justifyContent: 'center', height: '100%' }} size="large" color={"gray"} />
                    )
                  }}
                  renderIndicator={(currentIndex, size) => <View />} />
              </View>
              <View marginTop={50} height={100} width={"95%"} margi justifyContent="center" alignItems="flex-end" borderRadius={5} position="absolute">
                <Icon
                  onPress={() => {
                    this.setState({
                      isopenimage: false,
                    });
                  }}
                  type="feather"
                  size={50}
                  name="x"
                  style={{ color: "black" }}
                />
              </View>
            </View>
          </Modal>
          {this.showEditNameDialog()}
          {this._renderImageUploadModal()}
          {this._renderVideoUploadModal()}
          {this._renderDeleteModal()}
          {this.renderPaymentDataModal()}
          {this.renderPaymentDataModal_call()}
        </ImageBackground >
      </View >
    );
  }
}

const MapStateToProps = (state) => {
  return {
    userData: state.userData,
  };
};

export default connect(MapStateToProps, { setUser })(Profile);
