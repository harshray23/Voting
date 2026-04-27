import { ethers } from "ethers";

export const CONTRACT_ADDRESS = "0x3C4e8C05AD5B0B584AB0609da5d70Eaef1fe99c9";

const ABI = [
  "function createProposal(string id, string title, string description, string category, uint256 votingPeriod) external",
  "function castVote(string proposalId, uint128 votePower, bool inFavor) external",
  "function executeProposal(string id) external",
  "function vetoProposal(string id) external",
  "function getProposal(string id) external view returns (tuple(string id, address proposer, string title, string description, string category, uint256 endTime, uint128 votesFor, uint128 votesAgainst, bool executed, bool vetoed))",
  "function getProposalCount() external view returns (uint256)",
  "function listProposals() external view returns (tuple(string id, address proposer, string title, string description, string category, uint256 endTime, uint128 votesFor, uint128 votesAgainst, bool executed, bool vetoed)[])",
  "function hasVoted(string, address) external view returns (bool)"
];

const requireConfig = () => {
    if (!CONTRACT_ADDRESS) throw new Error("Set CONTRACT_ADDRESS in lib/nero.js after deployment");
};

export const checkConnection = async () => {
    if (!window.ethereum) {
        throw new Error("MetaMask is not installed");
    }
    try {
        const accounts = await window.ethereum.request({ method: 'eth_accounts' });
        if (accounts.length > 0) {
            return { publicKey: accounts[0] };
        }
        
        const requestedAccounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        if (requestedAccounts.length > 0) {
            return { publicKey: requestedAccounts[0] };
        }
        return null;
    } catch (err) {
        console.error(err);
        return null;
    }
};

const getProviderAndSigner = async () => {
    if (!window.ethereum) throw new Error("MetaMask is not installed");
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    return { provider, signer };
};

const getContract = async (withSigner = true) => {
    requireConfig();
    if (!window.ethereum) throw new Error("MetaMask is not installed");
    const provider = new ethers.BrowserProvider(window.ethereum);
    if (withSigner) {
        const signer = await provider.getSigner();
        return new ethers.Contract(CONTRACT_ADDRESS, ABI, signer);
    }
    return new ethers.Contract(CONTRACT_ADDRESS, ABI, provider);
};

export const createProposal = async (payload) => {
    if (!payload?.id) throw new Error("id is required");
    
    const contract = await getContract();
    const tx = await contract.createProposal(
        payload.id,
        payload.title || "",
        payload.description || "",
        payload.category || "general",
        payload.votingPeriod
    );
    return await tx.wait();
};

export const castVote = async (payload) => {
    if (!payload?.proposalId) throw new Error("proposalId is required");
    
    const contract = await getContract();
    const tx = await contract.castVote(
        payload.proposalId,
        payload.votePower,
        payload.inFavor
    );
    return await tx.wait();
};

export const executeProposal = async (payload) => {
    if (!payload?.id) throw new Error("id is required");
    
    const contract = await getContract();
    const tx = await contract.executeProposal(payload.id);
    return await tx.wait();
};

export const vetoProposal = async (payload) => {
    if (!payload?.id) throw new Error("id is required");
    
    const contract = await getContract();
    const tx = await contract.vetoProposal(payload.id);
    return await tx.wait();
};

export const getProposal = async (id) => {
    if (!id) throw new Error("id is required");
    const contract = await getContract(false);
    const result = await contract.getProposal(id);
    return {
        id: result[0],
        proposer: result[1],
        title: result[2],
        description: result[3],
        category: result[4],
        endTime: result[5].toString(),
        votesFor: result[6].toString(),
        votesAgainst: result[7].toString(),
        executed: result[8],
        vetoed: result[9]
    };
};

export const listProposals = async () => {
    const contract = await getContract(false);
    const results = await contract.listProposals();
    return results.map(result => ({
        id: result[0],
        proposer: result[1],
        title: result[2],
        description: result[3],
        category: result[4],
        endTime: result[5].toString(),
        votesFor: result[6].toString(),
        votesAgainst: result[7].toString(),
        executed: result[8],
        vetoed: result[9]
    }));
};

export const hasVoted = async (proposalId, voter) => {
    if (!proposalId) throw new Error("proposalId is required");
    if (!voter) throw new Error("voter address is required");
    const contract = await getContract(false);
    return await contract.hasVoted(proposalId, voter);
};

export const getProposalCount = async () => {
    const contract = await getContract(false);
    const count = await contract.getProposalCount();
    return count.toString();
};
