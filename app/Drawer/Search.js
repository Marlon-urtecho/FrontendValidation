import React, { useEffect, useState } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  TouchableOpacity,
} from 'react-native';
import {
  Searchbar,
  Card,
  ActivityIndicator,
  Text,
  Avatar,
} from 'react-native-paper';
import { useRouter } from 'expo-router';
import api from '../../Services/Api';

const estados = ['Todos', 'Aprobado', 'Rechazada', 'En Proceso', 'Pendiente'];

export default function PersonasScreen() {
  const router = useRouter();
  const [personas, setPersonas] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [estadoFilter, setEstadoFilter] = useState('Todos');

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

    if (estadoFilter !== 'Todos') {
      data = data.filter(p => {
        const lastSol = p.solicitudes?.slice(-1)[0];
        return lastSol?.Estado === estadoFilter;
      });
    }

    setFiltered(data);
  }, [searchQuery, personas, estadoFilter]);

  const getEstadoIcon = (estado) => {
    switch (estado) {
      case 'Aprobado':
        return { icon: 'check-decagram', color: '#4caf50' };
      case 'Rechazada':
        return { icon: 'alert-octagon', color: '#f44336' };
      case 'En Proceso':
        return { icon: 'progress-clock', color: '#ff9800' };
      case 'Pendiente':
        return { icon: 'clock-time-eight-outline', color: '#2196f3' };
      default:
        return { icon: 'help-circle-outline', color: '#9e9e9e' };
    }
  };

  if (loading) return <ActivityIndicator style={styles.loader} size="large" />;
  if (error) return <Text style={styles.error}>{error}</Text>;

  const renderItem = ({ item: p }) => {
    const lastSol = p.solicitudes?.slice(-1)[0] || {};
    const estado = lastSol.Estado || 'Sin estado';
    const { icon, color } = getEstadoIcon(estado);

    return (
      <Card
        key={p.id}
        style={styles.card}
        onPress={() =>
          router.push({
            pathname: '/Drawer/EditPerson',
            params: { personaID: p.id },
          })
        }
      >
        <Card.Title
          title={`${p.Nombres} ${p.Apellidos}`}
          subtitle={`ID: ${p.NumeroIdentificacion}`}
        />
        <Card.Content>
          {lastSol.NumeroSolicitud ? (
            <>
              <Text>Nº Solicitud: {lastSol.NumeroSolicitud}</Text>
              <View style={styles.estadoContainer}>
                <Avatar.Icon
                  icon={icon}
                  size={28}
                  color={color}
                  style={{ backgroundColor: 'transparent', marginRight: 8 }}
                />
                <Text style={[styles.estadoTexto, { color }]}>{estado}</Text>
              </View>
            </>
          ) : (
            <Text style={styles.noSolicitud}>No hay solicitudes.</Text>
          )}
        </Card.Content>
      </Card>
    );
  };

  return (
    <View style={styles.container}>
      <Searchbar
        placeholder="Buscar persona..."
        value={searchQuery}
        onChangeText={setSearchQuery}
        style={styles.search}
      />

      <View style={styles.chipsContainer}>
        {estados.map((estado) => (
          <TouchableOpacity
            key={estado}
            style={[
              styles.chip,
              estadoFilter === estado && styles.chipActive,
            ]}
            onPress={() => setEstadoFilter(estado)}
          >
            <Text
              style={[
                styles.chipText,
                estadoFilter === estado && styles.chipTextActive,
              ]}
            >
              {estado}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
        showsVerticalScrollIndicator={true}
        contentContainerStyle={{ paddingBottom: 20 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#f9fafb' },
  search: { marginBottom: 12 },
  chipsContainer: {
    flexDirection: 'row',
    marginBottom: 12,
    flexWrap: 'nowrap',
  },
  chip: {
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#bbb',
    marginRight: 8,
    backgroundColor: '#fff',
  },
  chipActive: {
    backgroundColor: '#2196f3',
    borderColor: '#2196f3',
  },
  chipText: {
    fontSize: 14,
    color: '#555',
  },
  chipTextActive: {
    color: '#fff',
    fontWeight: '600',
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
  estadoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
  },
  estadoTexto: {
    fontSize: 15,
    fontWeight: '600',
  },
  noSolicitud: {
    fontStyle: 'italic',
    color: '#777',
    fontSize: 14,
    marginTop: 4,
  },
  loader: { marginTop: 50 },
  error: { color: 'red', textAlign: 'center', marginTop: 20 },
});
