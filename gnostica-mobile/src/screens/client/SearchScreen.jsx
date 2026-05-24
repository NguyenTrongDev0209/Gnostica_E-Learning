import React, { useState } from 'react';
import {
    View, Text, ScrollView, TouchableOpacity, FlatList,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import SearchBar from '../../components/ui/SearchBar';
import CourseCard from '../../components/home/CourseCard';
import { courses } from '../../constants/mockData';

const FILTERS = ['Tất cả', 'Miễn phí', 'Lập trình', 'Thiết kế', 'Marketing', 'Ngoại ngữ'];

const SearchScreen = () => {
    const [query, setQuery] = useState('');
    const [activeFilter, setActiveFilter] = useState('Tất cả');

    const filtered = courses.filter(c => {
        const matchQuery = c.title.toLowerCase().includes(query.toLowerCase()) ||
            c.instructor.toLowerCase().includes(query.toLowerCase());
        const matchFilter = activeFilter === 'Tất cả' ||
            (activeFilter === 'Miễn phí' ? c.price === 'Miễn phí' : c.category === activeFilter);
        return matchQuery && matchFilter;
    });

    return (
        <View style={{ flex: 1, backgroundColor: '#F8FAFC' }}>
            {/* Header */}
            <View style={{
                backgroundColor: '#ffffff',
                paddingTop: 52,
                paddingHorizontal: 20,
                paddingBottom: 16,
                borderBottomWidth: 1,
                borderBottomColor: '#F1F5F9',
            }}>
                <Text style={{ fontSize: 22, fontWeight: '800', color: '#1E293B', marginBottom: 14 }}>
                    Tìm kiếm
                </Text>
                <SearchBar
                    value={query}
                    onChangeText={setQuery}
                    onClear={() => setQuery('')}
                />
            </View>

            {/* Filter Chips */}
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 12, gap: 8 }}
                style={{ flexGrow: 0, backgroundColor: '#ffffff', borderBottomWidth: 1, borderBottomColor: '#F1F5F9' }}
            >
                {FILTERS.map(f => (
                    <TouchableOpacity
                        key={f}
                        onPress={() => setActiveFilter(f)}
                        style={{
                            paddingHorizontal: 16,
                            paddingVertical: 7,
                            borderRadius: 99,
                            backgroundColor: activeFilter === f ? '#2563EB' : '#F1F5F9',
                            borderWidth: 1,
                            borderColor: activeFilter === f ? '#2563EB' : '#E2E8F0',
                        }}
                    >
                        <Text style={{
                            fontSize: 13, fontWeight: '600',
                            color: activeFilter === f ? '#ffffff' : '#475569',
                        }}>
                            {f}
                        </Text>
                    </TouchableOpacity>
                ))}
            </ScrollView>

            {/* Results */}
            {filtered.length === 0 ? (
                <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingBottom: 80 }}>
                    <Text style={{ fontSize: 48, marginBottom: 12 }}>🔍</Text>
                    <Text style={{ fontSize: 17, fontWeight: '700', color: '#1E293B', marginBottom: 6 }}>
                        Không tìm thấy kết quả
                    </Text>
                    <Text style={{ fontSize: 13, color: '#64748B', textAlign: 'center', paddingHorizontal: 40 }}>
                        Hãy thử từ khóa khác hoặc thay đổi bộ lọc
                    </Text>
                </View>
            ) : (
                <FlatList
                    data={filtered}
                    keyExtractor={item => item.id.toString()}
                    numColumns={2}
                    contentContainerStyle={{ padding: 16, gap: 12 }}
                    columnWrapperStyle={{ gap: 12 }}
                    showsVerticalScrollIndicator={false}
                    renderItem={({ item }) => (
                        <View style={{ flex: 1 }}>
                            <CourseCard course={item} />
                        </View>
                    )}
                />
            )}
        </View>
    );
};

export default SearchScreen;
