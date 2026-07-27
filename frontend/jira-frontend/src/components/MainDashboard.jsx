import {useEffect, useState} from "react";
import axios from "axios";
import StatCard from "./StatCard";
import TicketStatusChart from "./TicketStatusChart";
import ProjectBarChart from "./ProjectBarChart";
import AISummary from "./AISummary";
import ProjectsTable from "./ProjectsTable";
import RecentTickets from "./RecentTickets";
import {useNavigate} from "react-router-dom";
import {
  stats,
  pieData,
  projects,
  recentTickets,
} from "../components/dummyData";

export default function MainDashboard() {
  const [data,setData]= useState(null);
  const navigate = useNavigate();
  const [projectData, setProjectData] = useState(null);
  
    useEffect(() => {
    axios
      .get("http://localhost:3000/api/jira-data")
      .then((res) => {
        setData(res.data);
      })
      .catch((err) => {
        console.error(err);
      });
  },
   []);

   
    useEffect(() => {
      if(!data?.projects.length) return;
      const projectKey = data.projects[0].key; // Get the first project's key
    axios
      .get(`http://localhost:3000/api/jira-data/project/${projectKey}`)
      .then((res) => {
        setData(res.data);
      })
      .catch((err) => {
        console.error(err);
      });
  },
   []);


 if (!data) {

return (

<div className="min-h-screen bg-[#030712] flex items-center justify-center text-white">

<div className="text-2xl font-bold">
Loading Jira Dashboard...
</div>
</div>
);
}
  return (
    <div className="min-h-screen bg-[#030712] text-white p-6">

      {/* Header */}

      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 shadow-xl mb-8">

        <h1 className="text-4xl font-bold">
          AI Project Intelligence Dashboard
        </h1>

        <p className="text-gray-200 mt-2">
          Real-time Jira Project Analytics & Insights
        </p>

      </div>

      {/* User + Stats */}

      <div className="grid lg:grid-cols-4 gap-6 mb-8">

        <div className="lg:col-span-2 bg-[#081120] border border-[#16243d] rounded-xl p-6">

          <h2 className="text-xl font-semibold mb-4">
            Jira User Information
          </h2>

          <div className="space-y-3">

            <p>
              <span className="text-gray-400">
                User:
              </span>{" "}
              {data.user.displayName}
            </p>

            <p>
              <span className="text-gray-400">
                Account ID:
              </span>{" "}
              {data.user.accountId}
            </p>

            <p>
              <span className="text-gray-400">
                Active:
              </span>{" "}
              {String(data.user.active)}
            </p>

            <p>
              <span className="text-gray-400">
                Cloud ID:
              </span>{" "}
              {data.cloudId}
            </p>

            <p>
              <span className="text-gray-400">
                Projects:
              </span>{" "}
              {data.projects.length}
            </p>

          </div>

        </div>

        <div className="bg-[#081120] border border-[#16243d] rounded-xl p-6">
          <h3 className="text-gray-400">
            Total Projects
          </h3>

          <div className="text-5xl mt-4 font-bold text-blue-400">
            {data.projects.length}
          </div>
        </div>

        <div className="bg-[#081120] border border-[#16243d] rounded-xl p-6">
          <h3 className="text-gray-400">
            Account Status
          </h3>

          <div className="text-3xl mt-4 font-bold text-green-400">
            {data.user.active ? "Active" : "Inactive"}
          </div>
        </div>

      </div>

      {/* Charts */}

      <div className="grid md:grid-cols-2 gap-6">

        <TicketStatusChart data={pieData} />

        {projectData && (
          <ProjectBarChart
            projectData={projectData}
          />
        )}

      </div>

      {/* Projects */}

      <div className="mt-8 bg-[#081120] border border-[#16243d] rounded-xl p-6">

        <h2 className="text-2xl font-bold mb-6">
          Jira Projects
        </h2>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">

          {data.projects.map((project) => (

            <div
  key={project.id}
  className="bg-[#101827] rounded-xl p-4 border border-[#1f2f4a] hover:border-blue-500 transition cursor-pointer"
  onClick={() => navigate(`/project/${project.key}`)}
>

              <h3 className="font-bold text-lg text-blue-400">
                {project.key}
              </h3>

              <p className="mt-2 text-gray-300">
                {project.name}
              </p>

            </div>

          ))}
        </div>

      </div>

      {/* AI Summary */}

      <div className="mt-8">
        <AISummary />
      </div>

      {/* Tables */}

      <div className="mt-8">
        <ProjectsTable data={projects} />
      </div>

      <div className="mt-8">
        <RecentTickets
          tickets={recentTickets}
        />
      </div>

    </div>
  );
}


