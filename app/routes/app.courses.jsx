import { useEffect, useMemo, useState } from "react";
import { authenticate } from "../shopify.server";
import { boundary } from "@shopify/shopify-app-react-router/server";
import { useLoaderData } from "react-router";
import { listCourses, createCourse, updateCourse, deleteCourse } from "../api/courseApi.js";

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

export default function Courses() {
  const { shop } = useLoaderData();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [showForm, setShowForm] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
  const [form, setForm] = useState({
    title: "",
    description: "",
    instructorName: "",
    category: "",
    duration: "",
    status: "Active",
  });
  const [submitting, setSubmitting] = useState(false);

  const loadCourses = async () => {
    setLoading(true);
    setError("");
    try {
      const items = await listCourses(shop, { search, status: statusFilter === "All" ? "" : statusFilter });
      setCourses(items);
    } catch (err) {
      setError(err.message || "Unable to load courses.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCourses();
  }, [shop, search, statusFilter]);

  const filteredCount = useMemo(() => courses.length, [courses]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const resetForm = () => {
    setForm({
      title: "",
      description: "",
      instructorName: "",
      category: "",
      duration: "",
      status: "Active",
    });
    setEditingCourse(null);
    setShowForm(false);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!form.title || !form.description || !form.instructorName || !form.category || !form.duration) {
      setError("All course fields are required.");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      if (editingCourse) {
        await updateCourse(editingCourse._id, form, shop);
      } else {
        await createCourse(form, shop);
      }
      resetForm();
      await loadCourses();
    } catch (err) {
      setError(err.message || "Unable to save course.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (course) => {
    setEditingCourse(course);
    setForm({
      title: course.title,
      description: course.description,
      instructorName: course.instructorName,
      category: course.category,
      duration: course.duration,
      status: course.status,
    });
    setShowForm(true);
  };

  const handleDelete = async (courseId) => {
    if (!window.confirm("Are you sure you want to delete this course?")) return;

    try {
      await deleteCourse(courseId, shop);
      await loadCourses();
    } catch (err) {
      setError(err.message || "Unable to delete course.");
    }
  };

  return (
    <main className="min-h-screen w-full bg-[#f6f6f7] px-5 py-7 sm:px-7 lg:px-9">
      <section className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-[#242424]">Courses</h1>
          <p className="mt-1 text-sm text-gray-500">Manage your LMS course catalog.</p>
        </div>

        <button
          onClick={() => {
            resetForm();
            setShowForm(true);
          }}
          className="rounded-xl bg-[#202020] px-5 py-3 text-sm font-medium text-white transition hover:bg-black"
        >
          Create course
        </button>
      </section>

      {showForm && (
        <section className="mb-6 rounded-xl bg-white p-5 shadow-[0_4px_20px_rgba(0,0,0,0.05)]">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-[#242424]">{editingCourse ? "Edit Course" : "Create Course"}</h2>
            <button onClick={resetForm} className="text-sm text-gray-500 hover:text-gray-700">Close</button>
          </div>

          <form onSubmit={handleSubmit} className="grid gap-4 md:grid-cols-2">
            <div className="md:col-span-2">
              <label className="mb-2 block text-sm font-medium text-gray-700">Course Title</label>
              <input name="title" value={form.title} onChange={handleChange} className="h-11 w-full rounded-xl border border-gray-200 bg-white px-3 text-sm outline-none focus:border-gray-400" />
            </div>

            <div className="md:col-span-2">
              <label className="mb-2 block text-sm font-medium text-gray-700">Description</label>
              <textarea name="description" value={form.description} onChange={handleChange} rows="4" className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:border-gray-400" />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">Instructor Name</label>
              <input name="instructorName" value={form.instructorName} onChange={handleChange} className="h-11 w-full rounded-xl border border-gray-200 bg-white px-3 text-sm outline-none focus:border-gray-400" />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">Category</label>
              <input name="category" value={form.category} onChange={handleChange} className="h-11 w-full rounded-xl border border-gray-200 bg-white px-3 text-sm outline-none focus:border-gray-400" />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">Duration</label>
              <input name="duration" value={form.duration} onChange={handleChange} placeholder="e.g. 4 weeks" className="h-11 w-full rounded-xl border border-gray-200 bg-white px-3 text-sm outline-none focus:border-gray-400" />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">Status</label>
              <select name="status" value={form.status} onChange={handleChange} className="h-11 w-full rounded-xl border border-gray-200 bg-white px-3 text-sm outline-none focus:border-gray-400">
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>

            {error && <div className="md:col-span-2 text-sm text-red-600">{error}</div>}

            <div className="md:col-span-2 flex gap-3">
              <button type="submit" disabled={submitting} className="rounded-xl bg-[#202020] px-5 py-3 text-sm font-medium text-white disabled:opacity-60">
                {submitting ? "Saving..." : editingCourse ? "Update course" : "Create course"}
              </button>
              <button type="button" onClick={resetForm} className="rounded-xl border border-gray-200 bg-white px-5 py-3 text-sm font-medium text-gray-700">
                Cancel
              </button>
            </div>
          </form>
        </section>
      )}

      <section className="rounded-xl bg-white p-5 shadow-[0_4px_20px_rgba(0,0,0,0.05)]">
        <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-[#242424]">All Courses</h2>
            <p className="mt-1 text-sm text-gray-500">{filteredCount} course(s) found</p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search courses"
              className="h-11 rounded-xl border border-gray-200 bg-[#f9f9f9] px-3 text-sm outline-none focus:border-gray-300"
            />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="h-11 rounded-xl border border-gray-200 bg-[#f9f9f9] px-3 text-sm outline-none focus:border-gray-300"
            >
              <option value="All">All Status</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="flex min-h-[180px] items-center justify-center text-sm text-gray-500">Loading courses...</div>
        ) : courses.length === 0 ? (
          <div className="flex min-h-[180px] items-center justify-center text-sm text-gray-500">No courses available for this shop.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[850px]">
              <thead>
                <tr className="border-b border-gray-200 text-left">
                  <th className="px-4 py-3 text-sm font-medium text-gray-600">Title</th>
                  <th className="px-4 py-3 text-sm font-medium text-gray-600">Instructor</th>
                  <th className="px-4 py-3 text-sm font-medium text-gray-600">Category</th>
                  <th className="px-4 py-3 text-sm font-medium text-gray-600">Duration</th>
                  <th className="px-4 py-3 text-sm font-medium text-gray-600">Status</th>
                  <th className="px-4 py-3 text-sm font-medium text-gray-600">Created</th>
                  <th className="px-4 py-3 text-sm font-medium text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody>
                {courses.map((course) => (
                  <tr key={course._id} className="border-b border-gray-100 align-top">
                    <td className="px-4 py-4">
                      <div className="font-medium text-gray-800">{course.title}</div>
                      <div className="mt-1 text-xs text-gray-500">{course.description}</div>
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-700">{course.instructorName}</td>
                    <td className="px-4 py-4 text-sm text-gray-700">{course.category}</td>
                    <td className="px-4 py-4 text-sm text-gray-700">{course.duration}</td>
                    <td className="px-4 py-4">
                      <span className={`rounded-full px-3 py-1 text-xs font-medium ${course.status === "Active" ? "bg-green-100 text-green-700" : "bg-gray-200 text-gray-700"}`}>
                        {course.status}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-500">{formatDate(course.createdAt)}</td>
                    <td className="px-4 py-4">
                      <div className="flex gap-2">
                        <button onClick={() => handleEdit(course)} className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-700">Edit</button>
                        <button onClick={() => handleDelete(course._id)} className="rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-medium text-red-600">Delete</button>
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