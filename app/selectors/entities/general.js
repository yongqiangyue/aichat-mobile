import {createSelector} from 'reselect';

export function getConfig(state) {
    return state.entities.general.config;
}
