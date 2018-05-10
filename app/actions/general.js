import {bindClientFunc, forceLogoutIfNecessary, FormattedError} from './helpers.js';
import {GeneralTypes} from 'app/action_types';
import {logError} from './errors';
import {batchActions} from 'redux-batched-actions';

export function getClientConfig() {
    return async (dispatch, getState) => {
        dispatch({type: GeneralTypes.CLIENT_CONFIG_REQUEST}, getState);

        let data;
        try {
            // data = await Client4.getClientConfigOld();
        } catch (error) {
            forceLogoutIfNecessary(error, dispatch, getState);
            dispatch(batchActions([
                {
                    type: GeneralTypes.CLIENT_CONFIG_FAILURE,
                    error,
                },
                logError(error)(dispatch),
            ]), getState);
            return {error};
        }

        dispatch(batchActions([
            {type: GeneralTypes.CLIENT_CONFIG_RECEIVED, data},
            {type: GeneralTypes.CLIENT_CONFIG_SUCCESS},
        ]));

        return {data};
    };
}

export function setAppState(state) {
    return async (dispatch, getState) => {
        dispatch({type: GeneralTypes.RECEIVED_APP_STATE, data: state}, getState);

        return {data: true};
    };
}

export default {
    getClientConfig,
    setAppState,
};
