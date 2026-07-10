import React from 'react';
import { useOAuth2Callback } from '@/hooks/auth/useOAuth2Callback';

const OAuth2Callback = () => {
    useOAuth2Callback();

    return (
        <div className="flex items-center justify-center min-h-screen">
            <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                <h2 className="text-xl font-semibold">Đang xác thực...</h2>
                <p className="text-muted-foreground transition-all">Vui lòng đợi trong giây lát.</p>
            </div>
        </div>
    );
};

export default OAuth2Callback;
