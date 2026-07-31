import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/common/micro/AppButton";
import PageContainer from "@/components/common/core/PageContainer";
import { Download, Loader2 } from "lucide-react";
import * as htmlToImage from "html-to-image";
import { jsPDF } from "jspdf";
import certificateService from "@/services/course/certificateService";

export default function CertificatePage() {
    const { certifiUrl } = useParams();
    const navigate = useNavigate();
    const [certificate, setCertificate] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);
    const certificateRef = useRef(null);

    useEffect(() => {
        const fetchCertificate = async () => {
            try {
                const data = await certificateService.getCertificateByUrl(certifiUrl);
                setCertificate(data);
            } catch (err) {
                setError(true);
            } finally {
                setLoading(false);
            }
        };
        fetchCertificate();
    }, [certifiUrl]);

    const handleDownloadPdf = async () => {
        if (!certificateRef.current) return;
        try {
            const imgData = await htmlToImage.toPng(certificateRef.current, { 
                pixelRatio: 2,
                cacheBust: true,
            });
            const pdf = new jsPDF("l", "mm", "a4");
            
            const width = certificateRef.current.offsetWidth;
            const height = certificateRef.current.offsetHeight;
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = (height * pdfWidth) / width;
            
            pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
            pdf.save(`${certificate.studentName}_Certificate_${certificate.courseTitle}.pdf`);
        } catch (error) {
            console.error("Error generating PDF", error);
        }
    };

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center bg-muted">
                <Loader2 className="w-10 h-10 animate-spin text-primary" />
            </div>
        );
    }

    if (error || !certificate) {
        return (
            <div className="flex flex-col h-screen items-center justify-center bg-muted gap-4">
                <h1 className="text-2xl font-bold text-foreground">Chứng chỉ không tồn tại</h1>
                <p className="text-muted-foreground">Đường dẫn không hợp lệ hoặc chứng chỉ chưa được cấp.</p>
                <Button onClick={() => navigate("/")}>Về trang chủ</Button>
            </div>
        );
    }

    const dateStr = new Date(certificate.completedAt).toLocaleDateString("vi-VN", {
        day: "2-digit",
        month: "long",
        year: "numeric"
    });

    return (
        <PageContainer className="bg-secondary items-center justify-center p-6">
            <div className="mb-6 flex gap-4 w-full max-w-[1050px] justify-end">
                <Button onClick={handleDownloadPdf} className="font-bold gap-2">
                    <Download className="w-4 h-4" /> Tải PDF
                </Button>
            </div>

            {/* Khung chứng chỉ (tỷ lệ chuẩn A4 Landscape 297x210 mm) */}
            <div className="w-full max-w-[1050px] shadow-2xl relative">
                <div className="w-full aspect-[297/210] p-10 md:p-16 relative overflow-hidden bg-card text-card-foreground" ref={certificateRef}>
                {/* Góc trên */}
                <div className="flex justify-between items-start w-full">
                    <div className="flex items-center">
                        <img src="/Gnostica_Mark.webp" alt="Gnostica Logo" className="h-15 object-contain" />
                    </div>
                    <div className="text-right text-[10px] md:text-xs font-medium text-muted-foreground">
                        <p>Số giấy chứng nhận: {certificate.certifiUrl}</p>
                    </div>
                </div>

                {/* Nội dung chính */}
                <div className="mt-20">
                    <h4 className="text-sm md:text-base font-bold uppercase tracking-widest mb-6 text-muted-foreground">Giấy chứng nhận hoàn thành</h4>
                    <h1 className="text-4xl md:text-5xl font-black leading-tight w-3/4 text-balance text-foreground">
                        {certificate.courseTitle}
                    </h1>
                    <p className="mt-6 text-lg font-medium text-muted-foreground">
                        Giảng viên <span className="font-bold text-foreground">{certificate.instructorName}</span>
                    </p>
                </div>

                {/* Phần dưới (Tên học viên & Ngày tháng) */}
                <div className="absolute bottom-16 left-10 md:left-16 right-10 md:right-16">
                    <h2 className="text-5xl md:text-[60px] font-black mb-8 text-foreground">{certificate.studentName}</h2>
                    <div className="text-sm font-medium text-muted-foreground">
                        <p>Ngày <span className="font-bold text-foreground">{dateStr}</span></p>
                    </div>
                </div>
                </div>
            </div>
        </PageContainer>
    );
}
