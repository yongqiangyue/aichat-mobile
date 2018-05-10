// Copyright (c) 2017-present AiChat, Inc. All Rights Reserved.
// See License.txt for license information.

import {connect} from 'react-redux';

import {getCurrentLocale} from 'app/selectors/i18n';

import Root from './root';

function mapStateToProps(state) {
    const locale = getCurrentLocale(state);

    return {
        locale,
    };
}

export default connect(mapStateToProps)(Root);
