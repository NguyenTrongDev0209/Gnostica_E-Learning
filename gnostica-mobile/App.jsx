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
import PhoneLoginScreen from './src/screens/auth/PhoneLoginScreen';
import PhoneOTPScreen from './src/screens/auth/PhoneOTPScreen';
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
import FavoriteInstructorsScreen from './src/screens/client/FavoriteInstructorsScreen';
import LearningProgressScreen from './src/screens/client/LearningProgressScreen';
import ApplyInstructorScreen from './src/screens/client/ApplyInstructorScreen';
import MyForumPostsScreen from './src/screens/client/MyForumPostsScreen';
import PaymentQRCodeScreen from './src/screens/client/PaymentQRCodeScreen';
import InstructorDashboardScreen from './src/screens/instructor/InstructorDashboardScreen';
import InstructorCoursesScreen from './src/screens/instructor/InstructorCoursesScreen';
import InstructorRevenueScreen from './src/screens/instructor/InstructorRevenueScreen';
import InstructorQAScreen from './src/screens/instructor/InstructorQAScreen';
import InstructorCouponsScreen from './src/screens/instructor/InstructorCouponsScreen';
import InstructorStudentsScreen from './src/screens/instructor/InstructorStudentsScreen';
import InstructorReportsScreen from './src/screens/instructor/InstructorReportsScreen';
import WithdrawScreen from './src/screens/instructor/WithdrawScreen';
import InstructorSettingsScreen from './src/screens/instructor/InstructorSettingsScreen';

import AdminDashboardScreen from './src/screens/admin/AdminDashboardScreen';
import OrderModerationScreen from './src/screens/admin/OrderModerationScreen';
import UserManagementScreen from './src/screens/admin/UserManagementScreen';
import AdminCoursesScreen from './src/screens/admin/AdminCoursesScreen';
import AdminCourseModerationScreen from './src/screens/admin/AdminCourseModerationScreen';
import AdminCourseDetailModerationScreen from './src/screens/admin/AdminCourseDetailModerationScreen';
import AdminCategoriesScreen from './src/screens/admin/AdminCategoriesScreen';
import AdminTransactionsScreen from './src/screens/admin/AdminTransactionsScreen';
import AdminBanksScreen from './src/screens/admin/AdminBanksScreen';
import AdminCouponsScreen from './src/screens/admin/AdminCouponsScreen';
import AdminReportsScreen from './src/screens/admin/AdminReportsScreen';
import AdminReviewsScreen from './src/screens/admin/AdminReviewsScreen';
import AdminForumCategoryScreen from './src/screens/admin/AdminForumCategoryScreen';
import AdminThreadModerationScreen from './src/screens/admin/AdminThreadModerationScreen';
import AdminSettingsScreen from './src/screens/admin/AdminSettingsScreen';

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
            <Stack.Screen name="PhoneLogin" component={PhoneLoginScreen} />
            <Stack.Screen name="PhoneOTP" component={PhoneOTPScreen} />
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
            <Stack.Screen name="FavoriteInstructors" component={FavoriteInstructorsScreen} />
            <Stack.Screen name="LearningProgress" component={LearningProgressScreen} />
            <Stack.Screen name="ApplyInstructor" component={ApplyInstructorScreen} />
            <Stack.Screen name="MyForumPosts" component={MyForumPostsScreen} />
            <Stack.Screen name="PaymentQRCode" component={PaymentQRCodeScreen} />
            <Stack.Screen name="InstructorDashboard" component={InstructorDashboardScreen} />
            <Stack.Screen name="InstructorCourses" component={InstructorCoursesScreen} />
            <Stack.Screen name="InstructorRevenue" component={InstructorRevenueScreen} />
            <Stack.Screen name="InstructorQA" component={InstructorQAScreen} />
            <Stack.Screen name="InstructorCoupons" component={InstructorCouponsScreen} />
            <Stack.Screen name="InstructorStudents" component={InstructorStudentsScreen} />
            <Stack.Screen name="InstructorReports" component={InstructorReportsScreen} />
            <Stack.Screen name="Withdraw" component={WithdrawScreen} />
            <Stack.Screen name="InstructorSettings" component={InstructorSettingsScreen} />

            <Stack.Screen name="AdminDashboard" component={AdminDashboardScreen} />
            <Stack.Screen name="OrderModeration" component={OrderModerationScreen} />
            <Stack.Screen name="UserManagement" component={UserManagementScreen} />
            <Stack.Screen name="AdminCourses" component={AdminCoursesScreen} />
            <Stack.Screen name="AdminCourseModeration" component={AdminCourseModerationScreen} />
            <Stack.Screen name="AdminCourseDetailModeration" component={AdminCourseDetailModerationScreen} />
            <Stack.Screen name="AdminCategories" component={AdminCategoriesScreen} />
            <Stack.Screen name="AdminTransactions" component={AdminTransactionsScreen} />
            <Stack.Screen name="AdminBanks" component={AdminBanksScreen} />
            <Stack.Screen name="AdminCoupons" component={AdminCouponsScreen} />
            <Stack.Screen name="AdminReports" component={AdminReportsScreen} />
            <Stack.Screen name="AdminReviews" component={AdminReviewsScreen} />
            <Stack.Screen name="AdminForumCategory" component={AdminForumCategoryScreen} />
            <Stack.Screen name="AdminThreadModeration" component={AdminThreadModerationScreen} />
            <Stack.Screen name="AdminSettings" component={AdminSettingsScreen} />
          </Stack.Navigator>
        </NavigationContainer>
      </CartProvider>
    </AuthProvider>
  );
}

