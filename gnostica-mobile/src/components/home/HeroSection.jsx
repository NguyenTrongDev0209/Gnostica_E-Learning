import AppText from '../ui/AppText';
import React, { useState, useEffect, useRef } from 'react';
import { View, ImageBackground, FlatList, Dimensions } from 'react-native';
import Button from '../ui/Button';

const { width } = Dimensions.get('window');

const BANNERS = [
    {
        id: '1',
        title: 'Khai phá kiến thức\nmới mỗi ngày',
        subtitle: 'Cùng Gnostica chinh phục mọi kỹ năng',
        buttonText: 'Khám phá ngay',
        image: 'https://picsum.photos/seed/hero99/800/400',
        color: 'rgba(30, 58, 138, 0.80)',
        tag: 'GNOSTICA E-LEARNING',
        textColor: 'text-sky-200',
        btnColor: 'text-blue-700'
    },
    {
        id: '2',
        title: 'Học lập trình\ntừ con số 0',
        subtitle: 'Lộ trình bài bản cho người mới bắt đầu',
        buttonText: 'Xem lộ trình',
        image: 'https://picsum.photos/seed/code/800/400',
        color: 'rgba(15, 118, 110, 0.80)',
        tag: 'KHOÁ HỌC MỚI',
        textColor: 'text-teal-200',
        btnColor: 'text-teal-700'
    },
    {
        id: '3',
        title: 'Thiết kế UI/UX\nđỉnh cao',
        subtitle: 'Làm chủ công cụ và tư duy thiết kế',
        buttonText: 'Học ngay',
        image: 'https://picsum.photos/seed/design/800/400',
        color: 'rgba(126, 34, 206, 0.80)',
        tag: 'XU HƯỚNG',
        textColor: 'text-fuchsia-200',
        btnColor: 'text-purple-700'
    }
];

const HeroSection = () => {
    const flatListRef = useRef(null);
    const [currentIndex, setCurrentIndex] = useState(0);

    const onViewableItemsChanged = useRef(({ viewableItems }) => {
        if (viewableItems.length > 0) {
            setCurrentIndex(viewableItems[0].index);
        }
    }).current;

    const viewabilityConfig = useRef({
        itemVisiblePercentThreshold: 50,
    }).current;

    useEffect(() => {
        const timer = setInterval(() => {
            let nextIndex = currentIndex + 1;
            if (nextIndex >= BANNERS.length) {
                nextIndex = 0;
            }
            if (flatListRef.current) {
                flatListRef.current.scrollToIndex({
                    index: nextIndex,
                    animated: true,
                });
            }
        }, 4000); // 4 seconds per slide
        return () => clearInterval(timer);
    }, [currentIndex]);

    const renderItem = ({ item }) => (
        <View style={{ width: width, paddingHorizontal: 20 }}>
            <ImageBackground
                source={{ uri: item.image }}
                className="rounded-[20px] overflow-hidden min-h-[180px]"
                imageStyle={{ borderRadius: 20 }}
            >
                {/* Gradient overlay */}
                <View className="absolute top-0 bottom-0 left-0 right-0 rounded-[20px]"
                    style={{ backgroundColor: item.color }}
                />
                <View className="p-6 justify-center min-h-[180px]">
                    <AppText className={`${item.textColor} text-xs font-bold tracking-[1.5px] mb-1.5 uppercase`}>
                        {item.tag}
                    </AppText>
                    <AppText className="text-white text-[22px] font-extrabold leading-[30px] mb-1.5">
                        {item.title}
                    </AppText>
                    <AppText className="text-white/75 text-[13px] mb-[18px] leading-[18px]">
                        {item.subtitle}
                    </AppText>
                    <Button
                        variant="ghost"
                        className="bg-white self-start px-5 py-2.5 rounded-[10px]"
                        textClassName={`${item.btnColor} font-bold text-[13px]`}
                    >
                        {item.buttonText}
                    </Button>
                </View>
            </ImageBackground>
        </View>
    );

    return (
        <View className="pt-4 pb-2">
            <FlatList
                ref={flatListRef}
                data={BANNERS}
                renderItem={renderItem}
                keyExtractor={(item) => item.id}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                onViewableItemsChanged={onViewableItemsChanged}
                viewabilityConfig={viewabilityConfig}
            />
            
            {/* Pagination Dots */}
            <View className="flex-row justify-center items-center mt-4 gap-1.5">
                {BANNERS.map((_, index) => (
                    <View
                        key={index}
                        className={`h-1.5 rounded-full ${
                            currentIndex === index ? 'w-4 bg-blue-600' : 'w-1.5 bg-slate-300'
                        }`}
                        style={{
                            opacity: currentIndex === index ? 1 : 0.5,
                        }}
                    />
                ))}
            </View>
        </View>
    );
};

export default HeroSection;
