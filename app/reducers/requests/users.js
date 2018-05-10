// Copyright (c) 2016-present AiChat, Inc. All Rights Reserved.
// See License.txt for license information.

import {combineReducers} from 'redux';
import {UserTypes} from 'app/action_types';
import {RequestStatusConstants} from 'app/constants';

import {handleRequest, initialRequestState} from './helpers';

function login(state = initialRequestState(), action) {
    switch (action.type) {
    case UserTypes.LOGIN_REQUEST:
        return {...state, status: RequestStatusConstants.STARTED};

    case UserTypes.LOGIN_SUCCESS:
        return {...state, status: RequestStatusConstants.SUCCESS, error: null};

    case UserTypes.LOGIN_FAILURE:
        return {...state, status: RequestStatusConstants.FAILURE, error: action.error};

    case UserTypes.LOGOUT_SUCCESS:
        return {...state, status: RequestStatusConstants.NOT_STARTED, error: null};

    default:
        return state;
    }
}

function logout(state = initialRequestState(), action) {
    switch (action.type) {
    case UserTypes.LOGOUT_REQUEST:
        return {...state, status: RequestStatus.STARTED};

    case UserTypes.LOGOUT_SUCCESS:
        return {...state, status: RequestStatus.SUCCESS, error: null};

    case UserTypes.LOGOUT_FAILURE:
        return {...state, status: RequestStatus.FAILURE, error: action.error};

    case UserTypes.RESET_LOGOUT_STATE:
        return initialRequestState();

    default:
        return state;
    }
}

function getSnsFriends(state = initialRequestState(), action) {
    return handleRequest(
        UserTypes.SNS_PROFILES_REQUEST,
        UserTypes.SNS_PROFILES_SUCCESS,
        UserTypes.SNS_PROFILES_FAILURE,
        state,
        action
    );
}

function getPortraitFriends(state = initialRequestState(), action) {
    return handleRequest(
        UserTypes.PORTRAIT_PROFILES_REQUEST,
        UserTypes.PORTRAIT_PROFILES_SUCCESS,
        UserTypes.PORTRAIT_PROFILES_FAILURE,
        state,
        action
    );
}

export default combineReducers({
    logout,
    login,
    getSnsFriends,
    getPortraitFriends,
});
