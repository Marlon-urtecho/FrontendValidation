import React, { useEffect, useState } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
} from 'react-native';
import {
  Searchbar,
  Card,
  ActivityIndicator,
  Text,
  Menu,
  IconButton,
  Avatar,
} from 'react-native-paper';
import { useRouter } from 'expo-router';
import api from '../../Services/Api';

export default function PersonasScreen() {
  const router = useRouter();
  const [personas, setPersonas] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [menuVisible, setMenuVisible] = useState(false);
  const [estadoFilter, setEstadoFilter] = useState('Todos'); // Todos | Aprobada | Rechazada | En proceso

  useEffect(() => {
    const fetchPersonas = async () => {
      try {
        const res = await api.get('/personas/');
        setPersonas(res.data);
        setFiltered(res.data);
      } catch (e) {
        setError('Error al cargar personas');
      } finally {
        setLoading(false);
      }
    };
    fetchPersonas();
  }, []);

  useEffect(() => {
    const q = searchQuery.trim().toLowerCase();

    let data = personas.filter(p =>
      `${p.Nombres} ${p.Apellidos}`.toLowerCase().includes(q)
    );

    // Filtro por estado si no es "Todos"
    if (estadoFilter !== 'Todos') {
      data = data.filter(p => {
        const lastSol = p.solicitudes?.slice(-1)[0];
        if (!lastSol?.Estado) return false;
        return lastSol.Estado.toLowerCase() === estadoFilter.toLowerCase();
      });
    }

    setFiltered(data);
  }, [searchQuery, personas, estadoFilter]);

  const getEstadoIcon = (estado) => {
    switch (estado) {
      case 'Aprobado':
        return { icon: 'check-circle', color: '#4caf50' };
      case 'Rechazada':
        return { icon: 'close-circle', color: '#f44336' };
      case 'En Proceso':
        return { icon: 'progress-clock', color: '#ff9800' };
      case 'Pendiente':
        return { icon: 'clock-outline', color: '#2196f3' };
      default:
        return { icon: 'help-circle-outline', color: '#757575' };
    }
  };

  const renderItem = ({ item: p }) => {
    const lastSol = p.solicitudes?.slice(-1)[0] || {};
    const estado = lastSol.Estado || '';

    const { icon, color } = getEstadoIcon(estado);

    return (
      <Card
        style={styles.card}
        onPress={() =>
          router.push({
            pathname: '/Drawer/AmortizacionCalculada',
            params: { personaID: p.id },
          })
        }
      >
        <Card.Title
          title={`${p.Nombres} ${p.Apellidos}`}
          subtitle={`ID: ${p.NumeroIdentificacion}`}
          titleStyle={{ fontWeight: 'bold', fontSize: 18 }}
          left={() => <Avatar.Icon size={42} icon="account" style={{ backgroundColor: '#e0f7fa' }} />}
        />
        <Card.Content>
          {lastSol.NumeroSolicitud ? (
            <>
              <Text style={styles.solInfo}>Nº Solicitud: {lastSol.NumeroSolicitud}</Text>
              <View style={styles.estadoContainer}>
                <Avatar.Icon
                  icon={icon}
                  size={28}
                  style={{ backgroundColor: 'transparent', marginRight: 8 }}
                  color={color}
                />
                <Text style={[styles.estado, { color }]}>
                  {estado || 'Estado desconocido'}
                </Text>
              </View>
            </>
          ) : (
            <Text style={styles.noSolicitud}>No hay solicitudes registradas.</Text>
          )}
        </Card.Content>
      </Card>
    );
  };

  if (loading) return <ActivityIndicator style={styles.loader} size="large" />;
  if (error) return <Text style={styles.error}>{error}</Text>;

  return (
    <View style={styles.container}>
      <View style={styles.topBar}>
        <Searchbar
          placeholder="Buscar persona..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          style={styles.search}
        />

        <Menu
          visible={menuVisible}
          onDismiss={() => setMenuVisible(false)}
          anchor={
            <IconButton
              icon="filter-variant"
              size={28}
              onPress={() => setMenuVisible(true)}
              style={styles.filterIcon}
            />
          }
        >
          <Menu.Item
            onPress={() => {
              setEstadoFilter('Todos');
              setMenuVisible(false);
            }}
            title="Todos los estados"
          />
          <Menu.Item
            onPress={() => {
              setEstadoFilter('Aprobado');
              setMenuVisible(false);
            }}
            title="Aprobadas"
          />
          <Menu.Item
            onPress={() => {
              setEstadoFilter('Rechazada');
              setMenuVisible(false);
            }}
            title="Rechazadas"
          />
          <Menu.Item
            onPress={() => {
              setEstadoFilter('En Proceso');
              setMenuVisible(false);
            }}
            title="En proceso"
          />
          <Menu.Item
            onPress={() => {
              setEstadoFilter('Pendiente');
              setMenuVisible(false);
            }}
            title="Pendientes"
          />
        </Menu>
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
        contentContainerStyle={{ paddingBottom: 20 }}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={() => (
          <Text style={styles.noSolicitud}>No se encontraron resultados.</Text>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#f4f6f8' },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  search: {
    flex: 1,
    marginRight: 8,
    borderRadius: 12,
  },
  filterIcon: {
    backgroundColor: '#e0e0e0',
    borderRadius: 8,
  },
  card: {
    borderRadius: 12,
    elevation: 3,
    backgroundColor: '#fff',
    marginBottom: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  solInfo: {
    marginTop: 4,
    fontSize: 14,
    color: '#444',
  },
  estadoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
  },
  estado: {
    fontSize: 15,
    fontWeight: '600',
  },
  noSolicitud: {
    fontStyle: 'italic',
    color: '#777',
    fontSize: 14,
    marginTop: 4,
    textAlign: 'center',
  },
  loader: { marginTop: 50 },
  error: { color: 'red', textAlign: 'center', marginTop: 20 },
});
