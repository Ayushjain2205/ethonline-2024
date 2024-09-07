import { useRouter } from "next/router";
import Link from "next/link";
import { BarChart2, ActivitySquare, Tv } from "lucide-react";

const BottomBar = () => {
  const router = useRouter();

  const menuItems = [
    { name: "Markets", path: "/markets", icon: BarChart2 },
    { name: "Live", path: "/live", icon: Tv },
    { name: "Create", path: "/create-market", icon: ActivitySquare },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-purple-600 py-2 flex justify-around items-center z-50">
      {menuItems.map((item) => (
        <Link
          key={item.name}
          href={item.path}
          className={`flex flex-col items-center  ${
            router.pathname === item.path
              ? "text-orange-400"
              : "text-yellow-300"
          }`}
        >
          <item.icon className="h-6 w-6 mb-1" />
          <span className="text-xs">{item.name}</span>
        </Link>
      ))}
    </div>
  );
};

export default BottomBar;
