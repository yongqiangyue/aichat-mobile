import {combineReducers} from 'redux';
import {UserTypes, SessionTypes} from 'app/action_types';

function sessions(state = {}, action) {
    switch (action.type) {
    case SessionTypes.RECEIVED_SESSIONS_LIST:
        return action.data;
    case UserTypes.LOGOUT_SUCCESS:
        return {};
    default:
        return state;
    }
}

export default combineReducers({
    sessions,
});
