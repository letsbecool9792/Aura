import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Animated,
  Dimensions,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import { useAuth } from '../providers/AuthProvider';
import { googleAuth } from '../services/googleAuth';
import { backendAuth } from '../services/backendAuth';

const { width, height } = Dimensions.get('window');

export default function Welcome() {
  const bounceAnim = useRef(new Animated.Value(0)).current;
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const { login } = useAuth();

  useEffect(() => {
    const startBounce = () => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(bounceAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(bounceAnim, {
            toValue: 0,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      ).start();
    };

    startBounce();
  }, [bounceAnim]);

  const translateY = bounceAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -20],
  });

  const handleGoogleAuth = async () => {
    setIsAuthenticating(true);
    
    try {
      // Step 1: Authenticate with Google
      const googleResult = await googleAuth.signIn();
      
      if (!googleResult.success || !googleResult.token || !googleResult.user) {
        Alert.alert('Error', googleResult.error || 'Google authentication failed');
        return;
      }

      // Step 2: Authenticate with backend using Google ID token
      const backendResult = await backendAuth.authenticateWithGoogle(
        googleResult.token,
        'patient'
      );

      if (!backendResult.success || !backendResult.token || !backendResult.user) {
        Alert.alert('Error', backendResult.error || 'Backend authentication failed');
        return;
      }

      // Step 3: Set auth token for future API calls
      backendAuth.setAuthToken(backendResult.token);

      // Step 4: Login with backend user data
      await login({
        role: backendResult.user.role as 'patient' | 'doctor',
        name: backendResult.user.name,
        walletAddress: 'google-auth-temp', // This will be updated later with Web3 wallet
        token: backendResult.token,
        email: backendResult.user.email,
        picture: backendResult.user.picture,
      });

      // Step 5: Navigate to appropriate page
      if (backendResult.user.is_new_user) {
        // New user - go to Web3 setup
        router.push('/(auth)/web3login');
      } else {
        // Existing user - go to app
        router.push('/(app)/(patient)/finder');
      }

    } catch (error) {
      console.error('Authentication error:', error);
      Alert.alert('Error', 'Authentication failed. Please try again.');
    } finally {
      setIsAuthenticating(false);
    }
  };

  const handleGetStarted = () => {
    router.push('/(auth)/role-selection');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Bouncing Image */}
        <Animated.View
          style={[
            styles.imageContainer,
            {
              transform: [{ translateY }],
            },
          ]}
        >
          <View style={styles.imagePlaceholder}>
            <Text style={styles.imageText}>🏥</Text>
            <Text style={styles.imageLabel}>AURA Health</Text>
          </View>
        </Animated.View>

        {/* Welcome Text */}
        <View style={styles.textContainer}>
          <Text style={styles.title}>Welcome to AURA</Text>
          <Text style={styles.subtitle}>
            Your secure health wallet powered by blockchain technology
          </Text>
        </View>

        {/* Google Auth Button */}
        <TouchableOpacity 
          style={[styles.googleButton, isAuthenticating && styles.disabledButton]} 
          onPress={handleGoogleAuth}
          disabled={isAuthenticating}
        >
          <Text style={styles.googleIcon}>🔐</Text>
          <Text style={styles.googleButtonText}>
            {isAuthenticating ? 'Authenticating...' : 'Continue with Google'}
          </Text>
        </TouchableOpacity>

        {/* Divider */}
        <View style={styles.divider}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>or</Text>
          <View style={styles.dividerLine} />
        </View>

        {/* Get Started Button */}
        <TouchableOpacity style={styles.button} onPress={handleGetStarted}>
          <Text style={styles.buttonText}>Get Started</Text>
          <Text style={styles.arrow}>→</Text>
        </TouchableOpacity>
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
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  imageContainer: {
    marginBottom: 60,
  },
  imagePlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#1a1a2e',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#0f3460',
    shadowColor: '#0f3460',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  imageText: {
    fontSize: 48,
    marginBottom: 8,
  },
  imageLabel: {
    fontSize: 12,
    color: '#8892b0',
    fontWeight: '600',
  },
  textContainer: {
    alignItems: 'center',
    marginBottom: 60,
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 16,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 18,
    color: '#8892b0',
    textAlign: 'center',
    lineHeight: 26,
    maxWidth: 300,
  },
  googleButton: {
    backgroundColor: '#ffffff',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  googleIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  googleButtonText: {
    color: '#333333',
    fontSize: 16,
    fontWeight: '600',
  },
  disabledButton: {
    backgroundColor: '#cccccc',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    width: '100%',
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#16213e',
  },
  dividerText: {
    color: '#8892b0',
    fontSize: 14,
    marginHorizontal: 16,
  },
  button: {
    backgroundColor: '#0f3460',
    paddingVertical: 18,
    paddingHorizontal: 32,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#0f3460',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
    marginRight: 8,
  },
  arrow: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: 'bold',
  },
});