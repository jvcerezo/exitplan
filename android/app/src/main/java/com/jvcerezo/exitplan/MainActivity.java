package com.jvcerezo.exitplan;

import android.content.Intent;
import android.os.Bundle;
import com.getcapacitor.BridgeActivity;
import ee.forgr.capacitor.social.login.GoogleProvider;
import ee.forgr.capacitor.social.login.SocialLoginPlugin;
import ee.forgr.capacitor.social.login.ModifiedMainActivityForSocialLoginPlugin;

public class MainActivity extends BridgeActivity implements ModifiedMainActivityForSocialLoginPlugin {
    @Override
    protected void onActivityResult(int requestCode, int resultCode, Intent data) {
        super.onActivityResult(requestCode, resultCode, data);
        SocialLoginPlugin plugin = (SocialLoginPlugin) this.bridge.getPlugin("SocialLogin").getInstance();
        if (plugin != null) {
            GoogleProvider googleProvider = plugin.getGoogleProvider();
            if (googleProvider != null) {
                googleProvider.handleOnActivityResult(requestCode, resultCode, data);
            }
        }
    }
}
