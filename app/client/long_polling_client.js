import {LongPollingConstants} from 'app/constants';
import {ImClient} from 'app/client';

const LONG_POLLING_MAX_RET_ERROR_COUNT = 10;
const LONG_POLLING_TIME_OUT_ERROR_CODE = 60008;
const LONG_POLLING_INTERVAL_TIME = 5000;

class LongPollingClient {
    constructor() {
        this.dispatch = null;
        this.getState = null;

        this.longPollingDefaultTimeOut = 60000; // 1 mins
        this.notifySeq = 0;
        this.noticeSeq = 0;
        this.longPollingId = null;
        this.curLongPollingRetErrorCount = 0;
        this.longPollingOffCallbackFlag = false;
        this.curLongPollingStatus = LongPollingConstants.CONNECTION_STATUS_INIT;
        this.longPollingOn =  false;

        this.connectCallback = null;
        this.syncMsgsCallback = null;
        this.handlerOrdinaryAndTipC2cMsgsCallback = null;
        this.longPolling = this.longPolling.bind(this);
    }

    setConnectCallback (connectCallback) {
        this.connectCallback = connectCallback;
    }

    setSyncMsgsCallback (syncMsgsCallback) {
        this.syncMsgsCallback = syncMsgsCallback;
    }

    setHandlerOrdinaryAndTipC2cMsgsCallback (handlerOrdinaryAndTipC2cMsgsCallback) {
        this.handlerOrdinaryAndTipC2cMsgsCallback = handlerOrdinaryAndTipC2cMsgsCallback;
    }

    setLongPollingOn(isOn) {
        this.longPollingOn = true;
    }

    longPolling = async (dispatch, getState) => {
        let updatecLongPollingStatus = null;

        try {
            const startNextLongPolling = (dispatch, getState) => {
                this.longPollingOn && this.longPolling()(dispatch, getState);
            };

            updatecLongPollingStatus = (errObj, dispatch, getState) =>{
                try {
                    if (errObj.ErrorCode == 0 || errObj.ErrorCode == LONG_POLLING_TIME_OUT_ERROR_CODE) {
                        this.curLongPollingRetErrorCount = 0;
                        this.longPollingOffCallbackFlag = false;
                        var errorInfo;
                        var isNeedCallback = false;
                        switch (this.curLongPollingStatus) {
                            case LongPollingConstants.CONNECTION_STATUS_INIT:
                                isNeedCallback = true;
                                this.curLongPollingStatus = LongPollingConstants.CONNECTION_STATUS_ON;
                                errorInfo = "create connection successfully(INIT->ON)";
                                break;
                            case LongPollingConstants.CONNECTION_STATUS_ON:
                                errorInfo = "connection is on...(ON->ON)";
                                break;
                            case LongPollingConstants.CONNECTION_STATUS_RECONNECT:
                                this.curLongPollingStatus = LongPollingConstants.CONNECTION_STATUS_ON;
                                errorInfo = "connection is on...(RECONNECT->ON)";
                                break;
                            case LongPollingConstants.CONNECTION_STATUS_OFF:
                                isNeedCallback = true;
                                this.curLongPollingStatus = LongPollingConstants.CONNECTION_STATUS_RECONNECT;
                                errorInfo = "reconnect successfully(OFF->RECONNECT)";
                                break;
                        }
                        var successInfo = {
                            'ActionStatus': 'OK',
                            'ErrorCode': this.curLongPollingStatus,
                            'ErrorInfo': errorInfo
                        };
                        isNeedCallback && this.connectCallback(successInfo, dispatch, getState);
                        this.longPollingOn && this.longPolling(dispatch, getState);
                    } else {
                        //记录长轮询返回解析json错误次数
                        this.curLongPollingRetErrorCount++;
                        console.warn("longPolling接口第" + this.curLongPollingRetErrorCount + "次报错: " + errObj.ErrorInfo);
                        //累计超过一定次数
                        if (this.curLongPollingRetErrorCount <= LONG_POLLING_MAX_RET_ERROR_COUNT) {
                            setTimeout(startNextLongPolling(dispatch, getState), 100); //
                        } else {
                            this.curLongPollingStatus = LongPollingConstants.CONNECTION_STATUS_OFF;
                            var errInfo = {
                                'ActionStatus': 'FAIL',
                                'ErrorCode': LongPollingConstants.CONNECTION_STATUS_OFF,
                                'ErrorInfo': 'connection is off'
                            };
                            this.longPollingOffCallbackFlag == false && this.connectCallback(errInfo, dispatch, getState);
                            this.longPollingOffCallbackFlag = true;
                            // console.warn(this.longPollingIntervalTime + "毫秒之后,SDK会发起新的longPolling请求...");
                            setTimeout(startNextLongPolling(dispatch, getState), LONG_POLLING_INTERVAL_TIME); //长轮询接口报错次数达到一定值，每间隔5s发起新的长轮询
                        }
                    }
                } catch (error) {
                    console.log(error);
                }
            };

            let opts = {
                'Timeout': this.longPollingDefaultTimeOut / 1000,
                'Cookie': {
                    'NotifySeq': this.notifySeq,
                    'NoticeSeq': this.noticeSeq
                }
            };

            if (this.longPolingId) {
                opts.Cookie.LongPollingId = this.longPollingId;
            } else {
                const resp = await ImClient.getLongPollingId();
                this.longPollingId = opts.Cookie.LongPollingId = resp.LongPollingId;
                //根据回包设置超时时间，超时时长不能>60秒，因为webkit手机端的最长超时时间不能大于60s
                this.longPollingDefaultTimeOut = resp.Timeout > 60 ? this.longPollingDefaultTimeOut : resp.Timeout * 1000;
            }

            const doPolling = async (opts, dispatch, getState) => {
                try {
                    const url = `${ImClient.getOpenImRoute()}/longpolling${ImClient.getRequestParams()}`;
                    let response = await fetch(url, {method: 'post', body: JSON.stringify(opts)});
                    let data = await response.json();
                    for (var i in data.EventArray) {
                        var e = data.EventArray[i];
                        switch (e.Event) {
                            case LongPollingConstants.C2C: //c2c消息通知
                                //更新C2C消息通知seq
                                this.notifySeq = e.NotifySeq;
                                // console.warn("longpolling: received new c2c msg");
                                //获取新消息
                                this.syncMsgsCallback(dispatch, getState);
                                break;
                            case LongPollingConstants.GROUP_COMMON: //普通群消息通知
                                // console.warn("longpolling: received new group msgs");
                                break;
                            case LongPollingConstants.GROUP_TIP: //（全员广播）群提示消息
                                // console.warn("longpolling: received new group tips");
                                break;
                            case LongPollingConstants.GROUP_TIP2: //群提示消息
                                // console.warn("longpolling: received new group tips");
                                break;
                            case LongPollingConstants.GROUP_SYSTEM: //（多终端同步）群系统消息
                                // console.warn("longpolling: received new group system msgs");
                                //false 表示 通过长轮询收到的群系统消息，可以不判重
                                break;
                            case LongPollingConstants.FRIEND_NOTICE: //好友系统通知
                                // console.warn("longpolling: received new friend system notice");
                                //false 表示 通过长轮询收到的好友系统通知，可以不判重
                                break;
                            case LongPollingConstants.PROFILE_NOTICE: //资料系统通知
                                // console.warn("longpolling: received new profile system notice");
                                //false 表示 通过长轮询收到的资料系统通知，可以不判重
                                break;
                            case LongPollingConstants.C2C_COMMON: //c2c消息通知
                                this.noticeSeq = e.C2cMsgArray[0].NoticeSeq;
                                //更新C2C消息通知seq
                                // console.warn("longpolling: received new c2c_common msg", this.noticeSeq);
                                this.handlerOrdinaryAndTipC2cMsgsCallback(e.Event, e.C2cMsgArray, dispatch, getState);
                                break;
                            case LongPollingConstants.C2C_EVENT: //c2c已读消息通知
                                this.noticeSeq = e.C2cNotifyMsgArray[0].NoticeSeq;
                                // console.warn("longpolling: received new c2c_event msg");
                                break;
                            default:
                                console.error("longpolling收到未知新消息类型: Event=" + e.Event);
                                break;
                        }
                    }
                    var errObj = {
                        'ActionStatus': 'OK',
                        'ErrorCode': 0
                    };
                    updatecLongPollingStatus(errObj, dispatch, getState);
                } catch (errObj) {
                    updatecLongPollingStatus(errObj, dispatch, getState);
                }
            };
            this.doPolling(opts, dispatch, getState);
        } catch (error) {
            console.log(error);
            var errObj = {
                'ActionStatus': 'FAIL',
                'ErrorCode': 404
            };
            updatecLongPollingStatus(errObj, dispatch, getState);
        }
    }
}

export default new LongPollingClient();
