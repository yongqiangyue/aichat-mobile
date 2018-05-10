// Copyright (c) 2016-present AiChat, Inc. All Rights Reserved.
// See License.txt for license information.

import {combineReducers} from 'redux';

import i18n from './i18n';
import login from './login';
import root from './root';
import main from './main';

export default combineReducers({
    i18n,
    login,
    root,
    main,
});
