import React from 'react';

export function Chart() {
  return (
    <div className="h-64 relative overflow-hidden rounded-2xl backdrop-blur-xl bg-white/10 p-6 shadow-xl border border-white/20 group">
      <div className="absolute -right-6 -top-6 w-32 h-32 blur-3xl rounded-full bg-purple-500/30 group-hover:scale-150 transition-transform duration-500"></div>
      <h3 className="text-xl font-semibold text-white mb-4">Matching Performance</h3>
      <div className="flex items-end justify-between h-40 gap-2">
        {[65, 45, 75, 55, 85, 70, 90].map((height, i) => (
          <div key={i} className="w-full">
            <div
              className="bg-gradient-to-t from-purple-500/50 to-purple-500 rounded-t-lg transition-all duration-500 hover:from-purple-400/50 hover:to-purple-400 cursor-pointer"
              style={{ height: `${height}%` }}
            ></div>
          </div>
        ))}
      </div>
    </div>
  );
}
