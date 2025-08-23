import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  TextInput,
  Alert,
} from 'react-native';
import { useAuth } from '../providers/AuthProvider';

export default function DoctorVerification() {
  const [name, setName] = useState('');
  const [licenseNumber, setLicenseNumber] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const { login } = useAuth();

  const handleVerification = async () => {
    if (!name.trim() || !licenseNumber.trim()) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setIsVerifying(true);
    
    try {
      // Simulate verification process
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Login as doctor
      await login({
        role: 'doctor',
        name: name.trim(),
        walletAddress: 'doctor-verified',
      });
      
    } catch (error) {
      Alert.alert('Error', 'Verification failed');
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Doctor Verification</Text>
          <Text style={styles.subtitle}>
            Please provide your credentials for verification
          </Text>
        </View>

        <View style={styles.form}>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Full Name</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your full name"
              placeholderTextColor="#666"
              value={name}
              onChangeText={setName}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Medical License Number</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your license number"
              placeholderTextColor="#666"
              value={licenseNumber}
              onChangeText={setLicenseNumber}
            />
          </View>

          <TouchableOpacity
            style={[styles.verifyButton, isVerifying && styles.disabledButton]}
            onPress={handleVerification}
            disabled={isVerifying}
          >
            <Text style={styles.verifyButtonText}>
              {isVerifying ? 'Verifying...' : 'Verify & Continue'}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Your credentials will be verified with medical authorities
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
  verifyButton: {
    backgroundColor: '#38a169',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  verifyButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  disabledButton: {
    backgroundColor: '#4a5568',
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
