// Copyright (c) 2016-present AiChat, Inc. All Rights Reserved.
// See License.txt for license information.

import React, {PureComponent} from 'react';
import PropTypes from 'prop-types';
import {IntlProvider} from 'react-intl';

import {getTranslations} from 'app/i18n';

export default class Root extends PureComponent {
    static propTypes = {
        children: PropTypes.node,
        navigator: PropTypes.object,
        locale: PropTypes.string.isRequired,
    };

    render() {
        const locale = this.props.locale;

        return (
            <IntlProvider
                ref='provider'
                locale={locale}
                messages={getTranslations(locale)}
            >
                {this.props.children}
            </IntlProvider>
        );
    }
}
