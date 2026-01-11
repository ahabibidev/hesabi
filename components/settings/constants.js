// components/settings/constants.js
import bear from "@/public/avatars/bear.png";
import boy from "@/public/avatars/boy.png";
import cat from "@/public/avatars/cat.png";
import chicken from "@/public/avatars/chicken.png";
import gamer from "@/public/avatars/gamer.png";
import man from "@/public/avatars/man.png";
import girl from "@/public/avatars/girl.png";
import user from "@/public/avatars/user.png";
import woman from "@/public/avatars/woman.png";
import woman1 from "@/public/avatars/woman (1).png";

export const AVATAR_OPTIONS = [
  user,
  bear,
  boy,
  cat,
  chicken,
  gamer,
  man,
  girl,
  woman,
  woman1,
];

export const CURRENCY_OPTIONS = [
  { code: "USD", name: "US Dollar", symbol: "$" },
  { code: "EUR", name: "Euro", symbol: "€" },
  { code: "AFN", name: "Afghan Afghani", symbol: "؋" },
  { code: "IRR", name: "Iranian Rial", symbol: "﷼" },
];

export const DEFAULT_USER_PROFILE = {
  firstName: "Alex",
  lastName: "Johnson",
  email: "alex.johnson@example.com",
  avatar: user,
  currency: "USD",
};

export const DEFAULT_PASSWORD_DATA = {
  currentPassword: "",
  newPassword: "",
  confirmPassword: "",
};
