import {ViewTypes, GeneralTypes} from 'app/action_types';
import {ImClient} from 'app/client';

export function handleLoginIdChanged(loginId) {
    return async (dispatch, getState) => {
        dispatch({
            type: ViewTypes.LOGIN_ID_CHANGED,
            loginId,
        }, getState);
    };
}

export function handlePasswordChanged(password) {
    return async (dispatch, getState) => {
        dispatch({
            type: ViewTypes.PASSWORD_CHANGED,
            password,
        }, getState);
    };
}

export function handleSuccessfulLogin() {
    return async (dispatch, getState) => {
        const a2key = ImClient.getA2();
        const tinyId = ImClient.getTinyId();

        dispatch({
            type: GeneralTypes.RECEIVED_IM_TOKEN,
            a2Key: a2key, tinyId: tinyId,
        }, getState);

        return true;
    };
}

export default {
    handleLoginIdChanged,
    handlePasswordChanged,
    handleSuccessfulLogin,
};
