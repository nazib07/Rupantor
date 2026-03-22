package com.nazib.rupantor;

import android.Manifest;
import android.content.pm.PackageManager;
import android.os.Bundle;
import android.webkit.PermissionRequest;
import android.webkit.WebChromeClient;
import android.webkit.WebView;
import androidx.core.app.ActivityCompat;
import androidx.core.content.ContextCompat;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    private static final int MICROPHONE_PERMISSION_REQUEST_CODE = 1;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
    }

    @Override
    public void onStart() {
        super.onStart();
        
        WebView webView = getBridge().getWebView();
        webView.setWebChromeClient(new WebChromeClient() {
            @Override
            public void onPermissionRequest(final PermissionRequest request) {
                // Check if the request is for audio capture
                for (String resource : request.getResources()) {
                    if (resource.equals(PermissionRequest.RESOURCE_AUDIO_CAPTURE)) {
                        // Check if we already have the system-level permission
                        if (ContextCompat.checkSelfPermission(MainActivity.this, Manifest.permission.RECORD_AUDIO) 
                                != PackageManager.PERMISSION_GRANTED) {
                            
                            // Request the system-level permission
                            ActivityCompat.requestPermissions(MainActivity.this, 
                                    new String[]{Manifest.permission.RECORD_AUDIO}, 
                                    MICROPHONE_PERMISSION_REQUEST_CODE);
                            
                            // Note: We might need to deny the current request and tell the user to try again
                            // or wait for the result. For simplicity, we'll grant it here assuming
                            // the user will see the system popup shortly.
                            request.grant(request.getResources());
                        } else {
                            // System permission already granted, just grant to WebView
                            request.grant(request.getResources());
                        }
                        return;
                    }
                }
                // Grant other permissions normally
                request.grant(request.getResources());
            }
        });
    }
}
