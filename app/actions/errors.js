import {ErrorTypes} from 'app/action_types';
import serializeError from 'serialize-error';
import EventEmitter from 'app/utils/event_emitter';

export function dismissErrorObject(index) {
    return {
        type: ErrorTypes.DISMISS_ERROR,
        index,
    };
}

export function dismissError(index) {
    return async (dispatch) => {
        dispatch(dismissErrorObject(index));

        return {data: true};
    };
}

export function getLogErrorAction(error, displayable = false) {
    return {
        type: ErrorTypes.LOG_ERROR,
        displayable,
        error,
    };
}

export function logError(error, displayable = false) {
    return async (dispatch) => {
        const serializedError = serializeError(error);

        EventEmitter.emit(ErrorTypes.LOG_ERROR, error);
        dispatch(getLogErrorAction(serializedError, displayable));

        return {data: true};
    };
}

export function clearErrors() {
    return async (dispatch) => {
        dispatch({type: ErrorTypes.CLEAR_ERRORS});

        return {data: true};
    };
}
