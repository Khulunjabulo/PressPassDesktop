import React, { useState, createContext, useContext, useRef } from "react";

const SelectContext = createContext();

export function Select({ onValueChange, children, className = "" }) {
  const [selectedValue, setSelectedValue] = useState("");
  const [open, setOpen] = useState(false);

  const handleChange = (value) => {
    setSelectedValue(value);
    onValueChange?.(value);
    setOpen(false);
  };

  return (
    <SelectContext.Provider value={{ selectedValue, handleChange, open, setOpen }}>
      <div className={`relative ${className}`}>{children}</div>
    </SelectContext.Provider>
  );
}

export function SelectTrigger({ children, className = "" }) {
  const { open, setOpen } = useContext(SelectContext);

  return (
    <button
      type="button"
      onClick={() => setOpen(!open)}
      className={`w-full border border-gray-300 rounded-md px-3 py-2 bg-white text-left text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${className}`}
    >
      {children}
    </button>
  );
}

export function SelectValue({ placeholder }) {
  const { selectedValue } = useContext(SelectContext);
  return <span>{selectedValue || placeholder}</span>;
}

export function SelectContent({ children, className = "" }) {
  const { open } = useContext(SelectContext);
  if (!open) return null;

  return (
    <div
      className={`absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg ${className}`}
    >
      {children}
    </div>
  );
}

export function SelectItem({ value, children, className = "" }) {
  const { handleChange } = useContext(SelectContext);

  return (
    <div
      onClick={() => handleChange(value)}
      className={`cursor-pointer px-4 py-2 text-sm hover:bg-blue-50 ${className}`}
    >
      {children}
    </div>
  );
}
