// Copyright (c) 2016-present AiChat, Inc. All Rights Reserved.
// See License.txt for license information.

import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';
import {init as initLongPolling, close as closeLongPolling} from 'app/actions/long_polling';

import Main from './main.js';

function mapStateToProps(state) {
    return {
        tabIndex: state.views.main.selectedTabIndex,
    };
}

function mapDispatchToProps(dispatch) {
    return {
        actions: bindActionCreators({
            initLongPolling,
            closeLongPolling,
        }, dispatch),
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(Main);
