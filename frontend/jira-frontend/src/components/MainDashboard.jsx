import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { User, Mail, FolderKanban } from "lucide-react";
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
        console.log("projects",projectsRes.data);
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
 




  const projectList = jiraData?.projects && jiraData.projects.length > 0 ? jiraData.projects : projects;

  const projectMetrics = projectList.map((project) => {
    const projectIssues = issues.filter((issue) =>
      issue.key?.startsWith(project.key)
    );

    const issueStatus = (issue) =>
      String(issue.status || issue.fields?.status?.name || "").toLowerCase();
    const issuePriority = (issue) =>
      String(
        issue.priority ||
        issue.fields?.priority?.name ||
        issue.fields?.priority ||
        ""
      ).toLowerCase();
    const issueDueDate = (issue) =>
      issue.dueDate || issue.fields?.duedate || issue.fields?.dueDate;

    let openCount = 0;
    let inProgressCount = 0;
    let completedCount = 0;
    let overdueCount = 0;
    let highPriorityCount = 0;
    let unassignedCount = 0;

    const now = Date.now();

    projectIssues.forEach((issue) => {
      const status = issueStatus(issue);
      const priority = issuePriority(issue);
      const dueDate = issueDueDate(issue);
      const done = /done|closed|resolved/.test(status);

      if (!done) {
        openCount += 1;
      }
      if (status.includes("progress")) {
        inProgressCount += 1;
      }
      if (done) {
        completedCount += 1;
      }
      if (priority.includes("high") || priority.includes("critical")) {
        highPriorityCount += 1;
      }
      if (!issue.assignee || issue.assignee === "Unassigned") {
        unassignedCount += 1;
      }
      if (dueDate) {
        const dueTs = Date.parse(dueDate);
        if (!done && !Number.isNaN(dueTs) && dueTs < now) {
          overdueCount += 1;
        }
      }
    });

    const riskScore =
      openCount + overdueCount * 2 + highPriorityCount * 1.5 + unassignedCount * 0.75;

    return {
      project: project.key,
      projectName: project.name,
      totalIssues: projectIssues.length,
      openCount,
      inProgressCount,
      completedCount,
      overdueCount,
      highPriorityCount,
      unassignedCount,
      riskScore: Number(riskScore.toFixed(1)),
    };
  });

    const pieData = projectList.map((project) => ({
    name: project.name,
    value: issues.filter((issue) =>
      issue.key.startsWith(project.key)
    ).length,
  }));

  const ticketHeatData = projectMetrics;
  const projectBarData = projectMetrics;
 
  const tableProjects = projectList.map(
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
 
  const getIssueTimestamp = (issue) => {
    const raw =
      issue.createdAt ||
      issue.created ||
      issue.timestamp ||
      issue.updatedAt ||
      issue.updated ||
      "";
    const parsed = Date.parse(raw);
    return Number.isNaN(parsed) ? 0 : parsed;
  };
 
  const recentTickets = issues
    .slice()
    .sort(
      (a, b) =>
        getIssueTimestamp(b) -
        getIssueTimestamp(a)
    )
    .slice(0, 3)
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
          JIRA AI Project Management 
        </h1>
 
        <p className="text-gray-200 mt-2">
          Real-time Jira Analytics &
          Insights
        </p>
      </div>
 
      {/* User Information */}
 

<div className="bg-gradient-to-br from-[#0c1729] to-[#101d35] border border-[#1f3357] rounded-2xl p-6 md:p-8 shadow-lg shadow-blue-950/30 hover:border-blue-500/40 transition-all duration-300">
  <h2 className="text-2xl md:text-3xl font-bold mb-6 text-white">
    User Information
  </h2>

  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
    
    <div className="flex items-center gap-3 bg-[#111d33]/70 rounded-xl p-4 border border-[#1a2a45]">
      <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400">
        <User size={20} />
      </div>
      <div>
        <p className="text-gray-400 text-sm">User</p>
        <p className="text-white font-medium break-words">
          {jiraData.user?.displayName || "N/A"}
        </p>
      </div>
    </div>

    <div className="flex items-center gap-3 bg-[#111d33]/70 rounded-xl p-4 border border-[#1a2a45]">
      <div className="p-2 rounded-lg bg-green-500/10 text-green-400">
        <Mail size={20} />
      </div>
      <div>
        <p className="text-gray-400 text-sm">Email</p>
        <p className="text-white font-medium break-all">
          {jiraData.user?.email || "N/A"}
        </p>
      </div>
    </div>

    <div className="flex items-center gap-3 bg-[#111d33]/70 rounded-xl p-4 border border-[#1a2a45]">
      <div className="p-2 rounded-lg bg-purple-500/10 text-purple-400">
        <FolderKanban size={20} />
      </div>
      <div>
        <p className="text-gray-400 text-sm">Projects</p>
        <p className="text-white font-semibold text-lg">
          {jiraData.projects?.length || 0}
        </p>
      </div>
    </div>

  </div>
</div>
 
      {/* Metrics */}
 
      {/* <div className="grid md:grid-cols-4 gap-6 mb-8">
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
      </div> */}
 
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
 
<div className="mt-8 bg-gradient-to-br from-[#081120] via-[#0d1728] to-[#111c31] border border-[#1b2d4a] rounded-2xl p-6 md:p-8 shadow-2xl shadow-blue-950/20">
  <div className="flex items-center justify-between mb-6">
    <h2 className="text-2xl md:text-3xl font-bold text-white">
      Jira Projects
    </h2>

    <div className="px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm font-medium">
      {projectList.length} Projects
    </div>
  </div>

  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
    {projectList.map((project) => (
      <div
        key={project.id}
        className="
          group
          relative
          overflow-hidden
          rounded-2xl
          p-5
          bg-gradient-to-br
          from-[#101827]
          to-[#162238]
          border
          border-[#223556]
          hover:border-blue-500/60
          cursor-pointer
          transition-all
          duration-300
          hover:-translate-y-2
          hover:shadow-xl
          hover:shadow-blue-500/20
        "
        onClick={() => navigate(`/project/${project.key}`)}
      >
        {/* Glow Effect */}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-r from-blue-500/5 via-cyan-500/10 to-purple-500/5" />

        <div className="relative z-10">
          {/* Project Key */}
          {/* <div className="inline-flex items-center px-3 py-1 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400 font-semibold text-sm">
            {project.key}
          </div> */}

          {/* Project Name */}
          <h3 className="mt-4 text-lg font-semibold text-white group-hover:text-blue-300 transition-colors">
            {project.name}
          </h3>

          {/* Bottom Section */}
          <div className="mt-5 flex items-center justify-between">
            <span className="text-sm text-gray-400">
              View Details
            </span>

            <div className="w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-400 group-hover:bg-blue-500 group-hover:text-white transition-all">
              →
            </div>
          </div>
        </div>
      </div>
    ))}
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
 