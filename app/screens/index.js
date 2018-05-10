// Copyright (c) 2017-present AiChat, Inc. All Rights Reserved.
// See License.txt for license information.

import React from 'react';
import {Navigation} from 'react-native-navigation';

import Login from 'app/screens/login';
import Root from 'app/screens/root';
import Main from 'app/screens/main';
import Share from 'app/screens/share';
import ImFriends from 'app/screens/im_friends';
import NasFriends from 'app/screens/nas_friends';
import Chat from 'app/screens/chat';

import IntlWrapper from 'app/components/root';

function wrapWithContextProvider(Comp, excludeEvents = true) {
    return (props) => { //eslint-disable-line react/display-name
        const {navigator} = props; //eslint-disable-line react/prop-types
        return (
            <IntlWrapper
                navigator={navigator}
                excludeEvents={excludeEvents}
            >
                <Comp {...props}/>
            </IntlWrapper>
        );
    };
}

export function registerScreens(store, Provider) {
    Navigation.registerComponent('Login', () => wrapWithContextProvider(Login), store, Provider);
    Navigation.registerComponent('Root', () => Root, store, Provider);
    Navigation.registerComponent('Main', () => wrapWithContextProvider(Main), store, Provider);
    Navigation.registerComponent('Share', () => wrapWithContextProvider(Share), store, Provider);
    Navigation.registerComponent('ImFriends', () => wrapWithContextProvider(ImFriends), store, Provider);
    Navigation.registerComponent('NasFriends', () => wrapWithContextProvider(NasFriends), store, Provider);
    Navigation.registerComponent('Chat', () => wrapWithContextProvider(Chat), store, Provider);
}
