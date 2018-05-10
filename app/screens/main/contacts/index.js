// Copyright (c) 2016-present AiChat, Inc. All Rights Reserved.
// See License.txt for license information.

import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';

import {
    getSortedCommonUserIds,
    getSortedNasUserIds,
} from 'app/selectors/entities/users';

import Contacts from './contacts.js';

function mapStateToProps(state) {
    const commonUserIds = getSortedCommonUserIds(state);
    const nasUserIds = getSortedNasUserIds(state);

    return {
        commonUserIds,
        nasUserIds,
    };
}

function mapDispatchToProps(dispatch) {
    return {
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(Contacts);
