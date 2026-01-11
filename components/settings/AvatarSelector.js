// components/settings/AvatarSelector.jsx
"use client";

import { memo } from "react";
import Image from "next/image";

const AvatarSelector = memo(function AvatarSelector({
  avatarOptions,
  selectedAvatar,
  onSelect,
}) {
  return (
    <>
      <h4 className="text-sm font-medium mb-5 text-text/70">
        Choose an avatar:
      </h4>
      <div className="flex sm:grid-cols-6 gap-3">
        {avatarOptions.map((avatar, index) => (
          <button
            key={index}
            onClick={() => onSelect(avatar)}
            className={`p-1 rounded-lg transition-all duration-200 ${
              selectedAvatar === avatar
                ? "ring-2 ring-primary bg-primary/10"
                : "hover:bg-gray-100 dark:hover:bg-gray-800"
            }`}
            aria-label={`Select avatar ${index + 1}`}
          >
            <Image
              src={avatar}
              alt={`Avatar ${index + 1}`}
              width={60}
              height={60}
              className="rounded-full"
            />
          </button>
        ))}
      </div>
    </>
  );
});

export default AvatarSelector;
