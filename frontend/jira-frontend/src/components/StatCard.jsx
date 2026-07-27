import { useEffect, useState } from "react";
import axios from "axios";

export default function StatCard({
  title,
  value,
  change,
  color,
}) {
    const [data, setData] = useState(null);
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



  return (
    <>
    <div className="bg-[#081120] border border-[#16243d] rounded-xl p-6">
      <div className="flex justify-between">
        <h3 className="text-gray-400">
          User Name: {data?.user?.displayName}
        </h3>

        <span className={color}>
          {change}
        </span>
      </div>

      

      <h2 className="text-4xl font-bold mt-4 text-white">
        {value}
      </h2>
    </div>

     <div className="bg-[#081120] border border-[#16243d] rounded-xl p-6">
      <div className="flex justify-between">
        <h3 className="text-gray-400">
          {title}
        </h3>

        <span className={color}>
          {change}
        </span>
      </div>

      
      <h2 className="text-4xl font-bold mt-4 text-white">
        {value}
      </h2>
    </div>
    </>
  );
}