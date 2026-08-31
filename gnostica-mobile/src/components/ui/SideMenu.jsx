import AppText from './AppText';
import React, { useEffect, useRef } from 'react';
import { View, TouchableOpacity, Modal, Animated, Dimensions, TouchableWithoutFeedback, ScrollView } from 'react-native';
import { X, BookOpen, MessageSquare, Compass, Settings, LogOut, ChevronRight, User, Bot } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';

import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');
const DRAWER_WIDTH = width * 0.75;

const MenuItem = ({ icon: Icon, label, onPress, color, isDarkMode }) => {
    const defaultColor = isDarkMode ? "#cbd5e1" : "#475569";
    const itemColor = color || defaultColor;
    return (
        <TouchableOpacity 
            className="flex-row items-center px-4 py-3.5 mb-1 rounded-xl"
            onPress={onPress}
            activeOpacity={0.7}
        >
            <Icon size={22} color={itemColor} />
            <AppText className="flex-1 ml-4 font-semibold text-[15px]" style={{ color: itemColor }}>{label}</AppText>
            <ChevronRight size={18} color={isDarkMode ? "#64748B" : "#cbd5e1"} />
        </TouchableOpacity>
    );
};

const SideMenu = ({ visible, onClose }) => {
    const navigation = useNavigation();
    const { user, logout } = useAuth();
    const { isDarkMode } = useTheme();
    const slideAnim = useRef(new Animated.Value(-DRAWER_WIDTH)).current;
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const insets = useSafeAreaInsets();

    const handleNavigate = (screen) => {
        onClose();
        setTimeout(() => {
            navigation.navigate(screen);
        }, 300);
    };

    const handleLogout = () => {
        onClose();
        setTimeout(() => {
            logout();
            navigation.navigate('Login');
        }, 300);
    };

    const [modalVisible, setModalVisible] = React.useState(visible);

    useEffect(() => {
        if (visible) {
            setModalVisible(true);
            Animated.parallel([
                Animated.timing(slideAnim, { toValue: 0, duration: 250, useNativeDriver: true }),
                Animated.timing(fadeAnim, { toValue: 1, duration: 250, useNativeDriver: true })
            ]).start();
        } else {
            Animated.parallel([
                Animated.timing(slideAnim, { toValue: -DRAWER_WIDTH, duration: 250, useNativeDriver: true }),
                Animated.timing(fadeAnim, { toValue: 0, duration: 250, useNativeDriver: true })
            ]).start(() => {
                setModalVisible(false);
            });
        }
    }, [visible]);

    return (
        <Modal visible={modalVisible} transparent animationType="none" onRequestClose={onClose}>
            <View className="flex-1">
                {/* Overlay backdrop */}
                <TouchableWithoutFeedback onPress={onClose}>
                    <Animated.View style={{ opacity: fadeAnim }} className="absolute top-0 bottom-0 left-0 right-0 bg-black/40" />
                </TouchableWithoutFeedback>

                {/* Drawer Content */}
                <Animated.View 
                    style={{ transform: [{ translateX: slideAnim }], width: DRAWER_WIDTH }} 
                    className={`h-full shadow-2xl absolute top-0 bottom-0 left-0 ${isDarkMode ? 'bg-slate-900' : 'bg-white'}`}
                >
                    {/* Header */}
                    <View 
                        className={`pb-6 px-5 ${isDarkMode ? 'bg-slate-800' : 'bg-blue-600'}`}
                        style={{ paddingTop: Math.max(insets.top, 24) + 16 }}
                    >
                        <View className="flex-row justify-between items-start mb-4">
                            <View className={`w-14 h-14 rounded-full items-center justify-center shadow-sm ${isDarkMode ? 'bg-slate-700' : 'bg-white'}`}>
                                <User size={28} color={isDarkMode ? "#3B82F6" : "#2563eb"} />
                            </View>
                            <TouchableOpacity onPress={onClose} className="p-2 bg-white/20 rounded-full">
                                <X size={20} color="#fff" />
                            </TouchableOpacity>
                        </View>
                        {user ? (
                            <View>
                                <AppText className="text-white font-bold text-lg">{user.name}</AppText>
                                <AppText className="text-blue-100 text-sm mt-0.5">{user.email}</AppText>
                            </View>
                        ) : (
                            <TouchableOpacity onPress={() => handleNavigate('Login')}>
                                <AppText className="text-white font-bold text-lg">Đăng nhập / Đăng ký</AppText>
                                <AppText className="text-blue-100 text-sm mt-0.5">Vui lòng đăng nhập để tiếp tục</AppText>
                            </TouchableOpacity>
                        )}
                    </View>

                    {/* Menu Items */}
                    <ScrollView className="flex-1 py-4 px-2" showsVerticalScrollIndicator={false}>
                        <MenuItem icon={Compass} label="Khám phá khóa học" onPress={() => handleNavigate('Search')} isDarkMode={isDarkMode} />
                        <MenuItem icon={BookOpen} label="Khóa học của tôi" onPress={() => handleNavigate('MyCourses')} isDarkMode={isDarkMode} />
                        <MenuItem icon={Bot} label="Trợ lý AI Gnostica" onPress={() => handleNavigate('AiChat')} color="#3B82F6" isDarkMode={isDarkMode} />
                        <MenuItem icon={MessageSquare} label="Diễn đàn thảo luận" onPress={() => handleNavigate('Forum')} isDarkMode={isDarkMode} />
                        <View className={`h-[1px] my-2 mx-4 ${isDarkMode ? 'bg-slate-800' : 'bg-slate-100'}`} />
                        <MenuItem icon={Settings} label="Cài đặt tài khoản" onPress={() => handleNavigate('Settings')} isDarkMode={isDarkMode} />
                        {user && (
                            <MenuItem icon={LogOut} label="Đăng xuất" onPress={handleLogout} color="#ef4444" isDarkMode={isDarkMode} />
                        )}
                    </ScrollView>
                </Animated.View>
            </View>
        </Modal>
    );
};

export default SideMenu;
