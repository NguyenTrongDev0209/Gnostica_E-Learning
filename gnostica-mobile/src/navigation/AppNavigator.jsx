import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Home, Compass, BookOpen, User, Zap, MessageSquare, Settings } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';

import HomeScreen from '../screens/home/HomeScreen';
import SearchScreen from '../screens/home/SearchScreen';
import MyCoursesScreen from '../screens/course/MyCoursesScreen';
import SettingsScreen from '../screens/profile/SettingsScreen';
import HighlightsScreen from '../screens/home/HighlightsScreen';
import ForumScreen from '../screens/forum/ForumScreen';

import { useTheme } from '../context/ThemeContext';

const Tab = createBottomTabNavigator();

const PRIMARY = '#3b82f6';
const HIGHLIGHT = '#f97316';

const TabIcon = ({ Icon, focused, inactiveColor }) => (
    <View style={{ alignItems: 'center', justifyContent: 'center' }}>
        <Icon size={24} color={focused ? PRIMARY : inactiveColor} strokeWidth={focused ? 2.5 : 1.8} />
    </View>
);

const AppNavigator = () => {
    const { isDarkMode, colors } = useTheme();
    const inactiveColor = colors?.tabInactive || '#94a3b8';

    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                headerShown: false,
                tabBarShowLabel: true,
                tabBarActiveTintColor: PRIMARY,
                tabBarInactiveTintColor: inactiveColor,
                tabBarStyle: {
                    position: 'absolute',
                    backgroundColor: colors?.tabBg || '#ffffff',
                    borderTopWidth: isDarkMode ? 1 : 0,
                    borderTopColor: colors?.tabBorder || '#f1f5f9',
                    height: 75,
                    paddingBottom: 25,
                    paddingTop: 0,
                    elevation: 25,
                    shadowColor: '#000',
                    shadowOpacity: isDarkMode ? 0.4 : 0.1,
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
                    tabBarIcon: ({ focused }) => <TabIcon Icon={Home} focused={focused} inactiveColor={inactiveColor} />,
                }}
            />
            <Tab.Screen
                name="MyCourses"
                component={MyCoursesScreen}
                options={{
                    tabBarLabel: 'Khóa học',
                    tabBarIcon: ({ focused }) => <TabIcon Icon={BookOpen} focused={focused} inactiveColor={inactiveColor} />,
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
                                    borderColor: isDarkMode ? '#0f172a' : '#fff',
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
                    tabBarIcon: ({ focused }) => <TabIcon Icon={MessageSquare} focused={focused} inactiveColor={inactiveColor} />,
                }}
            />
            <Tab.Screen
                name="Settings"
                component={SettingsScreen}
                options={{
                    tabBarLabel: 'Cài đặt',
                    tabBarIcon: ({ focused }) => <TabIcon Icon={Settings} focused={focused} inactiveColor={inactiveColor} />,
                }}
            />
        </Tab.Navigator>
    );
};

export default AppNavigator;
