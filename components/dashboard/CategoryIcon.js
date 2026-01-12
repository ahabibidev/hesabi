// components/dashboard/CategoryIcon.jsx
import {
  FiFilm,
  FiShoppingCart,
  FiCoffee,
  FiTruck,
  FiShoppingBag,
  FiFileText,
  FiHeart,
  FiActivity,
  FiBook,
  FiHome,
  FiZap,
  FiShield,
  FiRepeat,
  FiBriefcase,
  FiMonitor,
  FiTrendingUp,
  FiGift,
  FiRotateCcw,
  FiAward,
  FiMoreHorizontal,
  FiArrowLeft,
  FiCircle,
} from "react-icons/fi";

const iconMap = {
  film: FiFilm,
  "shopping-cart": FiShoppingCart,
  utensils: FiCoffee,
  car: FiTruck,
  "shopping-bag": FiShoppingBag,
  "file-text": FiFileText,
  heart: FiHeart,
  activity: FiActivity,
  book: FiBook,
  home: FiHome,
  zap: FiZap,
  shield: FiShield,
  repeat: FiRepeat,
  briefcase: FiBriefcase,
  laptop: FiMonitor,
  "trending-up": FiTrendingUp,
  gift: FiGift,
  "rotate-ccw": FiRotateCcw,
  award: FiAward,
  "more-horizontal": FiMoreHorizontal,
  "arrow-right-left": FiArrowLeft,
  default: FiCircle,
};

export default function CategoryIcon({ icon, className = "" }) {
  const IconComponent = iconMap[icon] || iconMap.default;
  return <IconComponent className={className} />;
}
