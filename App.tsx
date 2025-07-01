import { StatusBar } from 'expo-status-bar';
import type React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import AppNavigator from './src/navigation/AppNavigator';

const App: React.FC = () => {
  return (
    <SafeAreaProvider>
      <AppNavigator />
      <StatusBar style="light" backgroundColor="#2E7D32" />
    </SafeAreaProvider>
  );
};

export default App;
