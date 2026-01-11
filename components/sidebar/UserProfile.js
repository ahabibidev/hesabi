import cat from "@/public/avatars/cat.png";
import Image from "next/image";

export default function UserProfile({
  isCollapsed,
  name = "John Doe",
  email = "john@example.com",
}) {
  return (
    <div className="p-6 border-b border-gray-700">
      <div
        className={`flex items-center ${
          isCollapsed ? "justify-center" : "space-x-3"
        }`}
      >
        <div className="relative">
          <Image src={cat} alt="user-image" width={45} height={45} />
        </div>
        {!isCollapsed && (
          <div className="flex-1 overflow-hidden">
            <h3 className="font-semibold truncate">{name}</h3>
            <p className="text-text text-sm truncate">{email}</p>
          </div>
        )}
      </div>
    </div>
  );
}
