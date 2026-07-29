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
    <div className="min-h-screen bg-[#030712] text-white p-8">
 
      <Link
        to="/dashboard"
        className="text-blue-400"
      >
        ← Back
      </Link>
 
      <div className="mt-6 bg-[#081120] rounded-xl p-8 border border-[#16243d]">
 
        <h1 className="text-4xl font-bold">
          {project.name}
        </h1>
 
        <p className="text-gray-400 mt-2">
          Project Key: {project.key}
        </p>
 
      </div>
 
      <div className="grid md:grid-cols-2 gap-6 mt-8">
 
        <div className="bg-[#081120] p-6 rounded-xl">
 
          <h2 className="text-xl font-semibold mb-4">
            Project Information
          </h2>
 
          <p>
            <span className="text-gray-400">
              Project ID:
            </span>{" "}
            {project.id}
          </p>
 
          <p>
            <span className="text-gray-400">
              Type:
            </span>{" "}
            {project.projectType}
          </p>
 
          <p>
            <span className="text-gray-400">
              Lead:
            </span>{" "}
            {project.projectLead}
          </p>
 
          <p>
            <span className="text-gray-400">
              Private:
            </span>{" "}
            {String(project.isPrivate)}
          </p>
 
          <p>
            <span className="text-gray-400">
              Simplified:
            </span>{" "}
            {String(project.simplified)}
          </p>
 
        </div>
 
        <div className="bg-[#081120] p-6 rounded-xl">
 
          <h2 className="text-xl font-semibold mb-4">
            Description
          </h2>
 
          <p>
            {project.description ||
              "No description available"}
          </p>
 
        </div>
 
      </div>
 
    </div>
 
    <div className="min-h-screen bg-[#030712] text-white p-8">
 
<h1 className="text-4xl font-bold mb-8">
 
Project Intelligence
 
</h1>
<div className="grid md:grid-cols-6 gap-6">
 
<div className="bg-[#081120] p-6 rounded-xl">
 
<h3>Total Tickets</h3>
 
<div className="text-4xl mt-3">
 
{data.metrics.totalTickets}
 
</div>
 
</div>
<div
 className="bg-[#081120] p-6 rounded-xl cursor-pointer border border-transparent hover:border-yellow-300 transition"
 onClick={() => setShowOpenModal(true)}
>
 
<h3>Open</h3>
 
<div className="text-4xl mt-3 text-yellow-400">
 
{data.metrics.openTickets}
 
</div>
 
<p className="mt-2 text-sm text-gray-400">
 Click to view open / to do issues
 </p>
</div>
<div className="bg-[#081120] p-6 rounded-xl">
 
<h3>Completed</h3>
 
<div className="text-4xl mt-3 text-green-400">
 
{data.metrics.completedTickets}
 
</div>
 
</div>
<div className="bg-[#081120] p-6 rounded-xl">
 
<h3>In Progress</h3>
 
<div className="text-4xl mt-3 text-blue-400">
 
{data.metrics.inProgressTickets}
 
</div>
 
</div>
<div className="bg-[#081120] p-6 rounded-xl">
 
<h3>In Review</h3>
 
<div className="text-4xl mt-3 text-purple-400">
 
{data.metrics.inReviewTickets}
 
</div>
 
</div>
 
<div
 className="bg-[#081120] p-6 rounded-xl cursor-pointer border border-transparent hover:border-yellow-300 transition"
 onClick={() => setShowUnassignedModal(true)}
>
 
<h3>Unassigned</h3>
 
<div className="text-4xl mt-3 text-orange-400">
 
{unassignedIssues.length}
 
</div>
 
<p className="mt-2 text-sm text-gray-400">
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
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <h2 className="text-2xl mb-4">Issue Intelligence</h2>
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setSelectedSprint("All")}
              className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                selectedSprint === "All"
                  ? "bg-blue-600 text-white"
                  : "bg-[#151f33] text-gray-300 hover:bg-[#1f2d4f]"
              }`}
            >
              All
            </button>
            {sprintNames.map((name) => (
              <button
                key={name}
                onClick={() => setSelectedSprint(name)}
                className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                  selectedSprint === name
                    ? "bg-blue-600 text-white"
                    : "bg-[#151f33] text-gray-300 hover:bg-[#1f2d4f]"
                }`}
              >
                {name}
              </button>
            ))}
          </div>
        </div>
        <div className="space-y-4">
 
{filteredIssues.map(issue => (
<div
 
key={issue.id}
 
className="bg-[#081120] rounded-xl p-5 border border-[#16243d]"
 
>
<div className="flex justify-between">
 
<h3 className="font-bold">
 
{issue.key}
 
</h3>
<span>
 
{issue.status}
 
</span>
</div>
<p className="mt-2">
 
{issue.summary}
 
</p>
<div className="grid md:grid-cols-4 gap-4 mt-4 text-sm text-gray-300">
 
<div>
 
Priority:
 
{" "}
 
{issue.priority}
 
</div>
 
 
 
<div>
 
Assignee:
 
{" "}
 
{issue.assignee}
 
</div>
<div>
 
Reporter:
 
{" "}
 
{issue.reporter}
</div>
<div>
Due:
{" "}
{issue.dueDate || "N/A"}
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
 