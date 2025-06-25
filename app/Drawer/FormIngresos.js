import React, { useState } from 'react';
import { ScrollView, StyleSheet, Platform, View, TouchableOpacity } from 'react-native';
import { TextInput, Button, Text, Divider, Menu } from 'react-native-paper';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useRouter, useLocalSearchParams } from 'expo-router';
import api from '../../Services/Api';

const opcionesEmpleo = ['Empleado', 'Desempleado', 'Independiente', 'Jubilado'];
const opcionesEstadoDomicilio = ['Propio', 'Alquilado', 'Familiar'];

export default function FormularioIngresos() {
  const router = useRouter();
  const { personaID } = useLocalSearchParams();

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [activeDateField, setActiveDateField] = useState('');
  const [menuVisible, setMenuVisible] = useState({});

  const [laboral, setLaboral] = useState({
    TipoEmpleo: '',
    LugarTrabajo: '',
    FechaContratacion: '',
    FechaAlCorriente: '',
    IngresosMensuales: '',
    MontoGarantia: '',
    MontoDeudas: '',
  });

  const [domicilio, setDomicilio] = useState({
    Direccion: '',
    EstadoDomicilio: '',
    MontoMensualidad: '',
    Departamento: '',
    Municipio: '',
    Barrio: '',
  });

  const [gastosMensuales, setGastosMensuales] = useState({
    Alimentacion: '',
    VestimentaCalzado: '',
    Transporte: '',
    Colegiatura: '',
    OtrosGastos: '',
    GastosSalud: '',
    Telecomunicaciones: '',
    ServiciosAguaLuz: '',
    ServiciosCableInternet: '',
  });

  const [referenciasPersonales, setReferenciasPersonales] = useState({
    NombreApellido: '',
    NumeroContacto: '',
  });

  const toggleMenu = (key) => {
    setMenuVisible((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleDateChange = (event, selectedDate) => {
    setShowDatePicker(false);
    const date = selectedDate || new Date();
    const dateString = date.toISOString().split('T')[0];

    if (activeDateField === 'FechaContratacion') {
      setLaboral((prev) => ({ ...prev, FechaContratacion: dateString }));
    } else if (activeDateField === 'FechaAlCorriente') {
      setLaboral((prev) => ({ ...prev, FechaAlCorriente: dateString }));
    }

    setActiveDateField('');
  };

  const renderInputs = (obj, setObj, keyboard = 'default') =>
    Object.entries(obj).map(([key, value]) => {
      if (key === 'MontoMensualidad' && domicilio.EstadoDomicilio === 'Propio') return null;

      return (
        <TextInput
          key={key}
          label={key}
          value={value}
          onChangeText={(text) => setObj((prev) => ({ ...prev, [key]: text }))}
          style={styles.input}
          keyboardType={keyboard}
          mode="outlined"
        />
      );
    });

  const handleEnviarFormulario = async () => {
    try {
      // Si no se seleccionó fecha, usar fecha actual
      const today = new Date().toISOString().split('T')[0];

      const datosLaboral = {
        ...laboral,
        FechaContratacion: laboral.FechaContratacion || today,
        FechaAlCorriente: laboral.FechaAlCorriente || today,
        IdPersona: personaID,
      };

      const datosDomicilio = {
        ...domicilio,
        MontoMensualidad: domicilio.EstadoDomicilio === 'Propio' ? '0' : domicilio.MontoMensualidad,
        IdPersona: personaID,
      };

      await api.post('/laborales/', datosLaboral);
      await api.post('/domicilios/', datosDomicilio);
      await api.post('/gastos/', { ...gastosMensuales, IdPersona: personaID });
      await api.post('/referencias/', { ...referenciasPersonales, IdPersona: personaID });

      alert('Formulario enviado correctamente');
      router.push({
        pathname: '/Drawer/AmortizacionCalculada',
          params: { personaID: personaID },
      });

    } catch (error) {
      console.error('Error al enviar formulario:', error.response?.data || error);
      alert('Error al enviar formulario. Verifica los datos.');
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.header}>Formulario de Ingresos</Text>

      <Divider style={styles.divider} />
      <Text style={styles.sectionTitle}>Información Laboral</Text>

      {/* Tipo de Empleo - select */}
      <View style={styles.input}>
        <Menu
          visible={menuVisible.TipoEmpleo}
          onDismiss={() => toggleMenu('TipoEmpleo')}
          anchor={
            <TouchableOpacity onPress={() => toggleMenu('TipoEmpleo')}>
              <TextInput
                label="Tipo de Empleo"
                mode="outlined"
                value={laboral.TipoEmpleo}
                editable={false}
                pointerEvents="none"
              />
            </TouchableOpacity>
          }
        >
          {opcionesEmpleo.map((option) => (
            <Menu.Item
              key={option}
              onPress={() => {
                setLaboral((prev) => ({ ...prev, TipoEmpleo: option }));
                toggleMenu('TipoEmpleo');
              }}
              title={option}
            />
          ))}
        </Menu>
      </View>

      <TextInput
        label="Lugar de Trabajo"
        value={laboral.LugarTrabajo}
        onChangeText={(text) => setLaboral({ ...laboral, LugarTrabajo: text })}
        style={styles.input}
        mode="outlined"
      />

      <TextInput
        label="Fecha de Contratación"
        value={laboral.FechaContratacion}
        onFocus={() => {
          setActiveDateField('FechaContratacion');
          setShowDatePicker(true);
        }}
        style={styles.input}
        mode="outlined"
      />

      <TextInput
        label="Fecha al Corriente"
        value={laboral.FechaAlCorriente}
        onFocus={() => {
          setActiveDateField('FechaAlCorriente');
          setShowDatePicker(true);
        }}
        style={styles.input}
        mode="outlined"
      />

      <TextInput
        label="Ingresos Mensuales"
        value={laboral.IngresosMensuales}
        onChangeText={(text) => setLaboral({ ...laboral, IngresosMensuales: text })}
        keyboardType="numeric"
        style={styles.input}
        mode="outlined"
      />
      <TextInput
        label="Monto Garantía"
        value={laboral.MontoGarantia}
        onChangeText={(text) => setLaboral({ ...laboral, MontoGarantia: text })}
        keyboardType="numeric"
        style={styles.input}
        mode="outlined"
      />
      <TextInput
        label="Monto Deudas"
        value={laboral.MontoDeudas}
        onChangeText={(text) => setLaboral({ ...laboral, MontoDeudas: text })}
        keyboardType="numeric"
        style={styles.input}
        mode="outlined"
      />

      <Divider style={styles.divider} />
      <Text style={styles.sectionTitle}>Domicilio</Text>

      <TextInput
        label="Dirección"
        value={domicilio.Direccion}
        onChangeText={(text) => setDomicilio({ ...domicilio, Direccion: text })}
        style={styles.input}
        mode="outlined"
      />

      {/* Estado Domicilio - select */}
      <View style={styles.input}>
        <Menu
          visible={menuVisible.EstadoDomicilio}
          onDismiss={() => toggleMenu('EstadoDomicilio')}
          anchor={
            <TouchableOpacity onPress={() => toggleMenu('EstadoDomicilio')}>
              <TextInput
                label="Estado Domicilio"
                mode="outlined"
                value={domicilio.EstadoDomicilio}
                editable={false}
                pointerEvents="none"
              />
            </TouchableOpacity>
          }
        >
          {opcionesEstadoDomicilio.map((option) => (
            <Menu.Item
              key={option}
              onPress={() => {
                setDomicilio((prev) => ({
                  ...prev,
                  EstadoDomicilio: option,
                  MontoMensualidad: option === 'Propio' ? '0' : '',
                }));
                toggleMenu('EstadoDomicilio');
              }}
              title={option}
            />
          ))}
        </Menu>
      </View>

      {/* Monto mensualidad solo si NO es propio */}
      {domicilio.EstadoDomicilio !== 'Propio' && (
        <TextInput
          label="Monto Mensualidad"
          value={domicilio.MontoMensualidad}
          onChangeText={(text) => setDomicilio({ ...domicilio, MontoMensualidad: text })}
          keyboardType="numeric"
          style={styles.input}
          mode="outlined"
        />
      )}

      <TextInput
        label="Departamento"
        value={domicilio.Departamento}
        onChangeText={(text) => setDomicilio({ ...domicilio, Departamento: text })}
        style={styles.input}
        mode="outlined"
      />
      <TextInput
        label="Municipio"
        value={domicilio.Municipio}
        onChangeText={(text) => setDomicilio({ ...domicilio, Municipio: text })}
        style={styles.input}
        mode="outlined"
      />
      <TextInput
        label="Barrio"
        value={domicilio.Barrio}
        onChangeText={(text) => setDomicilio({ ...domicilio, Barrio: text })}
        style={styles.input}
        mode="outlined"
      />

      <Divider style={styles.divider} />
      <Text style={styles.sectionTitle}>Gastos Mensuales</Text>
      {renderInputs(gastosMensuales, setGastosMensuales, 'numeric')}

      <Divider style={styles.divider} />
      <Text style={styles.sectionTitle}>Referencias Personales</Text>
      {renderInputs(referenciasPersonales, setReferenciasPersonales)}

      {showDatePicker && (
        <DateTimePicker
          value={new Date()}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={handleDateChange}
        />
      )}

      <Button mode="contained" onPress={handleEnviarFormulario} style={styles.button}>
        Enviar Formulario
      </Button>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    paddingBottom: 100,
  },
  header: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  input: {
    marginVertical: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 24,
    marginBottom: 8,
  },
  button: {
    marginTop: 32,
  },
  divider: {
    marginVertical: 16,
  },
});
