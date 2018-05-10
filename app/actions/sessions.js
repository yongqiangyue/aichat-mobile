// Copyright (c) 2016-present AiChat, Inc. All Rights Reserved.
// See License.txt for license information.

import {ImClient, AuthClient, LongPollingClient} from 'app/client';
import {SessionTypes, GeneralTypes} from 'app/action_types';
import {logError} from './errors';
import {bindClientFunc, forceLogoutIfNecessary} from './helpers';
import {batchActions} from 'redux-batched-actions';
import base64 from 'base-64';

export function getSessions() {
    return async (dispatch, getState) => {
        dispatch({type: SessionTypes.SESSIONS_REQUEST}, getState);
        let sessions = {};
        try {
            const recentContacts = await ImClient.getRecentContacts();
            const sessionItems = recentContacts.SessionItem;
            if (sessionItems && sessionItems.length > 0) {
                sessionItems.forEach((sessionItem) => {
                    if (sessionItem.Type == 1) {
                        sessionItem['Session_Id'] = sessionItem.To_Account;
                        sessions[sessionItem.To_Account] = sessionItem;
                    } else if (sessionItem.Type == 2) {
                        sessionItem['Session_Id'] = sessionItem.ToAccount;
                        sessions[sessionItem.ToAccount] = sessionItem;
                    }
                });
            }
        } catch (error) {
            dispatch(batchActions([
                {
                    type: SessionTypes.SESSIONS_FAILURE,
                    error,
                },
                logError(error)(dispatch),
            ]), getState);
            return {error};
        }

        dispatch(batchActions([
            {
                type: SessionTypes.RECEIVED_SESSIONS_LIST,
                data: sessions,
            },
            {
                type: SessionTypes.SESSIONS_SUCCESS,
            },
        ]), getState);
    };
}


export default {
};
