// Copyright (c) 2016-present AiChat, Inc. All Rights Reserved.
// See License.txt for license information.
/* eslint-disable no-undefined */

import {AsyncStorage, Platform} from 'react-native';
import {createStore, combineReducers} from 'redux';
import {createTransform, persistStore} from 'redux-persist';
import {enableBatching} from 'redux-batched-actions';
import devTools from 'remote-redux-devtools';
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
import deepFreezeAndThrowOnMutation from 'app/utils/deep_freeze';
import Config from 'assets/config';

import {transformSet} from './utils';
import {offlineConfig} from './helpers';

function getAppReducer() {
    return require('../../app/reducers'); // eslint-disable-line global-require
}

const devToolsEnhancer = (
    typeof window !== 'undefined' && window.__REDUX_DEVTOOLS_EXTENSION__ ?  // eslint-disable-line no-underscore-dangle
    window.__REDUX_DEVTOOLS_EXTENSION__ :  // eslint-disable-line no-underscore-dangle
    () => {
        return devTools({
            name: 'AiChat',
            hostname: 'localhost',
            port: 5678,
            realtime: true,
        });
    }
);



export default function configureAppStore(initialState) {

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
            const init_state = store.getState();
            const persistor = persistStore(store, {storage: AsyncStorage, ...options}, () => {
                const state = store.getState();
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

    const store = createStore(
        createOfflineReducer(createReducer(baseState, serviceReducer)),
        baseState,
        // eslint-disable-line - offlineCompose(config)(middleware, other funcs)
        offlineCompose(baseOfflineConfig)(
            middleware,
            [
                devToolsEnhancer(),
            ]
        )
    );

    const state1 = store.getState(); 

    // launch store persistor
    if (baseOfflineConfig.persist) {
        baseOfflineConfig.persist(store, baseOfflineConfig.persistOptions, baseOfflineConfig.persistCallback);
    }

    if (baseOfflineConfig.detectNetwork) {
        baseOfflineConfig.detectNetwork((online) => {
            store.dispatch(networkStatusChangedAction(online));
        });
    }

    if (module.hot) {
        // Enable Webpack hot module replacement for reducers
        module.hot.accept(() => {
            const nextServiceReducer = require('../reducers').default; // eslint-disable-line global-require
            let nextAppReducer;
            if (getAppReducer) {
                nextAppReducer = getAppReducer(); // eslint-disable-line global-require
            }
            store.replaceReducer(createReducer(baseState, nextServiceReducer, nextAppReducer));
        });
    }

    return store;
}

function createReducer(baseState, ...reducers) {
    const baseReducer = combineReducers(Object.assign({}, ...reducers));

    // Root reducer wrapper that listens for reset events.
    // Returns whatever is passed for the data property
    // as the new state.
    function offlineReducer(state = {}, action) {
        if (action.type === GeneralConstants.OFFLINE_STORE_RESET) {
            return baseReducer(baseState, action);
        }

        return baseReducer(state, action);
    }

    return enableFreezing(enableBatching(offlineReducer));
}

function enableFreezing(reducer) {
    return (state, action) => {
        const nextState = reducer(state, action);

        if (nextState !== state) {
            deepFreezeAndThrowOnMutation(nextState);
        }

        return nextState;
    };
}
