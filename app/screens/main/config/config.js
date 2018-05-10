// Copyright (c) 2016-present AiChat, Inc. All Rights Reserved.
// See License.txt for license information.

import React, {PureComponent} from 'react';
import PropTypes from 'prop-types';
import {injectIntl, intlShape} from 'react-intl';
import {GlobalStyles} from 'app/styles';
import {preventDoubleTap} from 'app/utils/tap';
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

import {StyleSheet, Platform,} from 'react-native';
import ppt from 'assets/images/im/ic_me_selected.png';
export default class Config extends PureComponent {
    static propTypes = {
        navigator: PropTypes.object.isRequired,
    };

    constructor(props) {
        super(props);

        this.state = {
            error: null,
        };
    }

    goToMyShare = preventDoubleTap(async () => {
        const {navigator} = this.props;

        const options = {
            screen: 'Share',
            animated: true,
            backButtonTitle: '',
            overrideBackPress: true,
            navigatorStyle: {
                navBarHidden: true,
            },
        };

        if (Platform.OS === 'android') {
            navigator.showModal(options);
        } else {
            navigator.push(options);
        }
    });

    render() {
        return (
            <Content >
                <ListItem thumbnail last>
                <Left>
                  <Thumbnail square size={55} source={ppt} />
                </Left>
                <Body>
                    <Text>
                      一休
                    </Text>
                    <Text numberOfLines={1} note>
                      18810555797
                    </Text>
                </Body>
                <Right>
                  <Button transparent>
                    <Icon name="arrow-forward" />
                  </Button>
                </Right>
              </ListItem>
                <Separator />

                <ListItem icon last onPress={this.goToMyShare}>
                  <Left>
                    <Button style={{ backgroundColor: "#FD3C2D" }}>
                      <Icon active name="notifications" />
                    </Button>
                  </Left>
                  <Body>
                    <Text>我的分享</Text>
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
                    <Text>设置</Text>
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
