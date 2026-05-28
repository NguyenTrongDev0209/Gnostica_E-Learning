import React from 'react';
import { View, Text, StyleSheet, SafeAreaView } from 'react-native';
import { Flame } from 'lucide-react-native';

const HighlightsScreen = () => {
    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.content}>
                <Flame size={64} color="#e32f45" />
                <Text style={styles.title}>Tính năng Nổi bật</Text>
                <Text style={styles.description}>
                    Đây là nơi hiển thị các nội dung, khóa học và sự kiện nổi bật nhất.
                </Text>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    content: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#1e293b',
        marginTop: 20,
    },
    description: {
        fontSize: 16,
        color: '#64748b',
        textAlign: 'center',
        marginTop: 10,
    },
});

export default HighlightsScreen;
