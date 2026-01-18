import { AiFillInfoCircle } from "react-icons/ai";
import { RiBillLine } from "react-icons/ri";
import {
  FiHome,
  FiCreditCard,
  FiPieChart,
  FiTarget,
  FiSettings,
} from "react-icons/fi";

export const mainNavItems = [
  { name: "dashboard", label: "Dashboard", icon: FiHome, href: "/dashboard" },
  {
    name: "transactions",
    label: "Transactions",
    icon: FiCreditCard,
    href: "/transactions",
  },
  {
    name: "budgets",
    label: "Budgets",
    icon: FiPieChart,
    href: "/budgets",
  },
  { name: "pots", label: "Pots", icon: FiTarget, href: "/pots" },
  {
    name: "recurringbills",
    label: "Recurring Bills",
    icon: RiBillLine,
    href: "/recurring-bills",
  },
];

export const bottomNavItems = [
  {
    name: "settings",
    label: "Settings",
    icon: FiSettings,
    href: "/settings",
  },
  {
    name: "about",
    label: "About",
    icon: AiFillInfoCircle,
    href: "/about",
  },
];
