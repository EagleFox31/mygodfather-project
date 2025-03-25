import React from "react";

const Spinner = () => {
  return (
    <div className="flex justify-center items-center h-16">
      <div className="w-10 h-10 border-4 border-secondary-3 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );
};

export default Spinner;
