import React from 'react';
import {
    Facebook,
    Twitter,
    Linkedin,
    Send
} from "lucide-react"
import { Link } from "react-router-dom";
import { usePublicSiteConfig } from "@/hooks/settings/useSiteSettings";

const FooterBrand = ({ config }) => (
    <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-2">
            <div className="flex flex-col gap-1">
                <h2 className="text-3xl font-black text-foreground tracking-tighter uppercase">{config["site.name"] || "Gnostica"}</h2>
                <span className="text-sm text-primary font-bold tracking-tight uppercase">{config["site.tagline"] || "Nền tảng học tập thông minh"}</span>
            </div>

            <div className="w-40 h-[2px] bg-muted"></div>

            <p className="text-sm text-muted-foreground max-w-xs leading-relaxed">
                {config["footer.description"] || "Gnostica là nền tảng học tập trực tuyến hiện đại, giúp bạn khai phá tiềm năng và phát triển kỹ năng mỗi ngày."}
            </p>
        </div>

        <div className="flex gap-4">
            {[
                { src: "/Facebook.webp", alt: "Facebook" },
                { src: "/Tiktok.webp", alt: "Tiktok" },
                { src: "/Youtube.webp", alt: "Youtube" },
                { src: "/Zalo.webp", alt: "Zalo" }
            ].map(({ src, alt }, i) => (
                <a
                    key={i}
                    href="#"
                    className="w-10 h-10 rounded-full flex items-center justify-center transition-all cursor-pointer hover:scale-110 overflow-hidden"
                >
                    <img src={src} alt={alt} className="w-full h-full object-cover" />
                </a>
            ))}
        </div>
    </div>
)

const FooterLinks = ({ title, links }) => (
    <div>
        <h3 className="font-bold text-xl text-foreground tracking-tight mb-8">{title}</h3>
        <ul style={{ padding: 0, margin: 0, listStyleType: 'none' }}>
            {links.map((link) => (
                <li key={link} className="mb-5 last:mb-0">
                    <a href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors font-medium block">
                        {link}
                    </a>
                </li>
            ))}
        </ul>
    </div>
)

const MainFooter = () => {
    const { data: config = {} } = usePublicSiteConfig();
    const contactPhone = config["site.contact_phone"] || "0978 070 553";
    const contactEmail = config["site.contact_email"] || "gnostica.team@gmail.com";
    const mapUrl = config["site.map_embed_url"];

    return (
        <footer className="w-full bg-primary/10 pt-6">

            {/* Main Sections */}
            <div className="app-container pb-9">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-y-16 lg:gap-y-12 gap-x-10 items-start">
                    {/* Brand */}
                    <div className="lg:col-span-3 h-full">
                        <FooterBrand config={config} />
                    </div>

                    {/* Links Group */}
                    <div className="lg:col-span-6 flex flex-col gap-12">
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
                            <FooterLinks title="Về Gnostica" links={['Câu chuyện', 'Đội ngũ', 'Tuyển dụng', 'Đối tác']} />
                            <FooterLinks title="Khám phá" links={['Khóa học', 'Bài viết', 'Sự kiện', 'Tài liệu']} />
                            <FooterLinks title="Dịch vụ" links={['Học trực tuyến', 'Cố vấn 1-1', 'Chứng chỉ', 'Cộng đồng']} />

                            {/* Contact Column */}
                            <div style={{ textAlign: 'left' }}>
                                <h3 className="font-bold text-xl text-foreground tracking-tight mb-8" style={{ textAlign: 'left' }}>Liên hệ</h3>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', textAlign: 'left' }}>
                                        <span className="text-sm font-bold text-foreground" style={{ textAlign: 'left' }}>Điện thoại :</span>
                                        <a href={`tel:${contactPhone.replace(/\s/g, "")}`} className="text-sm text-muted-foreground hover:text-primary transition-colors font-medium" style={{ textAlign: 'left' }}>
                                            {contactPhone}
                                        </a>
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', textAlign: 'left' }}>
                                        <span className="text-sm font-bold text-foreground" style={{ textAlign: 'left' }}>Email :</span>
                                        <a href={`mailto:${contactEmail}`} className="text-sm text-muted-foreground hover:text-primary transition-colors font-medium" style={{ textAlign: 'left' }}>
                                            {contactEmail}
                                        </a>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Thank You Bar */}
                        <div className="w-full py-5 px-6 border-2 border-border rounded-lg flex items-center justify-center bg-white shadow-md">
                            <span className="text-foreground font-bold text-sm lg:text-[15px] text-center leading-relaxed">
                                Cảm ơn bạn đã tin tưởng và đồng hành cùng Gnostica
                            </span>
                        </div>
                    </div>

                    {/* Map */}
                    <div className="lg:col-span-3 h-full flex flex-col justify-start">
                        <div className="overflow-hidden shadow-sm border border-border aspect-square group">
                            <iframe
                                src={mapUrl || "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d988.6924000753803!2d105.75821718944135!3d9.981928106454333!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31a08906415c355f%3A0x416815a99ebd841e!2zVHLGsOG7nW5nIENhbyDEkeG6s25nIEZQVCBQb2x5dGVjaG5pYw!5e1!3m2!1svi!2s!4v1784347006312!5m2!1svi!2s"}
                                className="w-full h-full border-0"
                                allowFullScreen=""
                                loading="lazy"
                                referrerPolicy="no-referrer-when-downgrade"
                                title="Google Map"
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom Bar */}
            <div className="w-full bg-foreground text-background">
                <div className="h-[3px] w-full bg-primary"></div>
                <div className="app-container py-4 flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="flex gap-4 items-center">
                        <Link to="/privacy" className="text-sm text-muted-foreground hover:text-white transition-colors">Chính sách bảo mật</Link>
                        <span className="text-primary font-bold">|</span>
                        <Link to="/terms" className="text-sm text-muted-foreground hover:text-white transition-colors">Điều khoản dịch vụ</Link>
                        <span className="text-primary font-bold">|</span>
                        <a href="#" className="text-sm text-muted-foreground hover:text-white transition-colors">Trung tâm hỗ trợ</a>
                    </div>
                    <p className="text-sm text-muted-foreground font-medium">
                        {config["footer.copyright"] || "© 2026 Gnostica. Bản quyền thuộc về đội ngũ phát triển."}
                    </p>
                </div>
            </div>
        </footer>
    );
};

export default MainFooter;
