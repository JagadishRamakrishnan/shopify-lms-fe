import { useEffect, useMemo, useState } from "react";
import { authenticate } from "../shopify.server";
import { boundary } from "@shopify/shopify-app-react-router/server";
import { useLoaderData } from "react-router";
import { listStudents, createStudent } from "../api/studentApi.js";

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

export default function Students() {
  const { shop } = useLoaderData();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "", email: "" });
  const [submitting, setSubmitting] = useState(false);

  const loadStudents = async () => {
    setLoading(true);
    setError("");
    try {
      const items = await listStudents(shop, search);
      setStudents(items);
      if (!selectedStudent && items.length > 0) {
        setSelectedStudent(items[0]);
      }
    } catch (err) {
      setError(err.message || "Unable to load students.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStudents();
  }, [shop, search]);

  const totalEnrollments = useMemo(
    () => students.reduce((sum, student) => sum + (student.enrolledCourseCount || 0), 0),
    [students]
  );

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!form.name || !form.email) {
      setError("Student name and email are required.");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      await createStudent(form, shop);
      setForm({ name: "", email: "" });
      setShowForm(false);
      await loadStudents();
    } catch (err) {
      setError(err.message || "Unable to create student.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen w-full bg-[#f6f6f7] px-5 py-7 sm:px-7 lg:px-9">
      <section className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-[#242424]">Students</h1>
          <p className="mt-1 text-sm text-gray-500">Track learners and their course activity.</p>
        </div>

        <button
          onClick={() => setShowForm(true)}
          className="rounded-xl bg-[#202020] px-5 py-3 text-sm font-medium text-white transition hover:bg-black"
        >
          Add student
        </button>
      </section>

      {showForm && (
        <section className="mb-6 rounded-xl bg-white p-5 shadow-[0_4px_20px_rgba(0,0,0,0.05)]">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-[#242424]">Add Student</h2>
            <button onClick={() => setShowForm(false)} className="text-sm text-gray-500 hover:text-gray-700">Close</button>
          </div>

          <form onSubmit={handleSubmit} className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">Student Name</label>
              <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="h-11 w-full rounded-xl border border-gray-200 bg-white px-3 text-sm outline-none focus:border-gray-400" />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">Email</label>
              <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="h-11 w-full rounded-xl border border-gray-200 bg-white px-3 text-sm outline-none focus:border-gray-400" />
            </div>

            {error && <div className="md:col-span-2 text-sm text-red-600">{error}</div>}

            <div className="md:col-span-2 flex gap-3">
              <button type="submit" disabled={submitting} className="rounded-xl bg-[#202020] px-5 py-3 text-sm font-medium text-white disabled:opacity-60">
                {submitting ? "Saving..." : "Save student"}
              </button>
              <button type="button" onClick={() => setShowForm(false)} className="rounded-xl border border-gray-200 bg-white px-5 py-3 text-sm font-medium text-gray-700">
                Cancel
              </button>
            </div>
          </form>
        </section>
      )}

      <section className="mb-6 grid gap-5 lg:grid-cols-[1.6fr_1fr]">
        <div className="rounded-xl bg-white p-5 shadow-[0_4px_20px_rgba(0,0,0,0.05)]">
          <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-[#242424]">Student List</h2>
              <p className="mt-1 text-sm text-gray-500">{students.length} student(s) tracked</p>
            </div>

            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search students"
              className="h-11 rounded-xl border border-gray-200 bg-[#f9f9f9] px-3 text-sm outline-none focus:border-gray-300"
            />
          </div>

          {loading ? (
            <div className="flex min-h-[180px] items-center justify-center text-sm text-gray-500">Loading students...</div>
          ) : students.length === 0 ? (
            <div className="flex min-h-[180px] items-center justify-center text-sm text-gray-500">No students found.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[600px]">
                <thead>
                  <tr className="border-b border-gray-200 text-left">
                    <th className="px-4 py-3 text-sm font-medium text-gray-600">Name</th>
                    <th className="px-4 py-3 text-sm font-medium text-gray-600">Email</th>
                    <th className="px-4 py-3 text-sm font-medium text-gray-600">Enrollments</th>
                    <th className="px-4 py-3 text-sm font-medium text-gray-600">Joined</th>
                  </tr>
                </thead>
                <tbody>
                  {students.map((student) => (
                    <tr key={student._id} className={`cursor-pointer border-b border-gray-100 ${selectedStudent?._id === student._id ? "bg-gray-50" : ""}`} onClick={() => setSelectedStudent(student)}>
                      <td className="px-4 py-4 text-sm font-medium text-gray-800">{student.name}</td>
                      <td className="px-4 py-4 text-sm text-gray-500">{student.email}</td>
                      <td className="px-4 py-4 text-sm text-gray-700">{student.enrolledCourseCount || 0}</td>
                      <td className="px-4 py-4 text-sm text-gray-500">{formatDate(student.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <aside className="rounded-xl bg-white p-5 shadow-[0_4px_20px_rgba(0,0,0,0.05)]">
          <h2 className="text-lg font-semibold text-[#242424]">Student Details</h2>

          {selectedStudent ? (
            <div className="mt-5 space-y-5">
              <div>
                <p className="text-sm text-gray-500">Student</p>
                <h3 className="mt-1 text-xl font-semibold text-[#242424]">{selectedStudent.name}</h3>
                <p className="mt-1 text-sm text-gray-500">{selectedStudent.email}</p>
              </div>

              <div className="grid grid-cols-2 gap-3 rounded-xl bg-[#f8f8f8] p-3">
                <div>
                  <p className="text-xs uppercase tracking-wide text-gray-500">Enrollments</p>
                  <p className="mt-1 text-xl font-semibold text-[#242424]">{selectedStudent.enrolledCourseCount || 0}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wide text-gray-500">Total</p>
                  <p className="mt-1 text-xl font-semibold text-[#242424]">{totalEnrollments}</p>
                </div>
              </div>

              <div>
                <p className="mb-2 text-sm font-medium text-gray-700">Course Activity</p>
                {(!selectedStudent.enrollments || selectedStudent.enrollments.length === 0) ? (
                  <div className="rounded-xl border border-dashed border-gray-200 p-4 text-sm text-gray-500">No enrollments yet.</div>
                ) : (
                  <div className="space-y-3">
                    {selectedStudent.enrollments.map((entry) => (
                      <div key={entry._id} className="rounded-xl border border-gray-200 p-3">
                        <div className="flex items-center justify-between gap-3">
                          <p className="font-medium text-gray-800">{entry.courseTitle}</p>
                          <span className={`rounded-full px-2 py-1 text-[10px] font-medium ${entry.status === "Completed" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}>
                            {entry.status}
                          </span>
                        </div>
                        <p className="mt-2 text-xs text-gray-500">{formatDate(entry.enrollmentDate)}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="mt-5 text-sm text-gray-500">Select a student to view details.</div>
          )}
        </aside>
      </section>
    </main>
  );
}

export const headers = (headersArgs) => {
  return boundary.headers(headersArgs);
};
