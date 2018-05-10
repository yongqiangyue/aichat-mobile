// Copyright (c) 2016-present AiChat, Inc. All Rights Reserved.
// See License.txt for license information.

import {AsyncStorage, Platform} from 'react-native';
import {createStore, combineReducers} from 'redux';
import {createTransform, persistStore} from 'redux-persist';
import {enableBatching} from 'redux-batched-actions';
import thunk from 'redux-thunk';
import {REHYDRATE} from 'redux-persist/constants';
import {createBlacklistFilter} from 'redux-persist-transform-filter';
import {createOfflineReducer, networkStatusChangedAction, offlineCompose} from 'redux-offline';
import defaultOfflineConfig from 'redux-offline/lib/defaults';
import createActionBuffer from 'redux-action-buffer';

import {ErrorTypes, GeneralTypes, NavigationTypes, ViewTypes} from 'app/action_types';
import {GeneralConstants, RequestStatusConstants} from 'app/constants';
import EventEmitter from 'app/utils/event_emitter';
import serviceReducer from 'app/reducers';
import {throttle} from 'app/utils/general';
import networkConnectionListener from 'app/utils/network';

import aichatBucket from 'app/aichat_bucket';
import Config from 'assets/config';

import {transformSet} from './utils';
import {offlineConfig} from './helpers';

function getAppReducer() {
    return require('../../app/reducers'); // eslint-disable-line global-require
}

export default function configureOfflineAppStore(initialState) {

    const offlineOptions = {
        effect: (effect, action) => {
            if (typeof effect !== 'function') {
                throw new Error('Offline Action: effect must be a function.');
            } else if (!action.meta.offline.commit) {
                throw new Error('Offline Action: commit action must be present.');
            }

            return effect();
        },
        detectNetwork: (callback) => networkConnectionListener(callback),
        persist: (store, options) => {
            const persistor = persistStore(store, {storage: AsyncStorage, ...options}, () => {
                store.dispatch({
                    type: GeneralConstants.STORE_REHYDRATION_COMPLETE,
                    complete: true,
                });
            });

            let purging = false;

            // for iOS write the entities to a shared file
            if (Platform.OS === 'ios') {
                store.subscribe(throttle(() => {
                    const state = store.getState();
                    if (state.entities) {
                        aichatBucket.writeToFile('entities', JSON.stringify(state.entities), Config.AppGroupId);
                    }
                }, 1000));
            }

            // check to see if the logout request was successful
            store.subscribe(async () => {
                const state = store.getState();
                if ((state.requests.users.logout.status === RequestStatusConstants.SUCCESS || state.requests.users.logout.status === RequestStatusConstants.FAILURE) && !purging) {
                    purging = true;

                    await persistor.purge();

                    store.dispatch(batchActions([
                        {
                            type: GeneralConstants.OFFLINE_STORE_RESET,
                            data: initialState,
                        },
                        {
                            type: GeneralTypes.RECEIVED_AUTH_TOKEN,
                            data: state.entities.general.authToken,
                        },
                        {
                            type: GeneralTypes.RECEIVED_IM_TOKEN,
                            data: state.entities.general.imToken,
                        },
                    ]));

                    setTimeout(() => {
                        purging = false;
                    }, 500);
                } else if (state.views.root.purge && !purging) {
                    purging = true;

                    await persistor.purge();

                    store.dispatch(batchActions([
                        {
                            type: GeneralConstants.OFFLINE_STORE_RESET,
                            data: initialState,
                        },
                        {
                            type: ErrorTypes.RESTORE_ERRORS,
                            data: [...state.errors],
                        },
                        {
                            type: GeneralTypes.RECEIVED_AUTH_TOKEN,
                            data: state.entities.general.authToken,
                        },
                        {
                            type: GeneralTypes.RECEIVED_IM_TOKEN,
                            data: state.entities.general.imToken,
                        },
                    ], 'BATCH_FOR_RESTART'));

                    setTimeout(() => {
                        purging = false;
                        EventEmitter.emit(NavigationTypes.RESTART_APP);
                    }, 500);
                }
            });

            return persistor;
        },
        persistOptions: {
            autoRehydrate: {
                log: false,
            },
            blacklist: ['device', 'navigation', 'offline', 'requests'],
            debounce: 500,
        },
    };

    const baseOfflineConfig = Object.assign({}, defaultOfflineConfig, offlineConfig, offlineOptions);
    const baseState = Object.assign({}, initialState);

    const middleware = [thunk];
    middleware.push(createActionBuffer(REHYDRATE));

    // Root reducer wrapper that listens for reset events.
    // Returns whatever is passed for the data property
    // as the new state.
    function offlineReducer(state = {}, action) {
        if (action.type === General.OFFLINE_STORE_RESET) {
            return baseReducer(baseState, action);
        }

        return baseReducer(state, action);
    }

    const store = createStore(
        createOfflineReducer(enableBatching(offlineReducer)),
        baseState,
        offlineCompose(baseOfflineConfig)(
            middleware,
            []
        )
    );

    // launch store persistor
    if (baseOfflineConfig.persist) {
        baseOfflineConfig.persist(store, baseOfflineConfig.persistOptions, baseOfflineConfig.persistCallback);
    }

    if (baseOfflineConfig.detectNetwork) {
        baseOfflineConfig.detectNetwork((online) => {
            store.dispatch(networkStatusChangedAction(online));
        });
    }

    return store;
}
