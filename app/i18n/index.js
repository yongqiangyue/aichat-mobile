// Copyright (c) 2016-present AiChat, Inc. All Rights Reserved.
// See License.txt for license information.

import 'intl';
import {addLocaleData} from 'react-intl';
import enLocaleData from 'react-intl/locale-data/en';
import zhLocaleData from 'react-intl/locale-data/zh';

import en from 'assets/i18n/en.json';
import zhCN from 'assets/i18n/zh-CN.json';

export const DEFAULT_LOCALE = 'en';

const TRANSLATIONS = {
    en,
    'zh-CN': zhCN,
};

addLocaleData(enLocaleData);
addLocaleData(zhLocaleData);

export function getTranslations(locale) {
    return TRANSLATIONS[locale] || TRANSLATIONS[DEFAULT_LOCALE];
}
