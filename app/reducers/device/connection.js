// Copyright (c) 2017-present AiChat, Inc. All Rights Reserved.
// See License.txt for license information.

import {UserTypes, DeviceTypes} from 'app/action_types';

export default function connection(state = true, action) {
    switch (action.type) {
    case DeviceTypes.CONNECTION_CHANGED:
        return action.data;

    case UserTypes.LOGOUT_SUCCESS:
        return true;
    }

    return state;
}
