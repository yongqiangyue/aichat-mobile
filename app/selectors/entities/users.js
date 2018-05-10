// Copyright (c) 2016-present AiChat, Inc. All Rights Reserved.
// See License.txt for license information.

import {createSelector} from 'reselect';
import {createIdsSelector} from 'app/utils/helpers';

import {
    getCurrentUser,
    getCurrentUserId,
    getUsers,
} from 'app/selectors/entities/common';

export {
    getCurrentUserId,
    getCurrentUser,
    getUsers,
};

export function makeGetUser() {
    return createSelector(
        getUsers,
        (state, props) => props.id,
        (profiles, userId) => {
            const user = profiles[userId];
            return user;
        }
    );
}

export const getUserIds = createIdsSelector(
    getUsers,
    (profiles) => {
        const userIds = profiles.map((profile) => profile.Account_Id);
        return userIds;
    }
);

export const getSortedCommonUserIds = createIdsSelector(
    getCurrentUserId,
    getUsers,
    (currentUserId, profiles) => {
        let commonUserIds = [];
        for (const profile of Object.values(profiles)) {
            customType = profile.Tag_Profile_Custom_Type || '';
            if ((customType === '' || customType === 'IM') && profile.Account_Id !== currentUserId) {
                commonUserIds.push(profile.Account_Id);
            }
        }
        return commonUserIds;
    }
);

export const getSortedNasUserIds = createIdsSelector(
    getCurrentUserId,
    getUsers,
    (currentUserId, profiles) => {
        let nasUserIds = [];
        for (const profile of Object.values(profiles)) {
            customType = profile.Tag_Profile_Custom_Type || '';
            if (customType === '') {
                continue;
            } else if (customType === 'NAS' && profile.Account_Id !== currentUserId) {
                nasUserIds.push(profile.Account_Id);
            }
        }
        return nasUserIds;
    }
);
