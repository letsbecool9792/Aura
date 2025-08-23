import "@ethersproject/shims";
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import { useAuth } from '../providers/AuthProvider';
import { ethers } from 'ethers';
import * as WebBrowser from "@toruslabs/react-native-web-browser";
import { EthereumPrivateKeyProvider } from "@web3auth/ethereum-provider";
import Web3Auth, { ChainNamespace, LOGIN_PROVIDER, WEB3AUTH_NETWORK } from "@web3auth/react-native-sdk";
import EncryptedStorage from "react-native-encrypted-storage";

// Configuration
const scheme = "patientapp"; // Replace with your app's scheme
const redirectUrl = `${scheme}://auth`;
const WEB3AUTH_CLIENT_ID = process.env.EXPO_PUBLIC_WEB3AUTH_CLIENT_ID;

const chainConfig = {
  chainNamespace: ChainNamespace.EIP155,
  chainId: "0xaa36a7", // Sepolia testnet
  rpcTarget: "https://1rpc.io/sepolia",
  displayName: "Ethereum Sepolia Testnet",
  blockExplorerUrl: "https://sepolia.etherscan.io",
  ticker: "ETH",
  tickerName: "Ethereum",
  decimals: 18,
  logo: "https://cryptologos.cc/logos/ethereum-eth-logo.png",
};

const ethereumPrivateKeyProvider = new EthereumPrivateKeyProvider({
  config: {
    chainConfig,
  },
});

export default function Web3Login() {
  const [name, setName] = useState('');
  const [isConnecting, setIsConnecting] = useState(false);
  const [web3auth, setWeb3auth] = useState<Web3Auth | null>(null);
  const { login, user } = useAuth();

  useEffect(() => {
    const initWeb3Auth = async () => {
      try {
        const web3authSDK = new Web3Auth(WebBrowser, EncryptedStorage, {
          clientId: WEB3AUTH_CLIENT_ID!,
          redirectUrl,
          network: WEB3AUTH_NETWORK.SAPPHIRE_MAINNET, // or TESTNET
          privateKeyProvider: ethereumPrivateKeyProvider,
        });

        await web3authSDK.init();
        setWeb3auth(web3authSDK);

        if (user?.name) {
          setName(user.name);
        }
      } catch (e) {
        console.error('Web3Auth initialization error:', e);
        Alert.alert('Error', 'Web3Auth failed to initialize.');
      }
    };

    initWeb3Auth();
  }, []);

  // Handler for Google social login
  const handleSocialLogin = async () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Please enter your name');
      return;
    }
    if (!web3auth) {
      Alert.alert('Error', 'Web3Auth not initialized.');
      return;
    }

    setIsConnecting(true);

    try {
      await web3auth.login({
        loginProvider: LOGIN_PROVIDER.GOOGLE,
      });

      if (web3auth.connected) {
        const ethersProvider = new ethers.BrowserProvider(ethereumPrivateKeyProvider);
        const signer = await ethersProvider.getSigner();
        const address = await signer.getAddress();

        await login({
          role: 'patient',
          name: name.trim(),
          walletAddress: address,
        });
      }
    } catch (error) {
      console.error('Failed to log in with Google:', error);
      Alert.alert('Error', 'Failed to log in with Google.');
    } finally {
      setIsConnecting(false);
    }
  };

  // Handler for email passwordless login
  const handleEmailLogin = async () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Please enter your name');
      return;
    }
    if (!web3auth) {
      Alert.alert('Error', 'Web3Auth not initialized.');
      return;
    }

    setIsConnecting(true);

    try {
      await web3auth.login({
        loginProvider: LOGIN_PROVIDER.EMAIL_PASSWORDLESS,
        extraLoginOptions: {
          login_hint: name.trim(), // Using name as email hint
        },
      });

      if (web3auth.connected) {
        const ethersProvider = new ethers.BrowserProvider(ethereumPrivateKeyProvider);
        const signer = await ethersProvider.getSigner();
        const address = await signer.getAddress();

        await login({
          role: 'patient',
          name: name.trim(),
          walletAddress: address,
        });
      }
    } catch (error) {
      console.error('Failed to log in with email:', error);
      Alert.alert('Error', 'Failed to log in with email.');
    } finally {
      setIsConnecting(false);
    }
  };

  const handleBackToWelcome = () => {
    router.back();
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={handleBackToWelcome}>
            <Text style={styles.backButtonText}>←</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Connect Wallet</Text>
          <Text style={styles.subtitle}>
            Create a wallet instantly with social login.
          </Text>
        </View>

        <View style={styles.form}>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Your Name</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your full name"
              placeholderTextColor="#666"
              value={name}
              onChangeText={setName}
            />
          </View>
          
          <TouchableOpacity
            style={[styles.socialButton, isConnecting && styles.disabledButton]}
            onPress={handleSocialLogin}
            disabled={isConnecting}
          >
            {isConnecting ? (
              <ActivityIndicator color="#ffffff" size="small" />
            ) : (
              <Text style={styles.buttonText}>Sign In with Google</Text>
            )}
          </TouchableOpacity>

          <View style={styles.separator}>
            <Text style={styles.separatorText}>OR</Text>
          </View>

          <TouchableOpacity
            style={[styles.emailButton, isConnecting && styles.disabledButton]}
            onPress={handleEmailLogin}
            disabled={isConnecting}
          >
            {isConnecting ? (
              <ActivityIndicator color="#ffffff" size="small" />
            ) : (
              <Text style={styles.buttonText}>📧 Login with Email</Text>
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            A secure wallet will be created automatically for you.
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

// Add emailButton style
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f0f23',
  },
  content: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 50,
  },
  backButton: {
    position: 'absolute',
    left: 0,
    top: 0,
    padding: 8,
  },
  backButtonText: {
    fontSize: 24,
    color: '#8892b0',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 18,
    color: '#8892b0',
    textAlign: 'center',
  },
  form: {
    gap: 24,
  },
  inputContainer: {
    gap: 8,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  input: {
    backgroundColor: '#1a1a2e',
    borderWidth: 1,
    borderColor: '#16213e',
    borderRadius: 8,
    padding: 16,
    fontSize: 16,
    color: '#ffffff',
  },
  socialButton: {
    backgroundColor: '#4285F4',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  emailButton: {
    backgroundColor: '#34a853',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  disabledButton: {
    opacity: 0.5,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  separator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 10,
  },
  separatorText: {
    color: '#8892b0',
    fontSize: 16,
    marginHorizontal: 10,
  },
  footer: {
    alignItems: 'center',
    marginTop: 40,
  },
  footerText: {
    fontSize: 14,
    color: '#4a5568',
    textAlign: 'center',
  },
});