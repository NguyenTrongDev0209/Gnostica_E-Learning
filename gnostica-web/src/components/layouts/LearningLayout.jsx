import React from 'react';
import { Outlet } from 'react-router-dom';

const LearningLayout = () => {
  return (
    <div className="learning-layout min-h-screen bg-background">
      <main className="h-screen overflow-hidden">
        <Outlet />
      </main>
    </div>
  );
};

export default LearningLayout;
