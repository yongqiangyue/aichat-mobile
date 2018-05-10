// Copyright (c) 2016-present AiChat, Inc. All Rights Reserved.
// See License.txt for license information.

import {combineReducers} from 'redux';
import {UserTypes} from 'app/action_types';

function currentUserId(state = '', action) {
    switch (action.type) {
    case UserTypes.RECEIVED_ME:
        return action.identifier;
    case UserTypes.LOGOUT_SUCCESS:
        return '';
    default:
        return state;
    }
}

function profiles(state = {}, action) {
    switch (action.type) {
    case UserTypes.RECEIVED_PROFILES_LIST:
        return action.data;
    case UserTypes.LOGOUT_SUCCESS:
        return {};
    default:
        return state;
    }
}

export default combineReducers({
    currentUserId,
    profiles,
});
