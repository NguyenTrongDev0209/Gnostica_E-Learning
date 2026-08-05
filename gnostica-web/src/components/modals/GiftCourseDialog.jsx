import React, { useState } from 'react';
import { AppDialog } from '../common/micro/AppDialog';
import AppInput from '../common/micro/AppInput';
import { AppButton } from '../common/micro/AppButton';
import AppAvatar from '../common/micro/AppAvatar';
import AppAlert from '../common/micro/AppAlert';
import AppTextarea from '../common/micro/AppTextarea';
import giftService from '../../services/course/giftService';
import { toast } from 'sonner';

const GiftCourseDialog = ({ open, setOpen, courseId, coursePrice, onGiftConfirm }) => {
    const [step, setStep] = useState(1);
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [receiver, setReceiver] = useState(null);
    const [message, setMessage] = useState('');

    const resetState = () => {
        setStep(1);
        setEmail('');
        setReceiver(null);
        setMessage('');
    };

    const handleClose = () => {
        setOpen(false);
        setTimeout(resetState, 300);
    };

    const handleSearch = async () => {
        if (!email) {
            toast.error("Vui lòng nhập email");
            return;
        }
        
        setLoading(true);
        try {
            const response = await giftService.searchReceiver(email, courseId);
            const data = response.data || response;
            
            if (data.senderOwns) {
                toast.error(data.errorMessage || "Bạn đã sở hữu khóa học này nên không thể tặng.");
                return;
            }

            if (data.valid || data.alreadyOwned) {
                setReceiver(data);
                setStep(2);
            } else {
                toast.error(data.errorMessage || "Không thể tặng cho tài khoản này");
            }
        } catch (error) {
            toast.error("Lỗi khi tìm kiếm người nhận");
        } finally {
            setLoading(false);
        }
    };

    const handleConfirm = () => {
        if (!receiver) return;
        
        if (receiver.alreadyOwned) {
            toast.error("Không thể tặng vì người này đã có khóa học");
            return;
        }

        onGiftConfirm({
            receiverEmail: email,
            message: message
        });
        
        handleClose();
    };

    const renderStep1 = () => (
        <div className="space-y-4 py-4">
            <p className="text-sm text-gray-500">
                Nhập email của người bạn muốn tặng khóa học này. Hệ thống sẽ kiểm tra xem tài khoản có hợp lệ hay không.
            </p>
            <AppInput
                label="Email người nhận"
                type="email"
                placeholder="example@gnostica.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            />
            <div className="flex justify-end pt-4">
                <AppButton onClick={handleSearch} loading={loading}>
                    Kiểm tra
                </AppButton>
            </div>
        </div>
    );

    const renderStep2 = () => {
        if (!receiver) return null;

        return (
            <div className="space-y-4 py-4">
                {receiver.alreadyOwned && (
                    <AppAlert
                        appVariant="info"
                        title="Đã sở hữu"
                        description="Người dùng này đã sở hữu khóa học nên bạn không thể tặng."
                    />
                )}
                
                {receiver.previouslyRejected && !receiver.alreadyOwned && (
                    <AppAlert
                        appVariant="warning"
                        title="Cảnh báo"
                        description="Người này đã từng từ chối quà tặng khóa học này trước đó."
                    />
                )}

                <div className="flex items-center space-x-4 p-4 border rounded-lg bg-gray-50">
                    <AppAvatar src={receiver.avatar} alt={receiver.fullName} fallback={receiver.fullName?.charAt(0)} size="lg" />
                    <div>
                        <p className="font-semibold">{receiver.fullName}</p>
                        <p className="text-sm text-gray-500">{receiver.email}</p>
                    </div>
                </div>

                {!receiver.alreadyOwned && (
                    <AppTextarea
                        label="Lời nhắn (Không bắt buộc)"
                        placeholder="Gửi lời chúc đến người nhận..."
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        rows={3}
                    />
                )}

                <div className="flex justify-between pt-4">
                    <AppButton variant="outline" onClick={() => setStep(1)}>
                        Quay lại
                    </AppButton>
                    <AppButton 
                        onClick={handleConfirm} 
                        disabled={receiver.alreadyOwned}
                        appVariant="gradient"
                    >
                        Tiến hành tặng quà ({coursePrice?.toLocaleString('vi-VN')} đ)
                    </AppButton>
                </div>
            </div>
        );
    };

    return (
        <AppDialog
            open={open}
            onOpenChange={(isOpen) => !isOpen && handleClose()}
            title="Tặng khóa học"
            description={step === 1 ? "Tìm kiếm người nhận" : "Xác nhận thông tin người nhận"}
            className="max-w-md"
        >
            {step === 1 ? renderStep1() : renderStep2()}
        </AppDialog>
    );
};

export default GiftCourseDialog;
