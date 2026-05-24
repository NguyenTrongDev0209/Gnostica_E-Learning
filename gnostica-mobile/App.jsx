import "./global.css";
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { enableScreens } from 'react-native-screens';
import { AuthProvider } from './src/context/AuthContext';
import { CartProvider } from './src/context/CartContext';

enableScreens(false);

import AppNavigator from './src/navigation/AppNavigator';
import LoginScreen from './src/screens/auth/LoginScreen';
import RegisterScreen from './src/screens/auth/RegisterScreen';
import CourseDetailScreen from './src/screens/client/CourseDetailScreen';
import CartScreen from './src/screens/client/CartScreen';
import LearningScreen from './src/screens/client/LearningScreen';
import CourseCatalogScreen from './src/screens/client/CourseCatalogScreen';
import CheckoutScreen from './src/screens/client/CheckoutScreen';
import OrdersScreen from './src/screens/client/OrdersScreen';
import SettingsScreen from './src/screens/client/SettingsScreen';
import CheckoutResultScreen from './src/screens/client/CheckoutResultScreen';
import ChangePasswordScreen from './src/screens/client/ChangePasswordScreen';
import ChatScreen from './src/screens/common/ChatScreen';
import GlobalChatButton from './src/components/ui/GlobalChatButton';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <NavigationContainer>
          <Stack.Navigator screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
            <Stack.Screen name="Main" component={AppNavigator} options={{ animation: 'none' }} />
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} />
            <Stack.Screen name="CourseDetail" component={CourseDetailScreen} />
            <Stack.Screen name="Cart" component={CartScreen} />
            <Stack.Screen name="Learning" component={LearningScreen} />
            <Stack.Screen name="CourseCatalog" component={CourseCatalogScreen} />
            <Stack.Screen name="Checkout" component={CheckoutScreen} />
            <Stack.Screen name="CheckoutResult" component={CheckoutResultScreen} />
            <Stack.Screen name="ChangePassword" component={ChangePasswordScreen} />
            <Stack.Screen name="Chat" component={ChatScreen} />
            <Stack.Screen name="Orders" component={OrdersScreen} />
            <Stack.Screen name="Settings" component={SettingsScreen} />
          </Stack.Navigator>
          <GlobalChatButton />
        </NavigationContainer>
      </CartProvider>
    </AuthProvider>
  );
}

