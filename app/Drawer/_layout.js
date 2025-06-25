import React from 'react';
import { Drawer } from 'expo-router/drawer';
import { Slot, usePathname } from 'expo-router';
import { Provider as PaperProvider, MD3LightTheme } from 'react-native-paper';
import DrawerContent from '../../components/DrawerContent';

const customTheme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: '#4BB2F2',       
    background: '#ffffff',
    surface: '#4BB2F2',       
    text: '#000000',
    placeholder: '#666666',
    outline: '#cccccc',
  },
};

export default function RootLayout() {
  const pathname = usePathname();

  const isIndex = pathname === '/' || pathname === '/index';

  return (
    <PaperProvider theme={customTheme}>
      {isIndex ? (
        <Slot /> 
      ) : (
        <Drawer
          drawerContent={(props) => <DrawerContent {...props} />}
          screenOptions={{
            headerStyle: {
              backgroundColor: '#4BB2F2',   
            },
            headerTintColor: '#fff',         
            drawerActiveTintColor: '#4BB2F2',
            drawerInactiveTintColor: '#444',
            drawerLabelStyle: { fontSize: 16 },
          }}
        />
      )}
    </PaperProvider>
  );
}
