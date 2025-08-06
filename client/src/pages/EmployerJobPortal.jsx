import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import apiService from "../api/apiService";

const EmployerJobPortal = () => {
  // --------------------------------------------------------------------------
  // STATE
  // --------------------------------------------------------------------------
  const [contracts, setContracts] = useState([]);
  const [filteredContracts, setFilteredContracts] = useState([]);

  // For filtering (optional)
  const [showFilters, setShowFilters] = useState(false);
  const [searchTitle, setSearchTitle] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  // Modal to view signers
  const [openSignersModal, setOpenSignersModal] = useState(false);
  // We will store the *entire* selected contract here
  const [selectedContract, setSelectedContract] = useState(null);

  // --------------------------------------------------------------------------
  // FETCH CONTRACTS
  // --------------------------------------------------------------------------
  useEffect(() => {
    const fetchContracts = async () => {
      const { data, error } = await supabase
        .from("contracts")
        .select("*")
        .neq("status", "open");

      if (error) {
        console.error("Error fetching contracts:", error);
      } else {
        setContracts(data || []);
        setFilteredContracts(data || []);
      }
    };
    fetchContracts();
  }, []);

  // --------------------------------------------------------------------------
  // FILTERING LOGIC
  // --------------------------------------------------------------------------
  useEffect(() => {
    filterContracts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTitle, statusFilter, contracts]);

  const filterContracts = () => {
    let updated = [...contracts];

    // 1. Filter by contracttitle
    if (searchTitle.trim() !== "") {
      updated = updated.filter((contract) =>
        contract.contracttitle
          ?.toLowerCase()
          .includes(searchTitle.toLowerCase())
      );
    }

    // 2. Filter by status
    if (statusFilter.trim() !== "") {
      updated = updated.filter(
        (contract) =>
          contract.status?.toLowerCase() === statusFilter.toLowerCase()
      );
    }

    setFilteredContracts(updated);
  };

  // --------------------------------------------------------------------------
  // VIEW SIGNERS (Open Modal)
  // --------------------------------------------------------------------------
  const handleViewSigners = (contract) => {
    // Set the entire contract in state so we know which one we're working with
    setSelectedContract(contract);
    setOpenSignersModal(true);
  };

  // --------------------------------------------------------------------------
  // HANDLE CHECKBOX CHANGE FOR SIGNERS
  // --------------------------------------------------------------------------
  const handleSignerCheck = (index, isChecked) => {
    if (!selectedContract) return;

    // Copy the signers array, update the "isChecked" property
    const updatedSigners = [...(selectedContract.signers || [])];
    updatedSigners[index] = {
      ...updatedSigners[index],
      isChecked: isChecked,
    };

    // Update the contract in state with the new signers array
    setSelectedContract({
      ...selectedContract,
      signers: updatedSigners,
    });
  };

  // --------------------------------------------------------------------------
  // SAVE CONTRACT STATUS (set "pending") + Updated Signers
  // --------------------------------------------------------------------------
  const handleSave = async () => {
    if (!selectedContract) return;

    // Optional check: only set status to 'pending' if at least one signer is checked
    const anyChecked = (selectedContract.signers || []).some(
      (s) => s.isChecked
    );

    if (!anyChecked) {
      alert("No signers were selected. Please check at least one signer.");
      return;
    }

    try {
      // Update the contract in supabase => from "Contract Created" to "pending"
      const { data, error } = await supabase
        .from("contracts")
        .update({
          status: "pending",
          signers: selectedContract.signers, // if you want to persist the updated signers
        })
        .eq("id", selectedContract.id)
        .select();

      if (error) {
        console.error("Error updating contract:", error);
        alert("Could not update contract status!");
      } else if (data && data.length > 0) {
        // Update local state
        const updated = data[0]; // the updated contract from Supabase
        setContracts((prev) =>
          prev.map((c) => (c.id === updated.id ? updated : c))
        );
        setFilteredContracts((prev) =>
          prev.map((c) => (c.id === updated.id ? updated : c))
        );
        // alert("Contract status updated to 'pending'!");
        setOpenSignersModal(false);
      }
    } catch (err) {
      console.error("Unexpected error:", err);
      alert("Something went wrong!");
    }
  };

  // --------------------------------------------------------------------------
  // RENDER
  // --------------------------------------------------------------------------
  return (
    <div className="relative min-h-screen p-6 bg-[#FFFFFF]">
      {/* TOP BAR */}
      <div className="max-w-5xl mx-auto flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-[#0D3B66]">View Contracts</h1>

        {/* Button or Link to create new contract */}
        <Link
          to="/new-job"
          className="bg-[#EE964B] text-white px-6 py-2 rounded-full shadow-md hover:bg-[#d97b33] transition">
          Create a new Contract
        </Link>
      </div>

      {/* CONTRACT LISTINGS (FILTERED) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 max-w-5xl mx-auto">
        {filteredContracts.map((contract) => (
          <div
            key={contract.id}
            className="bg-white p-4 rounded-lg shadow-md border-l-4 border-[#F4D35E]">
            <h2 className="text-lg font-bold text-[#EE964B] mb-2">
              {contract.contracttitle}
            </h2>
            <p className="text-sm text-[#0D3B66]">
              <strong>Payment Rate:</strong> {contract.paymentrate}
            </p>
            <p className="text-sm text-[#0D3B66]">
              <strong>Payment Frequency:</strong> {contract.paymentfrequency}
            </p>
            <p className="text-sm text-[#0D3B66]">
              <strong>Location:</strong> {contract.location}
            </p>
            <p className="text-sm text-[#0D3B66]">
              <strong>Status:</strong> {contract.status}
            </p>
            <p className="text-sm text-[#0D3B66]">
              <strong>Applicants:</strong>{" "}
              {Array.isArray(contract.signers) ? contract.signers.length : 0}
            </p>

            {/* Button to see signers */}
            <button
              className="mt-4 w-full bg-[#EE964B] text-white px-4 py-2 rounded-full shadow-md cursor-pointer"
              onClick={() => handleViewSigners(contract)}>
              View Applicants
            </button>
          </div>
        ))}
      </div>

      {/* FILTER BUTTON IN UPPER LEFT CORNER */}
      <button
        onClick={() => setShowFilters(!showFilters)}
        className="absolute top-6 left-6 w-12 h-12 rounded-full bg-white shadow-md border 
                   flex items-center justify-center text-[#EE964B] hover:bg-orange-50 cursor-pointer">
        {/* Icon (funnel/hamburger) */}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M3 4h18M8 12h8m-6 8h4"
          />
        </svg>
      </button>

      {/* FILTER PANEL */}
      {showFilters && (
        <div
          className="absolute top-20 left-6 w-64 bg-white p-4 rounded shadow-md border 
                     transition-all"
          style={{ zIndex: 9999 }}>
          <h2 className="text-xl font-bold mb-4">Filters</h2>

          {/* Search by Title */}
          <div className="mb-4">
            <label
              className="block text-sm font-medium mb-1"
              htmlFor="searchTitle">
              Search Contract Title
            </label>
            <input
              id="searchTitle"
              type="text"
              placeholder="e.g. My Contract"
              className="w-full p-2 border rounded"
              value={searchTitle}
              onChange={(e) => setSearchTitle(e.target.value)}
            />
          </div>

          {/* Status Filter Example */}
          <div className="mb-4">
            <label
              className="block text-sm font-medium mb-1"
              htmlFor="statusFilter">
              Status
            </label>
            <select
              id="statusFilter"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full p-2 border rounded">
              <option value="">-- Any Status --</option>
              <option value="draft">Draft</option>
              <option value="Contract Created">Contract Created</option>
              <option value="pending">Pending</option>
              <option value="active">Active</option>
              <option value="completed">Completed</option>
            </select>
          </div>

          <button
            className="mt-2 w-full bg-[#EE964B] text-white py-2 rounded shadow cursor-pointer"
            onClick={() => setShowFilters(false)}>
            Close
          </button>
        </div>
      )}

      {/* VIEW SIGNERS MODAL */}
      {openSignersModal && selectedContract && (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-96 relative">
            <h2 className="text-xl font-bold text-orange-600 mb-4">Signers</h2>

            {Array.isArray(selectedContract.signers) &&
            selectedContract.signers.length > 0 ? (
              <ul className="list-none ml-1">
                {selectedContract.signers.map((signer, index) => (
                  <li key={index} className="mb-2 flex items-center">
                    <input
                      type="checkbox"
                      className="mr-2"
                      checked={signer.isChecked || false}
                      onChange={(e) =>
                        handleSignerCheck(index, e.target.checked)
                      }
                    />
                    <span>
                      {signer.name} - {signer.walletAddress}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p>No signers yet.</p>
            )}

            <div className="flex justify-end gap-4 mt-6">
              <button
                className="border border-gray-300 px-4 py-2 rounded"
                onClick={() => setOpenSignersModal(false)}>
                Close
              </button>
              <button
                className="bg-orange-600 text-white px-4 py-2 rounded"
                onClick={handleSave}>
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployerJobPortal;
