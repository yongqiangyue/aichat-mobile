// Copyright (c) 2017-present AiChat, Inc. All Rights Reserved.
// See License.txt for license information.

import {NativeModules, Platform} from 'react-native';

// TODO: Remove platform specific once android is implemented
const AiChatBucket = Platform.OS === 'ios' ? NativeModules.AiChatBucket : null;

export default {
    setPreference: (key, value, groupName) => {
        if (AiChatBucket) {
            AiChatBucket.setPreference(key, value, groupName);
        }
    },
    getPreference: async (key, groupName) => {
        if (AiChatBucket) {
            const value = await AiChatBucket.getPreference(key, groupName);
            if (value) {
                try {
                    return JSON.parse(value);
                } catch (e) {
                    return value;
                }
            }
        }

        return null;
    },
    removePreference: (key, groupName) => {
        if (AiChatBucket) {
            AiChatBucket.removePreference(key, groupName);
        }
    },
    writeToFile: (fileName, content, groupName) => {
        if (AiChatBucket) {
            AiChatBucket.writeToFile(fileName, content, groupName);
        }
    },
    readFromFile: async (fileName, groupName) => {
        if (AiChatBucket) {
            const value = await AiChatBucket.readFromFile(fileName, groupName);
            if (value) {
                try {
                    return JSON.parse(value);
                } catch (e) {
                    return value;
                }
            }
        }

        return null;
    },
    removeFile: (fileName, groupName) => {
        if (AiChatBucket) {
            AiChatBucket.removeFile(fileName, groupName);
        }
    },
};
