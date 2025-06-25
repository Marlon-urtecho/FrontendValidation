import { useEffect, useState } from 'react';
import { ActivityIndicator, Image, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';

export default function IndexPage() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simula la carga de la app durante 10 segundos y luego navega al login
    const timer = setTimeout(() => {
      setLoading(false);
      router.replace('/login');
    }, 10000); // 10 segundos = 10000 ms
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <View style={styles.container}>
        <Image
          source={require('../assets/images/login.jpg')} 
          style={styles.logo}
        />
        <Text style={styles.titulo}>Bienvenido a Credit Validation</Text>
        <Text style={styles.title}>Cargando...</Text>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return null;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#4BB2F2',
  },
  logo: {
    width: 300,
    height: 400,
    marginBottom: 30,
    borderRadius: 20,
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
    fontWeight: 'bold',
  },
  titulo: {
    fontSize: 18,
    marginBottom: 20,
    color: '#555',
  },
});