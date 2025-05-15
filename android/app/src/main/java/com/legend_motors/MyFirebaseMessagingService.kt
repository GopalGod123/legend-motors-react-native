package com.lhgl.LegendCarTradingCustomer

import android.util.Log
import com.clevertap.android.sdk.CleverTapAPI
import com.google.firebase.messaging.FirebaseMessagingService
import com.google.firebase.messaging.RemoteMessage

class MyFirebaseMessagingService : FirebaseMessagingService() {

    override fun onNewToken(token: String) {
        super.onNewToken(token)
        Log.d("FCM", "New FCM Token: $token")

        // ✅ Pass token to CleverTap
        CleverTapAPI.getDefaultInstance(applicationContext)?.pushFcmRegistrationId(token, true)
    }

    override fun onMessageReceived(remoteMessage: RemoteMessage) {
        super.onMessageReceived(remoteMessage)
        Log.d("FCM", "Message Received: ${remoteMessage.data}")
    }
}
