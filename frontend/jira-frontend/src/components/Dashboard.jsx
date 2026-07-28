import { useEffect, useState } from "react";
import axios from "axios";
import { useParams, Link } from "react-router-dom";

export default function Dashboard() {

  const { projectKey } = useParams();

  const [project, setProject] = useState(null);
const [data, setData] = useState(null);
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
<div className="grid md:grid-cols-4 gap-6">

<div className="bg-[#081120] p-6 rounded-xl">

<h3>Total Tickets</h3>

<div className="text-4xl mt-3">

{data.metrics.totalTickets}

</div>

</div>
<div className="bg-[#081120] p-6 rounded-xl">

<h3>Open</h3>

<div className="text-4xl mt-3 text-yellow-400">

{data.metrics.openTickets}

</div>

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
</div>
<div className="mt-10">
<h2 className="text-2xl mb-4">

Issue Intelligence

</h2>
<div className="space-y-4">

{data.issues.map(issue => (

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