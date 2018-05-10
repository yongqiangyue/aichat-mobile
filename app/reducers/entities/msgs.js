import {combineReducers} from 'redux';
import {UserTypes} from 'app/action_types';

function msgs(state = {}, action) {
    switch (action.type) {
    case UserTypes.LOGOUT_SUCCESS:
        return {};
    default:
        return state;
    }
}

export default combineReducers({
    msgs,
});
