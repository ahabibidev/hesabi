// components/settings/PasswordInput.jsx
"use client";

import { memo, useState, useCallback } from "react";
import { FiEye, FiEyeOff } from "react-icons/fi";

const PasswordInput = memo(function PasswordInput({
  label,
  name,
  value,
  onChange,
  placeholder,
  className = "",
}) {
  const [showPassword, setShowPassword] = useState(false);

  const toggleVisibility = useCallback(() => {
    setShowPassword((prev) => !prev);
  }, []);

  return (
    <div className={className}>
      <label className="block text-sm font-medium mb-2">{label}</label>
      <div className="relative">
        <input
          type={showPassword ? "text" : "password"}
          name={name}
          value={value}
          onChange={onChange}
          className="w-full rounded-xl border border-text/20 bg-background dark:bg-gray-900 px-4 py-3 pr-12 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-transparent"
          placeholder={placeholder}
        />
        <button
          type="button"
          onClick={toggleVisibility}
          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-text/50 hover:text-text"
          aria-label={showPassword ? "Hide password" : "Show password"}
        >
          {showPassword ? <FiEyeOff /> : <FiEye />}
        </button>
      </div>
    </div>
  );
});

export default PasswordInput;
