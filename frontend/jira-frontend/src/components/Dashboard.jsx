import { useEffect, useState } from "react";
import axios from "axios";
import { useParams, Link } from "react-router-dom";
 
export default function Dashboard() {
 
  const { projectKey } = useParams();
 
  const [project, setProject] = useState(null);
  const [data, setData] = useState(null);
  const [showOpenModal, setShowOpenModal] = useState(false);
  const [showUnassignedModal, setShowUnassignedModal] = useState(false);
  const [selectedSprint, setSelectedSprint] = useState("All");

  const parseSprintValue = (value) => {
    if (!value) return null;
    if (typeof value === "string") {
      // Jira may encode sprint metadata as a string in some cases
      const match = value.match(/name=([^,]+)/);
      if (match) return match[1];
      return value;
    }
    if (Array.isArray(value) && value.length > 0) {
      return parseSprintValue(value[0]);
    }
    if (typeof value === "object") {
      return value.name || value.displayName || null;
    }
    return null;
  };

  const getSprintName = (issue) => {
    if (issue.sprint) return parseSprintValue(issue.sprint);
    if (issue.fields?.sprint) return parseSprintValue(issue.fields.sprint);
    if (issue.fields?.customfield_10020) {
      return parseSprintValue(issue.fields.customfield_10020);
    }
    if (issue.customfield_10020) {
      return parseSprintValue(issue.customfield_10020);
    }
    return null;
  };

  const sprintNames = Array.from(
    new Set(
      (data?.issues || [])
        .map((issue) => getSprintName(issue))
        .filter(Boolean)
    )
  );

  useEffect(() => {
    if (data?.issues) {
      console.log("Sprint names:", sprintNames);
      console.log(
        "Issue sprint raw values:",
        data.issues.map((issue) => ({
          key: issue.key,
          sprint: issue.sprint,
          fieldsSprint: issue.fields?.sprint,
          customfield10020: issue.fields?.customfield_10020,
          sprintName: getSprintName(issue)
        }))
      );
    }
  }, [data?.issues, sprintNames]);

  const filteredIssues =
    selectedSprint === "All"
      ? data?.issues || []
      : (data?.issues || []).filter(
          (issue) => getSprintName(issue) === selectedSprint
        );

  useEffect(() => {
    axios.get(`http://localhost:3000/api/jira-data/project/${projectKey}/intelligence`)
      .then((res) => {
        setData(res.data);
      });
  }, [projectKey]);
 
  useEffect(() => {
 
    axios
      .get(
        `http://localhost:3000/api/jira-data/project/${projectKey}`
      )
      .then((res) => {
        setProject(res.data);
      })
      .catch((err) => {
        console.error(err);
      });
 
  }, [projectKey]);
 
  if (!data || !data.metrics) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white">
        Loading Metrices...
      </div>
    );
  }
 
  if (!project) {
    return (
      <div className="min-h-screen bg-[#030712] text-white flex justify-center items-center">
        Loading Project...
      </div>
    );
  }

  const openIssues = filteredIssues.filter((issue) => {
    const status = String(issue.status || "").toLowerCase();
    return status === "open" || status === "to do" || status === "todo";
  });

  const unassignedIssues = filteredIssues.filter(
    (issue) => !issue.assignee || issue.assignee === "Unassigned"
  );
 
  return (
    <>
    <div className="min-h-screen bg-[#030712] text-white p-4 md:p-8">
  {/* Back Button */}
  <Link
    to="/dashboard"
    className="inline-flex items-center gap-2 text-blue-400 hover:text-blue-300 transition-colors mb-6"
  >
    ← Back to Dashboard
  </Link>

  {/* Hero Section */}
  <div className="bg-gradient-to-br from-[#081120] via-[#0d1728] to-[#111c31] rounded-3xl p-8 border border-[#1b2d4a] shadow-2xl shadow-blue-950/20">
    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
      <div>
        <h1 className="text-4xl md:text-5xl font-bold text-white">
          {project.name}
        </h1>

        <p className="text-gray-400 mt-3">
          Project Key:
          <span className="ml-2 px-3 py-1 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400">
            {project.key}
          </span>
        </p>
      </div>

      <div className="flex items-center justify-center w-20 h-20 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-3xl">
        🚀
      </div>
    </div>
  </div>

  {/* Content */}
  <div className="grid lg:grid-cols-2 gap-6 mt-8">

    {/* Project Information */}
    <div className="bg-gradient-to-br from-[#081120] to-[#111c31] p-6 rounded-2xl border border-[#1b2d4a] shadow-lg">
      <h2 className="text-2xl font-bold mb-6 text-white">
        Project Information
      </h2>

      <div className="space-y-4">

        <div className="flex justify-between items-center border-b border-[#1b2d4a] pb-3">
          <span className="text-gray-400">
            Project ID
          </span>
          <span className="font-medium text-white">
            {project.id}
          </span>
        </div>

        <div className="flex justify-between items-center border-b border-[#1b2d4a] pb-3">
          <span className="text-gray-400">
            Type
          </span>
          <span className="px-3 py-1 rounded-lg bg-cyan-500/10 text-cyan-400">
            {project.projectType}
          </span>
        </div>

        <div className="flex justify-between items-center border-b border-[#1b2d4a] pb-3">
          <span className="text-gray-400">
            Lead
          </span>
          <span className="text-white">
            {project.projectLead}
          </span>
        </div>

        <div className="flex justify-between items-center border-b border-[#1b2d4a] pb-3">
          <span className="text-gray-400">
            Private
          </span>
          <span
            className={`px-3 py-1 rounded-full text-sm ${
              project.isPrivate
                ? "bg-green-500/10 text-green-400 border border-green-500/20"
                : "bg-gray-500/10 text-gray-300 border border-gray-500/20"
            }`}
          >
            {String(project.isPrivate)}
          </span>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-gray-400">
            Simplified
          </span>
          <span
            className={`px-3 py-1 rounded-full text-sm ${
              project.simplified
                ? "bg-blue-500/10 text-blue-400 border border-blue-500/20"
                : "bg-gray-500/10 text-gray-300 border border-gray-500/20"
            }`}
          >
            {String(project.simplified)}
          </span>
        </div>

      </div>
    </div>

    {/* Description */}
    <div className="bg-gradient-to-br from-[#081120] to-[#111c31] p-6 rounded-2xl border border-[#1b2d4a] shadow-lg">
      <h2 className="text-2xl font-bold mb-6 text-white">
        Description
      </h2>

      <div className="bg-[#101827]/70 border border-[#223556] rounded-xl p-5 min-h-[220px]">
        <p className="text-gray-300 leading-8 whitespace-pre-line">
          {project.description || "No description available"}
        </p>
      </div>
    </div>

  </div>
</div>
 
    <div className="min-h-screen bg-[#030712] text-white p-8">
 
<h1 className="text-4xl font-bold mb-8">
 
Project Intelligence
 
</h1>
<div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6 gap-6">

  {/* Total Tickets */}
  <div className="group bg-gradient-to-br from-[#081120] to-[#111c31] p-6 rounded-2xl border border-[#1b2d4a] hover:border-cyan-500/40 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-cyan-500/10">
    <div className="flex items-center justify-between">
      <h3 className="text-gray-400 text-sm uppercase tracking-wider">
        Total Tickets
      </h3>
      <span className="text-2xl">🎟️</span>
    </div>

    <div className="text-4xl font-bold mt-4 text-white">
      {data.metrics.totalTickets}
    </div>
  </div>

  {/* Open */}
  <div
    className="group bg-gradient-to-br from-[#081120] to-[#111c31] p-6 rounded-2xl cursor-pointer border border-[#1b2d4a] hover:border-yellow-400 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-yellow-500/20"
    onClick={() => setShowOpenModal(true)}
  >
    <div className="flex items-center justify-between">
      <h3 className="text-gray-400 text-sm uppercase tracking-wider">
        Open
      </h3>
      <span className="text-2xl">🟡</span>
    </div>

    <div className="text-4xl font-bold mt-4 text-yellow-400">
      {data.metrics.openTickets}
    </div>

    <p className="mt-3 text-xs text-gray-500 group-hover:text-yellow-300 transition">
      Click to view open / to do issues
    </p>
  </div>

  {/* Completed */}
  <div className="group bg-gradient-to-br from-[#081120] to-[#111c31] p-6 rounded-2xl border border-[#1b2d4a] hover:border-green-400/50 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-green-500/10">
    <div className="flex items-center justify-between">
      <h3 className="text-gray-400 text-sm uppercase tracking-wider">
        Completed
      </h3>
      <span className="text-2xl">✅</span>
    </div>

    <div className="text-4xl font-bold mt-4 text-green-400">
      {data.metrics.completedTickets}
    </div>
  </div>

  {/* In Progress */}
  <div className="group bg-gradient-to-br from-[#081120] to-[#111c31] p-6 rounded-2xl border border-[#1b2d4a] hover:border-blue-400/50 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-blue-500/10">
    <div className="flex items-center justify-between">
      <h3 className="text-gray-400 text-sm uppercase tracking-wider">
        In Progress
      </h3>
      <span className="text-2xl">🚀</span>
    </div>

    <div className="text-4xl font-bold mt-4 text-blue-400">
      {data.metrics.inProgressTickets}
    </div>
  </div>

  {/* In Review */}
  <div className="group bg-gradient-to-br from-[#081120] to-[#111c31] p-6 rounded-2xl border border-[#1b2d4a] hover:border-purple-400/50 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-purple-500/10">
    <div className="flex items-center justify-between">
      <h3 className="text-gray-400 text-sm uppercase tracking-wider">
        In Review
      </h3>
      <span className="text-2xl">👀</span>
    </div>

    <div className="text-4xl font-bold mt-4 text-purple-400">
      {data.metrics.inReviewTickets}
    </div>
  </div>

  {/* Unassigned */}
  <div
    className="group bg-gradient-to-br from-[#081120] to-[#111c31] p-6 rounded-2xl cursor-pointer border border-[#1b2d4a] hover:border-orange-400 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-orange-500/20"
    onClick={() => setShowUnassignedModal(true)}
  >
    <div className="flex items-center justify-between">
      <h3 className="text-gray-400 text-sm uppercase tracking-wider">
        Unassigned
      </h3>
      <span className="text-2xl">⚠️</span>
    </div>

    <div className="text-4xl font-bold mt-4 text-orange-400">
      {unassignedIssues.length}
    </div>

    <p className="mt-3 text-xs text-gray-500 group-hover:text-orange-300 transition">
      Click to view unassigned issues
    </p>
  </div>

</div>

{showOpenModal ? (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
    <div className="w-full max-w-3xl rounded-2xl bg-[#081120] p-6 border border-[#2d3a57] shadow-2xl text-white">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-2xl font-semibold">Open / To Do Issues</h2>
          <p className="text-sm text-gray-400">Showing all issues with status Open or To Do</p>
        </div>
        <button
          className="rounded-lg border border-gray-600 px-4 py-2 text-sm text-white hover:bg-white/10"
          onClick={() => setShowOpenModal(false)}
        >
          Close
        </button>
      </div>

      {openIssues.length > 0 ? (
        <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
          {openIssues.map((issue) => (
            <div
              key={issue.id}
              className="rounded-xl border border-[#16243d] bg-[#0b172b] p-4"
            >
              <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                <div>
                  <h3 className="text-lg font-semibold">{issue.key}</h3>
                  <p className="text-sm text-gray-400">{issue.summary}</p>
                </div>
                <span className="rounded-full bg-yellow-500/15 px-3 py-1 text-sm text-yellow-200">
                  {issue.status}
                </span>
              </div>
              <div className="grid gap-3 mt-4 text-sm text-gray-300 md:grid-cols-4">
                <div>
                  <span className="text-gray-400">Priority:</span> {issue.priority || "N/A"}
                </div>
                <div>
                  <span className="text-gray-400">Assignee:</span> {issue.assignee || "Unassigned"}
                </div>
                <div>
                  <span className="text-gray-400">Reporter:</span> {issue.reporter || "N/A"}
                </div>
                <div>
                  <span className="text-gray-400">Due:</span> {issue.dueDate || "N/A"}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-xl border border-[#16243d] bg-[#0b172b] p-6 text-center text-gray-300">
          No Open / To Do issues found for this project.
        </div>
      )}
    </div>
  </div>
) : null}

  {showUnassignedModal ? (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="w-full max-w-3xl rounded-2xl bg-[#081120] p-6 border border-[#2d3a57] shadow-2xl text-white">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-semibold">Unassigned Issues</h2>
            <p className="text-sm text-gray-400">Showing all issues without an assignee.</p>
          </div>
          <button
            className="rounded-lg border border-gray-600 px-4 py-2 text-sm text-white hover:bg-white/10"
            onClick={() => setShowUnassignedModal(false)}
          >
            Close
          </button>
        </div>

        {unassignedIssues.length > 0 ? (
          <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
            {unassignedIssues.map((issue) => (
              <div
                key={issue.id || issue.key}
                className="rounded-xl border border-[#16243d] bg-[#0b172b] p-4"
              >
                <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                  <div>
                    <h3 className="text-lg font-semibold">{issue.key}</h3>
                    <p className="text-sm text-gray-400">{issue.summary}</p>
                  </div>
                  <span className="rounded-full bg-orange-500/15 px-3 py-1 text-sm text-orange-200">
                    {issue.status}
                  </span>
                </div>
                <div className="grid gap-3 mt-4 text-sm text-gray-300 md:grid-cols-4">
                  <div>
                    <span className="text-gray-400">Priority:</span> {issue.priority || "N/A"}
                  </div>
                  <div>
                    <span className="text-gray-400">Assignee:</span> {issue.assignee || "Unassigned"}
                  </div>
                  <div>
                    <span className="text-gray-400">Reporter:</span> {issue.reporter || "N/A"}
                  </div>
                  <div>
                    <span className="text-gray-400">Due:</span> {issue.dueDate || "N/A"}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-xl border border-[#16243d] bg-[#0b172b] p-6 text-center text-gray-300">
            No unassigned issues found for this project.
          </div>
        )}
      </div>
    </div>
  ) : null}

<div className="mt-10">
  {/* Header */}
  <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between mb-6">
    <div>
      <h2 className="text-3xl font-bold text-white">
        Issue Intelligence
      </h2>
      <p className="text-sm text-gray-400 mt-1">
        Track and analyze project issues across sprints
      </p>
    </div>

    {/* Sprint Filters */}
    <div className="flex flex-wrap items-center gap-2">
      <button
        onClick={() => setSelectedSprint("All")}
        className={`rounded-full px-4 py-2 text-sm font-medium transition-all duration-300 ${
          selectedSprint === "All"
            ? "bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-lg shadow-blue-500/20"
            : "bg-[#151f33] text-gray-300 border border-[#223556] hover:bg-[#1f2d4f]"
        }`}
      >
        All
      </button>

      {sprintNames.map((name) => (
        <button
          key={name}
          onClick={() => setSelectedSprint(name)}
          className={`rounded-full px-4 py-2 text-sm font-medium transition-all duration-300 ${
            selectedSprint === name
              ? "bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-lg shadow-blue-500/20"
              : "bg-[#151f33] text-gray-300 border border-[#223556] hover:bg-[#1f2d4f]"
          }`}
        >
          {name}
        </button>
      ))}
    </div>
  </div>

  {/* Issues */}
  <div className="space-y-5">
    {filteredIssues.map((issue) => (
      <div
        key={issue.id}
        className="
          group
          bg-gradient-to-br
          from-[#081120]
          to-[#111c31]
          rounded-2xl
          p-6
          border
          border-[#1b2d4a]
          hover:border-blue-500/40
          hover:shadow-lg
          hover:shadow-blue-500/10
          hover:-translate-y-1
          transition-all
          duration-300
        "
      >
        {/* Top Row */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div>
            <h3 className="font-bold text-lg text-blue-400">
              {issue.key}
            </h3>

            <p className="mt-2 text-gray-300 text-base">
              {issue.summary}
            </p>
          </div>

          <span
            className={`
              px-3 py-1
              rounded-full
              text-sm
              font-medium
              w-fit
              ${
                issue.status === "Done"
                  ? "bg-green-500/10 text-green-400 border border-green-500/20"
                  : issue.status === "In Progress"
                  ? "bg-blue-500/10 text-blue-400 border border-blue-500/20"
                  : issue.status === "In Review"
                  ? "bg-purple-500/10 text-purple-400 border border-purple-500/20"
                  : "bg-yellow-500/10 text-yellow-400 border border-yellow-500/20"
              }
            `}
          >
            {issue.status}
          </span>
        </div>

        {/* Details */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mt-6">
          
          <div className="bg-[#101827]/70 border border-[#223556] rounded-xl p-3">
            <p className="text-xs text-gray-500 uppercase">
              Priority
            </p>
            <p className="mt-1 text-white font-medium">
              {issue.priority}
            </p>
          </div>

          <div className="bg-[#101827]/70 border border-[#223556] rounded-xl p-3">
            <p className="text-xs text-gray-500 uppercase">
              Assignee
            </p>
            <p className="mt-1 text-white font-medium">
              {issue.assignee}
            </p>
          </div>

          <div className="bg-[#101827]/70 border border-[#223556] rounded-xl p-3">
            <p className="text-xs text-gray-500 uppercase">
              Reporter
            </p>
            <p className="mt-1 text-white font-medium">
              {issue.reporter}
            </p>
          </div>

          <div className="bg-[#101827]/70 border border-[#223556] rounded-xl p-3">
            <p className="text-xs text-gray-500 uppercase">
              Due Date
            </p>
            <p className="mt-1 text-white font-medium">
              {issue.dueDate || "N/A"}
            </p>
          </div>

        </div>
      </div>
    ))}
  </div>
</div>

</div>
    </>
  );
}
 