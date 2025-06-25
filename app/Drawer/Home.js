import DateTimePicker from '@react-native-community/datetimepicker';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  Platform,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import {
  Button,
  Menu,
  Text,
  TextInput,
} from 'react-native-paper';
import api from '../../Services/Api';

const dropdownOptions = {
  EstadoCivil: ['Soltero', 'Casado', 'Divorciado', 'Viudo'],
  Sexo: ['Masculino', 'Femenino', 'Otro'],
  TipoIdentificacion: ['DUI', 'Pasaporte', 'NIT', 'Otro'],
  TipoMoneda: ['Córdoba', 'Dólar'],
  PropositoPrestamo: [
    'Capital inversión',
    'Mejoramiento Vivienda',
    'Compra Vehículo',
    'Pago Servicios de Salud',
    'Pago de Deudas',
    'Otro',
  ],
  Estado: ['En Proceso', 'Aprobado', 'Rechazada'],
};

// Valida fecha YYYY-MM-DD y que no sea futura
const esFechaValida = (fechaStr) => {
  const fecha = new Date(fechaStr);
  if (isNaN(fecha)) return false;
  const hoy = new Date();
  return fecha <= hoy;
};

// Validar cédula nicaragüense (DUI)
const esCedulaValida = (cedula) => {
  const regex = /^\d{3}-\d{6}-\d{4}[A-Z]?$/i;
  if (!regex.test(cedula.trim())) return false;

  const partes = cedula.split('-');
  if (partes.length !== 3) return false;

  const fechaStr = partes[1]; // DDMMYY
  const dia = fechaStr.substring(0, 2);
  const mes = fechaStr.substring(2, 4);
  const anio = fechaStr.substring(4, 6);

  const anioCompleto = (parseInt(anio) <= 25) ? `20${anio}` : `19${anio}`;
  const fechaFormateada = `${anioCompleto}-${mes}-${dia}`;

  if (!esFechaValida(fechaFormateada)) return false;

  return true;
};

// Validar pasaporte (letras y números, 5-10 caracteres)
const esPasaporteValido = (numero) => {
  const regex = /^[a-zA-Z0-9]{5,10}$/;
  return regex.test(numero.trim());
};

// Validar NIT (ejemplo típico: 4-6-3-1 dígitos con guiones)
const esNITValido = (numero) => {
  const regex = /^\d{4}-\d{6}-\d{3}-\d{1}$/;
  return regex.test(numero.trim());
};

// Validación general según tipo de identificación
const validarIdentificacion = (tipo, numero) => {
  if (!numero) return false;

  switch (tipo) {
    case 'DUI':
      return esCedulaValida(numero);
    case 'Pasaporte':
      return esPasaporteValido(numero);
    case 'NIT':
      return esNITValido(numero);
    case 'Otro':
      return true; // No validar formato
    default:
      return false;
  }
};

export default function HomeScreen() {
  const router = useRouter();

  const [persona, setPersona] = useState({
    Nombres: '',
    Apellidos: '',
    TipoIdentificacion: '',
    NumeroIdentificacion: '',
    Nacionalidad: '',
    FechaNacimiento: '',
    EstadoCivil: '',
    Sexo: '',
  });

  const [solicitud, setSolicitud] = useState({
    NumeroSolicitud: '',
    TipoMoneda: '',
    MontoSolicitado: '',
    PlazoFinanciero: '',
    PropositoPrestamo: '',
    TasaInteresAnual: '',
    Estado: '',
  });

  const [conyuge, setConyuge] = useState({
    NombreApellidos: '',
    NumeroCedula: '',
    NumeroPersonasACargo: '',
  });

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [menuVisible, setMenuVisible] = useState({});
  const [activeDateField, setActiveDateField] = useState('');

  const handleInput = (section, field, value) => {
    if (section === 'persona') {
      let updatedPersona = { ...persona, [field]: value };

      // Extraer fecha desde DUI para FechaNacimiento si aplica
      if (field === 'NumeroIdentificacion' && persona.TipoIdentificacion === 'DUI' && value.length >= 14) {
        const parts = value.split('-');
        if (parts.length === 3 && parts[1].length === 6) {
          const day = parts[1].substring(0, 2);
          const month = parts[1].substring(2, 4);
          const year = parts[1].substring(4, 6);
          const fullYear = parseInt(year) <= 25 ? `20${year}` : `19${year}`;
          const fechaFormateada = `${fullYear}-${month}-${day}`;
          if (esFechaValida(fechaFormateada)) {
            updatedPersona.FechaNacimiento = fechaFormateada;
          }
        }
      }

      setPersona(updatedPersona);
    }

    if (section === 'solicitud') setSolicitud(prev => ({ ...prev, [field]: value }));
    if (section === 'conyuge') setConyuge(prev => ({ ...prev, [field]: value }));
  };

  const toggleMenu = (key) => {
    setMenuVisible(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleDateChange = (event, selectedDate) => {
    setShowDatePicker(false);
    if (!selectedDate) return;
    const formatted = selectedDate.toISOString().split('T')[0];
    handleInput('persona', activeDateField, formatted);
    setActiveDateField('');
  };

  const handleGuardar = async () => {
    // Validar identificación según tipo
    if (!validarIdentificacion(persona.TipoIdentificacion, persona.NumeroIdentificacion)) {
      alert('Número de identificación no válido para el tipo seleccionado.');
      return;
    }

    try {
      // Crear persona
      const resPersona = await api.post('/personas/', {
        ...persona,
        FechaNacimiento: persona.FechaNacimiento || null,
      });

      const idPersona = resPersona.data.id;

      await api.post('/solicitudes/', {
        ...solicitud,
        IdPersona: idPersona,
      });

      if (persona.EstadoCivil === 'Casado') {
        await api.post('/conyuges/', {
          ...conyuge,
          IdPersona: idPersona,
        });
      }

      router.push({
        pathname: '/Drawer/FormIngresos',
        params: { personaID: idPersona },
      });

    } catch (err) {
      console.error('Error al guardar información:', err);
      alert('Error al guardar. Verifica los datos o la conexión.');
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text variant="headlineMedium" style={styles.heading}>Datos Personales</Text>

      {['Nombres', 'Apellidos', 'NumeroIdentificacion', 'Nacionalidad'].map(field => (
        <TextInput
          key={field}
          label={field}
          mode="outlined"
          value={persona[field]}
          onChangeText={text => handleInput('persona', field, text)}
          style={styles.input}
        />
      ))}

      {['TipoIdentificacion', 'EstadoCivil', 'Sexo'].map(field => (
        <View key={field} style={styles.input}>
          <Menu
            visible={menuVisible[field]}
            onDismiss={() => toggleMenu(field)}
            anchor={
              <TouchableOpacity onPress={() => toggleMenu(field)}>
                <TextInput
                  label={field}
                  mode="outlined"
                  value={persona[field]}
                  editable={false}
                  pointerEvents="none"
                />
              </TouchableOpacity>
            }
          >
            {dropdownOptions[field].map(option => (
              <Menu.Item
                key={option}
                onPress={() => {
                  handleInput('persona', field, option);
                  toggleMenu(field);
                }}
                title={option}
              />
            ))}
          </Menu>
        </View>
      ))}

      <TouchableOpacity onPress={() => {
        setActiveDateField('FechaNacimiento');
        setShowDatePicker(true);
      }}>
        <TextInput
          label="Fecha de Nacimiento"
          mode="outlined"
          value={persona.FechaNacimiento}
          editable={false}
          style={styles.input}
        />
      </TouchableOpacity>

      {showDatePicker && (
        <DateTimePicker
          value={persona.FechaNacimiento ? new Date(persona.FechaNacimiento) : new Date()}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          maximumDate={new Date()}
          onChange={handleDateChange}
        />
      )}

      {persona.EstadoCivil === 'Casado' && (
        <>
          <Text variant="titleMedium" style={styles.sectionTitle}>Datos del Cónyuge</Text>
          {['NombreApellidos', 'NumeroCedula', 'NumeroPersonasACargo'].map(field => (
            <TextInput
              key={field}
              label={field}
              mode="outlined"
              keyboardType={field.includes('Numero') ? 'numeric' : 'default'}
              value={conyuge[field]}
              onChangeText={text => handleInput('conyuge', field, text)}
              style={styles.input}
            />
          ))}
        </>
      )}

      <Text variant="headlineSmall" style={styles.sectionTitle}>Datos de la Solicitud</Text>

      {['NumeroSolicitud', 'MontoSolicitado', 'PlazoFinanciero', 'TasaInteresAnual', 'Estado'].map(field => (
        <TextInput
          key={field}
          label={field}
          mode="outlined"
          keyboardType={['MontoSolicitado', 'PlazoFinanciero', 'TasaInteresAnual'].includes(field) ? 'numeric' : 'default'}
          value={solicitud[field]}
          onChangeText={text => handleInput('solicitud', field, text)}
          style={styles.input}
        />
      ))}

      <View style={styles.input}>
        <Menu
          visible={menuVisible['TipoMoneda']}
          onDismiss={() => toggleMenu('TipoMoneda')}
          anchor={
            <TouchableOpacity onPress={() => toggleMenu('TipoMoneda')}>
              <TextInput
                label="TipoMoneda"
                mode="outlined"
                value={solicitud.TipoMoneda}
                editable={false}
                pointerEvents="none"
              />
            </TouchableOpacity>
          }
        >
          {dropdownOptions.TipoMoneda.map(option => (
            <Menu.Item
              key={option}
              onPress={() => {
                handleInput('solicitud', 'TipoMoneda', option);
                toggleMenu('TipoMoneda');
              }}
              title={option}
            />
          ))}
        </Menu>
      </View>

      <View style={styles.input}>
        <Menu
          visible={menuVisible['PropositoPrestamo']}
          onDismiss={() => toggleMenu('PropositoPrestamo')}
          anchor={
            <TouchableOpacity onPress={() => toggleMenu('PropositoPrestamo')}>
              <TextInput
                label="PropositoPrestamo"
                mode="outlined"
                value={solicitud.PropositoPrestamo}
                editable={false}
                pointerEvents="none"
              />
            </TouchableOpacity>
          }
        >
          {dropdownOptions.PropositoPrestamo.map(option => (
            <Menu.Item
              key={option}
              onPress={() => {
                handleInput('solicitud', 'PropositoPrestamo', option);
                toggleMenu('PropositoPrestamo');
              }}
              title={option}
            />
          ))}
        </Menu>
      </View>

      <Button mode="contained" onPress={handleGuardar} style={{ marginTop: 20 }}>
        Guardar
      </Button>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  heading: {
    marginBottom: 16,
    fontWeight: 'bold',
  },
  sectionTitle: {
    marginTop: 20,
    marginBottom: 8,
    fontWeight: '600',
  },
  input: {
    marginBottom: 12,
  },
});
