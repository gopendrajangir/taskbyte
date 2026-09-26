import Foundation
import UIKit
import React
import FirebaseCore
import FirebaseAuth
import GoogleSignIn

@objc(GoogleAuthModule)
class GoogleAuthModule: NSObject {

  @objc(signIn:rejecter:)
  func signIn(
    _ resolve: @escaping RCTPromiseResolveBlock,
    rejecter reject: @escaping RCTPromiseRejectBlock
  ) {

    DispatchQueue.main.async {

      guard let rootViewController =
        UIApplication.shared.connectedScenes
          .compactMap({ ($0 as? UIWindowScene)?.keyWindow })
          .first?.rootViewController else {

        reject("NO_ROOT_VIEW_CONTROLLER", "No root view controller", nil)
        return
      }

      guard let path = Bundle.main.path(
          forResource: "GoogleService-Info",
          ofType: "plist"
      ),
      let plist = NSDictionary(contentsOfFile: path),
      let clientID = plist["CLIENT_ID"] as? String
      else {

        reject("NO_CLIENT_ID", "No client ID found", nil)
        return
      }

      let config = GIDConfiguration(clientID: clientID)

      GIDSignIn.sharedInstance.configuration = config

      GIDSignIn.sharedInstance.signIn(
        withPresenting: rootViewController
      ) { result, error in

        if let error = error {
          reject(
            "GOOGLE_SIGN_IN_FAILED",
            error.localizedDescription,
            error
          )
          return
        }

        guard let user = result?.user,
              let idToken = user.idToken?.tokenString else {

          reject("NO_TOKEN", "No ID token found", nil)
          return
        }

        resolve(idToken)
      }
    }
  }

  @objc
  static func requiresMainQueueSetup() -> Bool {
    return true
  }
}