import React from 'react';
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
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
    return (
        <div className="w-full text-left">
            <Accordion type="single" collapsible className="w-full">
                {faqs.map((faq, index) => (
                    <AccordionItem key={index} value={`item-${index}`} className="border-b border-border py-1 last:border-0">
                        <AccordionTrigger className="text-left font-bold text-lg text-foreground hover:text-primary transition-colors hover:no-underline py-5">
                            {faq.question}
                        </AccordionTrigger>
                        <AccordionContent className="text-muted-foreground leading-relaxed text-sm pb-6">
                            {faq.answer}
                        </AccordionContent>
                    </AccordionItem>
                ))}
            </Accordion>
        </div>
    );
};

export default FAQSection;
