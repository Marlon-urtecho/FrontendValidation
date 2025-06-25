import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, View } from 'react-native';
import { 
  ActivityIndicator, 
  Button, 
  Text, 
  TextInput, 
  Divider, 
  Menu 
} from 'react-native-paper';
import api from '../../Services/Api';

export default function EditPerson() {
  const { personaID } = useLocalSearchParams();
  const router = useRouter();

  const [persona, setPersona] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  // Campos Persona
  const [Nombres, setNombres] = useState('');
  const [Apellidos, setApellidos] = useState('');
  const [TipoIdentificacion, setTipoIdentificacion] = useState('');
  const [NumeroIdentificacion, setNumeroIdentificacion] = useState('');
  const [Nacionalidad, setNacionalidad] = useState('');
  const [FechaNacimiento, setFechaNacimiento] = useState('');
  const [EstadoCivil, setEstadoCivil] = useState('');
  const [Sexo, setSexo] = useState('');

  // Campos Solicitud (última o nueva)
  const [editingSolicitudId, setEditingSolicitudId] = useState(null);
  const [NumeroSolicitud, setNumeroSolicitud] = useState('');
  const [TipoMoneda, setTipoMoneda] = useState('');
  const [MontoSolicitado, setMontoSolicitado] = useState('');
  const [PlazoFinanciero, setPlazoFinanciero] = useState('');
  const [PropositoPrestamo, setPropositoPrestamo] = useState('');
  const [TasaInteresAnual, setTasaInteresAnual] = useState('');
  const [Estado, setEstado] = useState('');

  // Menu para Estado
  const [menuVisible, setMenuVisible] = useState(false);
  const estados = ['Aprobado', 'Rechazada', 'En proceso', 'Pendiente'];

  useEffect(() => {
    if (!personaID) return;

    const fetchPersona = async () => {
      try {
        const res = await api.get(`/personas/${personaID}/`);
        const p = res.data;
        setPersona(p);

        // Set persona fields
        setNombres(p.Nombres);
        setApellidos(p.Apellidos);
        setTipoIdentificacion(p.TipoIdentificacion);
        setNumeroIdentificacion(p.NumeroIdentificacion);
        setNacionalidad(p.Nacionalidad);
        setFechaNacimiento(p.FechaNacimiento);
        setEstadoCivil(p.EstadoCivil);
        setSexo(p.Sexo);

        // Cargar última solicitud si existe
        if (p.solicitudes && p.solicitudes.length > 0) {
          const lastSol = p.solicitudes[p.solicitudes.length - 1];
          setEditingSolicitudId(lastSol.IdSolicitud);
          setNumeroSolicitud(lastSol.NumeroSolicitud);
          setTipoMoneda(lastSol.TipoMoneda);
          setMontoSolicitado(String(lastSol.MontoSolicitado));
          setPlazoFinanciero(String(lastSol.PlazoFinanciero));
          setPropositoPrestamo(lastSol.PropositoPrestamo);
          setTasaInteresAnual(String(lastSol.TasaInteresAnual));
          setEstado(lastSol.Estado);
        } else {
          setEditingSolicitudId(null);
          setNumeroSolicitud('');
          setTipoMoneda('');
          setMontoSolicitado('');
          setPlazoFinanciero('');
          setPropositoPrestamo('');
          setTasaInteresAnual('');
          setEstado('');
        }

      } catch (e) {
        setError('Error al cargar la persona');
      } finally {
        setLoading(false);
      }
    };

    fetchPersona();
  }, [personaID]);

  const handleSave = async () => {
    setSaving(true);
    setError(null);

    try {
      // Actualizar persona
      await api.put(`/personas/${personaID}/`, {
        Nombres,
        Apellidos,
        TipoIdentificacion,
        NumeroIdentificacion,
        Nacionalidad,
        FechaNacimiento,
        EstadoCivil,
        Sexo,
      });

      // Payload para solicitud
      const solicitudPayload = {
        NumeroSolicitud,
        TipoMoneda,
        MontoSolicitado: parseFloat(MontoSolicitado) || 0,
        PlazoFinanciero: parseInt(PlazoFinanciero, 10) || 0,
        PropositoPrestamo,
        TasaInteresAnual: parseFloat(TasaInteresAnual) || 0,
        Estado,
        IdPersona: personaID,
      };

      if (editingSolicitudId) {
        // Actualizar solicitud existente
        await api.put(`/solicitudes/${editingSolicitudId}/`, solicitudPayload);
      } else {
        // Crear nueva solicitud
        await api.post('/solicitudes/', solicitudPayload);
      }

      Alert.alert('Éxito', 'La información fue actualizada');
      router.back();
    } catch (e) {
      setError('Error al guardar los cambios');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <ActivityIndicator style={styles.loader} size="large" />;
  if (error) return <Text style={styles.error}>{error}</Text>;

  return (
    <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
      {/* Sección Persona */}
      <Text style={styles.sectionTitle}>Editar Persona</Text>
      <TextInput label="Nombres" value={Nombres} onChangeText={setNombres} style={styles.input} mode="outlined" />
      <TextInput label="Apellidos" value={Apellidos} onChangeText={setApellidos} style={styles.input} mode="outlined" />
      <TextInput label="Tipo Identificación" value={TipoIdentificacion} onChangeText={setTipoIdentificacion} style={styles.input} mode="outlined" />
      <TextInput label="Número de Identificación" value={NumeroIdentificacion} onChangeText={setNumeroIdentificacion} style={styles.input} keyboardType="numeric" mode="outlined" />
      <TextInput label="Nacionalidad" value={Nacionalidad} onChangeText={setNacionalidad} style={styles.input} mode="outlined" />
      <TextInput label="Fecha de Nacimiento (YYYY-MM-DD)" value={FechaNacimiento} onChangeText={setFechaNacimiento} style={styles.input} mode="outlined" />
      <TextInput label="Estado Civil" value={EstadoCivil} onChangeText={setEstadoCivil} style={styles.input} mode="outlined" />
      <TextInput label="Sexo" value={Sexo} onChangeText={setSexo} style={styles.input} mode="outlined" />

      <Divider style={{ marginVertical: 24 }} />

      {/* Sección Solicitud */}
      <Text style={styles.sectionTitle}>Editar Solicitud</Text>
      <TextInput label="Número Solicitud" value={NumeroSolicitud} onChangeText={setNumeroSolicitud} style={styles.input} mode="outlined" />
      <TextInput label="Tipo Moneda" value={TipoMoneda} onChangeText={setTipoMoneda} style={styles.input} mode="outlined" />
      <TextInput label="Monto Solicitado" value={MontoSolicitado} onChangeText={setMontoSolicitado} style={styles.input} keyboardType="numeric" mode="outlined" />
      <TextInput label="Plazo Financiero (meses)" value={PlazoFinanciero} onChangeText={setPlazoFinanciero} style={styles.input} keyboardType="numeric" mode="outlined" />
      <TextInput label="Propósito Préstamo" value={PropositoPrestamo} onChangeText={setPropositoPrestamo} style={styles.input} mode="outlined" />
      <TextInput label="Tasa Interés Anual" value={TasaInteresAnual} onChangeText={setTasaInteresAnual} style={styles.input} keyboardType="numeric" mode="outlined" />

      {/* Select Estado con Menu */}
      <View style={{ marginBottom: 16 }}>
        <Menu
          visible={menuVisible}
          onDismiss={() => setMenuVisible(false)}
          anchor={
            <Button
              mode="outlined"
              onPress={() => setMenuVisible(true)}
              contentStyle={{ justifyContent: 'space-between' }}
              style={{ justifyContent: 'center' }}
            >
              {Estado || 'Seleccionar Estado'}
            </Button>
          }
        >
          {estados.map(e => (
            <Menu.Item
              key={e}
              onPress={() => {
                setEstado(e);
                setMenuVisible(false);
              }}
              title={e}
            />
          ))}
        </Menu>
      </View>

      {error && <Text style={styles.error}>{error}</Text>}

      <Button
        mode="contained"
        onPress={handleSave}
        loading={saving}
        disabled={saving}
        style={styles.button}
        contentStyle={{ paddingVertical: 8 }}
      >
        Guardar Cambios
      </Button>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    flexGrow: 1,
    backgroundColor: '#fafafa',
  },
  input: {
    marginBottom: 16,
    backgroundColor: '#fff',
  },
  button: {
    marginTop: 20,
    borderRadius: 6,
  },
  loader: {
    marginTop: 50,
  },
  error: {
    color: 'red',
    marginBottom: 16,
    textAlign: 'center',
    fontWeight: '600',
  },
  sectionTitle: {
    fontSize: 22,
    marginBottom: 16,
    fontWeight: '700',
    color: '#333',
  },
});
