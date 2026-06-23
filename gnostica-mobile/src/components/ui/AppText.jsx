import React from 'react';
import { Text } from 'react-native';

const AppText = ({ className = '', style, children, ...props }) => {
    // Basic logic to apply font family classes if they are not explicitly provided
    // This is a naive check. If the user provides a font class in className, we respect it.
    let fontClass = 'font-inter'; // Default to Inter_400Regular
    
    if (className.includes('font-medium')) {
        fontClass = 'font-inter-medium';
    } else if (className.includes('font-semibold')) {
        fontClass = 'font-inter-semibold';
    } else if (className.includes('font-bold') || className.includes('font-extrabold')) {
        fontClass = 'font-inter-bold';
    } else if (className.includes('font-inter')) {
        fontClass = ''; // User already provided a specific font-inter class
    }

    // Clean up generic font weight classes since we map them to our custom fonts
    const cleanedClassName = className
        .replace(/\bfont-medium\b/g, '')
        .replace(/\bfont-semibold\b/g, '')
        .replace(/\bfont-bold\b/g, '')
        .replace(/\bfont-extrabold\b/g, '')
        .trim();

    const finalClassName = `${fontClass} ${cleanedClassName}`.trim();

    return (
        <Text className={finalClassName} style={style} {...props}>
            {children}
        </Text>
    );
};

export default AppText;
