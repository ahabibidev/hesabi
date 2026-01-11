// components/settings/InputField.jsx
"use client";

import { memo } from "react";

const InputField = memo(function InputField({
  label,
  type = "text",
  name,
  value,
  onChange,
  placeholder,
  className = "",
}) {
  return (
    <div className={className}>
      <label className="block text-sm font-medium mb-2">{label}</label>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full rounded-xl border border-text/20 bg-background dark:bg-gray-900 px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-transparent"
      />
    </div>
  );
});

export default InputField;
