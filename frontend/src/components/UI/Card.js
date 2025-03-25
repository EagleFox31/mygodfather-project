import React from "react";

const Card = ({ title, children }) => {
  return (
    <div className="bg-white shadow-md p-6 rounded-lg flex flex-col h-full">
      <h3 className="text-xl font-semibold text-primary">{title}</h3>
      <p className="mt-2 flex-grow">{children}</p>
    </div>
  );
};

export default Card;
