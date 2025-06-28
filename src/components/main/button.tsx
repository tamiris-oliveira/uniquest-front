import React from "react";
import { Plus } from "lucide-react";
import "./button.css";

type ButtonProps = {
  onClick?: () => void;
  children?: React.ReactNode;
  disabled?: boolean;
};

const Button: React.FC<ButtonProps> = ({ onClick, children, disabled }) => {
  return (
    <button className="create-button" onClick={onClick} disabled={disabled}>
      <Plus size={18} /> {children}
    </button>
  );
};

export default Button;
