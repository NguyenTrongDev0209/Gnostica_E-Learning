import { useState, useEffect } from 'react';
import { MOCK_INSTRUCTORS } from '@/mocks/accountMocks';
import { toast } from 'sonner';

export default function useFavoriteInstructors() {
    const [instructors, setInstructors] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setLoading(true);
        setTimeout(() => {
            setInstructors(MOCK_INSTRUCTORS);
            setLoading(false);
        }, 600);
    }, []);

    const handleUnfollow = (instructorId) => {
        setInstructors(prev => prev.filter(inst => inst.id !== instructorId));
        toast.success("�� b? theo d�i gi?ng vi�n");
    };

    return {
        instructors,
        loading,
        handleUnfollow
    };
}
