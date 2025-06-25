import AsyncStorage from '@react-native-async-storage/async-storage'
import { useRouter } from 'expo-router'
import { useState } from 'react'
import {
  ImageBackground,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native'
import api from '../Services/Api'

const imgbg = require('../assets/images/fondo.jpg')

export default function LoginScreen() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const handleLogin = async () => {
    setError('')
    if (!email || !password) {
      setError('Por favor, completa todos los campos.')
      return
    }

    try {
      const response = await api.post('/token/', {
        username: email,
        password: password,
      })

      const { access } = response.data

      if (access) {
        await AsyncStorage.setItem('token', access)
        router.replace('/Drawer/Personas')
      } else {
        setError('Respuesta inesperada del servidor.')
      }
    } catch (err) {
      console.error('Error al intentar iniciar sesión:', err)
      if (err.response?.data?.detail) {
        setError(err.response.data.detail)
      } else {
        setError('No se pudo conectar con el servidor.')
      }
    }
  }

  return (
    <ImageBackground source={imgbg} style={styles.background}>
      <View style={styles.overlay}>
        <Text style={styles.title}>Iniciar Sesión</Text>

        {error !== '' && <Text style={styles.error}>{error}</Text>}

        <TextInput
          placeholder="Usuario"
          placeholderTextColor="gray"
          value={email}
          onChangeText={setEmail}
          style={styles.input}
          autoCapitalize="none"
        />

        <TextInput
          placeholder="Contraseña"
          placeholderTextColor="gray"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          style={styles.input}
        />

        <TouchableOpacity onPress={handleLogin} style={styles.button}>
          <Text style={styles.buttonText}>ENTRAR</Text>
        </TouchableOpacity>

        <Text style={styles.register}>
          ¿No tienes cuenta?{' '}
          <Text style={styles.link}>
            Pide autorizacion a tu Institución
          </Text>
        </Text>
      </View>
    </ImageBackground>
  )
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  overlay: {
    flex: 1,
    backgroundrepeat: 'no-repeat',
    backgroundSize: 'cover',
    justifyContent: 'center',
    padding: 16,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: 'white',
    textAlign: 'center',
    marginBottom: 16,
  },
  error: {
    backgroundColor: 'rgba(255,255,255,0.7)',
    color: '#d32f2f',
    borderRadius: 8,
    padding: 10,
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 8,
  },
  input: {
    backgroundColor: 'white',
    borderRadius: 8,
    paddingHorizontal: 16,
    height: 50,
    fontSize: 16,
    marginBottom: 12,
  },
  button: {
    backgroundColor: '#ffa100',
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    elevation: 2,
    marginBottom: 16,
  },
  buttonText: {
    color: 'white',
    fontWeight: '700',
    fontSize: 18,
  },
  register: {
    color: 'white',
    textAlign: 'center',
    fontWeight: '700',
  },
  link: {
    color: 'red',
    fontWeight: '700',
  },
})
