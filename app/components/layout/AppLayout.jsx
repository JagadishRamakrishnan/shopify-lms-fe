import { useState } from "react";
import { Outlet } from "react-router";

import Sidebar from "./Sidebar";
import Header from "./Header";

export default function AppLayout() {
    const [mobileOpen, setMobileOpen] = useState(false);

    return (
        <div className="min-h-screen bg-white text-[#202020]">
            <Sidebar
                mobileOpen={mobileOpen}
                setMobileOpen={setMobileOpen}
            />

            <div className="min-h-screen lg:ml-[225px]">
                <Header setMobileOpen={setMobileOpen} />

                <main className="min-h-[calc(100vh-88px)] bg-[#ffffff] px-5 py-6 lg:px-9 lg:py-8">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}