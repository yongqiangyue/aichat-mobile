import {NetInfo} from 'react-native';

export async function checkConnection(isConnected) {
    try {
        return true;
    } catch (error) {
        return false;
    }
}

function handleConnectionChange(onChange) {
    return async (isConnected) => {
        const result = await checkConnection(isConnected);
        onChange(result);
    };
}

export default function networkConnectionListener(onChange) {
    const connectionChanged = handleConnectionChange(onChange);

    NetInfo.isConnected.addEventListener('connectionChange', connectionChanged);
    NetInfo.isConnected.fetch().then(connectionChanged);

    const removeEventListener = () => NetInfo.isConnected.removeEventListener('connectionChange', connectionChanged); // eslint-disable-line

    return {
        removeEventListener,
    };
}
