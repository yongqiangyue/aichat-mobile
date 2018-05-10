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

import {StyleSheet,} from 'react-native';

export default class Finds extends PureComponent {
    constructor(props) {
        super(props);

        this.state = {
            error: null,
        };
    }

    render() {
        return (
            <Content  style={style.container}>
                <Separator/>

          <ListItem icon last>
            <Left>
              <Button style={{ backgroundColor: "#007AFF" }}>
                <Icon active name="wifi" />
              </Button>
            </Left>
            <Body>
              <Text>他人的分享</Text>
            </Body>
          </ListItem>


          <Separator />

          <ListItem icon last>
            <Left>
              <Button style={{ backgroundColor: "#FD3C2D" }}>
                <Icon active name="notifications" />
              </Button>
            </Left>
            <Body>
              <Text>扫一扫</Text>
            </Body>

          </ListItem>
            </Content>
      );
    }
}

const style = StyleSheet.create({
    container: {
        backgroundColor: "#FFF"
    },
});

// export default injectIntl(RecentContact);
