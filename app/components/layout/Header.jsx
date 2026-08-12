import { Menu, Search } from "lucide-react";
import { NavLink } from "react-router";

export default function Header({ setMobileOpen }) {
    return (
        <header className="sticky top-0 z-30 flex h-[88px] items-center border-b border-gray-100 bg-white/95 px-5 backdrop-blur lg:px-9">
            {/* Mobile menu */}
            <button
                onClick={() => setMobileOpen(true)}
                className="mr-4 rounded-lg p-2 hover:bg-gray-100 lg:hidden"
            >
                <Menu size={23} />
            </button>

            {/* Desktop navigation */}
            {/* <nav className="hidden items-center gap-8 lg:flex">
                <NavLink
                    to="/app"
                    className="text-[15px] font-medium text-[#292929] hover:text-black"
                >
                    Dashboard
                </NavLink>

                <NavLink
                    to="/app/courses"
                    className="text-[15px] font-medium text-[#292929] hover:text-black"
                >
                    Courses
                </NavLink>

                <NavLink
                    to="/app/students"
                    className="text-[15px] font-medium text-[#292929] hover:text-black"
                >
                    Students
                </NavLink>

                <NavLink
                    to="/app/enrollments"
                    className="text-[15px] font-medium text-[#292929] hover:text-black"
                >
                    Enrollments
                </NavLink>
            </nav> */}

            {/* Mobile title */}
            <div className="font-semibold text-lg lg:hidden">
                SkillUp
            </div>

            <div className="ml-auto flex items-center gap-4">
                {/* Search */}
                <div className="relative hidden sm:block">
                    <Search
                        size={21}
                        className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600"
                    />

                    <input
                        type="text"
                        placeholder="search.."
                        className="h-[48px] w-[260px] rounded-xl border-0 bg-[#eeeeee] pl-12 pr-4 text-sm outline-none placeholder:text-gray-500 focus:ring-2 focus:ring-gray-300"
                    />
                </div>

                {/* Sign In */}
                {/* <button className="rounded-xl bg-[#202020] px-6 py-3 text-sm font-medium text-white transition hover:bg-black">
                    Sign In
                </button> */}
            </div>
        </header>
    );
}