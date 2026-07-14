const fs = require('fs');
let content = fs.readFileSync('src/pages/general/UserProfile.jsx', 'utf8');

// Colors
content = content.replace(/from-violet-600 via-purple-600 to-indigo-600/g, 'from-primary/80 via-primary to-primary/90');
content = content.replace(/text-amber-500/g, 'text-warning');
content = content.replace(/bg-orange-500/g, 'bg-primary');
content = content.replace(/hover:bg-orange-600/g, 'hover:bg-primary/90');
content = content.replace(/bg-indigo-50/g, 'bg-info-soft');
content = content.replace(/text-indigo-700/g, 'text-info-foreground');
content = content.replace(/border-indigo-100/g, 'border-info/20');
content = content.replace(/text-indigo-600/g, 'text-info');
content = content.replace(/bg-orange-50/g, 'bg-warning-soft');
content = content.replace(/bg-yellow-50/g, 'bg-warning-soft');
content = content.replace(/bg-blue-50/g, 'bg-info-soft');
content = content.replace(/text-slate-700/g, 'text-foreground');
content = content.replace(/text-slate-400/g, 'text-muted-foreground');

// Missing imports
if (!content.includes('@tanstack/react-query')) {
    content = content.replace(/import followingService from/, `import { useQuery } from '@tanstack/react-query';
import instructorService from '@/services/instructor/instructorService';
import followingService from`);
}

const lines = content.split('\n');

const startIndex1 = lines.findIndex(l => l.includes('const [loading, setLoading] = useState(true);'));
const endIndex1 = lines.findIndex(l => l.includes('const [loadingCourses, setLoadingCourses] = useState(false);'));

const startIndex2 = lines.findIndex(l => l.includes('const [userData, setUserData] = useState(() =>'));
const endIndex2 = lines.findIndex(l => l.includes('if (loading) {'));
const returnEnd = endIndex2 + 2; // cover return <div ...></div>; }

if (startIndex1 !== -1 && endIndex1 !== -1 && startIndex2 !== -1 && returnEnd !== -1) {
    // Delete states
    lines.splice(startIndex1, endIndex1 - startIndex1 + 1);

    // After deleting, recalculate indices
    const newStartIndex2 = lines.findIndex(l => l.includes('const [userData, setUserData] = useState(() =>'));
    const newEndIndex2 = lines.findIndex(l => l.includes('if (loading) {'));
    const newReturnEnd = newEndIndex2 + 2;

    const replacement = `
  const { data: fetchedProfile, isLoading: loadingProfile } = useQuery({
    queryKey: ['instructor-profile', id],
    queryFn: () => instructorService.getInstructorProfile(id),
    enabled: !!id && !isOwnProfile,
    retry: false
  });

  const { data: fetchedCourses, isLoading: loadingCourses } = useQuery({
    queryKey: ['instructor-courses', id],
    queryFn: () => instructorService.getInstructorCourses(id),
    enabled: !!id && !isOwnProfile,
    retry: false
  });

  const user = isOwnProfile 
    ? { ...MOCK_USER, ...currentUser, name: currentUser.fullName, role: currentUser.role }
    : fetchedProfile 
      ? {
          ...MOCK_USER,
          id: fetchedProfile.id,
          name: fetchedProfile.name || fetchedProfile.fullName,
          avatar: fetchedProfile.avatar || \`https://ui-avatars.com/api/?name=\${encodeURIComponent(fetchedProfile.name || fetchedProfile.fullName)}&background=random&color=fff\`,
          email: fetchedProfile.email,
          role: "INSTRUCTOR",
          stats: {
            ...MOCK_USER.stats,
            courses: fetchedProfile.coursesCount || 0,
            students: fetchedProfile.studentsCount || 0,
          }
        }
      : MOCK_USER;

  const instructorCourses = fetchedCourses || [];
  const isInstructor = (user.role || '').toUpperCase() === 'INSTRUCTOR';
  const loading = loadingProfile;

  const handleBecomeInstructor = async () => {
    navigate('/apply-instructor');
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Ðang t?i h? so...</div>;
  }`;

    lines.splice(newStartIndex2, newReturnEnd - newStartIndex2 + 1, replacement);
    fs.writeFileSync('src/pages/general/UserProfile.jsx', lines.join('\n'));
    console.log('Success!');
} else {
    console.log('Could not find exact lines to replace.');
}
