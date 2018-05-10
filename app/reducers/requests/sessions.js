// Copyright (c) 2016-present AiChat, Inc. All Rights Reserved.
// See License.txt for license information.

import {combineReducers} from 'redux';
import {UserTypes, SessionTypes} from 'app/action_types';

import {handleRequest, initialRequestState} from './helpers';

function getSession(state = initialRequestState(), action) {
    return handleRequest(
        SessionTypes.SESSION_REQUEST,
        SessionTypes.SESSION_SUCCESS,
        SessionTypes.SESSION_FAILURE,
        state,
        action
    );
}

function mySessions(state = initialRequestState(), action) {
    return handleRequest(
        SessionTypes.SESSIONS_REQUEST,
        SessionTypes.SESSIONS_SUCCESS,
        SessionTypes.SESSIONS_FAILURE,
        state,
        action
    );
}

export default combineReducers({
    getSession,
    mySessions,
});
