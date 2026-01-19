// hooks/useUserProfile.js
"use client";

import { useState, useEffect, useCallback } from "react";
import { DEFAULT_AVATAR } from "@/lib/constants";

export function useUserProfile() {
  const [userProfile, setUserProfile] = useState({
    firstName: "",
    lastName: "",
    email: "",
    avatar: DEFAULT_AVATAR,
    oauthAvatar: null, // Add this for OAuth avatar
    currency: "USD",
    theme: "light",
    provider: null,
    hasPassword: true,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch user profile
  const fetchProfile = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch("/api/user/profile");
      const data = await response.json();

      console.log("=== FETCH PROFILE DEBUG ===");
      console.log("Response status:", response.status);
      console.log("Full response data:", data);
      console.log("OAuth avatar from API:", data.user?.oauthAvatar);
      console.log("===========================");

      if (!response.ok) {
        throw new Error(
          data.error || data.details || "Failed to fetch profile",
        );
      }

      setUserProfile({
        firstName: data.user.firstName || "",
        lastName: data.user.lastName || "",
        email: data.user.email || "",
        avatar: data.user.avatar || DEFAULT_AVATAR,
        oauthAvatar: data.user.oauthAvatar || null, // Add this
        currency: data.user.currency || "USD",
        theme: data.user.theme || "light",
        provider: data.user.provider || null,
        hasPassword: data.user.hasPassword !== false,
      });
    } catch (err) {
      setError(err.message);
      console.error("Error fetching profile:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Update user profile
  const updateProfile = useCallback(async (updates) => {
    try {
      console.log("Updating profile with:", updates);

      const response = await fetch("/api/user/profile", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updates),
      });

      const data = await response.json();
      console.log("Update profile response:", response.status, data);

      if (!response.ok) {
        throw new Error(
          data.error || data.details || "Failed to update profile",
        );
      }

      setUserProfile((prev) => ({
        ...prev,
        firstName: data.user.firstName || prev.firstName,
        lastName: data.user.lastName || prev.lastName,
        email: data.user.email || prev.email,
        avatar: data.user.avatar || prev.avatar,
        oauthAvatar: data.user.oauthAvatar || prev.oauthAvatar, // Add this (preserve existing)
        currency: data.user.currency || prev.currency,
        theme: data.user.theme || prev.theme,
      }));

      return { success: true, message: data.message };
    } catch (err) {
      console.error("Error updating profile:", err);
      return { success: false, error: err.message };
    }
  }, []);

  // Update password
  const updatePassword = useCallback(async (passwordData) => {
    try {
      console.log("Updating password...");

      const response = await fetch("/api/user/password", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(passwordData),
      });

      const data = await response.json();
      console.log("Update password response:", response.status, data);

      if (!response.ok) {
        throw new Error(
          data.error || data.details || "Failed to update password",
        );
      }

      return { success: true, message: data.message };
    } catch (err) {
      console.error("Error updating password:", err);
      return { success: false, error: err.message };
    }
  }, []);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  return {
    userProfile,
    setUserProfile,
    isLoading,
    error,
    fetchProfile,
    updateProfile,
    updatePassword,
  };
}
