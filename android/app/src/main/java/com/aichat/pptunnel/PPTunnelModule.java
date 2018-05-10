package com.aichat.pptunnel;

import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.ReadableMap;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.bridge.WritableNativeMap;

public class PPTunnelModule extends ReactContextBaseJavaModule {
    public PPTunnelModule(ReactApplicationContext reactContext) {
        super(reactContext);
    }

    @Override
    public String getName() {
        return "PPTunnel";
    }

    @ReactMethod
    public void startTunnel(String localDeviceId, Promise promise) {
        int status = 0;
        if (localDeviceId != null) {
            status = PPTunUtil.startTunnel(getReactApplicationContext(), localDeviceId);
        }
        WritableMap writableMap=new WritableNativeMap();
        writableMap.putInt("status",status);
        promise.resolve(writableMap);
    }

    @ReactMethod
    public void stopTunnel(Promise promise) {
        PPTunUtil.stopTunnel();
        WritableMap writableMap=new WritableNativeMap();
        writableMap.putInt("status",0);
        promise.resolve(writableMap);
    }

    @ReactMethod
    public void addConnect(String remoteListenAddr, String localListenAddr, String remoteDevID, Promise promise) {
        int status = 0;
        if (remoteListenAddr != null && localListenAddr != null && remoteDevID != null) {
            status = PPTunUtil.addConnect(remoteListenAddr, localListenAddr, remoteDevID);
        }
        WritableMap writableMap=new WritableNativeMap();
        writableMap.putInt("status",status);
        promise.resolve(writableMap);
    }

    @ReactMethod
    public void deleteConnect(String remoteListenAddr, String localListenAddr, String remoteDevID, Promise promise) {
        int status = 0;
        if (remoteListenAddr != null && localListenAddr != null && remoteDevID != null) {
            status = PPTunUtil.deleteConnect(remoteListenAddr, localListenAddr, remoteDevID);
        }
        WritableMap writableMap=new WritableNativeMap();
        writableMap.putInt("status",status);
        promise.resolve(writableMap);
    }

}
