// components/settings/ProfileCard.jsx
"use client";

import { memo } from "react";
import Image from "next/image";
import AvatarSelector from "./AvatarSelector";
import InputField from "./InputField";

const ProfileCard = memo(function ProfileCard({
  userProfile,
  avatarOptions,
  onProfileChange,
  onAvatarSelect,
}) {
  return (
    <div className="bg-background shadow-xl dark:bg-linear-45 dark:from-background dark:to-primary/20 border border-text/10 rounded-2xl p-6">
      <div className="flex items-center gap-3 mb-6">
        <h2 className="text-xl font-bold">Profile Settings</h2>
      </div>

      <div className="mb-8">
        <h3 className="font-semibold mb-4">Profile Avatar</h3>
        <div className="flex flex-col sm:flex-row items-center gap-6 mb-8">
          <div className="relative">
            <Image
              src={userProfile.avatar}
              alt="Profile"
              width={100}
              height={100}
              className="rounded-full border-4 border-white shadow-lg"
              priority
            />
          </div>
          <div className="text-center sm:text-left">
            <p className="font-bold text-xl">
              {userProfile.firstName} {userProfile.lastName}
            </p>
            <p className="text-text/70">{userProfile.email}</p>
          </div>
        </div>

        <AvatarSelector
          avatarOptions={avatarOptions}
          selectedAvatar={userProfile.avatar}
          onSelect={onAvatarSelect}
        />
      </div>

      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <InputField
            label="First Name"
            type="text"
            name="firstName"
            value={userProfile.firstName}
            onChange={onProfileChange}
          />
          <InputField
            label="Last Name"
            type="text"
            name="lastName"
            value={userProfile.lastName}
            onChange={onProfileChange}
          />
        </div>

        <InputField
          label="Email Address"
          type="email"
          name="email"
          value={userProfile.email}
          onChange={onProfileChange}
          className="mt-2"
        />
      </div>
    </div>
  );
});

export default ProfileCard;
