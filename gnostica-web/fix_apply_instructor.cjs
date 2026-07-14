const fs = require('fs');
let content = fs.readFileSync('src/pages/general/ApplyInstructor.jsx', 'utf8');

// Colors
const colorMap = {
    'bg-slate-50/50': 'bg-background',
    'bg-slate-50': 'bg-muted',
    'bg-slate-100': 'bg-muted',
    'bg-slate-200': 'bg-border',
    'bg-slate-900': 'bg-card',
    'text-slate-900': 'text-foreground',
    'text-slate-800': 'text-foreground',
    'text-slate-700': 'text-foreground',
    'text-slate-600': 'text-muted-foreground',
    'text-slate-500': 'text-muted-foreground',
    'text-slate-400': 'text-muted-foreground',
    'text-slate-300': 'text-muted-foreground/50',
    'text-slate-200': 'text-muted-foreground/30',
    'border-slate-200': 'border-border',
    'border-slate-100': 'border-border',
    'border-slate-50': 'border-border',
    'text-emerald-500': 'text-success',
    'text-emerald-600': 'text-success',
    'bg-emerald-500': 'bg-success',
    'bg-emerald-100': 'bg-success/20',
    'bg-emerald-50/50': 'bg-success/10',
    'bg-emerald-50/30': 'bg-success/5',
    'bg-emerald-50': 'bg-success/10',
    'border-emerald-500': 'border-success',
    'border-emerald-200': 'border-success/40',
    'text-rose-500': 'text-destructive',
    'text-rose-600': 'text-destructive',
    'bg-rose-50/30': 'bg-destructive/10',
    'bg-rose-50': 'bg-destructive/10',
    'border-rose-200': 'border-destructive/40',
    'text-amber-500': 'text-warning',
    'border-amber-500': 'border-warning',
    'text-sky-500': 'text-info',
    'bg-sky-50': 'bg-info/10',
    'border-indigo-500': 'border-info'
};

for (const [key, value] of Object.entries(colorMap)) {
    content = content.split(key).join(value);
}

// Ensure PageContainer is used
if (!content.includes('PageContainer')) {
    content = content.replace("import { Card, CardContent }", "import PageContainer from '@/components/common/core/PageContainer';\nimport { Card, CardContent }");
}
content = content.replace('<div className="min-h-screen bg-background py-12 px-4 sm:px-6">', '<PageContainer className="py-12 px-4 sm:px-6">');
// PRESERVE ONE </div> instead of removing both!
content = content.replace(/<\/div>\s*<\/div>\s*\);\s*};\s*export default ApplyInstructor;/, '</div>\n        </PageContainer>\n    );\n};\n\nexport default ApplyInstructor;');

// Replace onSubmit to use useMutation
if (!content.includes('useMutation')) {
    content = content.replace("import { useForm } from 'react-hook-form';", "import { useForm } from 'react-hook-form';\nimport { useMutation } from '@tanstack/react-query';");
    
    const submitRegex = /const onSubmit = async \(data\) => \{[\s\S]*?finally \{\s*setIsSubmitting\(false\);\s*\}\s*\};/;
    const newSubmit = `
    const createApplicationMutation = useMutation({
        mutationFn: (data) => instructorService.createApplication(data),
        onSuccess: () => {
            toast.success("N?p don thành công! Chúng tôi s? ph?n h?i s?m nh?t có th?.");
            navigate('/');
        },
        onError: (error) => {
            toast.error(error.response?.data?.message || "L?i h? th?ng khi g?i don");
        }
    });

    const onSubmit = async (data) => {
        if (!agreedTerms) {
            toast.error("B?n chua d?ng ý v?i di?u kho?n d?ch v?");
            return;
        }

        createApplicationMutation.mutate({
            email: currentUser.email,
            idCardFront: data.idCardFront,
            idCardBack: data.idCardBack,
            contactPhone: data.contactPhone,
            cvUrl: data.cvUrl,
            degreeUrls: data.degreeUrls,
            courseOutline: data.courseOutline || ''
        });
    };
    `;
    content = content.replace(submitRegex, newSubmit);
    
    // Remove the useState line for isSubmitting FIRST before replacing all isSubmitting
    content = content.replace(/const \[isSubmitting, setIsSubmitting\] = useState\(false\);\n?\s*/g, '');

    // Now replace all other uses of isSubmitting
    content = content.replace(/isSubmitting/g, 'createApplicationMutation.isPending');
}

fs.writeFileSync('src/pages/general/ApplyInstructor.jsx', content);
console.log('Success replacing ApplyInstructor');
