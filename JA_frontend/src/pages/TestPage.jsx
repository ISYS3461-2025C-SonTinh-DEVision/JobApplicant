import React, { useEffect, useState } from "react";

/* ===== Reusable Components ===== */
import {
  Button,
  Input,
  Card,
  Tag,
  Table,
  Modal,
} from "../components/reusable";

import HeadlessTable from "../components/headless/HeadlessTable";

/* ===== Mock API ===== */
import { mockApiClient } from "../services/mockApiClient";

/* ===== Auth Validators ===== */
import {
  validateEmail,
  validatePassword,
  validatePhone,
} from "../utils/validators/authValidators";

/* ===== Inline Test Component for Auth Fields ===== */
function AuthValidatorDemo() {
  const [form, setForm] = useState({
    email: "",
    password: "",
    phone: "",
  });

  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = {};

    const emailErr = validateEmail(form.email);
    if (emailErr.length) newErrors.email = emailErr[0].message;

    const pwErr = validatePassword(form.password);
    if (pwErr.length) newErrors.password = pwErr[0].message;

    if (form.phone) {
      const phoneErr = validatePhone(form.phone);
      if (phoneErr.length) newErrors.phone = phoneErr[0].message;
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      alert("All validators passed.");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
      <Input
        label="Email"
        name="email"
        value={form.email}
        onChange={handleChange}
        placeholder="example@email.com"
        error={errors.email}
        required
      />
      <Input
        label="Password"
        name="password"
        type="password"
        value={form.password}
        onChange={handleChange}
        placeholder="••••••••"
        error={errors.password}
        required
      />
      <Input
        label="Phone (optional)"
        name="phone"
        value={form.phone}
        onChange={handleChange}
        placeholder="+84..."
        error={errors.phone}
        required
      />
      <Button type="submit" label="Validate" />
    </form>
  );
}

export default function TestPage() {
  const [modalOpen, setModalOpen] = useState(false);
  const [inputValue, setInputValue] = useState("");

  const demoTableColumns = [
    { key: "name", label: "Name" },
    { key: "role", label: "Role" },
    { key: "status", label: "Status" },
  ];

  const demoTableData = [
    { name: "Alice Nguyen", role: "Frontend Dev", status: "Active" },
    { name: "Bob Tran", role: "Backend Dev", status: "Pending" },
    { name: "Charlie Pham", role: "Admin", status: "Suspended" },
  ];

  const [jobs, setJobs] = useState([]);
  const jobTable = HeadlessTable({ defaultSortKey: "title" });

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const res = await mockApiClient.get("/jobs");
        setJobs(res.data);
      } catch (err) {
        console.error("Failed to fetch jobs", err);
      }
    };

    fetchJobs();
  }, []);

  const sortedJobs = [...jobs].sort((a, b) => {
    const aVal = a[jobTable.sortKey];
    const bVal = b[jobTable.sortKey];

    if (aVal < bVal) return jobTable.direction === "asc" ? -1 : 1;
    if (aVal > bVal) return jobTable.direction === "asc" ? 1 : -1;
    return 0;
  });

  const jobColumns = [
    { key: "title", label: "Job Title" },
    { key: "company", label: "Company" },
    { key: "location", label: "Location" },
    { key: "employmentType", label: "Type" },
  ];

  return (
    <div className="p-6 space-y-10 bg-gray-50 min-h-screen">
      <h1 className="text-2xl font-bold text-gray-800">Test Page</h1>

      {/* ===== Buttons ===== */}
      <Card>
        <h2 className="font-semibold mb-4">Buttons</h2>
        <div className="flex flex-wrap gap-3">
          <Button label="Primary" />
          <Button variant="secondary" label="Secondary" />
          <Button variant="warning" label="Warning" />
          <Button variant="destructive" label="Destructive" />
          <Button variant="link" label="Link" />
          <Button disabled label="Disabled" />
        </div>
      </Card>

      {/* ===== Inputs ===== */}
      <Card>
        <h2 className="font-semibold mb-4">Input</h2>
        <div className="max-w-sm space-y-4">
          <Input
            label="Normal Input"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Type something…"
          />
          <Input
            label="Input with Error"
            value={inputValue}
            onChange={() => {}}
            error="This field is invalid"
          />
        </div>
      </Card>

      {/* ===== Tags ===== */}
      <Card>
        <h2 className="font-semibold mb-4">Tags</h2>
        <div className="flex gap-2 flex-wrap">
          <Tag label="React" />
          <Tag label="Spring Boot" variant="primary" />
          <Tag label="Premium" variant="success" />
          <Tag label="Warning" variant="warning" />
          <Tag label="Blocked" variant="danger" />
        </div>
      </Card>

      {/* ===== Basic Table ===== */}
      <Card>
        <h2 className="font-semibold mb-4">Basic Table</h2>
        <Table columns={demoTableColumns} data={demoTableData} />
      </Card>

      {/* ===== Modal ===== */}
      <Card>
        <h2 className="font-semibold mb-4">Modal</h2>
        <Button label="Open Modal" onClick={() => setModalOpen(true)} />
        {modalOpen && (
          <Modal
            title="Test Modal"
            onClose={() => setModalOpen(false)}
            footer={
              <>
                <Button
                  variant="secondary"
                  label="Cancel"
                  onClick={() => setModalOpen(false)}
                />
                <Button label="Confirm" />
              </>
            }
          >
            <p className="text-gray-700">This is a mock modal</p>
          </Modal>
        )}
      </Card>

      {/* ===== Job Table ===== */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold">Job Table (Mock API)</h2>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="secondary"
              label="Sort by Title"
              onClick={() => jobTable.toggleSort("title")}
            />
            <Button
              size="sm"
              variant="secondary"
              label="Sort by Company"
              onClick={() => jobTable.toggleSort("company")}
            />
          </div>
        </div>
        <Table columns={jobColumns} data={sortedJobs} />
        <p className="mt-2 text-xs text-gray-500">
          Sorted by <strong>{jobTable.sortKey}</strong> ({jobTable.direction})
        </p>
      </Card>

      {/* ===== Auth Validators Test ===== */}
      <Card>
        <h2 className="font-semibold mb-4">Auth Field Validators</h2>
        <AuthValidatorDemo />
      </Card>
    </div>
  );
}
