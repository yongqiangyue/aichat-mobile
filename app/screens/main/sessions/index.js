// Copyright (c) 2016-present AiChat, Inc. All Rights Reserved.
// See License.txt for license information.

import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';

import {RequestStatusConstants} from 'app/constants';

import {getSessions} from 'app/actions/sessions';
import {getSessionIds} from 'app/selectors/entities/sessions'

import Sessions from './sessions.js';

function mapStateToProps(state) {
    const {mySessions: sessionsRequest} = state.requests.sessions;

    return {
        sessionsRequestFailed: sessionsRequest.status === RequestStatusConstants.FAILURE,
        sessionIds: getSessionIds(state),
    };
}

function mapDispatchToProps(dispatch) {
    return {
        actions: bindActionCreators({
            getSessions,
        }, dispatch),
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(Sessions);
