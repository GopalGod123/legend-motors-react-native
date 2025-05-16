package com.lhgl.LegendCarTradingCustomer

import android.util.Log
import com.clevertap.android.sdk.CleverTapAPI
import com.clevertap.android.sdk.pushnotification.fcm.CTFcmMessageHandler
import com.google.firebase.messaging.FirebaseMessagingService
import com.google.firebase.messaging.RemoteMessage

class MyFirebaseMessagingService : FirebaseMessagingService() {
    override fun onMessageReceived(message: RemoteMessage) {
        try {
            CTFcmMessageHandler().createNotification(applicationContext, message)
        } catch (t: Throwable) {
            Log.d("MYFCMLIST", "Error parsing FCM message", t)
        }
    }

    override fun onNewToken(token: String) {
        CleverTapAPI.getDefaultInstance(this)?.pushFcmRegistrationId(token, true)
    }
}