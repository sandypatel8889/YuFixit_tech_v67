import React, { Component } from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import { CheckBox, Avatar, Button, Icon } from "react-native-elements";
import { mainColor } from '../helper/colors'
import { connect } from 'react-redux'
import { setPaymentModal, setUser } from '../../redux/actions/index'
import { enableModules } from '../../util/firestoreHandler'
import MyStorage from '../../util/MyStorage';
class Payment extends React.Component {
    constructor() {
        super()
        this.state = {
            total: 0,
            chatt: false,
            call: false,
            quote: false,
            calendar: false,
            statistics: false,
            loading: false
        }
    }
    componentDidMount() {

    }
    handlePayment = () => {
        this.setState({ loading: true })
        this.props.setPaymentModal(false)
        // let modules = []
        // if (this.state.call) {
        //     modules.push('call')
        // }
        // if (this.state.chatt) {
        //     modules.push('chatt')
        // }
        // if (this.state.quote) {
        //     modules.push('quote')
        // }
        // if (this.state.statistics) {
        //     modules.push('statistics')
        // }
        // if (this.state.calendar) {
        //     modules.push('calendar')
        // }
        // enableModules(this.props.userData.id, modules, this.state.total)
        //     .then(res => {
        //         if (res && res.data) {
        //             if (res.data.error) {
        //                 Alert.alert('Error', res.data.error)
        //             }
        //             else {
        //                 this.props.setUser(res.data)
        //                 new MyStorage().setUserData(JSON.stringify(res.data))
        //                 this.props.setPaymentModal(false)
        //             }
        //         }
        //         this.setState({ loading: false })

        //     })
        //     .catch(err => {
        //         Alert.alert('Error', 'Something went wrong please try again.')
        //         this.setState({ loading: false })
        //         console.log('err is: ', err)
        //     })

    }
    processExpiry = (expireData) => {
        const now = new Date()
        const expiresAt = new Date(expireData)
        var Difference_In_Time = expiresAt.getTime() - now.getTime();
        var Difference_In_Days = Math.ceil(Difference_In_Time / (1000 * 3600 * 24));
        console.log("diff:", Difference_In_Days)
        return Difference_In_Days >= 0 ? true : false
    }
    activeModules = () => {
        const { chatt, call, quote, calendar, statistics } = this.props.userData.modules
        if (
            this.processExpiry(chatt.expireAt) ||
            this.processExpiry(call.expireAt) ||
            this.processExpiry(quote.expireAt) ||
            this.processExpiry(calendar.expireAt) ||
            this.processExpiry(statistics.expireAt)
        ) {
            return (
                <View style={{ paddingVertical: 15 }}>
                    <Text style={{ fontWeight: 'bold', fontSize: 20 }}>Active Modules</Text>
                    {this.processExpiry(chatt.expireAt) && <Text style={{ fontSize: 18, paddingVertical: 5, paddingLeft: 20 }}>CHATT/MESSAGING</Text>}
                    {/* {this.processExpiry(call.expireAt) && <Text style={{ fontSize: 18, paddingVertical: 5, paddingLeft: 20 }}>CALL</Text>}
                    {this.processExpiry(quote.expireAt) && <Text style={{ fontSize: 18, paddingVertical: 5, paddingLeft: 20 }}>QUOTE REQUEST</Text>}
                    {this.processExpiry(calendar.expireAt) && <Text style={{ fontSize: 18, paddingVertical: 5, paddingLeft: 20 }}>CALENDAR BOOKING</Text>}
                    {this.processExpiry(statistics.expireAt) && <Text style={{ fontSize: 18, paddingVertical: 5, paddingLeft: 20 }}>STATISTICAL REPORTING</Text>} */}
                </View>
            )
        }

    }
    renderTitle = (title, price) => {
        return (
            <View style={{ marginLeft: 5, justifyContent: 'center', flex: 1, flexDirection: 'row' }}>
                <View style={{ flex: 0.7, justifyContent: 'center' }}>
                    <Text style={{ fontSize: 16, }}>{title}</Text>
                </View>
                <View style={{ flex: 0.3, justifyContent: 'center' }}>
                    <Text style={{ fontWeight: 'bold', fontSize: 16, }}>${price}</Text>
                </View>
            </View>
        )
    }
    inActiveModules = () => {
        const { chatt, call, quote, calendar, statistics } = this.props.userData.modules
        if (
            !this.processExpiry(chatt.expireAt) ||
            !this.processExpiry(call.expireAt) ||
            !this.processExpiry(quote.expireAt) ||
            !this.processExpiry(calendar.expireAt) ||
            !this.processExpiry(statistics.expireAt)
        ) {
            return (
                <View style={{ paddingVertical: 15 }}>
                    <Text style={{ fontWeight: 'bold', fontSize: 20 }}>In-Active Modules</Text>
                    {!this.processExpiry(chatt.expireAt) &&
                        <View style={{ flexDirection: 'row' }}>
                            <View>
                                <CheckBox color={mainColor} checked={true}
                                    onPress={() => {
                                        this.setState({ chatt: !this.state.chatt }, () => {
                                            if (this.state.chatt) {
                                                this.setState({ total: this.state.total + 5 })
                                            }
                                            else {
                                                this.setState({ total: this.state.total - 5 })
                                            }
                                        })
                                    }}
                                    checkedColor={mainColor}
                                />
                            </View>
                            <TouchableOpacity
                                onPress={() => {
                                    this.setState({ chatt: !this.state.chatt }, () => {
                                        if (this.state.chatt) {
                                            this.setState({ total: this.state.total + 5 })
                                        }
                                        else {
                                            this.setState({ total: this.state.total - 5 })
                                        }
                                    })
                                }}
                                style={{ flex: 1 }}>
                                {this.renderTitle('TEXT/CHATTING', 10)}
                            </TouchableOpacity>
                        </View>
                    }
                    {/* {!this.processExpiry(call.expireAt) &&

                        <View style={{ flexDirection: 'row' }}>
                            <View>
                                <CheckBox color={mainColor} checked={this.state.call} checkedColor={mainColor}

                                    onPress={() => {
                                        this.setState({ call: !this.state.call }, () => {
                                            if (this.state.call) {
                                                this.setState({ total: this.state.total + 5 })
                                            }
                                            else {
                                                this.setState({ total: this.state.total - 5 })
                                            }
                                        })
                                    }}
                                />
                            </View>
                            <TouchableOpacity
                                onPress={() => {
                                    this.setState({ call: !this.state.call }, () => {
                                        if (this.state.call) {
                                            this.setState({ total: this.state.total + 5 })
                                        }
                                        else {
                                            this.setState({ total: this.state.total - 5 })
                                        }
                                    })
                                }}
                                style={{ flex: 1 }}>
                                {this.renderTitle('CALL', 5)}
                            </TouchableOpacity>

                        </View>
                    } */}
                    {/* {!this.processExpiry(quote.expireAt) &&
                        <View style={{ flexDirection: 'row' }}>
                            <View>
                                <CheckBox color={mainColor} checked={this.state.quote} checkedColor={mainColor}

                                    onPress={() => {
                                        this.setState({ quote: !this.state.quote }, () => {
                                            if (this.state.quote) {
                                                this.setState({ total: this.state.total + 5 })
                                            }
                                            else {
                                                this.setState({ total: this.state.total - 5 })
                                            }
                                        })
                                    }}
                                />
                            </View>
                            <TouchableOpacity
                                onPress={() => {
                                    this.setState({ quote: !this.state.quote }, () => {
                                        if (this.state.quote) {
                                            this.setState({ total: this.state.total + 5 })
                                        }
                                        else {
                                            this.setState({ total: this.state.total - 5 })
                                        }
                                    })
                                }}
                                style={{ flex: 1 }}>
                                {this.renderTitle('QUOTE REQUEST', 5)}
                            </TouchableOpacity>

                        </View>
                    } */}
                    {/* {!this.processExpiry(calendar.expireAt) &&
                        <View style={{ flexDirection: 'row' }}>
                            <View>
                                <CheckBox color={mainColor} checked={this.state.calendar} checkedColor={mainColor}
                                    onPress={() => {
                                        this.setState({ calendar: !this.state.calendar }, () => {
                                            if (this.state.calendar) {
                                                this.setState({ total: this.state.total + 5 })
                                            }
                                            else {
                                                this.setState({ total: this.state.total - 5 })
                                            }
                                        })
                                    }}

                                />
                            </View>
                            <TouchableOpacity
                                onPress={() => {
                                    this.setState({ calendar: !this.state.calendar }, () => {
                                        if (this.state.calendar) {
                                            this.setState({ total: this.state.total + 5 })
                                        }
                                        else {
                                            this.setState({ total: this.state.total - 5 })
                                        }
                                    })
                                }}
                                style={{ flex: 1 }}>
                                {this.renderTitle('CALENDAR 📅 BOOKING', 5)}
                            </TouchableOpacity>
                        </View>
                    } */}
                    {/* {!this.processExpiry(statistics.expireAt) &&
                        <View style={{ flexDirection: 'row' }}>
                            <View>
                                <CheckBox color={mainColor} checked={this.state.statistics} checkedColor={mainColor}

                                    onPress={() => {
                                        this.setState({ statistics: !this.state.statistics }, () => {
                                            if (this.state.statistics) {
                                                this.setState({ total: this.state.total + 5 })
                                            }
                                            else {
                                                this.setState({ total: this.state.total - 5 })
                                            }
                                        })
                                    }}
                                />
                            </View>
                            <TouchableOpacity
                                onPress={() => {
                                    this.setState({ statistics: !this.state.statistics }, () => {
                                        if (this.state.statistics) {
                                            this.setState({ total: this.state.total + 5 })
                                        }
                                        else {
                                            this.setState({ total: this.state.total - 5 })
                                        }
                                    })
                                }}
                                style={{ flex: 1 }}>
                                {this.renderTitle('STATISTICAL REPORTING', 5)}
                            </TouchableOpacity>

                        </View>
                    } */}
                </View>
            )
        }
    }
    renderPayment = () => {
        console.log("modules: ", this.props.userData.modules)
        return (
            <View style={{ margin: 20, flex: 1, }}>
                <Text style={{ fontSize: 17, textAlign: 'justify' }}>By enabling this In-app purchase, you will now be able to receive instant job request from customers in your local area. Once this feature is enable, your profile will be online in your neighborhood and customers will be able to find you and request the services you provide. No more paying for quotes, waist of money on add that get you nothing, just enable the “let’s chat” feature and let YUFixit handle the rest!!</Text>
                {/* {this.activeModules()} */}
                {this.inActiveModules()}
                <View justifyContent="center" alignItems="center">
                    <View height={150} width={150} backgroundColor={mainColor} borderRadius={5} margin={20} justifyContent="center" alignItems="center">
                        <Text style={{ fontSize: 40, color: "white" }}>
                            $10
                        </Text>
                        <Text style={{ fontSize: 13, color: "white" }}>
                            1 Month Subscription
                        </Text>
                    </View>
                    {/* <Text style={{ padding: 10, backgroundColor: "#FFD89B", fontWeight: "bold", fontSize: 20, textAlign: "center" }}>The demo version will be expired in 15 days.</Text> */}
                </View>
                {/* <View style={{ paddingLeft: 20, paddingTop: 10, }}>
                    {this.renderTitle(<Text style={{ fontWeight: 'bold' }}>TOTAL</Text>, this.state.total)}
                </View> */}
                <View style={{ justifyContent: 'flex-end', flex: 1 }}>
                    <Button
                        // disabled={this.state.total === 0}
                        loading={this.state.loading}
                        onPress={this.handlePayment}
                        buttonStyle={{ backgroundColor: mainColor, height: 40, marginBottom: 20 }} title='Subscribe' />
                </View>
            </View>
        )
    }
    render() {
        return (
            <View style={{ flex: 1 }}>
                <View style={{ justifyContent: 'center', alignItems: 'center', marginTop: 50 }}>
                    <Icon type='antdesign' name='creditcard' color={mainColor} size={60} />
                </View>
                {this.renderPayment()}
            </View>
        )
    }
}

const MapStateToProps = state => {
    return {
        userData: state.userData,

    }
}
export default connect(MapStateToProps, { setPaymentModal, setUser })(Payment)