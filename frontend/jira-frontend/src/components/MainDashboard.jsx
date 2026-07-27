// import { useEffect, useState } from "react";
// import axios from "axios";

// function MainDashboard() {
//   const [data, setData] = useState(null);

//   useEffect(() => {
//     axios
//       .get("http://localhost:3000/api/jira-data")
//       .then((res) => {
//         setData(res.data);
//       })
//       .catch((err) => {
//         console.error(err);
//       });
//   }, []);

//   if (!data) {
//     return <h2>Loading...</h2>;
//   }

//   return (
//     <div style={{ padding: "30px" }}>
//       <h1> My Jira Dashboard</h1>

//       <h2>User Details</h2>

//       <p>
//         <strong>Name:</strong> {data.user.displayName}
//       </p>

//       <p>
//         <strong>Account ID:</strong> {data.user.accountId}
//       </p>

//       <p>
//         <strong>Active:</strong> {String(data.user.active)}
//       </p>

//       <h2>Jira Site</h2>

//       <p>{data.jiraSite.url}</p>

//       <p>
//         <strong>Cloud ID:</strong> {data.cloudId}
//       </p>

//       <h2>Projects</h2>

//       <ul>
//         {data.projects.map((project) => (
//           <li key={project.id}>
//             {project.key} - {project.name}
//           </li>
//         ))}
//       </ul>
//     </div>
//   );
// }

// export default MainDashboard;






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
    useEffect(() => {
    axios
      .get("http://localhost:3000/api/jira-data")
      .then((res) => {
        setData(res.data);
      })
      .catch((err) => {
        console.error(err);
      });
  }, []);


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
        <ProjectBarChart data={projectData} />
      </div>
      
       <div className="bg-[#081120] border border-[#16243d] rounded-xl p-6">
      <div className="flex justify-between">
        <h3 className="text-gray-400">
          User Name: {data.user.displayName}
        </h3>

      </div>

      

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