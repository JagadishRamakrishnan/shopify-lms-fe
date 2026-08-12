import { NavLink } from "react-router";
import {
    LayoutDashboard,
    BookOpen,
    Users,
    ClipboardList,
    BarChart3,
    Trophy,
    Award,
    FolderKanban,
    Download,
    X,
} from "lucide-react";

const menuItems = [
    {
        label: "Dashboard",
        to: "/app",
        icon: LayoutDashboard,
        end: true,
    },
    {
        label: "Courses",
        to: "/app/courses",
        icon: BookOpen,
    },
    {
        label: "Students",
        to: "/app/students",
        icon: Users,
    },
    {
        label: "Enrollments",
        to: "/app/enrollments",
        icon: ClipboardList,
    },
];

export default function Sidebar({ mobileOpen, setMobileOpen }) {
    return (
        <>
            {/* Mobile overlay */}
            {mobileOpen && (
                <div
                    className="fixed inset-0 z-40 bg-black/30 lg:hidden"
                    onClick={() => setMobileOpen(false)}
                />
            )}

            <aside
                className={`
                    fixed left-0 top-0 z-50
                    flex h-screen w-[225px] flex-col
                    border-r border-gray-100 bg-white
                    transition-transform duration-300
                    lg:translate-x-0
                    ${mobileOpen ? "translate-x-0" : "-translate-x-full"}
                `}
            >
                {/* Logo */}
                <div className="flex h-[110px] items-center px-5">
                    <div className="flex items-center gap-3">
                        <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-gray-100">
                            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#202020] text-white">
                                <span className="text-lg font-bold">S</span>
                            </div>
                        </div>

                        <span className="text-[27px] font-semibold tracking-tight text-[#202020]">
                            SkillUp
                        </span>
                    </div>

                    {/* Mobile close */}
                    <button
                        onClick={() => setMobileOpen(false)}
                        className="ml-auto rounded-lg p-2 text-gray-500 hover:bg-gray-100 lg:hidden"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Navigation */}
                <nav className="flex-1 overflow-y-auto px-5 py-3">
                    <div className="space-y-1">
                        {menuItems.map((item) => {
                            const Icon = item.icon;

                            return (
                                <NavLink
                                    key={item.label}
                                    to={item.to}
                                    end={item.end}
                                    onClick={() => setMobileOpen(false)}
                                    className={({ isActive }) => `
                                        group flex h-[42px] items-center gap-3
                                        rounded-md px-3
                                        text-[14px] font-medium
                                        transition-all
                                        ${
                                            isActive
                                                ? "bg-[#e9e9e9] text-[#202020]"
                                                : "text-[#333] hover:bg-gray-100"
                                        }
                                    `}
                                >
                                    <Icon
                                        size={19}
                                        strokeWidth={1.8}
                                        className="shrink-0"
                                    />

                                    <span>{item.label}</span>
                                </NavLink>
                            );
                        })}
                    </div>
                </nav>      
            </aside>
        </>
    );
}