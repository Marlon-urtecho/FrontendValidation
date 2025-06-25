import React, { useEffect, useState } from 'react'
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  ScrollView,
} from 'react-native'
import api from '../../Services/Api'

export default function UsersScreen() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(false)
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [password2, setPassword2] = useState('')
  const [error, setError] = useState('')
  const [errorsFields, setErrorsFields] = useState({})

  // Cargar usuarios al iniciar pantalla
  const fetchUsers = async () => {
    setLoading(true)
    try {
      const response = await api.get('/usuarios/')
      setUsers(response.data)
    } catch (err) {
      Alert.alert('Error', 'No se pudieron cargar los usuarios.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [])

  // Validaciones de campos
  const validateForm = () => {
    const errors = {}

    if (!username.trim()) errors.username = 'El usuario es obligatorio.'
    if (!email.trim()) {
      errors.email = 'El email es obligatorio.'
    } else if (
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
    ) {
      errors.email = 'Email inválido.'
    }
    if (!password) {
      errors.password = 'La contraseña es obligatoria.'
    } else if (password.length < 6) {
      errors.password = 'La contraseña debe tener al menos 6 caracteres.'
    }
    if (!password2) {
      errors.password2 = 'Repetir la contraseña es obligatorio.'
    } else if (password !== password2) {
      errors.password2 = 'Las contraseñas no coinciden.'
    }

    setErrorsFields(errors)
    return Object.keys(errors).length === 0
  }

  // Registrar nuevo usuario
  const handleRegister = async () => {
    setError('')
    if (!validateForm()) return

    try {
      const response = await api.post('/registro/', {
        username: username.trim(),
        email: email.trim(),
        password,
        password2,
      })
      Alert.alert('Éxito', 'Usuario registrado correctamente')
      setUsername('')
      setEmail('')
      setPassword('')
      setPassword2('')
      setErrorsFields({})
      fetchUsers() // Actualizar lista con nuevo usuario
    } catch (err) {
      if (err.response?.data) {
        setError(JSON.stringify(err.response.data))
      } else {
        setError('Error al registrar el usuario')
      }
    }
  }

  return (
    <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
      <Text style={styles.title}>Usuarios Registrados</Text>
      {loading ? (
        <ActivityIndicator size="large" color="#007AFF" style={{ marginBottom: 20 }} />
      ) : (
        <FlatList
          data={users}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <Text style={styles.userItem}>
              {item.username} - {item.email}
            </Text>
          )}
          style={styles.list}
        />
      )}

      <Text style={styles.title}>Registrar Nuevo Usuario</Text>
      {error !== '' && <Text style={styles.errorGeneral}>{error}</Text>}

      <TextInput
        placeholder="Usuario"
        value={username}
        onChangeText={setUsername}
        style={[styles.input, errorsFields.username && styles.inputError]}
        autoCapitalize="none"
      />
      {errorsFields.username && <Text style={styles.errorField}>{errorsFields.username}</Text>}

      <TextInput
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        style={[styles.input, errorsFields.email && styles.inputError]}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      {errorsFields.email && <Text style={styles.errorField}>{errorsFields.email}</Text>}

      <TextInput
        placeholder="Contraseña"
        value={password}
        onChangeText={setPassword}
        style={[styles.input, errorsFields.password && styles.inputError]}
        secureTextEntry
      />
      {errorsFields.password && <Text style={styles.errorField}>{errorsFields.password}</Text>}

      <TextInput
        placeholder="Repetir Contraseña"
        value={password2}
        onChangeText={setPassword2}
        style={[styles.input, errorsFields.password2 && styles.inputError]}
        secureTextEntry
      />
      {errorsFields.password2 && <Text style={styles.errorField}>{errorsFields.password2}</Text>}

      <TouchableOpacity onPress={handleRegister} style={styles.button}>
        <Text style={styles.buttonText}>Registrar</Text>
      </TouchableOpacity>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: { 
    padding: 20, 
    backgroundColor: '#f2f2f7', 
    flexGrow: 1,
  },
  title: { 
    fontSize: 24, 
    fontWeight: '700', 
    marginVertical: 12, 
    textAlign: 'center', 
    color: '#333',
  },
  list: { 
    maxHeight: 250, 
    marginBottom: 24, 
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 10,
    shadowColor: '#000',
    shadowOffset: {width:0, height:2},
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  userItem: { 
    fontSize: 16, 
    paddingVertical: 6, 
    borderBottomWidth: 1, 
    borderColor: '#eee',
    color: '#555',
  },
  input: {
    backgroundColor: 'white',
    padding: 14,
    borderRadius: 10,
    marginBottom: 6,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#ccc',
  },
  inputError: {
    borderColor: '#d93025',
  },
  errorField: {
    color: '#d93025',
    marginBottom: 8,
    marginLeft: 6,
    fontSize: 13,
  },
  errorGeneral: {
    color: '#d93025',
    marginBottom: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#007AFF',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 10,
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5,
  },
  buttonText: { 
    color: 'white', 
    fontWeight: '700', 
    fontSize: 20,
  },
})
