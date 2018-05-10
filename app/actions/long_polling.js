import {batchActions} from 'redux-batched-actions';

import EventEmitter from 'app/utils/event_emitter';
import LongPollingClient from 'app/client/long_polling_client';

export function init() {
    return async (dispatch, getState) => {
        await LongPollingClient.setLongPollingOn(true);
        await LongPollingClient.setConnectCallback(handleConnect);
        await LongPollingClient.setSyncMsgsCallback(handleSyncMsgs);
        await LongPollingClient.setHandlerOrdinaryAndTipC2cMsgsCallback(handleOrdinaryAndTipC2cMsgs);
        await LongPollingClient.longPolling(dispatch, getState);
    };
}

export function close() {
    return async (dispatch, getState) => {
        await LongPollingClient.setLongPollingOn(false);
    };
}

function handleConnect(connectInfo, dispatch, getState) {
    console.log(connectInfo);
}

function handleSyncMsgs(dispatch, getState) {
    console.log('syncmsgs');
}

function handleOrdinaryAndTipC2cMsgs(event, c2cMsgArray, dispatch, getState) {
    console.log('=================');
    console.log(event);
    console.log(c2cMsgArray);
    console.log('=================');
}
