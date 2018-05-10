// Copyright (c) 2016-present AiChat, Inc. All Rights Reserved.
// See License.txt for license information.

import React, {PureComponent} from 'react';
import PropTypes from 'prop-types';
import {injectIntl, intlShape} from 'react-intl';
import {GlobalStyles} from 'app/styles';
import Sessions from './sessions';
import Config from './config';
import Finds from './finds';
import Contacts from './contacts';
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

import networkConnectionListener from 'app/utils/network';

import {
    StyleSheet,
    AppState,
    Platform,} from 'react-native';

class Main extends PureComponent {
    static propTypes = {
        actions: PropTypes.shape({
            initLongPolling: PropTypes.func.isRequired,
            closeLongPolling: PropTypes.func.isRequired,
        }).isRequired,
        intl: intlShape.isRequired,
        navigator: PropTypes.object,
        tabIndex: PropTypes.number,
    };

    constructor(props) {
        super(props);
        this.state = {
            error: null,
            tabIndex: this.props.tabIndex || 1,
        };
    }

    handleConnectionChange = (isConnected) => {
        const {actions} = this.props;
        const {
            closeLongPolling,
            initLongPolling,
        } = actions;

        if (isConnected) {
            initLongPolling();
        } else {
            closeLongPolling();
        }
    };

    handleAppStateChange = async (appState) => {
        const {actions} = this.props;
        const {
            closeLongPolling,
            initLongPolling,
        } = actions;
        const isActive = appState === 'active';

        if (isActive) {
            initLongPolling();
        } else {
            closeLongPolling();
        }
    };

    componentWillMount() {
        this.networkListener = networkConnectionListener(this.handleConnectionChange);
    }

    componentDidMount() {
        if (Platform.OS === 'android') {
            AppState.addEventListener('change', this.handleAppStateChange);
        }
    }

    componentWillUnmount() {
        const {closeLongPolling} = this.props.actions;

        this.networkListener.removeEventListener();

        if (Platform.OS === 'android') {
            AppState.removeEventListener('change', this.handleAppStateChange);
        }

        closeLongPolling();
    }

    render() {
        const {
            intl,
            navigator,
        } = this.props;

        let content;
        switch (this.state.tabIndex) {
            case 2:
                content = (<Contacts navigator={navigator}/>);
                break;
            case 3:
                content = (<Finds navigator={navigator}/>);
                break;
            case 4:
                content = (<Config navigator={navigator}/>);
                break;
            default:
                content = (<Sessions navigator={navigator}/>);
        }


        return (
            <Container style={style.container}>
                <Header>
                    <Body>
                        <Title>消息</Title>
                      </Body>
                      <Right>
                        <Button transparent>
                          <Icon name="search" />
                        </Button>
                        <Button transparent>
                          <Icon name="more" />
                        </Button>
                      </Right>
                </Header>

                {content}

                <Footer>
                    <FooterTab>
                        <Button
                        active={this.state.tabIndex == 1}
                        onPress={() => this.setState({tabIndex: 1})}
                        vertical
                        badge
                        >
                            <Badge>
                                <Text>2</Text>
                            </Badge>
                            <Icon active={this.state.tabIndex == 1} name="chatboxes" />
                            <Text>消息</Text>
                        </Button>

                        <Button active={this.state.tabIndex == 2} onPress={() => this.setState({tabIndex: 2})}>
                            <Icon active={this.state.tabIndex == 2} name="contact" />
                        <Text>通讯录</Text>
                        </Button>

                        <Button
                        active={this.state.tabIndex == 3}
                        onPress={() => this.setState({tabIndex: 3})}
                        vertical
                        badge
                        >
                            <Badge style={{ backgroundColor: "green" }}>
                                <Text>51</Text>
                            </Badge>
                            <Icon active={this.state.tabIndex == 3} name="compass" />
                        <Text>发现</Text>
                       </Button>

                       <Button active={this.state.tabIndex == 4} onPress={() => this.setState({tabIndex: 4})}>
                           <Icon active={this.state.tabIndex == 4} name="contact" />
                       <Text>我</Text>
                       </Button>
                   </FooterTab>
                </Footer>
        </Container>
      );
    }
}

const style = StyleSheet.create({
    container: {
        backgroundColor: "#FFF"
    },
});

export default injectIntl(Main);
