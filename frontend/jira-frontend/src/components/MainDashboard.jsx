import {useEffect, useState} from "react";
import axios from "axios";
import StatCard from "./StatCard";
import TicketStatusChart from "./TicketStatusChart";
import ProjectBarChart from "./ProjectBarChart";
import AISummary from "./AISummary";
import ProjectsTable from "./ProjectsTable";
import RecentTickets from "./RecentTickets";
import {
  stats,
  pieData,
  projectData,
  projects,
  recentTickets,
} from "../components/dummyData";

export default function MainDashboard() {
  const [data,setData]= useState(null);
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
    return <h2>Loading...</h2>;
  }
  return (
    <div className="min-h-screen bg-[#030712] text-white p-6">
       
      <h1 className="text-3xl font-bold mb-8">
        AI Project Intelligence
      </h1>

<div className="grid md:grid-cols-2 gap-6 mt-8">
        <TicketStatusChart data={pieData} />
        {projectData && (
         <ProjectBarChart projectData={projectData} />)}
      </div>
      
       <div className="bg-[#081120] border border-[#16243d] rounded-xl p-6">
      <div className="flex justify-between">
        <h3 className="text-gray-400">
          User Name: {data.user.displayName}
        </h3>

      </div>
      <div className="flex justify-between">
        <h3 className="text-gray-400">
          Account ID: {data.user.accountId}
        </h3>

      </div>
      <div className="flex justify-between">
        <h3 className="text-gray-400">
          Active: {String(data.user.active)}
        </h3>

      </div>

       <div className="flex justify-between">
        <h3 className="text-gray-400">
          Cloud Id: {data.cloudId}
        </h3>

      </div>

              <h2>Projects</h2>

         <ul>
         {data.projects.map((project) => (
           <li key={project.id}>
             {project.key} - {project.name}
           </li>
         ))}
       </ul>

      

      <h2 className="text-4xl font-bold mt-4 text-white">
        
      </h2>
    </div>

      <div className="grid md:grid-cols-2 gap-6 mt-8">
      </div>

      <div className="mt-8">
        <AISummary />
      </div>

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