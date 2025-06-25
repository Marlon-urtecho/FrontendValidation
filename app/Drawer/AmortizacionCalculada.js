import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, ActivityIndicator, View } from 'react-native';
import { Text, DataTable, Card, Divider } from 'react-native-paper';
import { useLocalSearchParams } from 'expo-router';
import * as Animatable from 'react-native-animatable';
import api from '../../Services/Api';

export default function AmortizacionCalculada() {
  const { personaID } = useLocalSearchParams();
  const [data, setData] = useState(null);
  const [resumen, setResumen] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [tabRes, capPago, flujoCaja, endeud, ltvRes] = await Promise.all([
          api.get(`/amortizacion/calculada/persona/${personaID}/`),
          api.get(`/evaluar-capacidad-pago/persona/${personaID}/`),
          api.get(`/analizar-flujo-caja/persona/${personaID}/`),
          api.get(`/cacular-indice-endeudamineto/persona/${personaID}/`),
          api.get(`/api/ltv/${personaID}/`)
        ]);

        setData(tabRes.data);
        setResumen({
          capacidad: capPago.data,
          flujoCaja: flujoCaja.data,
          endeudamiento: endeud.data,
          ltv: ltvRes.data,
        });
      } catch (err) {
        console.error(err.response?.data || err);
        setError('Error al cargar los datos');
      } finally {
        setLoading(false);
      }
    };

    if (personaID) fetchAll();
  }, [personaID]);

  if (loading) return <ActivityIndicator style={{ marginTop: 30 }} size="large" color="#6200ee" />;
  if (error) return <Text style={styles.errorText}>{error}</Text>;
  if (!data) return null;

  const fmtCurrency = (num) =>
    num !== null && num !== undefined ? `$${Number(num).toFixed(2)}` : 'N/A';

  const fmtPercent = (num) =>
    num !== null && num !== undefined ? `${(Number(num) * 100).toFixed(2)}%` : 'N/A';

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Animatable.View animation="fadeInUp" duration={800} style={styles.cardContainer}>
        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.title}>Resumen de Capacidad de Pago</Text>
            <DataRow label="Ingresos Mensuales Totales" value={fmtCurrency(resumen.capacidad?.IngresosMensualesTotales)} />
            <DataRow label="Gastos Mensuales Totales" value={fmtCurrency(resumen.capacidad?.GastosMensualesTotales)} />
            <DataRow label="Flujo de Caja Libre" value={fmtCurrency(resumen.capacidad?.FlujoCajaLibre)} />
            <DataRow label="Cuota Estimada" value={fmtCurrency(resumen.capacidad?.CuotaMensual)} />
            <DataRow label="DSCR" value={resumen.capacidad?.DSCR !== null ? resumen.capacidad.DSCR.toFixed(2) : 'N/A'} />
            <DataRow label="Estado de Crédito" value={resumen.capacidad?.EstadoCredito || 'N/A'} />
          </Card.Content>
        </Card>
      </Animatable.View>

    <Animatable.View animation="fadeInUp" duration={800} delay={100} style={styles.cardContainer}>
        <Card style={styles.card}>
        <Card.Content>
            <Text style={styles.title}>Análisis de Flujo de Caja</Text>
            <DataRow label="Ingreso Mensual" value={fmtCurrency(resumen.flujoCaja?.IngresoMensual)} />
            <DataRow label="Gastos Mensuales" value={fmtCurrency(resumen.flujoCaja?.GastosMensuales)} />
            <DataRow label="Flujo de Caja Libre" value={fmtCurrency(resumen.flujoCaja?.FlujoCajaLibre)} />
            </Card.Content>
        </Card>
    </Animatable.View>


      <Animatable.View animation="fadeInUp" duration={800} delay={200} style={styles.cardContainer}>
        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.title}>Índice de Endeudamiento</Text>
            <DataRow label="Índice Endeudamiento" value={fmtPercent(resumen.endeudamiento?.IndiceEndeudamiento)} />
            <DataRow label="Evaluación" value={resumen.endeudamiento?.EvaluacionEndeudamiento || 'N/A'} />
          </Card.Content>
        </Card>
      </Animatable.View>

      <Animatable.View animation="fadeInUp" duration={800} delay={400} style={styles.cardContainer}>
        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.title}>Loan to Value (LTV)</Text>
            <DataRow label="Monto Préstamo" value={fmtCurrency(resumen.ltv?.MontoPrestamo)} />
            <DataRow label="Monto Garantía" value={fmtCurrency(resumen.ltv?.MontoGarantia)} />
            <DataRow label="LTV" value={resumen.ltv?.LTV !== null ? `${resumen.ltv.LTV.toFixed(2)}%` : 'N/A'} />
            <DataRow label="Interpretación" value={resumen.ltv?.Interpretacion || 'N/A'} />
          </Card.Content>
        </Card>
      </Animatable.View>

      <Animatable.View animation="fadeIn" delay={600} duration={600}>
        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.title}>Tabla de Amortización</Text>
            <DataTable>
              <DataTable.Header style={styles.headerRow}>
                <DataTable.Title>Mes</DataTable.Title>
                <DataTable.Title numeric>Cuota</DataTable.Title>
                <DataTable.Title numeric>Capital</DataTable.Title>
                <DataTable.Title numeric>Interés</DataTable.Title>
                <DataTable.Title numeric>Capital Vivo</DataTable.Title>
              </DataTable.Header>
              {data.TablaAmortizacion.map((item) => (
                <DataTable.Row key={item.Mes} style={styles.row}>
                  <DataTable.Cell>{item.Mes}</DataTable.Cell>
                  <DataTable.Cell numeric>{fmtCurrency(item.Cuota)}</DataTable.Cell>
                  <DataTable.Cell numeric>{fmtCurrency(item.Capital)}</DataTable.Cell>
                  <DataTable.Cell numeric>{fmtCurrency(item.Interes)}</DataTable.Cell>
                  <DataTable.Cell numeric>{fmtCurrency(item.CapitalVivo)}</DataTable.Cell>
                </DataTable.Row>
              ))}
            </DataTable>
          </Card.Content>
        </Card>
      </Animatable.View>
    </ScrollView>
  );
}

function DataRow({ label, value }) {
  return (
    <View style={styles.dataRow}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#f9fafb',
  },
  cardContainer: {
    marginBottom: 20,
  },
  card: {
    backgroundColor: '#fff',
    elevation: 5,
    borderRadius: 12,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#6200ee',
    marginBottom: 16,
  },
  dataRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomColor: '#eee',
    borderBottomWidth: 1,
  },
  label: {
    fontSize: 16,
    color: '#555',
  },
  value: {
    fontSize: 16,
    fontWeight: '600',
    color: '#222',
  },
  headerRow: {
    backgroundColor: '#e3e3e3',
  },
  row: {
    backgroundColor: '#fff',
  },
  errorText: {
    color: 'red',
    textAlign: 'center',
    margin: 20,
    fontSize: 16,
  },
});
