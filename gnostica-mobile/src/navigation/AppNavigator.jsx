import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Home, Compass, BookOpen, User, Zap, Settings } from 'lucide-react-native';

import HomeScreen from '../screens/client/HomeScreen';
import SearchScreen from '../screens/client/SearchScreen';
import MyCoursesScreen from '../screens/client/MyCoursesScreen';
import ProfileScreen from '../screens/client/ProfileScreen';
import SettingsScreen from '../screens/client/SettingsScreen';
import HighlightsScreen from '../screens/client/HighlightsScreen';

const Tab = createBottomTabNavigator();

const PRIMARY = '#2563eb';
const INACTIVE = '#94a3b8';
const HIGHLIGHT = '#e32f45';

const TabIcon = ({ Icon, focused, color }) => (
    <View style={{ alignItems: 'center', justifyContent: 'center' }}>
        <Icon size={24} color={color || (focused ? PRIMARY : INACTIVE)} strokeWidth={focused ? 2.5 : 1.8} />
    </View>
);

const CustomTabBarButton = ({ children, onPress }) => (
    <TouchableOpacity
        style={{
            top: -20,
            justifyContent: 'center',
            alignItems: 'center',
            ...styles.shadow
        }}
        onPress={onPress}
        activeOpacity={0.8}
    >
        <View style={{
            width: 58,
            height: 58,
            borderRadius: 29,
            backgroundColor: HIGHLIGHT,
            borderWidth: 4,
            borderColor: '#fff',
        }}>
            {children}
        </View>
    </TouchableOpacity>
);

const AppNavigator = () => {
    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                headerShown: false,
                tabBarShowLabel: true,
                tabBarActiveTintColor: PRIMARY,
                tabBarInactiveTintColor: INACTIVE,
                tabBarStyle: {
                    position: 'absolute',
                    backgroundColor: '#ffffff',
                    borderTopWidth: 0,
                    height: 75,
                    paddingBottom: 25,
                    paddingTop: 0,
                    elevation: 25,
                    shadowColor: '#000',
                    shadowOpacity: 0.1,
                    shadowOffset: { width: 0, height: -4 },
                    shadowRadius: 10,
                },
                tabBarLabelStyle: {
                    fontSize: 11,
                    fontWeight: '600',
                },
                tabBarItemStyle: {
                    height: 55,
                    marginTop: 0,
                }
            })}
        >
            <Tab.Screen
                name="Home"
                component={HomeScreen}
                options={{
                    tabBarLabel: 'Trang chủ',
                    tabBarIcon: ({ focused }) => <TabIcon Icon={Home} focused={focused} />,
                }}
            />
            <Tab.Screen
                name="Search"
                component={SearchScreen}
                options={{
                    tabBarLabel: 'Khám phá',
                    tabBarIcon: ({ focused }) => <TabIcon Icon={Compass} focused={focused} />,
                }}
            />
            <Tab.Screen
                name="Highlights"
                component={HighlightsScreen}
                options={{
                    tabBarLabel: 'Nổi bật',
                    tabBarIcon: ({ focused }) => (
                        <Zap size={24} color="#fff" fill="#fff" />
                    ),
                    tabBarButton: (props) => (
                        <CustomTabBarButton {...props} />
                    ),
                    tabBarLabelStyle: {
                        color: HIGHLIGHT,
                        fontWeight: 'bold',
                        marginTop: 25,
                    }
                }}
            />
            <Tab.Screen
                name="MyCourses"
                component={MyCoursesScreen}
                options={{
                    tabBarLabel: 'Khóa học',
                    tabBarIcon: ({ focused }) => <TabIcon Icon={BookOpen} focused={focused} />,
                }}
            />
            <Tab.Screen
                name="Settings"
                component={SettingsScreen}
                options={{
                    tabBarLabel: 'Cài đặt',
                    tabBarIcon: ({ focused }) => <TabIcon Icon={Settings} focused={focused} />,
                }}
            />
        </Tab.Navigator>
    );
};

const styles = StyleSheet.create({
    shadow: {
        shadowColor: HIGHLIGHT,
        shadowOffset: {
            width: 0,
            height: 10,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.5,
        elevation: 10
    }
});

export default AppNavigator;
