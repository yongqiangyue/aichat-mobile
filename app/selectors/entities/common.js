// Users

export function getCurrentUser(state) {
    return state.entities.users.profiles[getCurrentUserId(state)];
}

export function getCurrentUserId(state) {
    return state.entities.users.currentUserId;
}

export function getUsers(state) {
    return state.entities.users.profiles;
}
