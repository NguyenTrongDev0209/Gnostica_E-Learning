import React from 'react';
import { Text, View, ScrollView, TouchableOpacity } from 'react-native';
import { MonitorPlay, PenTool, Lightbulb, Briefcase, Languages, Sparkles } from 'lucide-react-native';
import { categories } from '../../constants/mockData';
import { useNavigation } from '@react-navigation/native';

const ICONS = {
    MonitorPlay, PenTool, Lightbulb, Briefcase, Languages, Sparkles,
};

const CategorySection = () => {
    const navigation = useNavigation();
    return (
        <View style={{ marginTop: 24 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, marginBottom: 14 }}>
                <Text style={{ fontSize: 18, fontWeight: '800', color: '#1E293B' }}>Danh mục</Text>
                <TouchableOpacity onPress={() => navigation.navigate('CategoryBrowse')}>
                    <Text style={{ fontSize: 13, color: '#2563EB', fontWeight: '600' }}>Tất cả</Text>
                </TouchableOpacity>
            </View>
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ paddingHorizontal: 16, gap: 10 }}
            >
                {categories.map((cat) => {
                    const IconComponent = ICONS[cat.icon];
                    return (
                        <TouchableOpacity
                            key={cat.id}
                            activeOpacity={0.75}
                            style={{ alignItems: 'center', width: 74 }}
                        >
                            <View style={{
                                width: 58,
                                height: 58,
                                borderRadius: 18,
                                backgroundColor: cat.bgColor,
                                alignItems: 'center',
                                justifyContent: 'center',
                                marginBottom: 7,
                                borderWidth: 1,
                                borderColor: cat.color + '30',
                            }}>
                                {IconComponent && <IconComponent size={26} color={cat.color} strokeWidth={1.8} />}
                            </View>
                            <Text style={{ fontSize: 11, color: '#475569', textAlign: 'center', fontWeight: '600' }} numberOfLines={1}>
                                {cat.name}
                            </Text>
                        </TouchableOpacity>
                    );
                })}
            </ScrollView>
        </View>
    );
};

export default CategorySection;
