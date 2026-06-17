import React, { useState } from 'react';
import {
    View, Text, ScrollView, TouchableOpacity, FlatList,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { clsx } from 'clsx';
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
        <View className="flex-1 bg-slate-50">
            {/* Header */}
            <View className="bg-white pt-10 px-5 pb-4">
                <Text className="text-2xl font-extrabold text-slate-800 mb-3.5">
                    Tìm kiếm
                </Text>
                <SearchBar
                    value={query}
                    onChangeText={setQuery}
                    onClear={() => setQuery('')}
                    style={{ backgroundColor: '#F1F5F9', borderWidth: 0, borderRadius: 12 }}
                />
            </View>

            {/* Filter Chips */}
            <View className="bg-white border-b border-slate-100">
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 14, gap: 8 }}
                >
                    {FILTERS.map(f => (
                        <TouchableOpacity
                            key={f}
                            onPress={() => setActiveFilter(f)}
                            className={clsx(
                                'px-[18px] py-2 rounded-[10px] border',
                                activeFilter === f
                                    ? 'bg-blue-600 border-blue-600'
                                    : 'bg-slate-50 border-slate-200',
                            )}
                        >
                            <Text className={clsx(
                                'text-[13px] font-bold',
                                activeFilter === f ? 'text-white' : 'text-slate-500',
                            )}>
                                {f}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>

            {/* Results */}
            {filtered.length === 0 ? (
                <View className="flex-1 items-center justify-center pb-24">
                    <Text className="text-5xl mb-3">🔍</Text>
                    <Text className="text-[17px] font-bold text-slate-800 mb-1.5">
                        Không tìm thấy kết quả
                    </Text>
                    <Text className="text-[13px] text-slate-500 text-center px-10">
                        Hãy thử từ khóa khác hoặc thay đổi bộ lọc
                    </Text>
                </View>
            ) : (
                <FlatList
                    data={filtered}
                    keyExtractor={item => item.id.toString()}
                    numColumns={2}
                    contentContainerStyle={{ padding: 16, paddingBottom: 120, gap: 12 }}
                    columnWrapperStyle={{ gap: 12 }}
                    showsVerticalScrollIndicator={false}
                    renderItem={({ item }) => (
                        <View className="flex-1">
                            <CourseCard course={item} />
                        </View>
                    )}
                />
            )}
        </View>
    );
};

export default SearchScreen;
