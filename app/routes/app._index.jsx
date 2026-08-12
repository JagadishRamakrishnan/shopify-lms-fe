import { authenticate } from "../shopify.server";
import { boundary } from "@shopify/shopify-app-react-router/server";
import { useLoaderData } from "react-router";
import dashboardStyles from "../styles/dashboard.css?url";
import { getDashboardStats } from "../api/dashboardApi.js";

import {
  FiBookOpen,
  FiUsers,
  FiLayers,
  FiCheckCircle,
  FiClock,
} from "react-icons/fi";

export const links = () => [
  {
    rel: "stylesheet",
    href: dashboardStyles,
  },
];

export const loader = async ({ request }) => {
  const { session } = await authenticate.admin(request);
  const stats = await getDashboardStats(session.shop);

  return {
    ...(stats || {
      totalCourses: 0,
      totalStudents: 0,
      totalEnrollments: 0,
      completedEnrollments: 0,
      activeEnrollments: 0,
      recentEnrollments: [],
    }),
    shopDomain: session.shop,
  };
};

function StatCard({ title, value, icon: Icon }) {
  return (
    <div className="rounded-xl bg-white p-5 shadow-[0_4px_20px_rgba(0,0,0,0.05)]">
      <div className="flex items-center justify-between">
        <span className="text-[15px] font-medium text-gray-600">{title}</span>
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#202020] text-white">
          <Icon size={17} />
        </div>
      </div>
      <p className="mt-3 text-2xl font-semibold text-[#242424]">{value}</p>
    </div>
  );
}

function formatDate(value) {
  if (!value) return "—";
  return new Date(value).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export default function Dashboard() {
  const data = useLoaderData();

  return (
    <main className="min-h-screen w-full bg-[#f6f6f7] px-5 py-7 sm:px-7 lg:px-9">
      <section className="mb-7">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-[#242424]">LMS Dashboard</h1>
            <p className="mt-1 text-sm text-gray-500">
              Manage your courses, students and enrollments for {data.shopDomain}.
            </p>
          </div>
        </div>
      </section>

      <section className="mb-7 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-5">
        <StatCard title="Total Courses" value={data.totalCourses ?? 0} icon={FiBookOpen} />
        <StatCard title="Total Students" value={data.totalStudents ?? 0} icon={FiUsers} />
        <StatCard title="Total Enrollments" value={data.totalEnrollments ?? 0} icon={FiLayers} />
        <StatCard title="Completed" value={data.completedEnrollments ?? 0} icon={FiCheckCircle} />
        <StatCard title="In Progress" value={data.activeEnrollments ?? 0} icon={FiClock} />
      </section>

      <section className="rounded-xl bg-white p-5 shadow-[0_4px_20px_rgba(0,0,0,0.05)]">
        <div className="mb-5">
          <h2 className="text-lg font-semibold text-[#242424]">Recently Enrolled Students</h2>
          <p className="mt-1 text-sm text-gray-500">Latest student enrollments in your courses.</p>
        </div>

        {(!data.recentEnrollments || data.recentEnrollments.length === 0) ? (
          <div className="flex min-h-[180px] items-center justify-center text-sm text-gray-500">
            No recent enrollments
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px]">
              <thead>
                <tr className="border-b border-gray-200 text-left">
                  <th className="px-4 py-3 text-sm font-medium text-gray-600">Student</th>
                  <th className="px-4 py-3 text-sm font-medium text-gray-600">Email</th>
                  <th className="px-4 py-3 text-sm font-medium text-gray-600">Course</th>
                  <th className="px-4 py-3 text-sm font-medium text-gray-600">Enrollment Date</th>
                  <th className="px-4 py-3 text-sm font-medium text-gray-600">Status</th>
                </tr>
              </thead>
              <tbody>
                {data.recentEnrollments.map((enrollment) => (
                  <tr key={enrollment.id} className="border-b border-gray-100">
                    <td className="px-4 py-4 text-sm font-medium text-gray-800">{enrollment.studentName}</td>
                    <td className="px-4 py-4 text-sm text-gray-500">{enrollment.studentEmail}</td>
                    <td className="px-4 py-4 text-sm text-gray-700">{enrollment.courseTitle}</td>
                    <td className="px-4 py-4 text-sm text-gray-500">{formatDate(enrollment.enrollmentDate)}</td>
                    <td className="px-4 py-4">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-medium ${
                          enrollment.status === "Completed"
                            ? "bg-green-100 text-green-700"
                            : "bg-yellow-100 text-yellow-700"
                        }`}
                      >
                        {enrollment.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  );
}

export const headers = (headersArgs) => {
  return boundary.headers(headersArgs);
};
