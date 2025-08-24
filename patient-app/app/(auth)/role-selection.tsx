import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Image,
} from 'react-native';
import { router } from 'expo-router';

export default function RoleSelection() {
  const handleRoleSelect = (role: 'patient' | 'doctor') => {
    if (role === 'patient') {
      router.push('/(auth)/web3login');
    } else {
      router.push('/(auth)/doctor-verification');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Welcome to AURA</Text>
          <Text style={styles.subtitle}>Choose your role to get started</Text>
        </View>

        <View style={styles.roleContainer}>
          <TouchableOpacity
            style={styles.roleCard}
            onPress={() => handleRoleSelect('patient')}
          >
            <View style={styles.roleIcon}>
              <Text style={styles.iconText}>👤</Text>
            </View>
            <Text style={styles.roleTitle}>Patient</Text>
            <Text style={styles.roleDescription}>
              Manage your health records securely with Web3 technology
            </Text>
            <View style={styles.features}>
              <Text style={styles.feature}>• Scan medical documents</Text>
              <Text style={styles.feature}>• Share records with doctors</Text>
              <Text style={styles.feature}>• Blockchain verification</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.roleCard}
            onPress={() => handleRoleSelect('doctor')}
          >
            <View style={styles.roleIcon}>
              <Text style={styles.iconText}>👨‍⚕️</Text>
            </View>
            <Text style={styles.roleTitle}>Doctor</Text>
            <Text style={styles.roleDescription}>
              Access patient records and provide medical care
            </Text>
            <View style={styles.features}>
              <Text style={styles.feature}>• Scan patient QR codes</Text>
              <Text style={styles.feature}>• View verified records</Text>
              <Text style={styles.feature}>• Secure data access</Text>
            </View>
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Your data is secured with blockchain technology
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
  roleContainer: {
    gap: 20,
  },
  roleCard: {
    backgroundColor: '#1a1a2e',
    borderRadius: 16,
    padding: 24,
    borderWidth: 2,
    borderColor: '#16213e',
  },
  roleIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#0f3460',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  iconText: {
    fontSize: 28,
  },
  roleTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 8,
  },
  roleDescription: {
    fontSize: 16,
    color: '#8892b0',
    marginBottom: 16,
    lineHeight: 22,
  },
  features: {
    gap: 8,
  },
  feature: {
    fontSize: 14,
    color: '#8892b0',
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