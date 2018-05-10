// Copyright (c) 2016-present AiChat, Inc. All Rights Reserved.
// See License.txt for license information.

import {combineReducers} from 'redux';
import {GeneralTypes, UserTypes} from 'app/action_types';

function selectedTabIndex(state = 1, action) {
    switch (action.type) {
    case GeneralTypes.RECEIVED_MAIN_TAB_SELECTED:
        return action.tabIndex;
    case UserTypes.LOGOUT_SUCCESS:
        return 1;
    default:
        return state;
    }
}

export default combineReducers({
    selectedTabIndex,
});
