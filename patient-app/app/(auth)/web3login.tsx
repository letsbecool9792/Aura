import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  TextInput,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import { useAuth } from '../providers/AuthProvider';

export default function Web3Login() {
  const [name, setName] = useState('');
  const [walletAddress, setWalletAddress] = useState('');
  const [isConnecting, setIsConnecting] = useState(false);
  const { login, user } = useAuth();

  // Pre-fill name if user already has Google auth data
  useEffect(() => {
    if (user?.name && user.walletAddress === 'google-auth-temp') {
      setName(user.name);
    }
  }, [user]);

  const handleConnectWallet = async () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Please enter your name');
      return;
    }

    setIsConnecting(true);
    
    try {
      // Simulate MetaMask connection
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Generate a mock wallet address
      const mockAddress = '0x' + Math.random().toString(16).substring(2, 42);
      setWalletAddress(mockAddress);
      
      // Login with user data
      await login({
        role: 'patient',
        name: name.trim(),
        walletAddress: mockAddress,
      });
      
    } catch (error) {
      Alert.alert('Error', 'Failed to connect wallet');
    } finally {
      setIsConnecting(false);
    }
  };

  const handleSkipWallet = async () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Please enter your name');
      return;
    }

    // Login without wallet (for demo purposes)
    await login({
      role: 'patient',
      name: name.trim(),
      walletAddress: 'demo-wallet',
    });
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
            {user?.walletAddress === 'google-auth-temp' 
              ? 'Great! Now connect your Web3 wallet for enhanced security'
              : 'Connect your wallet or continue without it'
            }
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

          {walletAddress ? (
            <View style={styles.walletInfo}>
              <Text style={styles.walletLabel}>Connected Wallet:</Text>
              <Text style={styles.walletAddress}>
                {walletAddress.substring(0, 6)}...{walletAddress.substring(38)}
              </Text>
            </View>
          ) : (
            <TouchableOpacity
              style={[styles.connectButton, isConnecting && styles.disabledButton]}
              onPress={handleConnectWallet}
              disabled={isConnecting}
            >
              <Text style={styles.connectButtonText}>
                {isConnecting ? 'Connecting...' : '🦊 Connect MetaMask'}
              </Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={styles.skipButton}
            onPress={handleSkipWallet}
          >
            <Text style={styles.skipButtonText}>Continue without wallet</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Connecting your wallet enables enhanced security features
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

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
  connectButton: {
    backgroundColor: '#f6851b',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  connectButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  disabledButton: {
    backgroundColor: '#4a5568',
  },
  skipButton: {
    backgroundColor: 'transparent',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#16213e',
  },
  skipButtonText: {
    color: '#8892b0',
    fontSize: 16,
  },
  walletInfo: {
    backgroundColor: '#1a1a2e',
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#0f3460',
  },
  walletLabel: {
    fontSize: 14,
    color: '#8892b0',
    marginBottom: 4,
  },
  walletAddress: {
    fontSize: 16,
    color: '#ffffff',
    fontFamily: 'monospace',
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
