import { StyleSheet, Text, View } from "react-native";
import { StatusBar } from "expo-status-bar";

import {
  GoogleSignin,
  GoogleSigninButton,
} from "@react-native-google-signin/google-signin";


GoogleSignin.configure({
  webClientId: process.env.GOOGLE_WEB_CLIENT_ID,
  scopes: ["https://www.googleapis.com/auth/drive.readonly"], // what API you want to access on behalf of the user, default is email and profile
  offlineAccess: true,
  forceCodeForRefreshToken: true,
  iosClientId: process.env.GOOGLE_IOS_CLIENT_ID,
});
