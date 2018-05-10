// Copyright (c) 2016-present AiChat, Inc. All Rights Reserved.
// See License.txt for license information.

import {RequestStatusConstants} from 'app/constants';

export function initialRequestState() {
    return {
        status: RequestStatusConstants.NOT_STARTED,
        error: null,
    };
}

export function handleRequest(REQUEST, SUCCESS, FAILURE, state, action) {
    switch (action.type) {
    case REQUEST:
        return {
            ...state,
            status: RequestStatusConstants.STARTED,
        };
    case SUCCESS:
        return {
            ...state,
            status: RequestStatusConstants.SUCCESS,
            error: null,
        };
    case FAILURE: {
        let error = action.error;
        if (error instanceof Error) {
            error = error.hasOwnProperty('intl') ? JSON.parse(JSON.stringify(error)) : error.toString();
        }

        return {
            ...state,
            status: RequestStatusConstants.FAILURE,
            error,
        };
    }
    default:
        return state;
    }
}
