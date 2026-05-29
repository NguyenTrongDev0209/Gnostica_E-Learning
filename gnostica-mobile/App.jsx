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
import ForgotPasswordScreen from './src/screens/auth/ForgotPasswordScreen';
import ConfirmCodeScreen from './src/screens/auth/ConfirmCodeScreen';
import ResetPasswordScreen from './src/screens/auth/ResetPasswordScreen';
import WishlistScreen from './src/screens/client/WishlistScreen';
import CertificatesScreen from './src/screens/client/CertificatesScreen';
import VouchersScreen from './src/screens/client/VouchersScreen';
import NotificationsScreen from './src/screens/client/NotificationsScreen';
import LegalInfoScreen from './src/screens/client/LegalInfoScreen';
import ForumScreen from './src/screens/client/ForumScreen';
import ForumDetailScreen from './src/screens/client/ForumDetailScreen';
import CreatePostScreen from './src/screens/client/CreatePostScreen';
import CategoryBrowseScreen from './src/screens/client/CategoryBrowseScreen';
import InstructorListScreen from './src/screens/client/InstructorListScreen';
import InstructorDashboardScreen from './src/screens/instructor/InstructorDashboardScreen';
import InstructorCoursesScreen from './src/screens/instructor/InstructorCoursesScreen';
import InstructorRevenueScreen from './src/screens/instructor/InstructorRevenueScreen';
import InstructorQAScreen from './src/screens/instructor/InstructorQAScreen';
import AdminDashboardScreen from './src/screens/admin/AdminDashboardScreen';
import OrderModerationScreen from './src/screens/admin/OrderModerationScreen';
import UserManagementScreen from './src/screens/admin/UserManagementScreen';

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
            <Stack.Screen name="Orders" component={OrdersScreen} />
            <Stack.Screen name="Settings" component={SettingsScreen} />
            <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
            <Stack.Screen name="ConfirmCode" component={ConfirmCodeScreen} />
            <Stack.Screen name="ResetPassword" component={ResetPasswordScreen} />
            <Stack.Screen name="Wishlist" component={WishlistScreen} />
            <Stack.Screen name="Certificates" component={CertificatesScreen} />
            <Stack.Screen name="Vouchers" component={VouchersScreen} />
            <Stack.Screen name="Notifications" component={NotificationsScreen} />
            <Stack.Screen name="LegalInfo" component={LegalInfoScreen} />
            <Stack.Screen name="Forum" component={ForumScreen} />
            <Stack.Screen name="ForumDetail" component={ForumDetailScreen} />
            <Stack.Screen name="CreatePost" component={CreatePostScreen} />
            <Stack.Screen name="CategoryBrowse" component={CategoryBrowseScreen} />
            <Stack.Screen name="InstructorList" component={InstructorListScreen} />
            <Stack.Screen name="InstructorDashboard" component={InstructorDashboardScreen} />
            <Stack.Screen name="InstructorCourses" component={InstructorCoursesScreen} />
            <Stack.Screen name="InstructorRevenue" component={InstructorRevenueScreen} />
            <Stack.Screen name="InstructorQA" component={InstructorQAScreen} />
            <Stack.Screen name="AdminDashboard" component={AdminDashboardScreen} />
            <Stack.Screen name="OrderModeration" component={OrderModerationScreen} />
            <Stack.Screen name="UserManagement" component={UserManagementScreen} />
          </Stack.Navigator>
        </NavigationContainer>
      </CartProvider>
    </AuthProvider>
  );
}

