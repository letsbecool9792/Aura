// ...existing imports...

export default function PatientDashboard() {
  const { user } = useAuth();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.welcomeText}>Welcome, {user?.name}</Text>
        <View style={styles.userInfo}>
          <Text style={styles.roleLabel}>{user?.role}</Text>
          <Text style={styles.walletAddress} numberOfLines={1}>
            Wallet: {user?.walletAddress?.substring(0, 6)}...
            {user?.walletAddress?.substring(38)}
          </Text>
        </View>
      </View>
      
      {/* ...rest of dashboard content... */}
    </SafeAreaView>
  );
}

// Add these styles to your existing StyleSheet
const styles = StyleSheet.create({
  // ...existing styles...
  header: {
    padding: 20,
    backgroundColor: "#1a1a2e",
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#ffffff",
  },
  userInfo: {
    marginTop: 8,
  },
  roleLabel: {
    color: "#f6851b",
    fontSize: 16,
    textTransform: "capitalize",
  },
  walletAddress: {
    color: "#8892b0",
    fontSize: 14,
    marginTop: 4,
  },
});
