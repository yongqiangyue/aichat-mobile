import Config from 'assets/config.json';
const FormData = require('form-data');

import fetch from './fetch_etag';

const HEADER_AUTH = 'Authorization';
const HEADER_BEARER = 'BEARER';

const PER_PAGE_DEFAULT = 60;

export default class ImClient {
    constructor() {
        this.logToConsole = false;
        this.url = Config.DefaultImUrl;
        this.urlVersion = '/v4';
        this.picUrl = Config.DefaultPicUrl;
        this.soundOrFileUrl = '';
        this.enableLogging = false;
        this.defaultHeaders = {};
        this.userId = '';
        this.tinyId = '';
        this.a2 = '';
        this.contentType = 'json';
        this.sdkAppId = Config.DefaultAppId;
        this.accountType = 0;
    }

    setTinyId(tinyId) {
        this.tinyId = tinyId;
    }

    getTinyId() {
        return this.tinyId;
    }

    setA2(a2) {
        this.a2 = a2;
    }

    getA2() {
        return this.a2;
    }

    setEnableLogging(enable) {
        this.enableLogging = enable;
    }

    setUserId(userId) {
        this.userId = userId;
    }

    getBaseRoute() {
        return `${this.url}${this.urlVersion}`;
    }

    getOpenImRoute() {
        return `${this.getBaseRoute()}/openim`;
    }

    getRecentContactRoute() {
        return `${this.getBaseRoute()}/recentcontact`;
    }

    getSnsRoute() {
        return `${this.getBaseRoute()}/sns`;
    }

    getProfileRoute() {
        return `${this.getBaseRoute()}/profile`;
    }

    getGroupRoute() {
        return `${this.getBaseRoute()}/group_open_http_svc`;
    }

    getRequestParams(identifier = '', usersig = '') {

        const requestParams = {};

        if (this.a2 && this.tinyId) {
            requestParams.a2 = this.a2;
            requestParams.tinyid = this.tinyId;
        } else {
            requestParams.identifier = identifier;
            requestParams.usersig = usersig;
        }
        requestParams.contenttype = this.contentType;
        requestParams.sdkappid = this.sdkAppId;
        requestParams.reqtime = Date.now();
        requestParams.accounttype = this.accountType;

        const requestString = buildRequestString(requestParams);
        return requestString;
    }

    login = async (identifier, usersig) => {
        const data = await this.doFetchWithResponse(
            `${this.getOpenImRoute()}/login${this.getRequestParams(identifier, usersig)}`,
            {method: 'post', body: JSON.stringify({State: 'Online'})}
        );

        return data;
    }


    logout = async () => {
        const data = await this.doFetchWithResponse(
            `${this.getOpenImRoute()}/logout${this.getRequestParams()}`,
            {method: 'post'}
        );

        return data;
    }

    longPolling = async (body) => {
        const data = await this.doFetchWithResponse(
            `${this.getOpenImRoute()}/longpolling${this.getRequestParams()}`,
            {method: 'post', body: JSON.stringify(body)}
        );

        return data;
    }

    getLongPollingId = async () => {
        const data = await this.doFetchWithResponse(
            `${this.getOpenImRoute()}/getlongpollingid${this.getRequestParams()}`,
            {method: 'post', body: JSON.stringify({})}
        );

        return data;
    }

    longPollingLogout = async (longPolingId) => {
        const data = await this.doFetchWithResponse(
            `${this.getOpenImRoute()}/longpollinglogout${this.getRequestParams()}`,
            {method: 'post', body: JSON.stringify({LongPollingId: longPolingId})}
        );

        return data;
    }

    /**
    cookie 记录当前读到的最新消息位置
    syncFlag 1代表没拉取完，2代表拉取完毕
    */
    getMsgs = async (cookie = '', syncFlag = 0) => {
        const data = await this.doFetch(
            `${this.getOpenImRoute()}/getmsg${this.getRequestParams()}`,
            {method: 'post', body: JSON.stringify({Cookie: cookie, SyncFlag: syncFlag})}
        );

        return data;
    }


    /**
    SyncOtherMachine	Integer	选填
        1：把消息同步到 From_Account 在线终端和漫游上；
        2：消息不同步至 From_Account；若不填写默认情况下会将消息存 From_Account 漫游
    From_Account	String	选填	消息发送方帐号。（用于指定发送消息方帐号）
    To_Account	String	必填	消息接收方帐号。
    MsgLifeTime	Integer	选填	消息离线保存时长（秒数），最长为 7 天（604800s）。若消息只发在线用户，不想保存离线，则该字段填 0。若不填，则默认保存 7 天
    MsgRandom	Integer	必填	消息随机数,由随机函数产生。（用作消息去重）
    MsgTimeStamp	Integer	选填	消息时间戳，unix 时间戳。
    MsgBody	Object	必填	消息内容，具体格式请参考 消息格式描述。（注意，一条消息可包括多种消息元素，MsgBody 为 Array 类型）
    MsgType	String	必填	TIM消息对象类型，目前支持的消息对象包括： TIMTextElem(文本消息),TIMFaceElem(表情消息)， TIMLocationElem(位置消息)，TIMCustomElem(自定义消息)。
    MsgContent	Object	必填	对于每种 MsgType 用不同的 MsgContent 格式，具体可参考 消息格式描述。
    OfflinePushInfo	Object	选填	离线推送信息配置，具体可参考 消息格式描述。
    */
    sendMsg = async (body) => {
        const data = await this.doFetch(
            `${this.getOpenImRoute()}/sendmsg${this.getRequestParams()}`,
            {method: 'post', body: JSON.stringify(body)}
        );

        return data;
    }

    /**
    From_Account	String	必填	需要拉取该 Identifier 的好友。
    TimeStamp	Integer	选填	上次拉取的时间戳，不填或为 0 时表示全量拉取。
    StartIndex	Integer	必填	拉取的起始位置。
    TagList	Array	选填	指定要拉取的字段 Tag，支持拉取的字段有：
        1、标配资料字段，详情可参见 标配资料字段；
        2、自定义资料字段，详情可参见 自定义资料字段；
        3、标配好友字段，详情可参见 标配好友字段；
        4、自定义好友字段，详情可参见 自定义好友字段；
    LastStandardSequence	Integer	选填	上次拉取标配关系链的 Sequence，仅在只拉取标配关系链字段时有用。
    GetCount	Integer	选填	每页需要拉取的好友数量：
        1、默认每页拉取 100 个好友；
        2、建议每次拉取的好友数不要太多；
        3、如果拉取好友超时，请适量减少每次拉取的好友数。
    */
    getSnsFriends = async (body) => {
        const data = await this.doFetch(
            `${this.getSnsRoute()}/friend_get_all${this.getRequestParams()}`,
            {method: 'post', body: JSON.stringify(body)}
        );

        return data;
    }

    /**
    To_Account	Array	必填	需要拉取这些Identifier的资料：
        注意：每次拉取的用户数不得超过100，避免因回包数据量太大以致回包失败。
    TagList	Array	必填	指定要拉取的资料字段的Tag，支持的字段有：
        1、标配资料字段，详情可参见标配资料字段；
        2、自定义资料字段，详情可参见自定义资料字段。
    */
    getPortraitFriends = async (body) => {
        const data = await this.doFetch(
            `${this.getProfileRoute()}/portrait_get${this.getRequestParams()}`,
            {method: 'post', body: JSON.stringify(body)}
        );

        return data;
    }

    getRecentContacts = async () => {
        const data = await this.doFetch(
            `${this.getRecentContactRoute()}/get${this.getRequestParams()}`,
            {method: 'post', body: JSON.stringify({From_Account: this.userId, Count: 50})}
        );

        return data;
    }

    /**
    From_Account	String	必填	需要拉取该 Identifier 的好友。
    Type
    ToGroupid
    To_Account
    */
    deleteRecentContacts = async (body) => {
        const data = await this.doFetch(
            `${this.getRecentContactRoute()}/delete${this.getRequestParams()}`,
            {method: 'post', body: JSON.stringify(body)}
        );

        return data;
    }

    doFetch = async (url, options) => {
        const data = await this.doFetchWithResponse(url, options);

        return data;
    };

    doFetchWithResponse = async (url, options) => {
        const response = await fetch(url, options);
        let data;

        try {
            data = await response.json();
        } catch (err) {
            throw {
                intl: {
                    id: 'mobile.request.invalid_response',
                    defaultMessage: 'Received invalid response from the server.',
                },
            };
        }

        if (response.ok && data.ActionStatus == 'OK') {
            return data;
        }

        const msg = data.ErrorInfo || '';

        if (this.logToConsole) {
            console.error(msg); // eslint-disable-line no-console
        }

        throw {
            message: msg,
            server_error_id: data.id,
            status_code: data.ErrorCode,
            url,
        };
    };

}

function buildRequestString(parameters) {
    const keys = Object.keys(parameters);
    if (keys.length === 0) {
        return '';
    }

    let query = '?';
    for (let i = 0; i < keys.length; i++) {
        const key = keys[i];
        query += key + '=' + encodeURIComponent(parameters[key]);

        if (i < keys.length - 1) {
            query += '&';
        }
    }

    return query;
}
