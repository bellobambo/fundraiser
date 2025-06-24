"use client";

import { chain } from "@/app/chain";
import { client } from "@/app/client";
import { parseEther, formatEther } from "ethers";
import {
  ConnectButton,
  useActiveAccount,
  useReadContract,
  TransactionButton,
} from "thirdweb/react";
import { contract } from "../utils/contract";
import { useState } from "react";
import { prepareContractCall } from "thirdweb";
import { ConnectEmbed } from "@/app/thirdweb";
import { lightTheme } from "thirdweb/react";

import { AutoConnect } from "thirdweb/react";
import { createWallet, inAppWallet } from "thirdweb/wallets";

const Fundraiser = () => {
  const account = useActiveAccount();
  const [hover, setHover] = useState(false);
  const [contributionAmount, setContributionAmount] = useState<string>("0");
  const [newProject, setNewProject] = useState({
    name: "",
    goalAmount: "",
    durationInDays: "",
  });

  const { data: projectCount } = useReadContract({
    contract,
    method: "projectCount",
  });

  const projectIds = Array.from({ length: Number(projectCount || 0) }, (_, i) =>
    BigInt(i)
  );

  const welcomeScreen = {
    title: "Ajór",
    subtitle: "Fundraiser",
  };

  const customTheme = lightTheme({
    colors: {
      modalBg: "#d496a7",
    },
  });

  if (!account) {
    return (
      <div className="flex justify-center items-center mt-[5rem] flex-col">
        <h2 className="font-md text-2xl mb-4">Ajór Shomolu</h2>
        <ConnectEmbed
          client={client}
          chain={chain}
          //   wallets={[
          //     createWallet("io.metamask"),
          //     createWallet("com.bybit"),
          //     createWallet("me.rainbow"),
          //   ]}
          welcomeScreen={welcomeScreen}
          showThirdwebBranding={false}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#d496a7] text-[#3a2e39] p-6 font-['Press_Start_2P'] text-xs">
      <div className="max-w-4xl mx-auto grid gap-6">
        <h1 className="text-sm tracking-widest text-center text-[20px]">
          Ajór
        </h1>
        <div className="flex justify-between items-center border-b-2 border-[#3a2e39] pb-3">
          <ConnectButton client={client} chain={chain} />
          <div>
            <p className="text-[#3a2e39]">
              Projects: {projectCount?.toString() || "0"}
            </p>
          </div>
        </div>

        {/* Project Creation Form */}
        <div className="bg-[#e8c8d5] border-2 border-[#3a2e39] p-4 shadow-sm">
          <h2 className="text-[#5e4352] mb-4 text-xs">
            [ CREATE NEW PROJECT ]
          </h2>
          <div className="space-y-3">
            <input
              className="w-full px-3 py-2 bg-[#f0d8e1] border border-[#3a2e39] text-[#3a2e39] placeholder-[#a78b9b] focus:outline-none"
              placeholder="Project Name"
              value={newProject.name}
              onChange={(e) =>
                setNewProject({ ...newProject, name: e.target.value })
              }
            />
            <input
              className="w-full px-3 py-2 bg-[#f0d8e1] border border-[#3a2e39] text-[#3a2e39] placeholder-[#a78b9b] focus:outline-none"
              placeholder="Goal Amount (ETH)"
              value={newProject.goalAmount}
              onChange={(e) =>
                setNewProject({ ...newProject, goalAmount: e.target.value })
              }
            />
            <input
              className="w-full px-3 py-2 bg-[#f0d8e1] border border-[#3a2e39] text-[#3a2e39] placeholder-[#a78b9b] focus:outline-none"
              placeholder="Duration (Days)"
              value={newProject.durationInDays}
              onChange={(e) =>
                setNewProject({ ...newProject, durationInDays: e.target.value })
              }
            />

            <TransactionButton
              style={{ backgroundColor: "#d496a7" }}
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
            >
              <span className="bg-[#d496a7] hover:text-white">CREATE</span>
            </TransactionButton>
          </div>
        </div>

        {/* Projects List */}
        {projectIds.map((projectId) => (
          <ProjectCard
            key={projectId.toString()}
            projectId={projectId}
            account={account}
            contributionAmount={contributionAmount}
            setContributionAmount={setContributionAmount}
          />
        ))}
      </div>
    </div>
  );
};

const ProjectCard = ({ projectId, account }: any) => {
  const { data: project } = useReadContract({
    contract,
    method: "getProject",
    params: [projectId],
  });

  const [contributionAmount, setContributionAmount] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);

  if (!project) return null;

  return (
    <div className="bg-[#e8c8d5] border-2 border-[#5e4352] p-4 mb-4">
      <h2 className="text-[#5e4352] mb-3 text-xs">
        [PROJECT #{projectId.toString()}]
      </h2>
      <div className="space-y-1">
        <p>Name: {project[1]}</p>
        <p>Owner: {project[0]}</p>
        <p>
          Goal:{" "}
          {parseFloat(formatEther(project[2]?.toString() || "0")).toFixed(6)}{" "}
          ETH
        </p>
        <p>
          Raised:{" "}
          {parseFloat(formatEther(project[3]?.toString() || "0")).toFixed(6)}{" "}
          ETH
        </p>
        <p>Start: {new Date(Number(project[4]) * 1000).toLocaleDateString()}</p>
        <p>End: {new Date(Number(project[5]) * 1000).toLocaleDateString()}</p>
        <p>Status: {project[6] ? "FUNDS RELEASED" : "FUNDRAISING"}</p>

        <div className="mt-3 space-y-2">
          <input
            type="number"
            className="w-full px-2 py-1 bg-[#f0d8e1] border border-[#3a2e39] text-[#3a2e39] placeholder-[#a78b9b] focus:outline-none text-xs"
            placeholder="Amount (ETH)"
            value={contributionAmount}
            onChange={(e) => setContributionAmount(e.target.value)}
            disabled={isLoading}
          />

          <div className="flex justify-between gap-3 flex-wrap">
            <TransactionButton
              style={{
                backgroundColor: "#d496a7",
                opacity: isLoading ? 0.6 : 1,
                cursor: isLoading ? "not-allowed" : "pointer",
              }}
              transaction={() =>
                prepareContractCall({
                  contract,
                  method: "contribute",
                  params: [projectId],
                  value: parseEther(contributionAmount || "0"),
                })
              }
              onTransactionSent={() => {
                setIsLoading(true);
              }}
              onTransactionConfirmed={() => {
                setIsLoading(false);
                setContributionAmount("");
                alert("✅ Contribution confirmed!");
              }}
              onError={(err) => {
                console.error(err);
                setIsLoading(false);
                alert("❌ Transaction failed. Please try again.");
              }}
              disabled={project[6] || isLoading}
            >
              <span className="block px-4 py-2 text-xs text-[#3a2e39] bg-[#d496a7] hover:text-white transition">
                {isLoading ? "Processing..." : "CONTRIBUTE"}
              </span>
            </TransactionButton>

            {account.address === project[0] && !project[6] && (
              <TransactionButton
                style={{ backgroundColor: "#d496a7" }}
                transaction={() =>
                  prepareContractCall({
                    contract,
                    method: "releaseFunds",
                    params: [projectId],
                  })
                }
                onTransactionConfirmed={() =>
                  alert("✅ Funds successfully released!")
                }
                onError={(err) => {
                  console.error(err);
                  alert("❌ Failed to release funds.");
                }}
              >
                <span className="block p-2 text-xs text-[#3a2e39] bg-[#d496a7] hover:text-white transition">
                  RELEASE FUNDS
                </span>
              </TransactionButton>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Fundraiser;
