// components/settings/SettingsContent.jsx
"use client";

import { useState, useCallback, useMemo } from "react";
import MessageAlert from "./MessageAlert";
import ProfileCard from "./ProfileCard";
import SecurityCard from "./SecurityCard";
import PreferencesCard from "./PreferencesCard";
import SaveSettingsCard from "./SaveSettingsCard";
import {
  AVATAR_OPTIONS,
  CURRENCY_OPTIONS,
  DEFAULT_USER_PROFILE,
  DEFAULT_PASSWORD_DATA,
} from "./constants";

export default function SettingsContent() {
  const [userProfile, setUserProfile] = useState(DEFAULT_USER_PROFILE);
  const [passwordData, setPasswordData] = useState(DEFAULT_PASSWORD_DATA);
  const [darkMode, setDarkMode] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  const handleProfileChange = useCallback((e) => {
    const { name, value } = e.target;
    setUserProfile((prev) => ({ ...prev, [name]: value }));
  }, []);

  const handlePasswordChange = useCallback((e) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({ ...prev, [name]: value }));
  }, []);

  const handleAvatarSelect = useCallback((avatarUrl) => {
    setUserProfile((prev) => ({ ...prev, avatar: avatarUrl }));
  }, []);

  const handleCurrencySelect = useCallback((currencyCode) => {
    setUserProfile((prev) => ({ ...prev, currency: currencyCode }));
  }, []);

  const handleToggleDarkMode = useCallback(() => {
    setDarkMode((prev) => !prev);
  }, []);

  const clearMessage = useCallback(() => {
    setMessage({ type: "", text: "" });
  }, []);

  const handleReset = useCallback(() => {
    setUserProfile(DEFAULT_USER_PROFILE);
    setPasswordData(DEFAULT_PASSWORD_DATA);
    setMessage({ type: "info", text: "Settings reset to defaults!" });
  }, []);

  const handleSaveSettings = useCallback(() => {
    setIsSaving(true);
    setMessage({ type: "", text: "" });

    setTimeout(() => {
      if (
        passwordData.newPassword &&
        passwordData.newPassword !== passwordData.confirmPassword
      ) {
        setMessage({ type: "error", text: "New passwords don't match!" });
        setIsSaving(false);
        return;
      }

      if (passwordData.newPassword && passwordData.newPassword.length < 6) {
        setMessage({
          type: "error",
          text: "Password must be at least 6 characters!",
        });
        setIsSaving(false);
        return;
      }

      console.log("Saving settings:", {
        profile: userProfile,
        passwordChanged: !!passwordData.newPassword,
        darkMode,
      });

      setMessage({ type: "success", text: "Settings saved successfully!" });

      if (passwordData.newPassword) {
        setPasswordData(DEFAULT_PASSWORD_DATA);
      }

      setIsSaving(false);

      setTimeout(() => {
        setMessage({ type: "", text: "" });
      }, 3000);
    }, 1000);
  }, [passwordData, userProfile, darkMode]);

  return (
    <>
      <MessageAlert message={message} onClose={clearMessage} />

      <div className="flex flex-col gap-5">
        <div className="space-y-8">
          <ProfileCard
            userProfile={userProfile}
            avatarOptions={AVATAR_OPTIONS}
            onProfileChange={handleProfileChange}
            onAvatarSelect={handleAvatarSelect}
          />
        </div>

        <div className="flex flex-col gap-5">
          <SecurityCard
            passwordData={passwordData}
            onPasswordChange={handlePasswordChange}
          />

          <PreferencesCard
            userProfile={userProfile}
            currencyOptions={CURRENCY_OPTIONS}
            darkMode={darkMode}
            onCurrencySelect={handleCurrencySelect}
            onToggleDarkMode={handleToggleDarkMode}
          />
        </div>
      </div>

      <SaveSettingsCard
        isSaving={isSaving}
        onReset={handleReset}
        onSave={handleSaveSettings}
      />
    </>
  );
}
