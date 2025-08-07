import React, { createContext, useContext } from "react";

const RadioGroupContext = createContext();

export function RadioGroup({ value, onValueChange, className = "", children, ...props }) {
  return (
    <RadioGroupContext.Provider value={{ value, onValueChange }}>
      <div className={`flex flex-col gap-2 ${className}`} {...props}>
        {children}
      </div>
    </RadioGroupContext.Provider>
  );
}

export function RadioGroupItem({ value, id, className = "", ...props }) {
  const { value: selected, onValueChange } = useContext(RadioGroupContext);
  const isChecked = selected === value;

  return (
    <div className="flex items-center space-x-2">
      <input
        type="radio"
        id={id || value}
        name="radio-group"
        value={value}
        checked={isChecked}
        onChange={() => onValueChange(value)}
        className={`h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500 ${className}`}
        {...props}
      />
    </div>
  );
}
