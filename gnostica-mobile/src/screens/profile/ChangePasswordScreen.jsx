import AppText from '../../components/ui/AppText';
import React, { useState } from 'react';
import { View, ScrollView, TouchableOpacity, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Lock, Eye, EyeOff, ShieldCheck } from 'lucide-react-native';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import AppHeader from '../../components/ui/AppHeader';
import accountService from '../../services/profile/accountService';
import { useAuth } from '../../context/AuthContext';

const ChangePasswordScreen = () => {
    const navigation = useNavigation();
    const { user } = useAuth();
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showCurrent, setShowCurrent] = useState(false);
    const [showNew, setShowNew] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);

    const validate = () => {
        const newErrors = {};
        if (!currentPassword) newErrors.current = 'Vui lòng nhập mật khẩu hiện tại';
        if (!newPassword) newErrors.new = 'Vui lòng nhập mật khẩu mới';
        else if (newPassword.length < 6) newErrors.new = 'Mật khẩu phải từ 6 ký tự';
        if (!confirmPassword) newErrors.confirm = 'Vui lòng xác nhận mật khẩu';
        else if (newPassword !== confirmPassword) newErrors.confirm = 'Mật khẩu xác nhận không khớp';
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSave = async () => {
        if (validate() && user?.email) {
            setLoading(true);
            try {
                await accountService.changePassword(user.email, currentPassword, newPassword);
                Alert.alert('Thành công', 'Mật khẩu đã được thay đổi thành công!', [
                    { text: 'OK', onPress: () => navigation.goBack() }
                ]);
            } catch (error) {
                console.error(error);
                Alert.alert('Lỗi', error?.message || 'Có lỗi xảy ra khi đổi mật khẩu.');
            } finally {
                setLoading(false);
            }
        }
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            className="flex-1 bg-slate-50"
        >
            <AppHeader title="Đổi mật khẩu" />

            <ScrollView
                className="flex-1"
                contentContainerStyle={{ padding: 20 }}
                showsVerticalScrollIndicator={false}
            >
                {/* Security Icon */}
                <View className="items-center mb-6">
                    <View className="w-16 h-16 rounded-2xl bg-blue-50 items-center justify-center mb-3">
                        <ShieldCheck size={32} color="#2563EB" />
                    </View>
                    <AppText className="text-slate-500 text-sm text-center leading-5">
                        Để bảo mật tài khoản, hãy chọn{'\n'}mật khẩu mạnh và không chia sẻ.
                    </AppText>
                </View>

                {/* Form */}
                <View className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
                    <Input
                        label="Mật khẩu hiện tại"
                        icon={Lock}
                        placeholder="••••••••"
                        secureTextEntry={!showCurrent}
                        value={currentPassword}
                        onChangeText={(t) => { setCurrentPassword(t); setErrors({ ...errors, current: null }); }}
                        error={errors.current}
                        containerClassName="mb-4"
                        rightIcon={
                            <TouchableOpacity onPress={() => setShowCurrent(!showCurrent)} className="p-1">
                                {showCurrent ? <EyeOff size={18} color="#64748b" /> : <Eye size={18} color="#64748b" />}
                            </TouchableOpacity>
                        }
                    />

                    <Input
                        label="Mật khẩu mới"
                        icon={Lock}
                        placeholder="Tối thiểu 6 ký tự"
                        secureTextEntry={!showNew}
                        value={newPassword}
                        onChangeText={(t) => { setNewPassword(t); setErrors({ ...errors, new: null }); }}
                        error={errors.new}
                        containerClassName="mb-4"
                        rightIcon={
                            <TouchableOpacity onPress={() => setShowNew(!showNew)} className="p-1">
                                {showNew ? <EyeOff size={18} color="#64748b" /> : <Eye size={18} color="#64748b" />}
                            </TouchableOpacity>
                        }
                    />

                    <Input
                        label="Xác nhận mật khẩu mới"
                        icon={Lock}
                        placeholder="Nhập lại mật khẩu mới"
                        secureTextEntry={!showConfirm}
                        value={confirmPassword}
                        onChangeText={(t) => { setConfirmPassword(t); setErrors({ ...errors, confirm: null }); }}
                        error={errors.confirm}
                        containerClassName="mb-2"
                        rightIcon={
                            <TouchableOpacity onPress={() => setShowConfirm(!showConfirm)} className="p-1">
                                {showConfirm ? <EyeOff size={18} color="#64748b" /> : <Eye size={18} color="#64748b" />}
                            </TouchableOpacity>
                        }
                    />
                </View>

                {/* Password Tips */}
                <View className="mt-5 bg-amber-50 p-4 rounded-2xl border border-amber-100">
                    <AppText className="text-amber-800 font-bold text-[13px] mb-2">💡 Lời khuyên bảo mật</AppText>
                    <AppText className="text-amber-700 text-xs leading-[18px]">
                        • Sử dụng ít nhất 8 ký tự{'\n'}
                        • Kết hợp chữ hoa, chữ thường và số{'\n'}
                        • Không dùng thông tin cá nhân làm mật khẩu
                    </AppText>
                </View>

                {/* Save Button */}
                <Button
                    variant="primary"
                    className="mt-6 py-3.5 rounded-xl"
                    textClassName="text-base font-bold"
                    onPress={handleSave}
                    disabled={loading}
                >
                    {loading ? 'Đang lưu...' : 'Lưu thay đổi'}
                </Button>

                <View className="h-10" />
            </ScrollView>
        </KeyboardAvoidingView>
    );
};

export default ChangePasswordScreen;
