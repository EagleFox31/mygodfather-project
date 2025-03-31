// src/components/Loader.jsx
import React from 'react';

/**
 * Loader : un spinner circulaire qui tourne
 * en se basant sur Tailwind CSS.
 */
export default function Loader() {
  return (
    <div className="flex items-center justify-center py-10">
      {/* Un spinner basé sur la border */}
      <div className="
        h-10 w-10
        animate-spin
        rounded-full
        border-4
        border-blue-500
        border-t-transparent
      " />
    </div>
  );
}
