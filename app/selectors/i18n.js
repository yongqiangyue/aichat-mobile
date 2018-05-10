import DeviceInfo from 'react-native-device-info';
import {createSelector} from 'reselect';

import DEFAULT_LOCALE from 'app/i18n';

// Not a proper selector since the device locale isn't in the redux store
export function getCurrentLocale(state) {
    const deviceLocale = DeviceInfo.getDeviceLocale().split('-')[0];
    if (deviceLocale) {
        return deviceLocale;
    }

    return DEFAULT_LOCALE;
}
