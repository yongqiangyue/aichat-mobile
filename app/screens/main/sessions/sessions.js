// Copyright (c) 2016-present AiChat, Inc. All Rights Reserved.
// See License.txt for license information.

import React, {PureComponent} from 'react';
import PropTypes from 'prop-types';
import {injectIntl, intlShape} from 'react-intl';
import {GlobalStyles} from 'app/styles';
import {
  Container,
  Header,
  Title,
  Content,
  Button,
  Icon,
  List,
  ListItem,
  Text,
  Thumbnail,
  Left,
  Right,
  Separator,
  Body,
  Footer,
  FooterTab,
  Badge,
} from "native-base";

import Loading from 'app/components/loading';
import SessionList from 'app/components/session_list';

import {StyleSheet, View} from 'react-native';

export default class Sessions extends PureComponent {

    static propTypes = {
        actions: PropTypes.shape({
            getSessions: PropTypes.func.isRequired,
        }).isRequired,
        sessionsRequestFailed: PropTypes.bool,
        sessionIds: PropTypes.array,
    };

    constructor(props) {
        super(props);

        this.state = {
            error: null,
        };
    }

    componentWillMount() {
        if (!this.props.sessionIds || this.props.sessionIds.length === 0) {
            this.props.actions.getSessions();
        }
    }

    render() {

        if (!this.props.sessionIds || this.props.sessionIds.length === 0) {

            return (
                <View style={style.loading}>
                    <Loading/>
                </View>
            );
        }


        return (
            <Content>
            <SessionList sessionIds={this.props.sessionIds} navigator={this.props.navigator}/>
      </Content>
      );
    }
}

const style = StyleSheet.create({
    container: {
        backgroundColor: "#FFF"
    },
});
