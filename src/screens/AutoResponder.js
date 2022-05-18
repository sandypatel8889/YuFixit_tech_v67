import React, { Component } from "react";
import {
    View,
    Text,
    Dimensions,
    TouchableOpacity,
    Image,
    Platform,
    ImageBackground,
    FlatList,
    TextInput,
    Alert,
    Switch
} from "react-native";
import {
    addAutoResponder,
    handleEnableDisable
} from "../util/firestoreHandler";
import { Header, Avatar, colors, CheckBox } from "react-native-elements";
const { height, width } = Dimensions.get("window");
import { verticalScale, scale, moderateScale } from "../components/helper/scaling";
import { connect } from "react-redux";
import { setUser } from "../redux/actions/index";
import NetInfo from "@react-native-community/netinfo";
import { ScrollView } from "react-native";
import { Icon } from "react-native-elements";
import { Button, Form, Item as FormItem, Input, Label, Textarea } from "native-base";
import { mainColor } from "../components/helper/colors";
import Modal from "react-native-modal";
import MyStorage from "../util/MyStorage";
import { strings, selection } from '../../locales/i18n';
class AutoResponder extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            uploading: false,
            isDialogOpen: false,
            replyValue: "",
            isEdit: false,
            indexValue: 0
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
    };
    renderSuggestion = ({ item, index }) => {
        return (
            <View
                style={{
                    backgroundColor: "white", flexDirection: "row", alignItems: "center", justifyContent: "space-between", margin: moderateScale(5), padding: moderateScale(5), borderRadius: 10, ...Platform.select({
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
                <Text style={{ fontSize: scale(14), paddingTop: moderateScale(10), paddingBottom: moderateScale(10), color: "#242424", fontFamily: "Poppins-Regular", width: "70%" }}>
                    {item}
                </Text>
                <TouchableOpacity
                    onPress={() => {
                        this.setState({
                            isDialogOpen: true,
                            replyValue: item,
                            isEdit: true,
                            indexValue: index
                        });
                    }}>
                    <View height={verticalScale(16)} width={verticalScale(16)} borderRadius={verticalScale(8)} backgroundColor="#F4F4F4" justifyContent="center" alignItems="center">
                        <Image source={require('../../assets/edit1.png')} style={{ height: verticalScale(8), width: verticalScale(8) }} />
                    </View>
                </TouchableOpacity>
            </View>

        );
    };
    storeReply() {
        if (this.state.isEdit) {
            let replys = this.props.userData.replys
            if (replys) {
                replys[this.state.indexValue] = this.state.replyValue
            } else {
                replys = []
            }
            addAutoResponder(this.props.userData.id, replys)
                .then((res) => {
                    let data = { ...this.props.userData, replys: replys };
                    this.props.setUser(data);
                    new MyStorage().setUserData(JSON.stringify(data));
                })
                .catch((err) => {
                    Alert.alert(strings("Error"), strings("Error_Something_went"));
                });
        }
        else {
            let replys = this.props.userData.replys
                ? [...this.props.userData.replys, this.state.replyValue]
                : [this.state.replyValue];
            let data = this.props.userData;
            data = { ...data, replys: replys }
            addAutoResponder(this.props.userData.id, replys)
                .then((res) => {
                    this.props.setUser(data);
                    new MyStorage().setUserData(JSON.stringify(data));
                })
                .catch((err) => {
                    Alert.alert(strings("Error"), strings("Error_Something_went"));
                });
        }
    }
    enableDisable() {
        let data = this.props.userData;
        let value = !data.isEnable;
        data = { ...data, isEnable: value };
        this.props.setUser(data);

        handleEnableDisable(this.props.userData.id, value)
            .then((res) => {
                new MyStorage().setUserData(JSON.stringify(data));
            })
            .catch((err) => {
                data = { ...data, isEnable: !value };
                this.props.setState(data);
                Alert.alert(strings("Error"), strings("Error_Something_went"));
            });
    };
    render() {
        return (
            <View style={{ flex: 1 }}>
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
                    leftComponent={
                        <View style={{ flexDirection: "column", justifyContent: "center", alignItems: "center" }}>
                            <Icon
                                onPress={() => {
                                    this.props.navigation.pop();
                                }}
                                type="FontAwesome"
                                size={40}
                                name="chevron-left"
                                color={mainColor}
                            />
                        </View>
                    }
                    centerComponent={
                        <View style={{ flexDirection: "column", justifyContent: "center", alignItems: "center" }}>
                            <Text style={{ fontSize: scale(18), color: mainColor, width: "100%", textAlign: "center", fontFamily: "Poppins-SemiBold" }}>{strings("Auto_Responder")}</Text>
                        </View>
                    }
                />
                <View style={{ paddingHorizontal: scale(12), flex: 1 }}>
                    <View flex={0.9}>
                        <View
                            style={{
                                flexDirection: "row",
                                justifyContent: "space-between",
                                alignItems: "center",
                                margin: moderateScale(10)
                            }}>
                            <Text style={{ textAlign: "center", margin: 5, fontFamily: "Poppins-Regular", fontSize: scale(14), color: "#242424" }}>
                                {strings("Enable_Auto_Responder")}
                            </Text>
                            <Switch
                                style={{ transform: [{ scaleX: 1 }, { scaleY: 0.90 }] }}
                                value={this.props.userData.isEnable}
                                onValueChange={() => {
                                    this.enableDisable()
                                }}
                            />

                        </View>

                        {this.props.userData && this.props.userData.replys ? (
                            <FlatList
                                data={this.props.userData.replys}
                                showsHorizontalScrollIndicator={false}
                                keyExtractor={(item) => item.id}
                                renderItem={this.renderSuggestion}
                            />
                        ) : (
                            <Text style={{ textAlign: "center", margin: 5, fontFamily: "Poppins-Regular", fontSize: scale(14), color: "#B5B5B5" }}>
                                {strings("no_reply")}
                            </Text>
                        )}

                        {/* <View marginTop={0} height={verticalScale(20)} /> */}
                    </View>
                    <View marginTop={0} height={verticalScale(10)} />
                    <View style={{ justifyContent: "center", flex: 0.1 }}>
                        <Button
                            full
                            onPress={() => {
                                this.setState({
                                    isDialogOpen: true,
                                    replyValue: "",
                                    isEdit: false
                                });
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
                                    {strings("add_reply")}
                                </Text>
                            )}
                        </Button>
                    </View>
                    <View marginTop={0} height={verticalScale(10)} />
                    <Modal
                        animationType="slide"
                        transparent={true}
                        isVisible={this.state.isDialogOpen}>
                        <View
                            style={{
                                flex: 1,
                                justifyContent: "center",
                            }}>
                            <Form style={{ backgroundColor: "white", padding: 15, borderRadius: 10 }}>
                                <Text style={{ fontSize: scale(18), color: mainColor, fontFamily: "Poppins-SemiBold", textAlign: "center" }}>{strings("Enter_your_reply")}</Text>
                                <View marginTop={0} height={verticalScale(10)} />
                                <View>
                                    <View height={verticalScale(35)} backgroundColor="#F4F4F4" borderRadius={5}>
                                        <TextInput
                                            style={{ height: verticalScale(35), includeFontPadding: false, color: "#242424", paddingLeft: scale(5) }}
                                            placeholder={strings("Enter_your_reply")}
                                            value={this.state.replyValue}
                                            onChangeText={(replyValue) => this.setState({ replyValue: replyValue })}
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
                                            if (this.state.replyValue !== "") {
                                                this.setState({
                                                    isDialogOpen: false
                                                });
                                                this.storeReply(1)
                                            } else {
                                                Alert.alert(strings("Please_enter_reply"))
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
                                                isDialogOpen: false
                                            });
                                        }}>
                                        <Text style={{ fontSize: scale(14), fontFamily: "Poppins-SemiBold", color: "#B5B5B5" }}>{strings("Cancel")}</Text>
                                    </Button>
                                </View>
                            </Form>
                            {/* </KeyboardAwareScrollView> */}
                        </View>
                    </Modal>
                </View>
            </View >
        );
    }
}
const MapStateToProps = (state) => {
    return {
        userData: state.userData,
    };
};
export default connect(MapStateToProps, { setUser })(AutoResponder);
