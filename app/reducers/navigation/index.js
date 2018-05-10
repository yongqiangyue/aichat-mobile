import {UserTypes, NavigationTypes} from 'app/action_types';
import EventEmitter from 'app/utils/event_emitter';

export default function(state = '', action) {
    switch (action.type) {
    case UserTypes.LOGOUT_SUCCESS:
        setTimeout(() => {
            EventEmitter.emit(NavigationTypes.NAVIGATION_RESET);
        });
        break;
    }

    return state;
}
