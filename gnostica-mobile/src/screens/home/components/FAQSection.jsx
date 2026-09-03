import React, { useState } from 'react';
import { View, TouchableOpacity, LayoutAnimation, UIManager, Platform } from 'react-native';
import { ChevronDown, ChevronUp } from 'lucide-react-native';
import AppText from '../../../components/ui/AppText';
import { useTheme } from '../../../context/ThemeContext';

const FAQS = [
    {
        question: "Gnostica là gì?",
        answer: "Gnostica là nền tảng học tập trực tuyến thông minh, cung cấp các khóa học đa dạng từ công nghệ, kinh doanh đến kỹ năng mềm, giúp bạn phát triển sự nghiệp một cách toàn diện."
    },
    {
        question: "Làm thế nào để tôi có thể học trên Gnostica?",
        answer: "Bạn chỉ cần đăng ký tài khoản, lựa chọn khóa học phù hợp và tiến hành thanh toán. Sau đó, bạn có thể bắt đầu học ngay lập tức trên mọi thiết bị."
    },
    {
        question: "Gnostica có cấp chứng chỉ sau khóa học không?",
        answer: "Có, sau khi hoàn thành đầy đủ các bài học và bài kiểm tra của khóa học, bạn sẽ nhận được chứng chỉ điện tử có giá trị khẳng định kỹ năng của mình."
    },
    {
        question: "Tôi có thể học trên điện thoại di động được không?",
        answer: "Hoàn toàn được. Gnostica hỗ trợ học tập trên cả trình duyệt máy tính, điện thoại di động và ứng dụng dành riêng cho Android/iOS."
    },
    {
        question: "Làm sao để tôi nhận được sự hỗ trợ khi gặp khó khăn?",
        answer: "Bạn có thể đặt câu hỏi trực tiếp trong phần Thảo luận của khóa học để giảng viên và cộng đồng hỗ trợ, hoặc liên hệ với đội ngũ CSKH qua email và hotline."
    }
];

const FAQSection = () => {
    const { isDarkMode } = useTheme();
    const [expandedIndex, setExpandedIndex] = useState(null);

    const toggleExpand = (index) => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setExpandedIndex(expandedIndex === index ? null : index);
    };

    return (
        <View className="px-5 mt-4 mb-4">
            <AppText className={`text-xl font-extrabold mb-4 ${isDarkMode ? 'text-slate-100' : 'text-slate-800'}`}>
                Câu hỏi thường gặp
            </AppText>
            
            <View className={`rounded-2xl shadow-sm border overflow-hidden ${isDarkMode ? 'bg-slate-800 border-slate-700/60' : 'bg-white border-slate-100'}`}>
                {FAQS.map((faq, index) => {
                    const isExpanded = expandedIndex === index;
                    return (
                        <View 
                            key={index} 
                            className={`border-b ${isDarkMode ? 'border-slate-700/60' : 'border-slate-100'} last:border-b-0`}
                        >
                            <TouchableOpacity
                                className="flex-row items-center justify-between p-4"
                                onPress={() => toggleExpand(index)}
                                activeOpacity={0.7}
                            >
                                <AppText className={`flex-1 text-[15px] font-bold pr-4 ${isExpanded ? 'text-blue-500' : (isDarkMode ? 'text-slate-100' : 'text-slate-800')}`}>
                                    {faq.question}
                                </AppText>
                                {isExpanded ? (
                                    <ChevronUp size={20} color="#3B82F6" />
                                ) : (
                                    <ChevronDown size={20} color={isDarkMode ? "#94A3B8" : "#64748B"} />
                                )}
                            </TouchableOpacity>
                            
                            {isExpanded && (
                                <View className="px-4 pb-4">
                                    <AppText className={`text-sm leading-5 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                                        {faq.answer}
                                    </AppText>
                                </View>
                            )}
                        </View>
                    );
                })}
            </View>
        </View>
    );
};

export default FAQSection;
