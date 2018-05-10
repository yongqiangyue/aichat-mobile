// Copyright (c) 2016-present AiChat, Inc. All Rights Reserved.
// See License.txt for license information.

import 'babel-polyfill';
import Orientation from 'react-native-orientation';
import {Provider} from 'react-redux';
import {Navigation, NativeEventsReceiver} from 'react-native-navigation';
import {IntlProvider} from 'react-intl';
import {
    Alert,
    AppState,
    InteractionManager,
    Keyboard,
    NativeModules,
    Platform,
} from 'react-native';
import DeviceInfo from 'react-native-device-info';
import {setJSExceptionHandler, setNativeExceptionHandler} from 'react-native-exception-handler';
import StatusBarSizeIOS from 'react-native-status-bar-size';
import semver from 'semver';

import {ImClient, AuthClient} from 'app/client';

import {setAppState} from 'app/actions/general';
import {logError} from 'app/actions/errors';
import {logout} from 'app/actions/users';
import EventEmitter from 'app/utils/event_emitter';

import {
    calculateDeviceDimensions,
    setDeviceOrientation,
    setDeviceAsTablet,
    setStatusBarHeight,
} from 'app/actions/device';
import {
    purgeOfflineStore,
} from 'app/actions/views/root';
import {NavigationTypes, ViewTypes} from 'app/action_types';
import {getTranslations} from 'app/i18n';
import initialState from 'app/initial_state';
import {registerScreens} from 'app/screens';
import configureStore from 'app/store';
import {deleteFileCache} from 'app/utils/file';

import LocalConfig from 'assets/config';

const {StatusBarManager} = NativeModules;
const AUTHENTICATION_TIMEOUT = 5 * 60 * 1000;

export default class AiChat {
    constructor() {
        Orientation.unlockAllOrientations();
        //配置store
        this.store = configureStore(initialState);
        registerScreens(this.store, Provider);
        this.unsubscribeFromStore = this.store.subscribe(this.listenForHydration);
        //监听App状态修改
        AppState.addEventListener('change', this.handleAppStateChange);
        //监听导航重置
        EventEmitter.on(NavigationTypes.NAVIGATION_RESET, this.handleLogout);
        //监听重启App
        EventEmitter.on(NavigationTypes.RESTART_APP, this.restartApp);
        Orientation.addOrientationListener(this.orientationDidChange);

        if (Platform.OS === 'ios') {
            StatusBarSizeIOS.addEventListener('willChange', this.handleStatusBarHeightChange);
        }

        setJSExceptionHandler(this.errorHandler, false);
        setNativeExceptionHandler(this.nativeErrorHandler, false);
    }

    errorHandler = (e, isFatal) => {
        if (!e) {
            // This method gets called for propTypes errors in dev mode without an exception
            return;
        }

        console.warn('Handling Javascript error ' + JSON.stringify(e)); // eslint-disable-line no-console

        const intl = this.getIntl();
        // closeWebSocket()(this.store.dispatch, this.store.getState);

        logError(e)(this.store.dispatch);

        if (isFatal) {
            Alert.alert(
                intl.formatMessage({id: 'mobile.error_handler.title', defaultMessage: 'Unexpected error occurred'}),
                intl.formatMessage({id: 'mobile.error_handler.description', defaultMessage: '\nClick relaunch to open the app again. After restart, you can report the problem from the settings menu.\n'}),
                [{
                    text: intl.formatMessage({id: 'mobile.error_handler.button', defaultMessage: 'Relaunch'}),
                    onPress: () => {
                        // purge the store
                        this.store.dispatch(purgeOfflineStore());
                    },
                }],
                {cancelable: false}
            );
        }
    };

    nativeErrorHandler = (e) => {
        console.warn('Handling native error ' + JSON.stringify(e)); // eslint-disable-line no-console
    };

    getIntl = () => {
        const state = this.store.getState();
        let locale = DeviceInfo.getDeviceLocale().split('-')[0];
        if (state.views.i18n.locale) {
            locale = state.views.i18n.locale;
        }

        const intlProvider = new IntlProvider({locale, messages: getTranslations(locale)}, {});
        const {intl} = intlProvider.getChildContext();
        return intl;
    };

    handleAppStateChange = async (appState) => {
        const {dispatch, getState} = this.store;
        const isActive = appState === 'active';

        setAppState(isActive)(dispatch, getState);

        if (isActive) {
            this.launchApp();
            Keyboard.dismiss();
        } else {
            dispatch({type: ViewTypes.DATA_CLEANUP, payload: getState()});
        }
    };

    handleLogout = () => {
        this.appStarted = false;
        deleteFileCache();
        this.startApp('fade');
    };

    handleStatusBarHeightChange = (nextStatusBarHeight) => {
        this.store.dispatch(setStatusBarHeight(nextStatusBarHeight));
    };

    // We need to wait for hydration to occur before load the router.
    listenForHydration = () => {
        const {dispatch, getState} = this.store;
        const state = getState();

        if (state.views.root.hydrationComplete) {
            const orientation = Orientation.getInitialOrientation();
            const {imToken, authToken} = state.entities.general;
            const {currentUserId} = state.entities.users;
            const isNotActive = AppState.currentState !== 'active';

            this.unsubscribeFromStore();

            if (orientation) {
                this.orientationDidChange(orientation);
            }

            if (currentUserId) {
                AuthClient.setMobile(currentUserId);
                AuthClient.setToken(authToken);
                ImClient.setUserId(currentUserId);
            }

            if (imToken.a2Key && imToken.tinyId) {
                ImClient.setA2(imToken.a2Key);
                ImClient.setTinyId(imToken.tinyId);
            }

            if (Platform.OS === 'ios') {
                StatusBarManager.getHeight(
                    (data) => {
                        this.handleStatusBarHeightChange(data.height);
                    }
                );
            }

            if (Platform.OS === 'android') {
                // In case of Android we need to handle the bridge being initialized by HeadlessJS
                Promise.resolve(Navigation.isAppLaunched()).then((appLaunched) => {
                    if (appLaunched) {
                        this.launchApp(); // App is launched -> show UI
                    } else {
                        new NativeEventsReceiver().appLaunched(this.launchApp); // App hasn't been launched yet -> show the UI only when needed.
                    }
                });
            } else {
                this.launchApp();
            }
        }
    };

    orientationDidChange = (orientation) => {
        const {dispatch} = this.store;
        dispatch(setDeviceOrientation(orientation));
        if (DeviceInfo.isTablet()) {
            dispatch(setDeviceAsTablet());
        }
        setTimeout(() => {
            dispatch(calculateDeviceDimensions());
        }, 100);
    };

    restartApp = async () => {
        Navigation.dismissModal({animationType: 'none'});

        const {dispatch, getState} = this.store;
        // await loadConfigAndLicense()(dispatch, getState);
        // await loadMe()(dispatch, getState);
        this.appStarted = false;
        this.startApp('fade');
    };

    launchApp = () => {
        this.startApp('fade');
    };

    startApp = (animationType = 'none') => {
        if (!this.appStarted) {
            const {dispatch, getState} = this.store;
            const {entities} = getState();
            let screen = 'Login';

            if (entities) {
                const {imToken} = entities.general;
                if (imToken.a2Key && imToken.tinyId) {
                    screen = 'Main';
                    // loadMe()(dispatch, getState);
                }
            }

            Navigation.startSingleScreenApp({
                screen: {
                    screen,
                    navigatorStyle: {
                        navBarHidden: true,
                        statusBarHidden: false,
                        statusBarHideWithNavBar: false,
                        screenBackgroundColor: 'transparent',
                    },
                },
                passProps: {
                    allowOtherServers: this.allowOtherServers,
                    tabIndex: 3,
                },
                appStyle: {
                    orientation: 'auto',
                },
                animationType,
            });

            this.appStarted = true;
        }
    };
}
