import React, { Component } from 'react';
import { View, TouchableOpacity, Modal, Text, ScrollView, Alert } from 'react-native'
import { verticalScale, scale } from '../helper/scaling'
import { List, ListItem, Left, Body, Right, Thumbnail, Card, CardItem, Button } from 'native-base';
import { acceptByProvider, rejectByProvider, comingProvider, startedJob, completeJob } from '../../util/firestoreHandler'
import { connect } from 'react-redux'
import { ActivityIndicator } from 'react-native';
import { mainColor } from "../helper/colors";
const statusColors = {
    'pending': '#B2B94B',
    'accepted': 'orange',
    'completed': 'green',
    'rejected': 'red',
    'coming': 'blue',
    'started': mainColor
}
class BookingComponent extends React.Component {


    constructor() {
        super()
        this.state = {
            showModal: false,
            booking: null,
            index: 0,
            rejectedLoading: false,
            acceptedLoading: false,
            startedLoading: false,
            comingLoading: false,
            completeLoading: false
        }
    }

    componentDidMount = () => {
    }

    handleComplete = () => {
        this.setState({ completeLoading: true })
        completeJob(this.state.booking)
            .then(res => {
                if (res.data) {
                    this.props.update(this.state.index, 'completed')
                    this.setState({ showModal: false, booking: null, index: 0, completeLoading: false })
                }
                else {
                    Alert.alert('Error', 'Please try again')
                    this.setState({ completeLoading: false })
                }
            })
            .catch(err => {
                this.setState({ completeLoading: false })
                Alert.alert('Error', 'Something went wrong please try again')
                console.log('Error in completeing job is: ', err)
            })
    }

    handleStart = () => {
        // console.log('start job called')
        this.setState({ startedLoading: true })
        startedJob(this.state.booking)
            .then(res => {
                if (res.data) {
                    this.props.update(this.state.index, 'started')
                    this.setState({ showModal: false, booking: null, index: 0, startedLoading: false })
                }
                else {
                    Alert.alert('Error', 'You can not start this job')
                    this.setState({ startedLoading: false })
                }
            })
            .catch(err => {
                this.setState({ startedLoading: false })
                Alert.alert('Error', 'Something went wrong please try again')
                console.log('Error in starting job is: ', err)
            })
    }

    handleAccept = () => {
        this.setState({ acceptedLoading: true })
        acceptByProvider(
            this.state.booking.id,
            this.props.userData.name,
            this.props.userData.id,
            this.state.booking.customerName,
            this.state.booking.customerId,
        )
            .then(res => {
                if (res.data) {
                    this.props.update(this.state.index, 'accepted')
                    this.setState({ showModal: false, booking: null, index: 0, acceptedLoading: false })
                }
                else {
                    this.setState({ acceptedLoading: false })
                    Alert.alert('Error', 'Something went wrong please try again')
                }
            })
            .catch(err => {
                this.setState({ acceptedLoading: false })
                console.log('error in accepting request is: ', err)
                Alert.alert('Error', 'Something went wrong please try again')
            })
    }
    handleReject = () => {
        this.setState({ rejectedLoading: true })
        rejectByProvider(
            this.state.booking.id,
            this.props.userData.name,
            this.props.userData.id,
            this.state.booking.customerName,
            this.state.booking.customerId,
        )
            .then(res => {
                if (res.data) {
                    this.props.update(this.state.index, 'rejected')
                    this.setState({ showModal: false, booking: null, index: 0, rejectedLoading: false })
                }
                else {
                    this.setState({ rejectedLoading: false })
                    Alert.alert('Error', 'Something went wrong please try again')
                }
            })
            .catch(err => {
                this.setState({ rejectedLoading: false })
                console.log('error in accepting request is: ', err)
                Alert.alert('Error', 'Something went wrong please try again')
            })
    }

    handleComing = () => {
        this.setState({ comingLoading: true })
        comingProvider(this.state.booking)
            .then(res => {

                if (res.data) {
                    this.props.update(this.state.index, 'coming')
                    this.setState({ showModal: false, booking: null, index: 0, comingLoading: false })
                }
                else {
                    this.setState({ comingLoading: false })
                    Alert.alert('Error', 'You can not start another job')
                }
            })
            .catch(err => {
                console.log('error in coming is: ', err)
                this.setState({ comingLoading: false })
                Alert.alert('Error', 'Something went wrong please try again')
            })
    }
    renderModal = () => {

        return (

            <Modal
                style={{ margin: 0 }}
                animationType="slide"
                // transparent={true}
                isVisible={this.state.showModal}
                onRequestClose={() => {
                    if (!this.state.acceptedLoading && !this.state.rejectedLoading && !this.state.startedLoading)
                        this.setState({ showModal: !this.state.showModal, booking: null, index: 0 })
                }}
            >
                <View style={{ flex: 1, backgroundColor: 'white' }}>
                    <View style={{ flex: 0.7, paddingTop: 60, paddingHorizontal: 20 }}>
                        <Text style={{ fontSize: scale(23), fontWeight: 'bold', textAlign: 'center' }}>
                            {'Job Request'}
                        </Text>

                        <View style={{ paddingVertical: 20, alignItems: 'center' }}>
                            <View style={{ height: 140, width: 140, borderRadius: 70, borderWidth: 8, borderColor: mainColor, justifyContent: 'center' }}>
                                <Text style={{ textAlign: 'center', fontSize: 25 }}>{this.state.booking.time}</Text>
                            </View>
                        </View>

                        <View style={{ paddingHorizontal: 20, paddingTop: 20 }}>
                            <Card>
                                <CardItem>
                                    <Body>
                                        <Text style={{ fontWeight: 'bold', textAlign: 'center', width: '100%', fontSize: 16 }}>Customer</Text>
                                        <Text style={{ textAlign: 'center', width: '100%', fontSize: 14 }}>{this.state.booking.customerName}</Text>
                                        <Text style={{ fontWeight: 'bold', textAlign: 'center', width: '100%', fontSize: 16, paddingTop: 20 }}>Address</Text>
                                        <Text style={{ textAlign: 'center', width: '100%', fontSize: 14 }}>{this.state.booking.address.value.name}</Text>
                                    </Body>
                                </CardItem>
                            </Card>
                        </View>
                    </View>
                    <View style={{ flex: 0.3, paddingHorizontal: 40 }}>
                        {this.state.booking.status == 'pending' &&
                            <View style={{ justifyContent: 'center', flex: 1 }}>
                                <Button full
                                    style={{ backgroundColor: 'red', borderRadius: scale(5), marginBottom: 20 }}
                                    disabled={this.state.rejectedLoading}
                                    onPress={() => {
                                        // this.handleReject()
                                    }}>

                                    {this.state.rejectedLoading ?
                                        <ActivityIndicator size='small' color='white' />
                                        : <Text style={{ fontSize: 15, color: 'white', fontWeight: 'bold' }}> Reject </Text>
                                    }

                                </Button>
                                <Button full
                                    disabled={this.state.acceptedLoading}
                                    onPress={() => {
                                        this.handleAccept()
                                    }}
                                    style={{ backgroundColor: mainColor, borderRadius: scale(5) }}
                                >
                                    {this.state.acceptedLoading ?
                                        <ActivityIndicator size='small' color='white' />
                                        :
                                        <Text style={{ fontSize: 15, color: 'white', fontWeight: 'bold' }}> Accept </Text>
                                    }

                                </Button>
                            </View>
                        }

                        {this.state.booking.status == 'accepted' &&
                            <View style={{ justifyContent: 'center', flex: 1 }}>

                                <Button full
                                    onPress={() => {
                                        this.handleComing()
                                    }}
                                    disabled={this.state.startedLoading}
                                    style={{ backgroundColor: mainColor, borderRadius: scale(5) }}
                                >
                                    {this.state.comingLoading ?
                                        <ActivityIndicator size='small' color='white' />
                                        : <Text style={{ fontSize: 15, color: 'white', fontWeight: 'bold' }}> Going </Text>
                                    }

                                </Button>
                            </View>
                        }

                        {this.state.booking.status == 'coming' &&
                            <View style={{ justifyContent: 'center', flex: 1 }}>

                                <Button full
                                    onPress={() => {
                                        this.handleStart()
                                    }}
                                    disabled={this.state.startedLoading}
                                    style={{ backgroundColor: mainColor, borderRadius: scale(5) }}
                                >
                                    {this.state.startedLoading ?
                                        <ActivityIndicator size='small' color='white' />
                                        :

                                        <Text style={{ fontSize: 15, color: 'white', fontWeight: 'bold' }}> Start Job </Text>
                                    }

                                </Button>
                            </View>
                        }

                        {this.state.booking.status == 'started' &&
                            <View style={{ justifyContent: 'center', flex: 1 }}>

                                <Button full
                                    onPress={() => {
                                        this.handleComplete()
                                    }}
                                    disabled={this.state.startedLoading}
                                    style={{ backgroundColor: mainColor, borderRadius: scale(5) }}
                                >
                                    {this.state.completeLoading ?
                                        <ActivityIndicator size='small' color='white' />
                                        :

                                        <Text style={{ fontSize: 15, color: 'white', fontWeight: 'bold' }}> Complete Job </Text>
                                    }

                                </Button>
                            </View>
                        }

                    </View>
                </View>
            </Modal>

        )
    }

    renderItem = (booking, index) => {
        let d = new Date(booking.date)
        let _date = d.toDateString()
        return (

            <List>
                <ListItem
                    onPress={() => {
                        this.setState({ booking: booking }, () => {
                            this.setState({ showModal: true, index: index })
                        })

                    }}
                    avatar>
                    <Left>
                        {booking.providerProfileUrl ?
                            <Thumbnail source={{ uri: booking.customerProfileUrl }} />
                            :
                            <Thumbnail source={{ uri: 'https://api.adorable.io/avatars/400/38badb6842838b6c03c29ac2657d4013.png' }} />
                        }

                    </Left>
                    <Body>
                        <Text>{booking.customerName}</Text>
                        <View style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: verticalScale(2) }}>
                            <Text style={{ color: "black", }}>{_date}</Text>
                        </View>
                        <Text style={{ color: 'gray' }}>{booking.time}</Text>
                    </Body>
                    <Right>
                        <View style={{ flex: 1, flexDirection: 'column', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Text style={{ color: "gray", paddingLeft: scale(6) }}>{'30 min before'}</Text>
                            <TouchableOpacity style={{
                                width: scale(70),
                                // height: 20,
                                borderRadius: 50,
                                alignItems: 'center',
                                justifyContent: 'center',
                                backgroundColor: statusColors[booking.status],

                            }}>
                                <Text style={{ color: 'white', fontSize: scale(11), padding: scale(2), }}>{booking.status == 'coming' ? 'going' : booking.status}</Text>

                            </TouchableOpacity>
                        </View>
                    </Right>
                </ListItem>
            </List>

        )
    }
    render() {
        return (
            <View style={{ flex: 1, }}>
                <ScrollView showsVerticalScrollIndicator={false} >
                    {this.props.data.map((booking, index) =>
                    (
                        this.renderItem(booking, index)
                    ))
                    }

                    {this.state.showModal && this.renderModal()}
                </ScrollView>
            </View>

        )
    };
}

const MapStateToProps = state => {
    return {
        userData: state.userData
    }
}

export default connect(MapStateToProps, {})(BookingComponent)