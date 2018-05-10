// Copyright (c) 2016-present AiChat, Inc. All Rights Reserved.
// See License.txt for license information.

import React, {PureComponent} from 'react';
import PropTypes from 'prop-types';
import {Navigation, NativeEventsReceiver} from 'react-native-navigation';
import {injectIntl, intlShape} from 'react-intl';
import {
    ActivityIndicator,
    Image,
    InteractionManager,
    Keyboard,
    StyleSheet,
    Text,
    TextInput,
    TouchableWithoutFeedback,
    View,
} from 'react-native';
import Button from 'react-native-button';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
import Orientation from 'react-native-orientation';

import StatusBar from 'app/components/status_bar';
import {GlobalStyles} from 'app/styles';
import {preventDoubleTap} from 'app/utils/tap';

import logo from 'assets/images/im/ic_me_selected.png';

import {RequestStatusConstants} from 'app/constants';

class Login extends PureComponent {
    static propTypes = {
        intl: intlShape.isRequired,
        navigator: PropTypes.object,
        actions: PropTypes.shape({
            handleLoginIdChanged: PropTypes.func.isRequired,
            handlePasswordChanged: PropTypes.func.isRequired,
            handleSuccessfulLogin: PropTypes.func.isRequired,
            login: PropTypes.func.isRequired,
        }).isRequired,
        loginRequest: PropTypes.object.isRequired,
    };

    constructor(props) {
        super(props);

        this.state = {
            error: null,
        };
    }

    componentWillMount() {
        Orientation.addOrientationListener(this.orientationDidChange);
    }

    componentWillReceiveProps(nextProps) {
        if (this.props.loginRequest.status === RequestStatusConstants.STARTED && nextProps.loginRequest.status === RequestStatusConstants.SUCCESS) {
            this.props.actions.handleSuccessfulLogin().then(this.goToLoadMain);
        } else if (this.props.loginRequest.status !== nextProps.loginRequest.status && nextProps.loginRequest.status !== RequestStatusConstants.STARTED) {
            this.setState({isLoading: false});
        }
    }

    componentWillUnmount() {
        Orientation.removeOrientationListener(this.orientationDidChange);
    }

    goToLoadMain = () => {
        const {intl, navigator} = this.props;
        tracker.initialLoad = Date.now();
        navigator.resetTo({
            screen: 'Main',
            title: '',
            animated: false,
            backButtonTitle: '',
            navigatorStyle: {
                animated: true,
                animationType: 'fade',
                navBarHidden: true,
                statusBarHidden: false,
                statusBarHideWithNavBar: false,
                screenBackgroundColor: 'transparent',
            },
        });
    };

    blur = () => {
        this.loginId.blur();
        this.passwd.blur();
        Keyboard.dismiss();
    };

    preSignIn = preventDoubleTap(() => {
        this.setState({error: null, isLoading: true});
        Keyboard.dismiss();
        InteractionManager.runAfterInteractions(async () => {
            if (!this.props.loginId) {
                // it's slightly weird to be constructing the message ID, but it's a bit nicer than triply nested if statements
                this.setState({
                    error: {
                        intl: {
                            id: 'login.noUsername',
                            defaultMessage: 'Please enter your username',
                        },
                    },
                });
                return;
            }

            if (!this.props.password) {
                this.setState({
                    error: {
                        intl: {
                            id: 'login.noPassword',
                            defaultMessage: 'Please enter your password',
                        },
                    },
                });
                return;
            }

            this.signIn();
        });
    });

    signIn = () => {
        const {actions, loginId, loginRequest, password} = this.props;
        if (loginRequest.status !== RequestStatusConstants.STARTED) {
            actions.login(loginId.toLowerCase(), password);
        }
    };

    getLoginErrorMessage = () => {
        return (
            this.getServerErrorForLogin() ||
            this.state.error
        );
    };

    getServerErrorForLogin = () => {
        const {error} = this.props.loginRequest;
        if (!error) {
            return null;
        }
        return {
            intl: {
                id: 'login.invalidPassword',
                defaultMessage: 'Your password is incorrect.',
            },
        };
    };

    loginRef = (ref) => {
        this.loginId = ref;
    };

    passwordRef = (ref) => {
        this.passwd = ref;
    };

    passwordFocus = () => {
        this.passwd.focus();
    };

    orientationDidChange = () => {
        this.scroll.scrollToPosition(0, 0, true);
    };

    scrollRef = (ref) => {
        this.scroll = ref;
    };

    render() {
        const isLoading = this.props.loginRequest.status === RequestStatusConstants.STARTED || this.state.isLoading;

        let proceed;
        if (isLoading) {
            proceed = (
                <ActivityIndicator
                    animating={true}
                    size='small'
                />
            );
        } else {
            const additionalStyle = {};
            const additionalTextStyle = {};

            proceed = (
                <Button
                    onPress={this.preSignIn}
                    containerStyle={[GlobalStyles.signupButton, additionalStyle]}
                >
                    {/* <FormattedText
                        id='login.signIn'
                        defaultMessage='Sign in'
                        style={[GlobalStyles.signupButtonText, additionalTextStyle]}
                    /> */}
                Sign In
                </Button>
            );
        }

        return (
            <View style={style.container}>
                <StatusBar/>
                <TouchableWithoutFeedback onPress={this.blur}>
                    <KeyboardAwareScrollView
                        ref={this.scrollRef}
                        style={style.container}
                        contentContainerStyle={style.innerContainer}
                        keyboardShouldPersistTaps='handled'
                        enableOnAndroid={true}
                    >
                        <Image
                            source={logo}
                        />
                        {/* <View>
                            <FormattedText
                                style={GlobalStyles.subheader}
                                id='web.root.signup_info'
                                defaultMessage='All team communication in one place, searchable and accessible anywhere'
                            />
                        </View>
                        <ErrorText error={this.getLoginErrorMessage()}/> */}
                        <TextInput
                            ref={this.loginRef}
                            value={this.props.loginId}
                            onChangeText={this.props.actions.handleLoginIdChanged}
                            style={GlobalStyles.inputBox}
                            placeholder={this.props.intl.formatMessage({id: 'login.username', defaultMessage: 'Username'})}
                            autoCorrect={false}
                            autoCapitalize='none'
                            keyboardType='email-address'
                            returnKeyType='next'
                            underlineColorAndroid='transparent'
                            onSubmitEditing={this.passwordFocus}
                            blurOnSubmit={false}
                            disableFullscreenUI={true}
                        />
                        <TextInput
                            ref={this.passwordRef}
                            value={this.props.password}
                            onChangeText={this.props.actions.handlePasswordChanged}
                            style={GlobalStyles.inputBox}
                            placeholder={this.props.intl.formatMessage({id: 'login.password', defaultMessage: 'Password'})}
                            secureTextEntry={true}
                            autoCorrect={false}
                            autoCapitalize='none'
                            underlineColorAndroid='transparent'
                            returnKeyType='go'
                            onSubmitEditing={this.preSignIn}
                            disableFullscreenUI={true}
                        />
                        {proceed}
                    </KeyboardAwareScrollView>
                </TouchableWithoutFeedback>
            </View>
        );
    }
}

const style = StyleSheet.create({
    container: {
        backgroundColor: '#FFFFFF',
        flex: 1,
    },
    innerContainer: {
        alignItems: 'center',
        flexDirection: 'column',
        justifyContent: 'center',
        paddingHorizontal: 15,
        paddingVertical: 50,
    },
});

export default injectIntl(Login);
