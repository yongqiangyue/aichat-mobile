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
const datas = [
  {
    img: ppt,
    text: "新朋友",
  },
  {
    img: ppt,
    text: "群",
  },
  {
    img: ppt,
    text: "好友",
  },
  {
    img: ppt,
    text: "NAS",
  }
];

export default class Contacts extends PureComponent {
    static propTypes = {
        commonUserIds: PropTypes.array.isRequired,
        nasUserIds: PropTypes.array.isRequired,
    };

    constructor(props) {
        super(props);

        this.state = {
            error: null,
        };
    }

    goToImFriends = preventDoubleTap(async () => {
        const {navigator} = this.props;

        const options = {
            screen: 'ImFriends',
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

    goToNasFriends = preventDoubleTap(async () => {
        const {navigator} = this.props;

        const options = {
            screen: 'NasFriends',
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


                <Separator/>

          <ListItem icon last>
            <Left>
              <Button style={{ backgroundColor: "#007AFF" }}>
                <Icon active name="wifi" />
              </Button>
            </Left>
            <Body>
              <Text>新朋友</Text>
            </Body>
            <Badge style={{ backgroundColor: "#FD3C2D" }}>
              <Text>2</Text>
            </Badge>
          </ListItem>



          <ListItem icon last>
            <Left>
              <Button style={{ backgroundColor: "#FD3C2D" }}>
                <Icon active name="notifications" />
              </Button>
            </Left>
            <Body>
              <Text>群</Text>
            </Body>

          </ListItem>


          <ListItem icon last onPress={this.goToImFriends}>
            <Left>
              <Button style={{ backgroundColor: "#FD3C2D" }}>
                <Icon active name="notifications" />
              </Button>
            </Left>
            <Body>
              <Text>好友</Text>
            </Body>

          </ListItem>


          <ListItem icon last onPress={this.goToNasFriends}>
            <Left>
              <Button style={{ backgroundColor: "#FD3C2D" }}>
                <Icon active name="notifications" />
              </Button>
            </Left>
            <Body>
              <Text>NAS</Text>
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
