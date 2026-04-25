import React from 'react';
import { Text, View } from 'react-native';

const CourseCard = ({ title, instructor, price }) => {
    return (
        <View className="w-64 bg-white rounded-2xl mx-2 overflow-hidden shadow-sm mb-4 border border-gray-100">
            <View className="w-full h-36 bg-gray-200" />
            <View className="p-4">
                <Text className="text-base font-bold text-gray-800 h-11" numberOfLines={2}>{title}</Text>
                <Text className="text-sm border-gray-500 text-gray-500 mt-1">{instructor}</Text>
                <View className="mt-3">
                    <Text className="text-base font-bold text-primary">{price}</Text>
                </View>
            </View>
        </View>
    );
};

export default CourseCard;
