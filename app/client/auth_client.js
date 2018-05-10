// Copyright (c) 2017-present AiChat, Inc. All Rights Reserved.
// See License.txt for license information.

import RNFetchBlob from 'react-native-fetch-blob';

import base64 from 'base-64';

import Config from 'assets/config.json';

const HEADER_AUTH = 'Authorization';
const HEADER_BASIC = 'basic';
const HEADER_REQUESTED_WITH = 'X-Requested-With';

export default class AuthClient {
    constructor() {
        this.logToConsole = false;
        this.token = base64.encode('admin@internal:abc123');
        this.url = Config.DefaultAuthUrl;
        this.enableLogging = false;
        this.defaultHeaders = {};
        this.mobile = '';
    }

    setMobile(mobile) {
        this.mobile = mobile;
    }

    getMobile() {
        return this.mobile;
    }

    getToken() {
        return this.token;
    }

    setToken(token) {
        this.token = token;
    }

    setAcceptLanguage(locale) {
        this.defaultHeaders['Accept-Language'] = locale;
    }

    setEnableLogging(enable) {
        this.enableLogging = enable;
    }

    getBaseRoute() {
        return `${this.url}`;
    }

    getMobileRoute(mobile) {
        return `${this.getBaseRoute()}/${mobile}`;
    }

    getHeaders(customToken) {

        const headers = {
            [HEADER_REQUESTED_WITH]: 'XMLHttpRequest',
            ...this.defaultHeaders,
        };

        if (customToken == '') {
            headers[HEADER_AUTH] = `${HEADER_BASIC} ${this.token}`;
        } else {
            headers[HEADER_AUTH] = `${HEADER_BASIC} ${customToken}`;
        }

        return headers;
    }

    doFetch = async (method, url, customToken = '', body = '') => {
        const {data} = await this.doFetchWithResponse(method, url, customToken, body);

        return data;
    };

    doFetchWithResponse = async (method, url, customToken = '', body = '') => {
        let headers = this.getHeaders(customToken);
        let data;
        try {
            if (body === '') {
                data = await RNFetchBlob.config({trusty: true}).fetch(method, url, headers).then((response) => {
                    let auth_data = {
                        code: 1,
                        message: "ERROR",
                        value: ""
                    };
                    const info = response.info();
                    if (info.status == 200) {
                        auth_data = response.json();
                    }
                    return auth_data;
                });
            } else {
                data = await RNFetchBlob.config({trusty: true}).fetch(method, url, headers, body).then((response) => {
                    let auth_data = {
                        code: 1,
                        message: "ERROR",
                        value: ""
                    };
                    const info = response.info();
                    if (info.status == 200) {
                        auth_data = response.json();
                    }
                    return auth_data;
                });
            }
            if (data.code == 0) {
                return data;
            }
        } catch (err) {
            throw {
                intl: {
                    id: 'mobile.request.invalid_response',
                    defaultMessage: 'Received invalid response from the auth server.',
                },
            };
        }

        const msg = data.message || '';

        if (this.logToConsole) {
            console.error(msg); // eslint-disable-line no-console
        }

        throw {
            message: msg,
            server_error_id: `mobile.request.auth_${data.code}`,
            status_code: data.code,
            url,
        };
    };

    checkMobileExists = async (mobile) => {
        return this.doFetch('get',
            `${this.getMobileRoute(mobile)}/checktel`
        );
    };

    sendVerificationMobile = async (mobile) => {
        return this.doFetch('get',
            `${this.getMobileRoute(mobile)}/getrandomcode`
        );
    }

    login = async (customToken) => {
        try {
            const data = await this.doFetchWithResponse('get',
                `${this.getBaseRoute()}/login`, customToken);
            return data;
        } catch (error) {
            console.log(error);
        }
        return {};
    }

    createUser = async (reqOptions) => {
        return this.doFetch('post',
            `${this.getBaseRoute()}/user/register`,
            getToken(),
            JSON.stringify(reqOptions)
        );
    }

    updatePassword = async (reqOptions) => {
        return this.doFetch('put',
            `${this.getMobileRoute(mobile)}/updatepwd`,
            getToken(),
            JSON.stringify(reqOptions)
        );
    }

    getShare = async () => {
        const headers = {
            [HEADER_AUTH]: `${HEADER_BASIC} ${base64.encode('superadmin:admin')}`,
            'OCS-APIREQUEST': 'true',
        };
        let data;
        try {
            const url = 'http://192.168.110.81/ocs/v2.php/apps/files_sharing/api/v3/shares/110';
            await RNFetchBlob.config({trusty: true}).fetch('get', url, headers).then((response) => {
                data = response.text();

                if (data.code === 0) {
                    return {
                        response,
                        headers,
                        data,
                    };
                }
            });
        } catch (err) {
            console.log(err);
            throw {
                intl: {
                    id: 'mobile.request.invalid_response',
                    defaultMessage: 'Received invalid response from the auth server.',
                },
            };
        }

        const msg = data.message || '';

        if (this.logToConsole) {
            console.error(msg); // eslint-disable-line no-console
        }

        throw {
            message: msg,
            server_error_id: `mobile.request.auth_${data.code}`,
            status_code: data.status_code,
            url,
        };
    };

}
