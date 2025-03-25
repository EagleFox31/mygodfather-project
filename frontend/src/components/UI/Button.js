import React from "react";

const Button = ({ children, onClick, type = "button", color = "primary" }) => {
  const colors = {
    primary: "bg-primary hover:bg-secondary-1 text-white",
    secondary: "bg-secondary-3 hover:bg-secondary-2 text-white",
    danger: "bg-alert hover:bg-alert-dark text-white",
  };

  return (
    <button
      type={type}
      onClick={onClick}
      className={`px-4 py-2 rounded-md transition ${colors[color]}`}
    >
      {children}
    </button>
  );
};

export default Button;
