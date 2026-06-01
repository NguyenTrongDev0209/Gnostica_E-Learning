import React from 'react';
import {
    Facebook,
    Twitter,
    Linkedin,
    Send
} from "lucide-react"
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

const FooterBrand = () => (
    <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-1">
            <h2 className="text-3xl font-black text-slate-900 tracking-tighter uppercase">Gnostica</h2>
            <span className="text-sm text-primary font-bold tracking-tight uppercase">Nền tảng học tập thông minh</span>
        </div>

        <div className="w-40 h-[2px] bg-slate-800"></div>

        <p className="text-sm text-slate-500 max-w-xs leading-relaxed">
            Gnostica là nền tảng học tập trực tuyến hiện đại, giúp bạn khai phá tiềm năng và phát triển kỹ năng mỗi ngày.
        </p>

        <div className="flex gap-4">
            {[
                { Icon: Facebook, color: 'bg-primary' },
                { Icon: Twitter, color: 'bg-slate-200 text-slate-600' },
                { Icon: Linkedin, color: 'bg-slate-200 text-slate-600' },
                { Icon: Send, color: 'bg-slate-200 text-slate-600' }
            ].map(({ Icon, color }, i) => (
                <div
                    key={i}
                    className={`w-10 h-10 rounded-full flex items-center justify-center transition-all cursor-pointer border border-transparent hover:scale-110 ${color}`}
                >
                    <Icon className="h-4 w-4 fill-current" />
                </div>
            ))}
        </div>
    </div>
)

const FooterLinks = ({ title, links }) => (
    <div className="flex flex-col gap-8">
        <h3 className="font-bold text-xl text-slate-900 tracking-tight">{title}</h3>
        <ul className="flex flex-col gap-5">
            {links.map((link) => (
                <li key={link}>
                    <a href="#" className="text-sm text-slate-500 hover:text-primary transition-colors flex items-center gap-3 font-medium">
                        <div className="w-1.5 h-1.5 rounded-full bg-slate-400"></div>
                        {link}
                    </a>
                </li>
            ))}
        </ul>
    </div>
)

const MainFooter = () => {
    return (
        <footer className="w-full bg-white pt-6">
            {/* Subscribe Section */}
            <div className="app-container border-b border-slate-100 pb-6 mb-10">
                <div className="flex flex-col lg:flex-row items-center gap-10 lg:gap-20">
                    <div className="flex flex-col md:flex-row items-baseline gap-4 md:gap-10 lg:w-3/5">
                        <h2 className="text-3xl font-black text-slate-900">Đăng ký ngay</h2>
                        <p className="text-sm text-slate-500 max-w-lg leading-relaxed">
                            Đăng ký nhận bản tin để không bỏ lỡ các khóa học mới nhất, sự kiện hấp dẫn và ưu đãi đặc biệt từ Gnostica.
                        </p>
                    </div>

                    <div className="flex-1 w-full relative">
                        <Input
                            placeholder="Nhập email của bạn"
                            className="h-14 pl-6 pr-16 bg-slate-50 border-none rounded-sm placeholder:text-slate-400"
                        />
                        <Button className="absolute right-1 top-1 bottom-1 px-4 bg-primary hover:bg-primary/90 text-primary-foreground rounded-sm transition-all shadow-none h-auto">
                            <Send className="h-5 w-5 fill-current" />
                        </Button>
                    </div>
                </div>
            </div>

            {/* Main Sections */}
            <div className="app-container pb-9">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-y-16 lg:gap-y-12 gap-x-10 items-start">
                    {/* Brand */}
                    <div className="lg:col-span-3 h-full">
                        <FooterBrand />
                    </div>

                    {/* Links Group */}
                    <div className="lg:col-span-6 flex flex-col gap-12">
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
                            <FooterLinks title="Về Gnostica" links={['Câu chuyện', 'Đội ngũ', 'Tuyển dụng', 'Đối tác']} />
                            <FooterLinks title="Khám phá" links={['Khóa học', 'Bài viết', 'Sự kiện', 'Tài liệu']} />
                            <FooterLinks title="Dịch vụ" links={['Học trực tuyến', 'Cố vấn 1-1', 'Chứng chỉ', 'Cộng đồng']} />

                            {/* Contact Column */}
                            <div className="flex flex-col gap-8">
                                <h3 className="font-bold text-xl text-slate-900 tracking-tight">Liên hệ</h3>
                                <div className="flex flex-col gap-6">
                                    <div className="flex flex-col gap-2">
                                        <span className="text-sm font-bold text-slate-900">Điện thoại :</span>
                                        <a href="tel:+012345678900" className="text-sm text-slate-600 hover:text-primary transition-colors font-medium">
                                            +0123 456 789 00
                                        </a>
                                    </div>
                                    <div className="flex flex-col gap-2">
                                        <span className="text-sm font-bold text-slate-900">Email :</span>
                                        <a href="mailto:gnostica.team@gmail.com" className="text-sm text-slate-600 hover:text-primary transition-colors font-medium">
                                            gnostica.team@gmail.com
                                        </a>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Thank You Bar */}
                        <div className="w-full py-5 px-6 border-2 border-slate-900 rounded-lg flex items-center justify-center bg-white shadow-[6px_6px_0px_0px_rgba(0,0,0,0.05)]">
                            <span className="text-slate-900 font-bold text-sm lg:text-[15px] text-center leading-relaxed">
                                Cảm ơn bạn đã tin tưởng và đồng hành cùng Gnostica
                            </span>
                        </div>
                    </div>

                    {/* Map */}
                    <div className="lg:col-span-3 h-full flex flex-col justify-start">
                        <div className="overflow-hidden shadow-sm border border-slate-100 aspect-square group">
                            <img
                                src="/footer_map_location.png"
                                alt="Location Map"
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom Bar */}
            <div className="w-full bg-[#11141D] text-white">
                <div className="h-[3px] w-full bg-primary"></div>
                <div className="app-container py-4 flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="flex gap-4 items-center">
                        <a href="#" className="text-sm text-slate-400 hover:text-white transition-colors">Chính sách bảo mật</a>
                        <span className="text-primary font-bold">|</span>
                        <a href="#" className="text-sm text-slate-400 hover:text-white transition-colors">Điều khoản dịch vụ</a>
                        <span className="text-primary font-bold">|</span>
                        <a href="#" className="text-sm text-slate-400 hover:text-white transition-colors">Trung tâm hỗ trợ</a>
                    </div>
                    <p className="text-sm text-slate-500 font-medium">
                        © 2026 Gnostica. Bản quyền thuộc về đội ngũ phát triển.
                    </p>
                </div>
            </div>
        </footer>
    );
};

export default MainFooter;
