import AppText from './AppText';
import React, { useEffect, useRef } from 'react';
import { View, TouchableOpacity, Modal, Animated, Dimensions, TouchableWithoutFeedback, ScrollView } from 'react-native';
import { X, BookOpen, MessageSquare, Compass, Settings, LogOut, ChevronRight, User } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../../context/AuthContext';

import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');
const DRAWER_WIDTH = width * 0.75;

const MenuItem = ({ icon: Icon, label, onPress, color = "#475569" }) => (
    <TouchableOpacity 
        className="flex-row items-center px-4 py-3.5 mb-1 rounded-xl"
        onPress={onPress}
        activeOpacity={0.7}
    >
        <Icon size={22} color={color} />
        <AppText className="flex-1 ml-4 font-semibold text-[15px]" style={{ color }}>{label}</AppText>
        <ChevronRight size={18} color="#cbd5e1" />
    </TouchableOpacity>
);

const SideMenu = ({ visible, onClose }) => {
    const navigation = useNavigation();
    const { user, logout } = useAuth();
    const slideAnim = useRef(new Animated.Value(-DRAWER_WIDTH)).current;
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const insets = useSafeAreaInsets();

    useEffect(() => {
        if (visible) {
            Animated.parallel([
                Animated.timing(slideAnim, {
                    toValue: 0,
                    duration: 250,
                    useNativeDriver: true,
                }),
                Animated.timing(fadeAnim, {
                    toValue: 1,
                    duration: 250,
                    useNativeDriver: true,
                })
            ]).start();
        } else {
            Animated.parallel([
                Animated.timing(slideAnim, {
                    toValue: -DRAWER_WIDTH,
                    duration: 250,
                    useNativeDriver: true,
                }),
                Animated.timing(fadeAnim, {
                    toValue: 0,
                    duration: 250,
                    useNativeDriver: true,
                })
            ]).start();
        }
    }, [visible]);

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

    // If not visible and animation is done, we could unmount, but Modal visible handles it.
    // However, if we animate out, Modal unmounts immediately if visible becomes false.
    // We need to keep Modal visible while animating out.
    // A better approach is to delay visible=false in parent, OR use a local state.
    // Let's use local state for actual modal visibility.
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
                    className="bg-white h-full shadow-2xl absolute top-0 bottom-0 left-0"
                >
                    {/* Header */}
                    <View 
                        className="bg-blue-600 pb-6 px-5"
                        style={{ paddingTop: Math.max(insets.top, 24) + 16 }}
                    >
                        <View className="flex-row justify-between items-start mb-4">
                            <View className="w-14 h-14 bg-white rounded-full items-center justify-center shadow-sm">
                                <User size={28} color="#2563eb" />
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
                        <MenuItem icon={Compass} label="Khám phá khóa học" onPress={() => handleNavigate('Search')} />
                        <MenuItem icon={BookOpen} label="Khóa học của tôi" onPress={() => handleNavigate('MyCourses')} />
                        <MenuItem icon={MessageSquare} label="Diễn đàn thảo luận" onPress={() => handleNavigate('Forum')} />
                        <View className="h-[1px] bg-slate-100 my-2 mx-4" />
                        <MenuItem icon={Settings} label="Cài đặt tài khoản" onPress={() => handleNavigate('Settings')} />
                        {user && (
                            <MenuItem icon={LogOut} label="Đăng xuất" onPress={handleLogout} color="#ef4444" />
                        )}
                    </ScrollView>
                </Animated.View>
            </View>
        </Modal>
    );
};

export default SideMenu;
