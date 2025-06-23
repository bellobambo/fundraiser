"use client";

import { chain } from "@/app/chain";
import { client } from "@/app/client";
import { parseEther } from "ethers";

import {
  ConnectButton,
  useActiveAccount,
  useReadContract,
  TransactionButton,
} from "thirdweb/react";
import { contract } from "../utils/contract";
import { useState } from "react";
import { prepareContractCall } from "thirdweb";

const Fundraiser = () => {
  const account = useActiveAccount();
  const projectId = BigInt(0);

  const [contributionAmount, setContributionAmount] = useState<string>("0");
  const [newProject, setNewProject] = useState({
    name: "",
    goalAmount: "",
    durationInDays: "",
  });

  const { data: project } = useReadContract({
    contract,
    method: "getProject",
    params: [projectId],
  });

  const { data: projectCount } = useReadContract({
    contract,
    method: "projectCount",
  });

  if (!account) {
    return (
      <div className="container">
        <ConnectButton client={client} chain={chain} />
      </div>
    );
  }

  return (
    <div className="container">
      <div className="header">
        <ConnectButton client={client} chain={chain} />
        <h1>Fundraiser Projects</h1>
        <p>Total projects: {projectCount?.toString() || "0"}</p>
      </div>

      {/* Project Creation Form */}
      <div className="section">
        <h2>Create New Project</h2>
        <input
          placeholder="Project Name"
          value={newProject.name}
          onChange={(e) =>
            setNewProject({ ...newProject, name: e.target.value })
          }
        />
        <input
          placeholder="Goal Amount (wei)"
          value={newProject.goalAmount}
          onChange={(e) =>
            setNewProject({ ...newProject, goalAmount: e.target.value })
          }
        />
        <input
          placeholder="Duration (days)"
          value={newProject.durationInDays}
          onChange={(e) =>
            setNewProject({ ...newProject, durationInDays: e.target.value })
          }
        />

        <TransactionButton
          transaction={() =>
            prepareContractCall({
              contract,
              method: "createProject",
              params: [
                newProject.name,
                parseEther(newProject.goalAmount || "0"),

                BigInt(newProject.durationInDays),
              ],
            })
          }
          onTransactionSent={(tx) => console.log("Sent tx", tx)}
          onError={(err) => console.error("Transaction error:", err)}
        >
          Create Project
        </TransactionButton>
      </div>

      {/* Project Display */}
      {projectCount?.toString() === "0" ? (
        <p>No projects created yet</p>
      ) : (
        <div className="project-card">
          {project && (
            <>
              <h2>{project[1]}</h2>
              <p>Owner: {project[0]}</p>
              <p>Goal: {project[2]?.toString()} wei</p>
              <p>Raised: {project[3]?.toString()} wei</p>
              <p>
                Start Date:{" "}
                {new Date(Number(project[4]) * 1000).toLocaleString()}
              </p>
              <p>
                End Date: {new Date(Number(project[5]) * 1000).toLocaleString()}
              </p>

              <p>Status: {project[6] ? "Funds released" : "Fundraising"}</p>

              {/* Contribution Form */}
              <div className="contribute-form">
                <input
                  type="number"
                  placeholder="Amount to contribute (wei)"
                  value={contributionAmount}
                  onChange={(e) => setContributionAmount(e.target.value)}
                />
                <TransactionButton
                  transaction={() =>
                    prepareContractCall({
                      contract,
                      method: "contribute",
                      params: [projectId],
                      value: parseEther(contributionAmount || "0"),
                    })
                  }
                  onTransactionSent={(tx) => console.log("Sent tx", tx)}
                  onError={(err) => console.error("Transaction error:", err)}
                  disabled={project[6]}
                >
                  Contribute
                </TransactionButton>
              </div>

              {/* Release Funds Button */}
              {account.address === project[0] && !project[6] && (
                <TransactionButton
                  transaction={() =>
                    prepareContractCall({
                      contract,
                      method: "releaseFunds",
                      params: [projectId],
                    })
                  }
                >
                  Release Funds
                </TransactionButton>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default Fundraiser;
