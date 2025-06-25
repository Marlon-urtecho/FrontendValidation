import React from 'react';
import { DrawerContentScrollView, DrawerItem } from '@react-navigation/drawer';
import { Avatar, Title, Caption } from 'react-native-paper';
import { MaterialIcons, FontAwesome5, Entypo, Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import api from '../Services/Api';

export default function DrawerContent(props) {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      const refreshToken = await AsyncStorage.getItem('refreshToken');
      if (refreshToken) {
        await api.post('/logout/', { refresh: refreshToken });
      }
      await AsyncStorage.removeItem('authToken');
      await AsyncStorage.removeItem('refreshToken');
      router.replace('/login');
    } catch (error) {
      console.error('Error al cerrar sesión:', error.response?.data || error.message);
      await AsyncStorage.removeItem('authToken');
      await AsyncStorage.removeItem('refreshToken');
      router.replace('/login');
    }
  };

  return (
    <DrawerContentScrollView
      {...props}
      contentContainerStyle={{
        flex: 1,
        backgroundColor: '#4BB2F2',
        paddingTop: 30,
      }}
    >
      <Avatar.Icon
        size={80}
        icon="account"
        style={{
          backgroundColor: '#fff',
          alignSelf: 'center',
          marginBottom: 20,
        }}
      />
      <Title
        style={{
          textAlign: 'center',
          marginBottom: 20,
          color: '#fff',
          fontWeight: 'bold',
        }}
      >
        Credit Validation
      </Title>

      <DrawerItem
        label="Solicitudes Registradas"
        labelStyle={{ color: '#fff', fontWeight: '600' }}
        icon={({ size }) => (
          <MaterialIcons name="assignment" color="#fff" size={size} />
        )}
        onPress={() => props.navigation.navigate('Personas')}
      />

      <DrawerItem
        label="Nuevo Crédito"
        labelStyle={{ color: '#fff', fontWeight: '600' }}
        icon={({ size }) => (
          <FontAwesome5 name="file-invoice-dollar" color="#fff" size={size} />
        )}
        onPress={() => props.navigation.navigate('Home')}
      />

      <DrawerItem
        label="Clientes Registrados"
        labelStyle={{ color: '#fff', fontWeight: '600' }}
        icon={({ size }) => (
          <Entypo name="users" color="#fff" size={size} />
        )}
        onPress={() => props.navigation.navigate('Search')}
      />

      <DrawerItem
        label="Usuarios"
        labelStyle={{ color: '#fff', fontWeight: '600' }}
        icon={({ size }) => (
          <Ionicons name="people-circle" color="#fff" size={size} />
        )}
        onPress={() => props.navigation.navigate('register')}
      />

      <DrawerItem
        label="Cerrar sesión"
        labelStyle={{ color: '#fff', fontWeight: '600' }}
        icon={({ size }) => (
          <MaterialIcons name="logout" color="#fff" size={size} />
        )}
        onPress={handleLogout}
      />

      <Caption
        style={{
          marginTop: 'auto',
          textAlign: 'center',
          padding: 10,
          color: '#e0e0e0',
        }}
      >
        v1.0.0
      </Caption>
    </DrawerContentScrollView>
  );
}
