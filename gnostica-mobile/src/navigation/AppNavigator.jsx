import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Home, Compass, BookOpen, User, Zap, MessageSquare, Settings } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';

import HomeScreen from '../screens/client/HomeScreen';
import SearchScreen from '../screens/client/SearchScreen';
import MyCoursesScreen from '../screens/client/MyCoursesScreen';
import SettingsScreen from '../screens/client/SettingsScreen';
import HighlightsScreen from '../screens/client/HighlightsScreen';
import ForumScreen from '../screens/client/ForumScreen';

const Tab = createBottomTabNavigator();

const PRIMARY = '#2563eb';
const INACTIVE = '#94a3b8';
const HIGHLIGHT = '#f97316';

const TabIcon = ({ Icon, focused, color }) => (
    <View style={{ alignItems: 'center', justifyContent: 'center' }}>
        <Icon size={24} color={color || (focused ? PRIMARY : INACTIVE)} strokeWidth={focused ? 2.5 : 1.8} />
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
                    fontFamily: 'Inter_600SemiBold',
                },
                tabBarItemStyle: {
                    height: 55,
                    marginTop: 0,
                    paddingTop: 5,
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
                name="MyCourses"
                component={MyCoursesScreen}
                options={{
                    tabBarLabel: 'Khóa học',
                    tabBarIcon: ({ focused }) => <TabIcon Icon={BookOpen} focused={focused} />,
                }}
            />
            <Tab.Screen
                name="Highlights"
                component={HighlightsScreen}
                options={{
                    tabBarLabel: 'Nổi bật',
                    tabBarLabelStyle: {
                        color: HIGHLIGHT,
                        fontSize: 11,
                        fontFamily: 'Inter_600SemiBold',
                    },
                    tabBarIcon: () => (
                        <View style={{ width: 24, height: 24, alignItems: 'center', justifyContent: 'center' }}>
                            <LinearGradient
                                colors={['#fb923c', '#ea580c']}
                                style={{
                                    position: 'absolute',
                                    bottom: 0,
                                    width: 58,
                                    height: 58,
                                    borderRadius: 29,
                                    borderWidth: 4,
                                    borderColor: '#fff',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                }}
                            >
                                <Zap size={24} color="#fff" fill="#fff" />
                            </LinearGradient>
                        </View>
                    ),
                    tabBarButton: (props) => (
                        <TouchableOpacity
                            {...props}
                            activeOpacity={0.8}
                            hitSlop={{ top: 30, left: 10, right: 10 }}
                        />
                    )
                }}
            />
            <Tab.Screen
                name="Forum"
                component={ForumScreen}
                options={{
                    tabBarLabel: 'Diễn đàn',
                    tabBarIcon: ({ focused }) => <TabIcon Icon={MessageSquare} focused={focused} />,
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

export default AppNavigator;
