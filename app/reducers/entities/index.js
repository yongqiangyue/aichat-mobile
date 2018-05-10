import {combineReducers} from 'redux';

import general from './general';
import users from './users';
import sessions from './sessions';
import msgs from './msgs';

export default combineReducers({
    general,
    users,
    sessions,
    msgs,
});
