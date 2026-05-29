import {
    Text,
    View,
    ScrollView,
    TouchableOpacity,
    Image,
} from 'react-native';
import { Menu, Bell, User } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { useCart } from '../../context/CartContext';
import SearchBar from '../../components/ui/SearchBar';
import HeroSection from '../../components/home/HeroSection';
import CategorySection from '../../components/home/CategorySection';
import CourseSection from '../../components/home/CourseSection';

const HomeScreen = () => {
    const navigation = useNavigation();
    const { cartItems } = useCart();

    return (
        <ScrollView style={{ flex: 1, backgroundColor: '#F8FAFC' }} showsVerticalScrollIndicator={false}>
            {/* Header */}
            <View style={{
                flexDirection: 'row',
                alignItems: 'center',
                paddingHorizontal: 16,
                paddingTop: 40,
                paddingBottom: 16,
                backgroundColor: '#ffffff',
                gap: 12,
            }}>
                <TouchableOpacity style={{ padding: 4 }}>
                    <Menu size={26} color="#1e293b" />
                </TouchableOpacity>

                <View style={{ flex: 1 }}>
                    <SearchBar
                        placeholder="Tìm kiếm"
                        style={{
                            backgroundColor: '#F1F5F9',
                            borderRadius: 12,
                            paddingVertical: 8,
                            paddingHorizontal: 12,
                            borderWidth: 0
                        }}
                    />
                </View>

                <TouchableOpacity style={{ padding: 4 }}>
                    <Bell size={24} color="#1e293b" />
                </TouchableOpacity>

                <TouchableOpacity
                    style={{
                        width: 38,
                        height: 38,
                        borderRadius: 19,
                        backgroundColor: '#EFF6FF',
                        borderWidth: 1,
                        borderColor: '#BFDBFE',
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}
                    onPress={() => navigation.navigate('Login')}
                >
                    <User size={22} color="#2563EB" />
                </TouchableOpacity>
            </View>

            {/* Hero Banner */}
            <HeroSection />


            {/* Categories */}
            <CategorySection />

            {/* Course Sections */}
            <CourseSection title="Khóa học thịnh hành" variant="trending" />

            {/* Phase 2: Discovery Section */}
            <View style={{ paddingHorizontal: 20, marginTop: 24, gap: 16 }}>
                <View style={{ flexDirection: 'row', gap: 12 }}>
                    <TouchableOpacity
                        style={{ flex: 1, backgroundColor: '#ffffff', padding: 16, borderRadius: 20, borderWidth: 1, borderColor: '#F1F5F9', elevation: 2, shadowColor: '#000', shadowOpacity: 0.05, shadowOffset: { width: 0, height: 2 } }}
                        onPress={() => navigation.navigate('Forum')}
                    >
                        <View style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: '#EFF6FF', alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}>
                            <Text style={{ fontSize: 20 }}>💬</Text>
                        </View>
                        <Text style={{ fontSize: 15, fontWeight: '800', color: '#1E293B' }}>Diễn đàn</Text>
                        <Text style={{ fontSize: 11, color: '#64748B', marginTop: 2 }}>Cùng thảo luận</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={{ flex: 1, backgroundColor: '#ffffff', padding: 16, borderRadius: 20, borderWidth: 1, borderColor: '#F1F5F9', elevation: 2, shadowColor: '#000', shadowOpacity: 0.05, shadowOffset: { width: 0, height: 2 } }}
                        onPress={() => navigation.navigate('InstructorList')}
                    >
                        <View style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: '#F0FDF4', alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}>
                            <Text style={{ fontSize: 20 }}>👨‍🏫</Text>
                        </View>
                        <Text style={{ fontSize: 15, fontWeight: '800', color: '#1E293B' }}>Giảng viên</Text>
                        <Text style={{ fontSize: 11, color: '#64748B', marginTop: 2 }}>Tìm chuyên gia</Text>
                    </TouchableOpacity>
                </View>
            </View>

            <CourseSection title="Khóa học nổi bật" variant="featured" />

            <View style={{ height: 20 }} />
        </ScrollView>
    );
};

export default HomeScreen;
