// Copyright (c) 2017-present AiChat, Inc. All Rights Reserved.
// See License.txt for license information.

import ImClientClass from './im_client';
import AuthClientClass from './auth_client';

const ImClient = new ImClientClass();
const AuthClient  = new AuthClientClass();

export {
    ImClient,
    AuthClient,
};
