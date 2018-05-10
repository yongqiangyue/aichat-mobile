// Copyright (c) 2017-present AiChat, Inc. All Rights Reserved.
// See License.txt for license information.

import {DeviceTypes} from 'app/action_types';

export default function height(state = 0, action) {
    switch (action.type) {
    case DeviceTypes.STATUSBAR_HEIGHT_CHANGED:
        return action.data;
    default:
        return state;
    }
}
