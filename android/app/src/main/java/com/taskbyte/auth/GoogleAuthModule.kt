package com.taskbyte.auth

import android.app.Activity
import androidx.credentials.CredentialManager
import androidx.credentials.GetCredentialRequest
import androidx.credentials.exceptions.NoCredentialException // Ensure this is imported
import com.facebook.react.bridge.*
import com.google.android.libraries.identity.googleid.GetGoogleIdOption
import com.google.android.libraries.identity.googleid.GetSignInWithGoogleOption // Ensure this is imported
import com.google.android.libraries.identity.googleid.GoogleIdTokenCredential
import kotlinx.coroutines.*

class GoogleAuthModule(private val reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext) {

    override fun getName(): String {
        return "GoogleAuthModule"
    }

    @ReactMethod
    fun signIn(promise: Promise) {
        val activity: Activity? = reactApplicationContext.currentActivity
        
        if (activity == null) {
            promise.reject("NO_ACTIVITY", "Activity is null or not currently active")
            return
        }

        val packageName = reactApplicationContext.packageName
        val resourceId = reactApplicationContext.resources.getIdentifier("default_web_client_id", "string", packageName)

        if (resourceId == 0) {
            promise.reject("CONFIG_ERROR", "Web Client ID not found in google-services.json")
            return
        }

        val serverClientId = reactApplicationContext.getString(resourceId)

        // 1. Initial seamless request
        val googleIdOption = GetGoogleIdOption.Builder()
            .setFilterByAuthorizedAccounts(false)
            .setServerClientId(serverClientId)
            .setAutoSelectEnabled(false)
            .build()

        val request = GetCredentialRequest.Builder()
            .addCredentialOption(googleIdOption)
            .build()

        val credentialManager = CredentialManager.create(activity)

        CoroutineScope(Dispatchers.Main).launch {
            try {
                // Attempt standard fetch
                val result = credentialManager.getCredential(
                    request = request,
                    context = activity
                )

                val googleIdTokenCredential = GoogleIdTokenCredential.createFrom(result.credential.data)
                promise.resolve(googleIdTokenCredential.idToken)

            } catch (e: NoCredentialException) {
                // 2. The Crucial Fallback for first-time installs
                try {
                    val signInOption = GetSignInWithGoogleOption.Builder(serverClientId).build()
                    
                    val fallbackRequest = GetCredentialRequest.Builder()
                        .addCredentialOption(signInOption)
                        .build()

                    val fallbackResult = credentialManager.getCredential(
                        request = fallbackRequest,
                        context = activity
                    )

                    val googleIdTokenCredential = GoogleIdTokenCredential.createFrom(fallbackResult.credential.data)
                    promise.resolve(googleIdTokenCredential.idToken)

                } catch (fallbackException: Exception) {
                    promise.reject("GOOGLE_SIGN_IN_FAILED", fallbackException)
                }
            } catch (e: Exception) {
                promise.reject("GOOGLE_SIGN_IN_FAILED", e)
            }
        }
    }
}