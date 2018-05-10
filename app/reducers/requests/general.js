// Copyright (c) 2016-present AiChat, Inc. All Rights Reserved.
// See License.txt for license information.

import {combineReducers} from 'redux';
import {GeneralTypes} from 'app/action_types';

import {handleRequest, initialRequestState} from './helpers';

function config(state = initialRequestState(), action) {
    return handleRequest(
        GeneralTypes.CLIENT_CONFIG_REQUEST,
        GeneralTypes.CLIENT_CONFIG_SUCCESS,
        GeneralTypes.CLIENT_CONFIG_FAILURE,
        state,
        action
    );
}

export default combineReducers({
    config,
});
