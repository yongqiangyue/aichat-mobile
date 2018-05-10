// Copyright (c) 2016-present AiChat, Inc. All Rights Reserved.
// See License.txt for license information.

import {combineReducers} from 'redux';

import {GeneralConstants} from 'app/constants';

function hydrationComplete(state = false, action) {
    switch (action.type) {
    case GeneralConstants.STORE_REHYDRATION_COMPLETE:
        return true;
    default:
        return state;
    }
}

function purge(state = false, action) {
    switch (action.type) {
    case GeneralConstants.OFFLINE_STORE_PURGE:
        return true;
    default:
        return state;
    }
}

export default combineReducers({
    hydrationComplete,
    purge,
});
