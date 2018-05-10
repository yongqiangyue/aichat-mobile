import {createSelector} from 'reselect';

export function getSelectTabIndex(state) {
    return state.views.main.selectedTabIndex;
}
