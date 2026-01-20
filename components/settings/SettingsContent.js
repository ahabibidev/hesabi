// components/settings/SettingsContent.jsx
"use client";

import { useState, useCallback, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import MessageAlert from "./MessageAlert";
import ProfileCard from "./ProfileCard";
import SecurityCard from "./SecurityCard";
import PreferencesCard from "./PreferencesCard";
import SaveSettingsCard from "./SaveSettingsCard";
import SettingsSkeleton from "./SettingsSkeleton";
import { DEFAULT_PASSWORD_DATA } from "./constants";
import { AVATAR_OPTIONS, CURRENCY_OPTIONS } from "@/lib/constants";
import { useUserProfile } from "@/hooks/useUserProfile";

export default function SettingsContent() {
  const router = useRouter();

  const {
    userProfile,
    setUserProfile,
    isLoading,
    error: fetchError,
    updateProfile,
    updatePassword,
  } = useUserProfile();

  const [passwordData, setPasswordData] = useState(DEFAULT_PASSWORD_DATA);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [hasChanges, setHasChanges] = useState(false);
  const [originalProfile, setOriginalProfile] = useState(null);

  // ✅ Detect OAuth user by checking if avatar is from GitHub or Google
  const isOAuthUser = useMemo(() => {
    const avatar = userProfile.avatar || "";
    const oauthAvatar = userProfile.oauthAvatar || "";

    // Check if avatar is from GitHub or Google
    const isExternalAvatar =
      avatar.includes("avatars.githubusercontent.com") ||
      avatar.includes("lh3.googleusercontent.com") ||
      oauthAvatar.includes("avatars.githubusercontent.com") ||
      oauthAvatar.includes("lh3.googleusercontent.com");

    // Also check provider field if available
    const hasProvider = userProfile.provider && userProfile.provider !== null;

    return isExternalAvatar || hasProvider;
  }, [
    userProfile.avatar,
    userProfile.oauthAvatar,
    userProfile.provider,
    userProfile.hasPassword,
  ]);

  const dynamicAvatarOptions = useMemo(() => {
    const options = [...AVATAR_OPTIONS];

    if (userProfile.oauthAvatar && !options.includes(userProfile.oauthAvatar)) {
      options.unshift(userProfile.oauthAvatar);
    }

    return options;
  }, [userProfile.oauthAvatar]);

  useEffect(() => {
    if (!isLoading && userProfile.email) {
      setOriginalProfile({ ...userProfile });
    }
  }, [isLoading, userProfile.email]);

  useEffect(() => {
    if (message.text) {
      const mainContent = document.getElementById("main-content");
      if (mainContent) {
        mainContent.scrollTo({
          top: 0,
          behavior: "smooth",
        });
      }
    }
  }, [message]);

  useEffect(() => {
    if (!originalProfile) return;

    const profileChanged =
      userProfile.firstName !== originalProfile.firstName ||
      userProfile.lastName !== originalProfile.lastName ||
      userProfile.email !== originalProfile.email ||
      userProfile.avatar !== originalProfile.avatar ||
      userProfile.currency !== originalProfile.currency;

    const passwordChanged =
      !isOAuthUser &&
      (passwordData.currentPassword ||
        passwordData.newPassword ||
        passwordData.confirmPassword);

    setHasChanges(profileChanged || !!passwordChanged);
  }, [userProfile, passwordData, originalProfile, isOAuthUser]);

  const handleProfileChange = useCallback(
    (e) => {
      const { name, value } = e.target;
      setUserProfile((prev) => ({ ...prev, [name]: value }));
    },
    [setUserProfile],
  );

  const handlePasswordChange = useCallback((e) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({ ...prev, [name]: value }));
  }, []);

  const handleAvatarSelect = useCallback(
    (avatarPath) => {
      setUserProfile((prev) => ({ ...prev, avatar: avatarPath }));
    },
    [setUserProfile],
  );

  const handleCurrencySelect = useCallback(
    (currencyCode) => {
      setUserProfile((prev) => ({ ...prev, currency: currencyCode }));
    },
    [setUserProfile],
  );

  const clearMessage = useCallback(() => {
    setMessage({ type: "", text: "" });
  }, []);

  const handleReset = useCallback(() => {
    if (originalProfile) {
      setUserProfile({ ...originalProfile });
    }
    setPasswordData(DEFAULT_PASSWORD_DATA);
    setMessage({ type: "info", text: "Settings reset to original values!" });
  }, [originalProfile, setUserProfile]);

  const handleSaveSettings = useCallback(async () => {
    setIsSaving(true);
    setMessage({ type: "", text: "" });

    try {
      const isChangingPassword =
        !isOAuthUser &&
        (passwordData.currentPassword ||
          passwordData.newPassword ||
          passwordData.confirmPassword);

      if (isChangingPassword) {
        if (!passwordData.currentPassword) {
          setMessage({
            type: "error",
            text: "Please enter your current password",
          });
          setIsSaving(false);
          return;
        }

        if (!passwordData.newPassword) {
          setMessage({ type: "error", text: "Please enter a new password" });
          setIsSaving(false);
          return;
        }

        if (passwordData.newPassword !== passwordData.confirmPassword) {
          setMessage({ type: "error", text: "New passwords don't match!" });
          setIsSaving(false);
          return;
        }

        if (passwordData.newPassword.length < 6) {
          setMessage({
            type: "error",
            text: "Password must be at least 6 characters!",
          });
          setIsSaving(false);
          return;
        }
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(userProfile.email)) {
        setMessage({
          type: "error",
          text: "Please enter a valid email address",
        });
        setIsSaving(false);
        return;
      }

      if (!userProfile.firstName.trim()) {
        setMessage({ type: "error", text: "First name is required" });
        setIsSaving(false);
        return;
      }

      let hasError = false;

      const profileResult = await updateProfile({
        firstName: userProfile.firstName,
        lastName: userProfile.lastName,
        email: userProfile.email,
        avatar: userProfile.avatar,
        currency: userProfile.currency,
      });

      if (!profileResult.success) {
        setMessage({ type: "error", text: profileResult.error });
        hasError = true;
      }

      if (!hasError && isChangingPassword) {
        const passwordResult = await updatePassword({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
          confirmPassword: passwordData.confirmPassword,
        });

        if (!passwordResult.success) {
          setMessage({ type: "error", text: passwordResult.error });
          hasError = true;
        }
      }

      if (!hasError) {
        setMessage({ type: "success", text: "Settings saved successfully!" });
        setPasswordData(DEFAULT_PASSWORD_DATA);
        setOriginalProfile({ ...userProfile });
        setHasChanges(false);
        router.refresh();

        setTimeout(() => {
          setMessage({ type: "", text: "" });
        }, 3000);
      }
    } catch (err) {
      setMessage({ type: "error", text: "An unexpected error occurred" });
    } finally {
      setIsSaving(false);
    }
  }, [
    passwordData,
    userProfile,
    updateProfile,
    updatePassword,
    router,
    isOAuthUser,
  ]);

  if (isLoading) {
    return <SettingsSkeleton />;
  }

  if (fetchError) {
    return (
      <div className="text-center py-10">
        <p className="text-red-500 mb-4">
          Failed to load settings: {fetchError}
        </p>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-primary text-white rounded-lg"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <>
      <MessageAlert message={message} onClose={clearMessage} />

      <div className="flex flex-col gap-5">
        <div className="space-y-8">
          <ProfileCard
            userProfile={userProfile}
            avatarOptions={dynamicAvatarOptions}
            onProfileChange={handleProfileChange}
            onAvatarSelect={handleAvatarSelect}
          />
        </div>

        <div className="flex flex-col gap-5">
          {/* ✅ Only show SecurityCard if NOT OAuth user */}
          {!isOAuthUser && (
            <SecurityCard
              passwordData={passwordData}
              onPasswordChange={handlePasswordChange}
            />
          )}

          <PreferencesCard
            userProfile={userProfile}
            currencyOptions={CURRENCY_OPTIONS}
            onCurrencySelect={handleCurrencySelect}
          />
        </div>
      </div>

      <SaveSettingsCard
        isSaving={isSaving}
        hasChanges={hasChanges}
        onReset={handleReset}
        onSave={handleSaveSettings}
      />
    </>
  );
}
