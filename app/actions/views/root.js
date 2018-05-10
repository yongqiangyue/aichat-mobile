// Copyright (c) 2016-present AiChat, Inc. All Rights Reserved.
// See License.txt for license information.

import {GeneralConstants} from 'app/constants';
import {getClientConfig} from 'app/actions/general';

export function loadConfig() {
    return async (dispatch, getState) => {
        const [configData] = await Promise.all([
            getClientConfig()(dispatch, getState),
        ]);
        const config = configData.data || {};
        return {config};
    };
}

export function purgeOfflineStore() {
    return {type: GeneralConstants.OFFLINE_STORE_PURGE};
}

export default {
    loadConfig,
    purgeOfflineStore,
};
