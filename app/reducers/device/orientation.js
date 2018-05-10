// Copyright (c) 2017-present AiChat, Inc. All Rights Reserved.
// See License.txt for license information.

import {DeviceTypes} from 'app/action_types';

export default function orientation(state = 'PORTRAIT', action) {
    switch (action.type) {
    case DeviceTypes.DEVICE_ORIENTATION_CHANGED:
        return action.data;
    }

    return state;
}
