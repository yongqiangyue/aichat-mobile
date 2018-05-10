// Copyright (c) 2016-present AiChat, Inc. All Rights Reserved.
// See License.txt for license information.

import {ImClient, AuthClient, LongPollingClient} from 'app/client';
import {UserTypes, GeneralTypes} from 'app/action_types';
import {buildProfileItem} from 'app/utils/user_utils';
import {logError} from './errors';
import {bindClientFunc, forceLogoutIfNecessary} from './helpers';
import {batchActions} from 'redux-batched-actions';
import base64 from 'base-64';

export function login(loginId, password) {
    return async (dispatch, getState) => {
        dispatch({type: UserTypes.LOGIN_REQUEST}, getState);
        let sigKey = '';
        let customToken = base64.encode(loginId + ':' + password);
        try {
            const data = await AuthClient.login(customToken);
            sigKey = data.value[0].sigKey;
        } catch (error) {
            dispatch(batchActions([
                {
                    type: UserTypes.LOGIN_FAILURE,
                    error,
                },
                logError(error)(dispatch),
            ]), getState);
            return {error};
        }

        return await completeAuthLogin(sigKey, loginId, customToken)(dispatch, getState);
    };
}

function completeAuthLogin(sigKey, identifier, customToken) {
    return async (dispatch, getState) => {
        dispatch(batchActions([
            {
                type: UserTypes.RECEIVED_ME,
                identifier,
            },
            {
                type: GeneralTypes.RECEIVED_AUTH_TOKEN,
                customToken,
            },
        ]), getState);

        AuthClient.setMobile(identifier);

        let data = {};
        try {
            data = await ImClient.login(identifier, sigKey);
            ImClient.setA2(data.A2Key);
            ImClient.setTinyId(data.TinyId);
        } catch (error) {
            dispatch(batchActions([
                {
                    type: UserTypes.LOGIN_FAILURE,
                    error,
                },
                logError(error)(dispatch),
            ]), getState);
            return {error};
        }

        return await completeImLogin(identifier)(dispatch, getState);
    };
}

function completeImLogin(identifier) {
    return async (dispatch, getState) => {
        let profiles = {};
        try {
            const body = {
                From_Account: identifier,
                TagList:
                [
                    'Tag_SNS_IM_Group',
                    'Tag_SNS_IM_Remark',
                    'Tag_SNS_IM_AddSource',
                    'Tag_SNS_IM_AddWording'
                ]
            };
            const snsFriends = await ImClient.getSnsFriends(body);
            const infoItems = snsFriends.InfoItem;
            let portraitAccount = [];
            if (infoItems && infoItems.length > 0) {

                let snsProfile = {};
                infoItems.forEach((infoItem) => {
                    portraitAccount.push(infoItem.Info_Account);
                    snsProfile = buildProfileItem(infoItem.SnsProfileItem);
                    snsProfile['Account_Id'] = infoItem.Info_Account;
                    profiles[infoItem.Info_Account] = snsProfile;
                });
                snsProfile = {};
                snsProfile['Account_Id'] = identifier;
                profiles[identifier] = snsProfile;
            }

            portraitAccount.push(identifier);

            body = {
                From_Account: identifier,
                To_Account: portraitAccount,
                TagList:
                [
                    'Tag_Profile_IM_Nick',
                    'Tag_Profile_IM_Gender',
                    'Tag_Profile_IM_BirthDay',
                    'Tag_Profile_IM_Location',
                    'Tag_Profile_IM_SelfSignature',
                    'Tag_Profile_IM_AllowType',
                    'Tag_Profile_IM_Language',
                    'Tag_Profile_IM_Image',
                    'Tag_Profile_IM_MsgSettings',
                    'Tag_Profile_IM_AdminForbidType',
                    'Tag_Profile_IM_Level',
                    'Tag_Profile_IM_Role',
                    'Tag_Profile_Custom_Type'
                ]
            };
            const portraitFriends = await ImClient.getPortraitFriends(body);
            const userProfileItems = portraitFriends.UserProfileItem;
            if (userProfileItems && userProfileItems.length > 0) {
                let profile = {};
                userProfileItems.forEach((userProfileItem) => {
                    profile = buildProfileItem(userProfileItem.ProfileItem);
                    const snsProfile = profiles[userProfileItem.To_Account];
                    profile = Object.assign({}, profile, snsProfile);
                    profiles[userProfileItem.To_Account] = profile;
                });
            }
        } catch (error) {
            console.log(error);
            dispatch(batchActions([
                {
                    type: UserTypes.LOGIN_FAILURE,
                    error,
                },
                logError(error)(dispatch),
            ]), getState);
            return {error};
        }

        dispatch(batchActions([
            {
                type: UserTypes.RECEIVED_PROFILES_LIST,
                data: profiles,
            },
            {
                type: UserTypes.LOGIN_SUCCESS,
            },
        ]), getState);

        return {data: true};
    };
}

export function logout(url) {
    return async (dispatch, getState) => {
        dispatch({type: UserTypes.LOGOUT_REQUEST}, getState);
        let data;
        try {
            data = await ImClient.logout(loginId, password);
        } catch (error) {
            dispatch(batchActions([
                {
                    type: UserTypes.LOGOUT_FAILURE,
                    error,
                },
                logError(error)(dispatch),
            ]), getState);
            return {error};
        }

        dispatch({type: UserTypes.LOGOUT_SUCCESS}, getState);
    };
}

export function getSnsFriends(body) {
    return bindClientFunc(
        ImClient.getSnsFriends,
        UserTypes.SNS_PROFILES_REQUEST,
        [UserTypes.RECEIVED_SNS_PROFILES, UserTypes.SNS_PROFILES_SUCCESS],
        UserTypes.SNS_PROFILES_FAILURE,
        body,
    );
}

export function getPortraitFriends(body) {
    return bindClientFunc(
        ImClient.getPortraitFriends,
        UserTypes.PORTRAIT_PROFILES_REQUEST,
        [UserTypes.RECEIVED_PORTRAIT_PROFILES, UserTypes.PORTRAIT_PROFILES_SUCCESS],
        UserTypes.PORTRAIT_PROFILES_FAILURE,
        body,
    );
}

export default {
    login,
    logout,
    getSnsFriends,
    getPortraitFriends,
};
