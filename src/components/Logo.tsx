import React from 'react';

const Logo = () => {
  return (
    <div className="flex items-center">
      <svg
        width="32"
        height="32"
        viewBox="0 0 100 100"
        fill="#7c71a9"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path d="M62.5,37.5 C62.5,31.9771525 58.0228475,27.5 52.5,27.5 L52.5,0 L77.5,0 L77.5,37.5 L62.5,37.5 Z M77.5,12.5 L92.5,12.5 L92.5,22.5 L77.5,22.5 L77.5,12.5 Z" fill="white" />
        <path
          d="M52.5,27.5 C40,27.5 30,35 30,50 C30,60 37.5,70 47.5,70 C57.5,70 65,62.5 65,52.5 L65,15 C80,20 85,35 80,45 C75,55 60,57.5 52.5,52.5"
          stroke="#7c71a9"
          strokeWidth="6"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx="35" cy="80" r="15" />
        <circle cx="75" cy="75" r="15" />
      </svg>
      <span className="ml-2 text-xl font-bold" style={{ color: '#7c71a9' }}>
        My SetList
      </span>
    </div>
  );
};

export default Logo;
