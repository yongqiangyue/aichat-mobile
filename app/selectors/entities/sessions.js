import {createSelector} from 'reselect';
import {createIdsSelector} from 'app/utils/helpers';

export function getSessions(state) {
    return state.entities.sessions.sessions;
}

export function getSession(state, sessionId) {
    return getSessions(state)[sessionId];
}

export function makeGetSession() {
    return createSelector(
        getSessions,
        (state, props) => props.id,
        (sessions, sessionId) => {
            const session = sessions[sessionId];
            return session;
        }
    );
}

export const getSessionIds = createIdsSelector(
    getSessions,
    (sessions) => {
        const sessionIds = Object.values(sessions).map((session) => session.Session_Id);
        return sessionIds;
    }
);
