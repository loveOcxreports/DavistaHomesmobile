import React from 'react';
import { ActivityIndicator, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useAppFonts } from './src/lib/useAppFonts';
import { InvoiceProvider } from './src/state/InvoiceStore';
import { RootNavigator } from './src/navigation/RootNavigator';
import { colors } from './src/lib/theme';

export default function App() {
  const [fontsLoaded] = useAppFonts();

  if (!fontsLoaded) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#fff' }}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <InvoiceProvider>
        <StatusBar style="dark" />
        <RootNavigator />
      </InvoiceProvider>
    </SafeAreaProvider>
  );
}
