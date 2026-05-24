import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, Text } from 'react-native';
import { Home, Search, BookOpen, User } from 'lucide-react-native';

import HomeScreen from '../screens/client/HomeScreen';
import SearchScreen from '../screens/client/SearchScreen';
import MyCoursesScreen from '../screens/client/MyCoursesScreen';
import ProfileScreen from '../screens/client/ProfileScreen';

const Tab = createBottomTabNavigator();

const PRIMARY = '#2563eb';
const INACTIVE = '#94a3b8';

const TabIcon = ({ Icon, focused, label }) => (
    <View style={{ alignItems: 'center', justifyContent: 'center', paddingTop: 4 }}>
        <Icon size={22} color={focused ? PRIMARY : INACTIVE} strokeWidth={focused ? 2.5 : 1.8} />
    </View>
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
                    backgroundColor: '#ffffff',
                    borderTopWidth: 1,
                    borderTopColor: '#f1f5f9',
                    paddingBottom: 8,
                    paddingTop: 6,
                    height: 64,
                    elevation: 12,
                    shadowColor: '#000',
                    shadowOpacity: 0.08,
                    shadowOffset: { width: 0, height: -2 },
                    shadowRadius: 8,
                },
                tabBarLabelStyle: {
                    fontSize: 11,
                    fontWeight: '600',
                    marginTop: 2,
                },
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
                    tabBarLabel: 'Tìm kiếm',
                    tabBarIcon: ({ focused }) => <TabIcon Icon={Search} focused={focused} />,
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
                name="Profile"
                component={ProfileScreen}
                options={{
                    tabBarLabel: 'Cá nhân',
                    tabBarIcon: ({ focused }) => <TabIcon Icon={User} focused={focused} />,
                }}
            />
        </Tab.Navigator>
    );
};

export default AppNavigator;
