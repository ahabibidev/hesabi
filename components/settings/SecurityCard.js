// components/settings/SecurityCard.jsx
"use client";

import { memo } from "react";
import PasswordInput from "./PasswordInput";

const SecurityCard = memo(function SecurityCard({
  passwordData,
  onPasswordChange,
}) {
  return (
    <div className="bg-background shadow-xl dark:bg-linear-45 dark:from-background dark:to-primary/20 border border-text/10 rounded-2xl p-6">
      <h2 className="text-xl font-bold mb-6">Security Settings</h2>

      <div className="space-y-6">
        <PasswordInput
          label="Current Password"
          name="currentPassword"
          value={passwordData.currentPassword}
          onChange={onPasswordChange}
          placeholder="Enter your current password"
        />

        <div className="grid grid-cols-1 gap-6">
          <PasswordInput
            label="New Password"
            name="newPassword"
            value={passwordData.newPassword}
            onChange={onPasswordChange}
            placeholder="Enter new password"
            className="mt-2"
          />

          <PasswordInput
            label="Confirm New Password"
            name="confirmPassword"
            value={passwordData.confirmPassword}
            onChange={onPasswordChange}
            placeholder="Confirm new password"
          />
        </div>

        <div className="text-sm text-text/70">
          <p>• Password must be at least 6 characters long</p>
          <p>
            • Use a mix of letters, numbers, and symbols for better security
          </p>
        </div>
      </div>
    </div>
  );
});

export default SecurityCard;
