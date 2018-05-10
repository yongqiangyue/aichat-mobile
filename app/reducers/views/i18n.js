// Copyright (c) 2016-present AiChat, Inc. All Rights Reserved.
// See License.txt for license information.

import {combineReducers} from 'redux';
import DeviceInfo from 'react-native-device-info';

import {UserTypes} from 'app/action_types';

const defaultLocale = DeviceInfo.getDeviceLocale().split('-')[0];

function locale(state = defaultLocale, action) {
    switch (action.type) {
    case UserTypes.RECEIVED_ME: {
        return defaultLocale;
    }
    case UserTypes.LOGOUT_SUCCESS:
        return defaultLocale;
    }

    return state;
}

export default combineReducers({
    locale,
});
