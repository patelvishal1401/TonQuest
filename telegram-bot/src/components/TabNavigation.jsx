import { ListTodo, PlusCircle, Settings as SettingsIcon } from "lucide-react";
import { Link } from "react-router";

const TabNavigation = ({ activeTab, onChange }) => {
  const tabs = [
    { id: "view", label: "View Tasks", icon: ListTodo },
    { id: "create", label: "Create Task", icon: PlusCircle },
    { id: "settings", label: "Settings", icon: SettingsIcon },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 border-t border-neutral-200 bg-white/80 backdrop-blur-xl">
      <div className="mx-auto max-w-screen-xl">
        <nav className="flex justify-around items-center h-16">
          {tabs.map(({ id, label, icon: Icon }) => (
            <Link
              to={`/${id}`}
              key={id}
              className={`flex flex-col items-center justify-center w-full h-full gap-1 transition-colors ${
                activeTab === id
                  ? "text-purple-600"
                  : "text-neutral-600 hover:text-purple-600"
              }`}
            >
              <Icon className="h-5 w-5" />
              <span className="text-xs font-medium">{label}</span>
            </Link>
          ))}
        </nav>
      </div>
    </div>
  );
};

export default TabNavigation;