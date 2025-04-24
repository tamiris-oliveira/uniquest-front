import React from "react";
import { Plus } from "lucide-react";
import "./button.css";

type ButtonProps = {
  onClick?: () => void;
  children?: React.ReactNode;
};

const Button: React.FC<ButtonProps> = ({ onClick, children }) => {
  return (
    <button className="create-button" onClick={onClick}>
      <Plus size={18} /> {children}
    </button>
  );
};

export default Button;
