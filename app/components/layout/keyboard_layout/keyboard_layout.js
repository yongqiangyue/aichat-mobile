// Copyright (c) 2017-present AiChat, Inc. All Rights Reserved.
// See License.txt for license information.

import React, {PureComponent} from 'react';
import PropTypes from 'prop-types';
import {Animated, Keyboard, Platform, View, StyleSheet} from 'react-native';

const {View: AnimatedView} = Animated;

export default class KeyboardLayout extends PureComponent {
    static propTypes = {
        children: PropTypes.node,
        statusBarHeight: PropTypes.number,
    };

    static defaultProps = {
        keyboardVerticalOffset: 0,
    };

    constructor(props) {
        super(props);
        this.subscriptions = [];
        this.count = 0;
        this.state = {
            bottom: new Animated.Value(0),
        };
    }

    componentWillMount() {
        if (Platform.OS === 'ios') {
            this.subscriptions = [
                Keyboard.addListener('keyboardWillChangeFrame', this.onKeyboardChange),
                Keyboard.addListener('keyboardWillHide', this.onKeyboardWillHide),
            ];
        }
    }

    componentWillUnmount() {
        this.subscriptions.forEach((sub) => sub.remove());
    }

    onKeyboardWillHide = (e) => {
        const {duration} = e;
        Animated.timing(this.state.bottom, {
            toValue: 0,
            duration,
        }).start();
    };

    onKeyboardChange = (e) => {
        if (!e) {
            this.setState({bottom: new Animated.Value(0)});
            return;
        }

        const {endCoordinates, duration} = e;
        const {height} = endCoordinates;
        Animated.timing(this.state.bottom, {
            toValue: height,
            duration,
        }).start();
    };

    render() {
        const {children, ...otherProps} = this.props;

        if (Platform.OS === 'android') {
            return (
                <View
                    style={style.keyboardLayout}
                    {...otherProps}
                >
                    {children}
                </View>
            );
        }

        return (
            <AnimatedView
                style={[style.keyboardLayout, {bottom: this.state.bottom}]}
            >
                {children}
            </AnimatedView>
        );
    }
}

const style = StyleSheet.create({
    keyboardLayout: {
        position: 'relative',
        backgroundColor: '#ffffff',
        flex: 1,
    },
});
