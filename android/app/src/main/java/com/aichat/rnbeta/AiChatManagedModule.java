package com.aichat.rnbeta;

import android.app.Application;
import android.content.Context;
import android.os.Bundle;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.NativeModule;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.Promise;

public class AiChatManagedModule extends ReactContextBaseJavaModule {
    private static AiChatManagedModule instance;

    private boolean shouldBlurAppScreen = false;

    private AiChatManagedModule(ReactApplicationContext reactContext) {
        super(reactContext);
    }

    public static AiChatManagedModule getInstance(ReactApplicationContext reactContext) {
        if (instance == null) {
            instance = new AiChatManagedModule(reactContext);
        }

        return instance;
    }

    public static AiChatManagedModule getInstance() {
        return instance;
    }

    @Override
    public String getName() {
        return "AiChatManaged";
    }

    @ReactMethod
    public void blurAppScreen(boolean enabled) {
        shouldBlurAppScreen = enabled;
    }

    public boolean isBlurAppScreenEnabled() {
        return shouldBlurAppScreen;
    }

    @ReactMethod
    public void getConfig(final Promise promise) {
        try {
            Bundle config = NotificationsLifecycleFacade.getInstance().getManagedConfig();

            if (config != null) {
                Object result = Arguments.fromBundle(config);
                promise.resolve(result);
            } else {
                throw new Exception("The MDM vendor has not sent any Managed configuration");
            }
        } catch (Exception e) {
            promise.reject("no managed configuration", e);
        }
    }
}
