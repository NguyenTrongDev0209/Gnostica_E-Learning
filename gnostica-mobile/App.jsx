import "./global.css";
import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { enableScreens } from 'react-native-screens';
import { AuthProvider } from './src/context/AuthContext';
import { CartProvider } from './src/context/CartContext';
import { LoadingProvider } from './src/context/LoadingContext';
import {
  useFonts,
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold
} from '@expo-google-fonts/inter';

enableScreens(false);

import AppNavigator from './src/navigation/AppNavigator';
import SplashScreen from './src/screens/auth/SplashScreen';
import OnboardingScreen from './src/screens/auth/OnboardingScreen';
import LoginScreen from './src/screens/auth/LoginScreen';
import RegisterScreen from './src/screens/auth/RegisterScreen';
import CourseDetailScreen from './src/screens/course/CourseDetailScreen';
import CartScreen from './src/screens/checkout/CartScreen';
import LearningScreen from './src/screens/course/LearningScreen';
import CourseCatalogScreen from './src/screens/course/CourseCatalogScreen';
import CheckoutScreen from './src/screens/checkout/CheckoutScreen';
import OrdersScreen from './src/screens/checkout/OrdersScreen';
import SettingsScreen from './src/screens/profile/SettingsScreen';
import CheckoutResultScreen from './src/screens/checkout/CheckoutResultScreen';
import ChangePasswordScreen from './src/screens/profile/ChangePasswordScreen';
import ForgotPasswordScreen from './src/screens/auth/ForgotPasswordScreen';
import ConfirmCodeScreen from './src/screens/auth/ConfirmCodeScreen';
import ResetPasswordScreen from './src/screens/auth/ResetPasswordScreen';
import EmailRegisterScreen from './src/screens/auth/EmailRegisterScreen';
import EmailLoginScreen from './src/screens/auth/EmailLoginScreen';
import PhoneLoginScreen from './src/screens/auth/PhoneLoginScreen';
import PhoneOTPScreen from './src/screens/auth/PhoneOTPScreen';
import WishlistScreen from './src/screens/profile/WishlistScreen';
import CertificatesScreen from './src/screens/profile/CertificatesScreen';
import VouchersScreen from './src/screens/checkout/VouchersScreen';
import NotificationsScreen from './src/screens/profile/NotificationsScreen';
import LegalInfoScreen from './src/screens/profile/LegalInfoScreen';
import ProfileScreen from './src/screens/profile/ProfileScreen';
import SupportScreen from './src/screens/profile/SupportScreen';
import ForumScreen from './src/screens/forum/ForumScreen';
import ForumDetailScreen from './src/screens/forum/ForumDetailScreen';
import CreatePostScreen from './src/screens/forum/CreatePostScreen';
import CategoryBrowseScreen from './src/screens/course/CategoryBrowseScreen';
import InstructorListScreen from './src/screens/instructor/InstructorListScreen';
import FavoriteInstructorsScreen from './src/screens/instructor/FavoriteInstructorsScreen';
import LearningProgressScreen from './src/screens/course/LearningProgressScreen';
import ApplyInstructorScreen from './src/screens/instructor/ApplyInstructorScreen';
import MyForumPostsScreen from './src/screens/forum/MyForumPostsScreen';
import PaymentQRCodeScreen from './src/screens/checkout/PaymentQRCodeScreen';
import PaymentSuccessScreen from './src/screens/checkout/PaymentSuccessScreen';
import SearchScreen from './src/screens/home/SearchScreen';
import GiftScreen from './src/screens/checkout/GiftScreen';
import GiftResponseScreen from './src/screens/checkout/GiftResponseScreen';
// Removed Admin & Instructor Imports

const Stack = createNativeStackNavigator();

export default function App() {
  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  const [showSplash, setShowSplash] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState(false);

  const handleSplashFinish = async () => {
    try {
      const seen = await AsyncStorage.getItem('onboarding_seen');
      if (!seen) {
        setShowOnboarding(true);
      }
    } catch (_) { }
    setShowSplash(false);
  };

  const handleOnboardingFinish = async () => {
    try {
      await AsyncStorage.setItem('onboarding_seen', 'true');
    } catch (_) { }
    setShowOnboarding(false);
  };

  if (!fontsLoaded) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  if (showSplash) {
    return <SplashScreen onFinish={handleSplashFinish} />;
  }

  if (showOnboarding) {
    return <OnboardingScreen onFinish={handleOnboardingFinish} />;
  }

  return (
    <AuthProvider>
      <CartProvider>
        <LoadingProvider>
          <NavigationContainer>
            <Stack.Navigator screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
              <Stack.Screen name="Main" component={AppNavigator} options={{ animation: 'none' }} />
              <Stack.Screen name="Login" component={LoginScreen} />
              <Stack.Screen name="EmailLogin" component={EmailLoginScreen} />
              <Stack.Screen name="Register" component={RegisterScreen} />
              <Stack.Screen name="EmailRegister" component={EmailRegisterScreen} />
              <Stack.Screen name="CourseDetail" component={CourseDetailScreen} />
              <Stack.Screen name="Cart" component={CartScreen} />
              <Stack.Screen name="Learning" component={LearningScreen} />
              <Stack.Screen name="CourseCatalog" component={CourseCatalogScreen} />
              <Stack.Screen name="Checkout" component={CheckoutScreen} />
              <Stack.Screen name="CheckoutResult" component={CheckoutResultScreen} />
              <Stack.Screen name="ChangePassword" component={ChangePasswordScreen} />
              <Stack.Screen name="Orders" component={OrdersScreen} />
              <Stack.Screen name="Settings" component={SettingsScreen} />
              <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
              <Stack.Screen name="ConfirmCode" component={ConfirmCodeScreen} />
              <Stack.Screen name="ResetPassword" component={ResetPasswordScreen} />
              <Stack.Screen name="PhoneLogin" component={PhoneLoginScreen} />
              <Stack.Screen name="PhoneOTP" component={PhoneOTPScreen} />
              <Stack.Screen name="Wishlist" component={WishlistScreen} />
              <Stack.Screen name="Certificates" component={CertificatesScreen} />
              <Stack.Screen name="Vouchers" component={VouchersScreen} />
              <Stack.Screen name="Notifications" component={NotificationsScreen} />
              <Stack.Screen name="LegalInfo" component={LegalInfoScreen} />
              <Stack.Screen name="Profile" component={ProfileScreen} />
              <Stack.Screen name="Support" component={SupportScreen} />
              <Stack.Screen name="Forum" component={ForumScreen} />
              <Stack.Screen name="ForumDetail" component={ForumDetailScreen} />
              <Stack.Screen name="CreatePost" component={CreatePostScreen} />
              <Stack.Screen name="CategoryBrowse" component={CategoryBrowseScreen} />
              <Stack.Screen name="InstructorList" component={InstructorListScreen} />
              <Stack.Screen name="FavoriteInstructors" component={FavoriteInstructorsScreen} />
              <Stack.Screen name="LearningProgress" component={LearningProgressScreen} />
              <Stack.Screen name="ApplyInstructor" component={ApplyInstructorScreen} />
              <Stack.Screen name="MyForumPosts" component={MyForumPostsScreen} />
              <Stack.Screen name="PaymentQRCode" component={PaymentQRCodeScreen} />
              <Stack.Screen name="PaymentSuccess" component={PaymentSuccessScreen} />
              <Stack.Screen name="Search" component={SearchScreen} />
              <Stack.Screen name="Gift" component={GiftScreen} />
              <Stack.Screen name="GiftResponse" component={GiftResponseScreen} />
              {/* Removed Admin & Instructor Screens */}
            </Stack.Navigator>
          </NavigationContainer>
        </LoadingProvider>
      </CartProvider>
    </AuthProvider>
  );
}

