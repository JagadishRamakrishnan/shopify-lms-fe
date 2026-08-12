import { useEffect, useState } from "react";
import { authenticate } from "../shopify.server";
import { boundary } from "@shopify/shopify-app-react-router/server";
import { useLoaderData } from "react-router";
import { listEnrollments, createEnrollment, updateEnrollment, deleteEnrollment } from "../api/enrollmentApi.js";
import { listStudents } from "../api/studentApi.js";
import { listCourses } from "../api/courseApi.js";

export const loader = async ({ request }) => {
  const { session } = await authenticate.admin(request);
  return { shop: session.shop };
};

function formatDate(value) {
  if (!value) return "—";
  return new Date(value).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export default function Enrollments() {
  const { shop } = useLoaderData();
  const [enrollments, setEnrollments] = useState([]);
  const [students, setStudents] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ studentId: "", courseId: "", enrollmentDate: new Date().toISOString().slice(0, 10), status: "In Progress" });
  const [submitting, setSubmitting] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const [items, studentItems, courseItems] = await Promise.all([
        listEnrollments(shop, { search, status: statusFilter === "All" ? "" : statusFilter }),
        listStudents(shop),
        listCourses(shop),
      ]);

      setEnrollments(items);
      setStudents(studentItems);
      setCourses(courseItems);
      setError("");
    } catch (err) {
      setError(err.message || "Unable to load enrollment data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [shop, search, statusFilter]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!form.studentId || !form.courseId) {
      setError("Student and course are required.");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      await createEnrollment(form, shop);
      setShowForm(false);
      setForm({ studentId: "", courseId: "", enrollmentDate: new Date().toISOString().slice(0, 10), status: "In Progress" });
      await loadData();
    } catch (err) {
      setError(err.message || "Unable to create enrollment.");
    } finally {
      setSubmitting(false);
    }
  };

  const updateStatus = async (id, status) => {
    try {
      await updateEnrollment(id, { status }, shop);
      await loadData();
    } catch (err) {
      setError(err.message || "Unable to update enrollment status.");
    }
  };

  const removeEnrollment = async (id) => {
    if (!window.confirm("Delete this enrollment?")) return;

    try {
      await deleteEnrollment(id, shop);
      await loadData();
    } catch (err) {
      setError(err.message || "Unable to delete enrollment.");
    }
  };

  return (
    <main className="min-h-screen w-full bg-[#f6f6f7] px-5 py-7 sm:px-7 lg:px-9">
      <section className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-[#242424]">Enrollments</h1>
          <p className="mt-1 text-sm text-gray-500">Manage student enrollment activity.</p>
        </div>

        <button
          onClick={() => setShowForm(true)}
          className="rounded-xl bg-[#202020] px-5 py-3 text-sm font-medium text-white transition hover:bg-black"
        >
          Enroll student
        </button>
      </section>

      {showForm && (
        <section className="mb-6 rounded-xl bg-white p-5 shadow-[0_4px_20px_rgba(0,0,0,0.05)]">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-[#242424]">Enroll Student</h2>
            <button onClick={() => setShowForm(false)} className="text-sm text-gray-500 hover:text-gray-700">Close</button>
          </div>

          <form onSubmit={handleSubmit} className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">Student</label>
              <select value={form.studentId} onChange={(e) => setForm({ ...form, studentId: e.target.value })} className="h-11 w-full rounded-xl border border-gray-200 bg-white px-3 text-sm outline-none focus:border-gray-400">
                <option value="">Select student</option>
                {students.map((student) => (
                  <option key={student._id} value={student._id}>{student.name} ({student.email})</option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">Course</label>
              <select value={form.courseId} onChange={(e) => setForm({ ...form, courseId: e.target.value })} className="h-11 w-full rounded-xl border border-gray-200 bg-white px-3 text-sm outline-none focus:border-gray-400">
                <option value="">Select course</option>
                {courses.map((course) => (
                  <option key={course._id} value={course._id}>{course.title}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">Enrollment Date</label>
              <input type="date" value={form.enrollmentDate} onChange={(e) => setForm({ ...form, enrollmentDate: e.target.value })} className="h-11 w-full rounded-xl border border-gray-200 bg-white px-3 text-sm outline-none focus:border-gray-400" />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">Status</label>
              <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className="h-11 w-full rounded-xl border border-gray-200 bg-white px-3 text-sm outline-none focus:border-gray-400">
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed</option>
              </select>
            </div>

            {error && <div className="md:col-span-2 text-sm text-red-600">{error}</div>}

            <div className="md:col-span-2 flex gap-3">
              <button type="submit" disabled={submitting} className="rounded-xl bg-[#202020] px-5 py-3 text-sm font-medium text-white disabled:opacity-60">
                {submitting ? "Saving..." : "Enroll student"}
              </button>
              <button type="button" onClick={() => setShowForm(false)} className="rounded-xl border border-gray-200 bg-white px-5 py-3 text-sm font-medium text-gray-700">
                Cancel
              </button>
            </div>
          </form>
        </section>
      )}

      <section className="rounded-xl bg-white p-5 shadow-[0_4px_20px_rgba(0,0,0,0.05)]">
        <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-[#242424]">Enrollment List</h2>
            <p className="mt-1 text-sm text-gray-500">{enrollments.length} enrollment(s)</p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search enrollments"
              className="h-11 rounded-xl border border-gray-200 bg-[#f9f9f9] px-3 text-sm outline-none focus:border-gray-300"
            />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="h-11 rounded-xl border border-gray-200 bg-[#f9f9f9] px-3 text-sm outline-none focus:border-gray-300"
            >
              <option value="All">All Status</option>
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="flex min-h-[180px] items-center justify-center text-sm text-gray-500">Loading enrollments...</div>
        ) : enrollments.length === 0 ? (
          <div className="flex min-h-[180px] items-center justify-center text-sm text-gray-500">No enrollments yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px]">
              <thead>
                <tr className="border-b border-gray-200 text-left">
                  <th className="px-4 py-3 text-sm font-medium text-gray-600">Student</th>
                  <th className="px-4 py-3 text-sm font-medium text-gray-600">Email</th>
                  <th className="px-4 py-3 text-sm font-medium text-gray-600">Course</th>
                  <th className="px-4 py-3 text-sm font-medium text-gray-600">Date</th>
                  <th className="px-4 py-3 text-sm font-medium text-gray-600">Status</th>
                  <th className="px-4 py-3 text-sm font-medium text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody>
                {enrollments.map((enrollment) => (
                  <tr key={enrollment._id} className="border-b border-gray-100">
                    <td className="px-4 py-4 text-sm font-medium text-gray-800">{enrollment.studentId?.name || "Student"}</td>
                    <td className="px-4 py-4 text-sm text-gray-500">{enrollment.studentId?.email || "—"}</td>
                    <td className="px-4 py-4 text-sm text-gray-700">{enrollment.courseId?.title || "Course"}</td>
                    <td className="px-4 py-4 text-sm text-gray-500">{formatDate(enrollment.enrollmentDate)}</td>
                    <td className="px-4 py-4">
                      <span className={`rounded-full px-3 py-1 text-xs font-medium ${enrollment.status === "Completed" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}>
                        {enrollment.status}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex gap-2">
                        <button onClick={() => updateStatus(enrollment._id, enrollment.status === "Completed" ? "In Progress" : "Completed")} className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-700">
                          Toggle status
                        </button>
                        <button onClick={() => removeEnrollment(enrollment._id)} className="rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-medium text-red-600">
                          Delete
                        </button>
                      </div>
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
