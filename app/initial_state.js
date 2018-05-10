import Config from 'assets/config.json';

const state = {
    entities: {
        general: {
            appState: false,
            config: {},
            authToken: '',
            imToken: {},
        },
        users: {
            currentUserId: '',
            profiles: {},
        },
        sessions: {
            sessions: {},
        },
        msgs: {
            msgs: {},
        },
    },
    errors: [],
    requests: {
        general: {
            config: {
                status: 'not_started',
                error: null,
            },
        },
        users: {
            login: {
                status: 'not_started',
                error: null,
            },
            logout: {
                status: 'not_started',
                error: null,
            },
            getSnsFriends: {
                status: 'not_started',
                error: null,
            },
            getPortraitFriends: {
                status: 'not_started',
                error: null,
            },
        },
    },
    device: {
        connection: true,
    },
    navigation: '',
    views: {
        i18n: {
            locale: '',
        },
        login: {
            loginId: '',
            password: '',
        },
        root: {
            hydrationComplete: false,
            purge: false,
        },
        main: {
            selectedTabIndex: 1,
        },
    },
};

export default state;
