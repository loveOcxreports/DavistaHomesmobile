import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { FileText, List, User } from 'lucide-react-native';
import { colors, fonts } from '../lib/theme';
import { InvoiceEditorScreen } from '../screens/InvoiceEditorScreen';
import { SavedScreen } from '../screens/SavedScreen';
import { GuestsScreen } from '../screens/GuestsScreen';
import { PreviewScreen } from '../screens/PreviewScreen';

export type TabParamList = {
  Invoice: undefined;
  Saved: undefined;
  Guests: undefined;
};

export type RootStackParamList = {
  Tabs: undefined;
  Preview: undefined;
};

const Tab = createBottomTabNavigator<TabParamList>();
const Stack = createNativeStackNavigator<RootStackParamList>();

function Tabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.muted2,
        tabBarLabelStyle: {
          fontFamily: fonts.sansBold,
          fontSize: 8.5,
          letterSpacing: 1,
          textTransform: 'uppercase',
        },
        tabBarStyle: {
          borderTopWidth: 1,
          borderTopColor: colors.borderSoft,
          backgroundColor: colors.canvas,
          paddingTop: 8,
        },
      }}
    >
      <Tab.Screen
        name="Invoice"
        component={InvoiceEditorScreen}
        options={{ tabBarIcon: ({ color, size }) => <FileText color={color} size={size} strokeWidth={1.8} /> }}
      />
      <Tab.Screen
        name="Saved"
        component={SavedScreen}
        options={{ tabBarIcon: ({ color, size }) => <List color={color} size={size} strokeWidth={1.8} /> }}
      />
      <Tab.Screen
        name="Guests"
        component={GuestsScreen}
        options={{ tabBarIcon: ({ color, size }) => <User color={color} size={size} strokeWidth={1.8} /> }}
      />
    </Tab.Navigator>
  );
}

export function RootNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Tabs" component={Tabs} />
        <Stack.Screen name="Preview" component={PreviewScreen} options={{ animation: 'slide_from_right' }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
