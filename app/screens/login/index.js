// Copyright (c) 2016-present AiChat, Inc. All Rights Reserved.
// See License.txt for license information.

import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';

import LoginActions from 'app/actions/views/login';

import {login} from 'app/actions/users';

import Login from './login.js';

function mapStateToProps(state) {
    const {login: loginRequest} = state.requests.users;
    return {
        ...state.views.login,
        loginRequest,
    };
}

function mapDispatchToProps(dispatch) {
    return {
        actions: bindActionCreators({
            ...LoginActions,
            login,
        }, dispatch),
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(Login);
