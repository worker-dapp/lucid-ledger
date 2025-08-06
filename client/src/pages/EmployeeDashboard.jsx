import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import apiService from "../api/apiService";
import Navbar from "../components/Navbar";

const EmployeeDashboard = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const { data, error } = await apiService.getJobs();
        if (error) {
          console.error("Error fetching jobs:", error);
          // Fallback to mock data for development
          const mockData = apiService.getMockData('jobs');
          setJobs(mockData.data);
        } else {
          // Filter for active jobs only
          const activeJobs = (data || []).filter(
            (job) => job.status?.toLowerCase() === "active" || !job.status
          );
          setJobs(activeJobs);
        }
      } catch (error) {
        console.error("Error fetching jobs:", error);
        // Fallback to mock data for development
        const mockData = apiService.getMockData('jobs');
        setJobs(mockData.data);
      } finally {
        setLoading(false);
      }
    };
    fetchJobs();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FFFFFF] flex items-center justify-center">
        <div className="text-2xl text-[#0D3B66]">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FFFFFF]">
      <Navbar />
      <div className="max-w-5xl mx-auto flex justify-between items-center mb-6">
        <h1 className="text-4xl p-10 font-bold text-[#0D3B66]">
          Available Jobs
        </h1>
        <Link to="/my-jobs" className="text-4xl p-10 font-bold text-[#0D3B66]">
          My Jobs
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 max-w-5xl mx-auto">
        {jobs.map((job) => (
          <div
            key={job.id}
            className="bg-white p-8 rounded-lg shadow-md border-l-4 border-[#F4D35E] hover:shadow-lg transition duration-300 flex flex-col justify-between"
          >
            <div onClick={() => navigate(`/job-details/${job.id}`)} className="cursor-pointer">
              <h2 className="text-2xl font-bold text-[#EE964B] mb-2">
                {job.title}
              </h2>
              <p className="text-lg text-[#0D3B66]">
                <strong>Company:</strong> {job.company_name}
              </p>
              <p className="text-lg text-[#0D3B66]">
                <strong>Salary:</strong> {job.salary} {job.currency}
              </p>
              <p className="text-lg text-[#0D3B66]">
                <strong>Location:</strong> {job.location}
              </p>
              <p className="text-lg text-[#0D3B66] mb-4">
                <strong>Job Type:</strong> {job.job_type}
              </p>
            </div>
            <button
              onClick={() => navigate(`/job-details/${job.id}`)}
              className="bg-orange-500 text-white py-2 cursor-pointer rounded-lg hover:bg-orange-400 transition-all shadow-md text-xl w-32"
            >
              View
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default EmployeeDashboard;
