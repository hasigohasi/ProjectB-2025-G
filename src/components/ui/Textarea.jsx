// src/components/ui/Textarea.jsx
import React from "react";

export const Textarea = ({ value, onChange, placeholder = "", className = "" }) => {
  return (
    <textarea
      className={`border p-2 rounded w-full ${className}`}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
    />
  );
};
