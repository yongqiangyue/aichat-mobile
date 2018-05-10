// Copyright (c) 2016-present AiChat, Inc. All Rights Reserved.
// See License.txt for license information.

import {combineReducers} from 'redux';
import {GeneralTypes, UserTypes} from 'app/action_types';

function config(state = {}, action) {
    switch (action.type) {
    case GeneralTypes.CLIENT_CONFIG_RECEIVED:
        return Object.assign({}, state, action.data);
    case GeneralTypes.CLIENT_CONFIG_RESET:
    case UserTypes.LOGOUT_SUCCESS:
        return {};
    default:
        return state;
    }
}

function appState(state = false, action) {
    switch (action.type) {
    case GeneralTypes.RECEIVED_APP_STATE:
        return action.data;

    default:
        return state;
    }
}

function imToken(state = {}, action) {
    switch (action.type) {
    case GeneralTypes.RECEIVED_IM_TOKEN:
        const data = {a2Key: action.a2Key, tinyId: action.tinyId};
        return data;
    case UserTypes.LOGOUT_SUCCESS:
        return {};
    default:
        return state;
    }
}

function authToken(state = '', action) {
    switch (action.type) {
    case GeneralTypes.RECEIVED_AUTH_TOKEN:
        return action.customToken;
    case UserTypes.LOGOUT_SUCCESS:
        return '';
    default:
        return state;
    }
}

export default combineReducers({
    appState,
    config,
    imToken,
    authToken,
});
