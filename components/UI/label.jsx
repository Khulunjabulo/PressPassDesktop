import React from "react";

const Label = React.forwardRef((props, ref) => {
  const { className = "", children, ...rest } = props;

  return (
    <label
      ref={ref}
      className={`block text-sm font-medium text-gray-700 ${className}`}
      {...rest}
    >
      {children}
    </label>
  );
});

Label.displayName = "Label";

export { Label };