import {
    Text,
    View,
    ScrollView,
    TouchableOpacity,
    Image,
} from 'react-native';
import { ShoppingBag, User } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { useCart } from '../../context/CartContext';
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
                flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
                paddingHorizontal: 20, paddingTop: 52, paddingBottom: 12,
                backgroundColor: '#ffffff',
                borderBottomWidth: 1, borderBottomColor: '#F1F5F9',
            }}>
                <View>
                    <Text style={{ fontSize: 13, color: '#64748B', fontWeight: '500' }}>Xin chào 👋</Text>
                    <Image
                        source={require('../../assets/images/Gnostica_Mark.webp')}
                        style={{ width: 120, height: 28, marginTop: 4 }}
                        resizeMode="contain"
                    />
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                    <TouchableOpacity
                        style={{
                            width: 42, height: 42, borderRadius: 21, position: 'relative',
                            backgroundColor: '#F8FAFC', borderWidth: 1, borderColor: '#E2E8F0',
                            alignItems: 'center', justifyContent: 'center',
                        }}
                        onPress={() => navigation.navigate('Cart')}
                    >
                        <ShoppingBag size={20} color="#64748B" />
                        {cartItems.length > 0 && (
                            <View style={{
                                position: 'absolute', top: -2, right: -2,
                                backgroundColor: '#EF4444', width: 18, height: 18, borderRadius: 9,
                                alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: '#ffffff',
                            }}>
                                <Text style={{ color: '#ffffff', fontSize: 10, fontWeight: '800' }}>
                                    {cartItems.length}
                                </Text>
                            </View>
                        )}
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={{
                            width: 42, height: 42, borderRadius: 21,
                            backgroundColor: '#EFF6FF', borderWidth: 1, borderColor: '#BFDBFE',
                            alignItems: 'center', justifyContent: 'center',
                        }}
                        onPress={() => navigation.navigate('Login')}
                    >
                        <User size={20} color="#2563EB" />
                    </TouchableOpacity>
                </View>
            </View>

            {/* Hero Banner */}
            <HeroSection />

            <View style={{ paddingHorizontal: 20, marginTop: 12 }}>
                <TouchableOpacity
                    onPress={() => navigation.navigate('CourseCatalog')}
                    style={{
                        backgroundColor: '#2563EB', paddingVertical: 12, borderRadius: 10,
                        alignItems: 'center', justifyContent: 'center'
                    }}
                >
                    <Text style={{ color: '#ffffff', fontSize: 15, fontWeight: '700' }}>Khám phá khóa học</Text>
                </TouchableOpacity>
            </View>

            {/* Categories */}
            <CategorySection />

            {/* Course Sections */}
            <CourseSection title="Khóa học thịnh hành" variant="trending" />
            <CourseSection title="Khóa học nổi bật" variant="featured" />

            <View style={{ height: 20 }} />
        </ScrollView>
    );
};

export default HomeScreen;
