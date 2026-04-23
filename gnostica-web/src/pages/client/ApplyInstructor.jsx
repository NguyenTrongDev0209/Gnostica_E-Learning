import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import axios from 'axios';
import { toast } from 'sonner';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Loader2, UploadCloud, X, FileText, Image as ImageIcon } from "lucide-react";

const ApplyInstructor = () => {
    const navigate = useNavigate();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { register, handleSubmit, formState: { errors }, watch, setValue } = useForm();

    const [files, setFiles] = useState({
        idCardFront: null,
        idCardBack: null,
        cvUrl: null,
        degreeUrls: [] // Changed to array
    });
    const [agreedTerms, setAgreedTerms] = useState(false);

    const currentUser = JSON.parse(localStorage.getItem('user'));

    const handleFileChange = async (e, field) => {
        const selectedFiles = Array.from(e.target.files);
        if (selectedFiles.length === 0) return;

        if (field === 'degreeUrls') {
            toast.info(`Đang tải ${selectedFiles.length} file bằng cấp...`);
            
            const uploadPromises = selectedFiles.map(async (file) => {
                const formData = new FormData();
                formData.append('file', file);
                
                let endpoint = '/api/upload/image';
                if (file.type === 'application/pdf') {
                    endpoint = '/api/upload/document';
                }

                try {
                    const res = await axios.post(`http://localhost:8080${endpoint}`, formData, {
                        headers: { 'Content-Type': 'multipart/form-data' }
                    });
                    return { name: file.name, url: res.data.url, type: file.type };
                } catch (err) {
                    toast.error(`Lỗi khi tải file: ${file.name}`);
                    return null;
                }
            });

            const results = (await Promise.all(uploadPromises)).filter(r => r !== null);
            
            if (results.length > 0) {
                const currentUrls = watch('degreeUrls') ? watch('degreeUrls').split(',').filter(u => u) : [];
                const newUrls = results.map(r => r.url);
                const updatedUrls = [...currentUrls, ...newUrls];
                
                setValue('degreeUrls', updatedUrls.join(','));
                setFiles(prev => ({
                    ...prev,
                    degreeUrls: [...prev.degreeUrls, ...results]
                }));
                toast.success(`Đã tải thành công ${results.length} file`);
            }
            e.target.value = null; // Reset input
            return;
        }

        // Existing single file logic for others
        const file = selectedFiles[0];
        // Custom validation for CV PDF
        if (field === 'cvUrl' && file.type !== 'application/pdf') {
            toast.error("CV/Resume phải là file định dạng PDF");
            e.target.value = null;
            return;
        }

        const formData = new FormData();
        formData.append('file', file);

        let endpoint = '/api/upload/image';
        if (field === 'cvUrl') {
            endpoint = '/api/upload/document';
        }

        try {
            toast.info(`Đang tải ${field}...`);
            const res = await axios.post(`http://localhost:8080${endpoint}`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setValue(field, res.data.url);
            setFiles(prev => ({...prev, [field]: file}));
            toast.success("Tải file thành công");
        } catch (error) {
            toast.error("Lỗi khi tải file");
        }
    };

    const removeDegreeFile = (index) => {
        const currentFiles = [...files.degreeUrls];
        currentFiles.splice(index, 1);
        
        const updatedUrls = currentFiles.map(f => f.url).join(',');
        setValue('degreeUrls', updatedUrls);
        setFiles(prev => ({...prev, degreeUrls: currentFiles}));
    };

    const onSubmit = async (data) => {
        if (!agreedTerms) {
            toast.error("Vui lòng đồng ý với các điều khoản!");
            return;
        }

        // Validate files not empty (if required)
        if (!data.idCardFront || !data.idCardBack || !data.cvUrl || !data.degreeUrls) {
            toast.error("Vui lòng tải lên đầy đủ CCCD 2 mặt, CV/Resume và các bằng cấp liên quan");
            return;
        }

        setIsSubmitting(true);
        try {
            const user = JSON.parse(localStorage.getItem('user'));
            const token = user?.token;
            const res = await axios.post('http://localhost:8080/api/instructor-applications', {
                email: currentUser.email,
                idCardFront: data.idCardFront,
                idCardBack: data.idCardBack,
                contactPhone: data.contactPhone,
                cvUrl: data.cvUrl,
                degreeUrls: data.degreeUrls || '',
                courseOutline: data.courseOutline || ''
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            toast.success("Nộp đơn đăng ký thành công! Vui lòng chờ xét duyệt.");
            navigate('/');
        } catch (error) {
            toast.error(error.response?.data?.message || "Có lỗi xảy ra khi gửi đơn");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!currentUser) return <div className="p-10 text-center">Vui lòng đăng nhập</div>;

    return (
        <div className="min-h-screen bg-slate-50 py-10 px-4">
            <div className="max-w-3xl mx-auto">
                <Card>
                    <CardHeader className="text-center">
                        <CardTitle className="text-2xl text-primary font-bold">Đăng Ký Giảng Viên</CardTitle>
                        <CardDescription>Cung cấp đầy đủ thông tin để trở thành đối tác giảng dạy của chúng tôi</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Email / Names mock info */}
                                <div className="space-y-2">
                                    <Label>Họ và tên</Label>
                                    <Input value={currentUser.fullName} disabled className="bg-slate-100" />
                                </div>
                                <div className="space-y-2">
                                    <Label>Email</Label>
                                    <Input value={currentUser.email} disabled className="bg-slate-100" />
                                </div>
                                
                                <div className="space-y-2">
                                    <Label>Số điện thoại liên hệ <span className="text-red-500">*</span></Label>
                                    <Input 
                                        {...register('contactPhone', { 
                                            required: "Vui lòng nhập số điện thoại",
                                            pattern: {
                                                value: /^(0|\+84)(\s|\.)?((3[2-9])|(5[689])|(7[06-9])|(8[1-689])|(9[0-46-9]))(\d)(\s|\.)?(\d{3})(\s|\.)?(\d{3})$/,
                                                message: "Định dạng số điện thoại không hợp lệ"
                                            }
                                        })} 
                                        placeholder="0912345678" 
                                    />
                                    {errors.contactPhone && <p className="text-red-500 text-sm">{errors.contactPhone.message}</p>}
                                </div>
                            </div>

                            <div className="space-y-4">
                                <h3 className="font-semibold text-lg border-b pb-2">Hồ sơ cá nhân & Chứng chỉ</h3>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <Label>Ảnh CCCD Mặt trước <span className="text-red-500">*</span></Label>
                                        <Input type="file" accept="image/*" onChange={(e) => handleFileChange(e, 'idCardFront')} />
                                        {files.idCardFront && <p className="text-green-600 text-sm">Đã chọn: {files.idCardFront.name}</p>}
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Ảnh CCCD Mặt sau <span className="text-red-500">*</span></Label>
                                        <Input type="file" accept="image/*" onChange={(e) => handleFileChange(e, 'idCardBack')} />
                                        {files.idCardBack && <p className="text-green-600 text-sm">Đã chọn: {files.idCardBack.name}</p>}
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label>CV/Resume (Chỉ nhận file PDF) <span className="text-red-500">*</span></Label>
                                    <Input type="file" accept="application/pdf" onChange={(e) => handleFileChange(e, 'cvUrl')} />
                                    {files.cvUrl && <p className="text-green-600 text-sm">Đã chọn: {files.cvUrl.name}</p>}
                                </div>

                                <div className="space-y-3">
                                    <Label>Ảnh bằng cấp, tín chỉ (Chấp nhận Ảnh hoặc PDF) <span className="text-red-500">*</span></Label>
                                    <div className="flex items-center justify-center w-full">
                                        <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-slate-300 rounded-lg cursor-pointer bg-slate-50 hover:bg-slate-100 transition-colors">
                                            <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                                <UploadCloud className="w-8 h-8 mb-3 text-slate-400" />
                                                <p className="mb-2 text-sm text-slate-500 font-semibold text-center px-4">Nhấp để tải lên hoặc kéo thả nhiều file</p>
                                                <p className="text-xs text-slate-400 text-center px-4">PNG, JPG, PDF (Tối đa 10MB/file)</p>
                                            </div>
                                            <input 
                                                type="file" 
                                                className="hidden" 
                                                multiple 
                                                accept="image/*,application/pdf" 
                                                onChange={(e) => handleFileChange(e, 'degreeUrls')} 
                                            />
                                        </label>
                                    </div>
                                    
                                    {files.degreeUrls.length > 0 && (
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
                                            {files.degreeUrls.map((file, index) => (
                                                <div key={index} className="flex items-center justify-between p-3 bg-white border rounded-md shadow-sm">
                                                    <div className="flex items-center space-x-3 overflow-hidden">
                                                        {file.type === 'application/pdf' ? (
                                                            <FileText className="w-5 h-5 text-red-500 flex-shrink-0" />
                                                        ) : (
                                                            <ImageIcon className="w-5 h-5 text-blue-500 flex-shrink-0" />
                                                        )}
                                                        <span className="text-sm font-medium truncate max-w-[150px]" title={file.name}>
                                                            {file.name}
                                                        </span>
                                                    </div>
                                                    <button 
                                                        type="button"
                                                        onClick={() => removeDegreeFile(index)}
                                                        className="text-slate-400 hover:text-red-500 transition-colors"
                                                    >
                                                        <X className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="space-y-4">
                                <h3 className="font-semibold text-lg border-b pb-2">Kế hoạch giảng dạy</h3>
                                
                                <div className="space-y-2">
                                    <Label>Đề cương khóa học dự kiến</Label>
                                    <Textarea 
                                        {...register('courseOutline')} 
                                        placeholder="Mô tả tóm tắt nội dung bạn dự định giảng dạy..."
                                        rows={5}
                                    />
                                </div>
                            </div>

                            <div className="space-y-4">
                                <h3 className="font-semibold text-lg border-b pb-2">Điều khoản và điều kiện</h3>
                                <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 h-48 overflow-y-auto text-sm text-slate-600 leading-relaxed">
                                    <p className="mb-2">1. Bạn cam kết các thông tin cung cấp là chính xác và trung thực.</p>
                                    <p className="mb-2">2. Nội dung các khóa học phải tuân thủ quy định về bản quyền và đạo đức nghề nghiệp.</p>
                                    <p className="mb-2">3. Bạn chịu trách nhiệm hoàn toàn về nội dung và chất lượng bài giảng của mình.</p>
                                    <p className="mb-2">4. Gnostica có quyền tạm dừng hoặc hủy bỏ tư cách giảng viên nếu phát hiện vi phạm nghiêm trọng các quy định chung.</p>
                                    <p className="mb-2">5. Tỷ lệ chia sẻ doanh thu sẽ được thực hiện theo thỏa thuận cụ thể cho từng khóa học.</p>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <Checkbox 
                                    id="terms" 
                                    checked={agreedTerms}
                                    onCheckedChange={setAgreedTerms}
                                  />
                                  <label 
                                    htmlFor="terms" 
                                    className="text-sm font-medium leading-none cursor-pointer select-none"
                                  >
                                    Tôi đã đọc và đồng ý với các điều khoản trên
                                  </label>
                                </div>
                            </div>

                            <Button type="submit" disabled={isSubmitting || !agreedTerms} className="w-full">
                                {isSubmitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Đang xử lý</> : "Gửi Đăng Ký"}
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default ApplyInstructor;
