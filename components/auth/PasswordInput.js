"use client";

import { BiHide, BiShow } from "react-icons/bi";
import { useState } from "react";

export default function PasswordInput({
  id,
  name,
  placeholder,
  label,
  value,
  onChange,
}) {
  const [show, setShow] = useState(false);

  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={id} className="font-semibold text-xs">
        {label}
      </label>

      <div className="flex items-center  overflow-hidden">
        <input
          id={id}
          name={name}
          type={show ? "text" : "password"}
          placeholder={placeholder}
          className="flex-1 border text-sm py-1 px-2 rounded-l-sm placeholder:text-xs border-r-transparent border-gray-400 focus:outline-primary/70 "
          value={value}
          onChange={onChange}
        />

        <button
          type="button"
          onClick={() => setShow(!show)}
          aria-label={show ? "Hide password" : "Show password"}
          className="p-2 text-text  cursor-pointer rounded-r-sm py-0.5 px-2 border border-gray-400"
        >
          {show ? (
            <BiHide className="text-2xl" />
          ) : (
            <BiShow className="text-2xl" />
          )}
        </button>
      </div>
    </div>
  );
}
