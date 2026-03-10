// src/components/PoolsSkeleton.jsx
import React from "react";

const PoolsSkeleton = () => {
  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-md p-4 animate-pulse">
      {/* Image */}
      <div className="h-24 bg-gray-300 rounded-md mb-3" />

      <hr className="mb-3" />

      <div className="bg-slate-200 p-3 rounded-md space-y-3">
        {/* Jackpot */}
        <div className="h-6 w-32 bg-gray-300 rounded" />

        {/* Timer */}
        <div className="h-4 w-40 bg-gray-300 rounded" />

        {/* Price */}
        <div className="h-4 w-20 bg-gray-300 rounded" />

        {/* Footer */}
        <div className="flex justify-between items-center pt-2">
          <div className="h-4 w-16 bg-gray-300 rounded" />
          <div className="h-8 w-24 bg-gray-300 rounded-full" />
        </div>
      </div>
    </div>
  );
};

export default PoolsSkeleton;
