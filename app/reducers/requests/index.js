import {combineReducers} from 'redux';

import general from './general';
import users from './users';
import sessions from './sessions';

export default combineReducers({
    general,
    users,
    sessions,
});
