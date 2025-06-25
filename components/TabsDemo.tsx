import React, { useState } from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';

const demos = ['horizontal', 'vertical'] as const;
type DemoType = typeof demos[number];
const demosTitle: Record<DemoType, string> = {
  horizontal: 'Horizontal',
  vertical: 'Vertical',
};

export default function TabsDemo() {
  const [demoIndex, setDemoIndex] = useState(0);
  const demo: DemoType = demos[demoIndex];

  return (
    <View style={styles.container}>
      {demo === 'horizontal' ? <HorizontalTabs /> : <VerticalTabs />}

      <View style={styles.buttonContainer}>
        <Button
          title={demosTitle[demo]}
          onPress={() => setDemoIndex((demoIndex + 1) % demos.length)}
        />
      </View>
    </View>
  );
}

function HorizontalTabs() {
  const [activeTab, setActiveTab] = useState('ingresos');

  return (
    <View style={styles.tabsContainer}>
      <View style={styles.tabListHorizontal}>
        <Button
          title="Ingresos"
          onPress={() => setActiveTab('ingresos')}
          color={activeTab === 'ingresos' ? 'blue' : 'gray'}
        />
        <Button
          title="Otro"
          onPress={() => setActiveTab('otro')}
          color={activeTab === 'otro' ? 'blue' : 'gray'}
        />
      </View>

      <View style={styles.tabContent}>
        {activeTab === 'ingresos' && <FormularioIngresos />}
        {activeTab === 'otro' && (
          <Text style={styles.tabText}>Otro contenido aquí</Text>
        )}
      </View>
    </View>
  );
}

function VerticalTabs() {
  const [activeTab, setActiveTab] = useState('ingresos');

  return (
    <View style={styles.tabsContainerRow}>
      <View style={styles.tabListVertical}>
        <Button
          title="Ingresos"
          onPress={() => setActiveTab('ingresos')}
          color={activeTab === 'ingresos' ? 'blue' : 'gray'}
        />
        <Button
          title="Otro"
          onPress={() => setActiveTab('otro')}
          color={activeTab === 'otro' ? 'blue' : 'gray'}
        />
      </View>

      <View style={styles.tabContent}>
        {activeTab === 'ingresos' && <FormularioIngresos />}
        {activeTab === 'otro' && (
          <Text style={styles.tabText}>Otro contenido aquí</Text>
        )}
      </View>
    </View>
  );
}

function FormularioIngresos() {
  const { personaID } = useLocalSearchParams();
  const router = useRouter();

  return (
    <View style={styles.formContainer}>
      <Text style={styles.infoText}>ID del cliente recibido: {personaID}</Text>
      <Button title="Volver" onPress={() => router.back()} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 50,
  },
  buttonContainer: {
    position: 'absolute',
    bottom: 20,
    left: 16,
  },
  tabsContainer: {
    width: 400,
    height: 200,
  },
  tabsContainerRow: {
    flexDirection: 'row',
    width: 400,
    height: 200,
  },
  tabListHorizontal: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 10,
  },
  tabListVertical: {
    justifyContent: 'space-around',
    marginRight: 10,
  },
  tabContent: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabText: {
    fontSize: 16,
  },
  formContainer: {
    alignItems: 'center',
  },
  infoText: {
    marginBottom: 20,
    fontSize: 16,
  },
});
