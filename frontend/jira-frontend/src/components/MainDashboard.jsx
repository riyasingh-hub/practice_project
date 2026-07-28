import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
 
import StatCard from "./StatCard";
import TicketStatusChart from "./TicketStatusChart";
import ProjectBarChart from "./ProjectBarChart";
import AISummary from "./AISummary";
import ProjectsTable from "./ProjectsTable";
import RecentTickets from "./RecentTickets";
 
export default function MainDashboard() {
  const navigate = useNavigate();
 
  const [jiraData, setJiraData] = useState(null);
  const [issues, setIssues] = useState([]);
  const [projects, setProjects] = useState([]);
  const [metrics, setMetrics] = useState(null);
 
  useEffect(() => {
    const fetchData = async () => {
      try {
        const jiraRes = await axios.get(
          "http://localhost:3000/api/jira-data"
        );
const projects = jiraRes.data.projects;
 
await Promise.all(
 
projects.map((project) =>
 
axios.get(
 
`http://localhost:3000/api/jira-data/project-intelligence/${project.key}`
 
)
 
)
 
);
        const accountId = jiraRes.data?.user?.accountId;
 
        // fetch DB-backed data scoped to accountId
        const [issuesRes, projectsRes, metricsRes] = await Promise.all([
          axios.get(
            `http://localhost:3000/api/jira-data/db/issues${accountId ? `?accountId=${accountId}` : ""}`
          ),
          axios.get(
            `http://localhost:3000/api/jira-data/db/projects${accountId ? `?accountId=${accountId}` : ""}`
          ),
          axios.get(
            `http://localhost:3000/api/jira-data/db/metrics${accountId ? `?accountId=${accountId}` : ""}`
          ),
        ]);
 
        setJiraData(jiraRes.data);
        setIssues(issuesRes.data);
        setProjects(projectsRes.data);
        setMetrics(metricsRes.data);
      } catch (error) {
        console.error(error);
      }
    };
 
    fetchData();
  }, []);
 
  if (
    !jiraData ||
    !projects ||
    !issues ||
    !metrics
  ) {
    return (
      <div className="min-h-screen bg-[#030712] flex items-center justify-center text-white">
        <div className="text-2xl font-bold">
          Loading Jira Dashboard...
        </div>
      </div>
    );
  }
 
  const pieData = [
    {
      name: "Open",
      value: metrics.openTickets || 0,
    },
    {
      name: "Completed",
      value:
        metrics.completedTickets || 0,
    },
    {
      name: "In Progress",
      value:
        metrics.inProgressTickets || 0,
    },
  ];
 
  const projectBarData = projects.map(
    (project) => ({
      project: project.key,
      tickets: issues.filter((issue) =>
        issue.key.startsWith(project.key)
      ).length,
    })
  );
 
  const tableProjects = projects.map(
    (project) => ({
      name: project.name,
      lead:
        project.projectLead ||
        "Not Assigned",
 
      tickets: issues.filter((issue) =>
        issue.key.startsWith(project.key)
      ).length,
 
      done: issues.filter(
        (issue) =>
          issue.status === "Done" &&
          issue.key.startsWith(
            project.key
          )
      ).length,
 
      status: "Active",
    })
  );
 
  const recentTickets = issues
    .slice(0, 5)
    .map((issue) => ({
      id: issue.key,
      title: issue.summary,
      priority:
        issue.priority || "N/A",
      status: issue.status,
    }));
 
  return (
    <div className="min-h-screen bg-[#030712] text-white p-6">
      {/* Header */}
 
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 shadow-xl mb-8">
        <h1 className="text-4xl font-bold">
          AI Project Intelligence Dashboard
        </h1>
 
        <p className="text-gray-200 mt-2">
          Real-time Jira Analytics &
          Insights
        </p>
      </div>
 
      {/* User Information */}
 
      <div className="bg-[#081120] border border-[#16243d] rounded-xl p-6 mb-8">
        <h2 className="text-2xl font-bold mb-4">
          Jira User Information
        </h2>
 
        <div className="space-y-2">
          <p>
            <span className="text-gray-400">
              User:
            </span>{" "}
            {jiraData.user?.displayName}
          </p>
 
          <p>
            <span className="text-gray-400">
              Email:
            </span>{" "}
            {jiraData.user?.email}
          </p>
 
          <p>
            <span className="text-gray-400">
              Projects:
            </span>{" "}
            {jiraData.projects?.length}
          </p>
        </div>
      </div>
 
      {/* Metrics */}
 
      <div className="grid md:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Total Tickets"
          value={metrics.totalTickets}
        />
 
        <StatCard
          title="Open Tickets"
          value={metrics.openTickets}
        />
 
        <StatCard
          title="Completed"
          value={
            metrics.completedTickets
          }
        />
 
        <StatCard
          title="In Progress"
          value={
            metrics.inProgressTickets
          }
        />
      </div>
 
      {/* Charts */}
 
      <div className="grid md:grid-cols-2 gap-6">
        <TicketStatusChart
          data={pieData}
        />
 
        <ProjectBarChart
          data={projectBarData}
        />
      </div>
 
      {/* Projects Grid */}
 
      <div className="mt-8 bg-[#081120] border border-[#16243d] rounded-xl p-6">
        <h2 className="text-2xl font-bold mb-6">
          Jira Projects
        </h2>
 
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {jiraData.projects.map(
            (project) => (
              <div
                key={project.id}
                className="bg-[#101827] rounded-xl p-4 border border-[#1f2f4a] hover:border-blue-500 transition cursor-pointer"
                onClick={() =>
                  navigate(
                    `/project/${project.key}`
                  )
                }
              >
                <h3 className="font-bold text-lg text-blue-400">
                  {project.key}
                </h3>
 
                <p className="mt-2 text-gray-300">
                  {project.name}
                </p>
              </div>
            )
          )}
        </div>
      </div>
 
      {/* AI Summary */}
 
      <div className="mt-8">
        <AISummary />
      </div>
 
      {/* Projects Table */}
 
      <div className="mt-8">
        <ProjectsTable
          data={tableProjects}
        />
      </div>
 
      {/* Recent Tickets */}
 
      <div className="mt-8">
        <RecentTickets
          tickets={recentTickets}
        />
      </div>
    </div>
  );
}
 