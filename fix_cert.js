const fs = require('fs');
const file = 'gnostica-web/src/pages/learning/LearningWorkspace.jsx';
let lines = fs.readFileSync(file, 'utf8').split(/\r?\n/);

let insertIndex = -1;
for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes('const totalLessonsCount =')) {
        insertIndex = i;
        break;
    }
}

if (insertIndex !== -1) {
    lines.splice(insertIndex, 0,
        '  // Auto fetch certificate URL when progress reaches 100%',
        '  useEffect(() => {',
        '      if (progressValue === 100 && !certifiUrl) {',
        '          courseService.getCourseProgress(slug).then(res => {',
        '              if (res?.data?.certifiUrl) {',
        '                  setCertifiUrl(res.data.certifiUrl);',
        '              }',
        '          }).catch(console.error);',
        '      }',
        '  }, [progressValue, certifiUrl, slug]);',
        ''
    );
    fs.writeFileSync(file, lines.join('\n'), 'utf8');
    console.log('done');
} else {
    console.log('not found');
}
