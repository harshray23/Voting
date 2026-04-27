// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract DaoVoting {
    struct Proposal {
        string id;
        address proposer;
        string title;
        string description;
        string category;
        uint256 endTime;
        uint128 votesFor;
        uint128 votesAgainst;
        bool executed;
        bool vetoed;
    }

    mapping(string => Proposal) public proposals;
    string[] public proposalIds;
    mapping(string => mapping(address => bool)) public hasVoted;

    event ProposalCreated(string id, address proposer, string title, uint256 endTime);
    event VoteCast(string proposalId, address voter, uint128 votePower, bool inFavor);
    event ProposalExecuted(string id, address executor);
    event ProposalVetoed(string id, address vetoer);

    function createProposal(
        string memory id,
        string memory title,
        string memory description,
        string memory category,
        uint256 votingPeriod
    ) external {
        require(bytes(proposals[id].id).length == 0, "Proposal ID already exists");
        
        proposals[id] = Proposal({
            id: id,
            proposer: msg.sender,
            title: title,
            description: description,
            category: category,
            endTime: block.timestamp + votingPeriod,
            votesFor: 0,
            votesAgainst: 0,
            executed: false,
            vetoed: false
        });
        
        proposalIds.push(id);
        
        emit ProposalCreated(id, msg.sender, title, block.timestamp + votingPeriod);
    }

    function castVote(string memory proposalId, uint128 votePower, bool inFavor) external {
        require(bytes(proposals[proposalId].id).length != 0, "Proposal does not exist");
        require(block.timestamp < proposals[proposalId].endTime, "Voting period has ended");
        require(!hasVoted[proposalId][msg.sender], "Already voted");

        if (inFavor) {
            proposals[proposalId].votesFor += votePower;
        } else {
            proposals[proposalId].votesAgainst += votePower;
        }

        hasVoted[proposalId][msg.sender] = true;

        emit VoteCast(proposalId, msg.sender, votePower, inFavor);
    }

    function executeProposal(string memory id) external {
        require(bytes(proposals[id].id).length != 0, "Proposal does not exist");
        require(block.timestamp >= proposals[id].endTime, "Voting period not yet ended");
        require(!proposals[id].executed, "Already executed");
        require(!proposals[id].vetoed, "Proposal was vetoed");
        require(proposals[id].votesFor > proposals[id].votesAgainst, "Proposal did not pass");

        proposals[id].executed = true;

        emit ProposalExecuted(id, msg.sender);
    }

    function vetoProposal(string memory id) external {
        require(bytes(proposals[id].id).length != 0, "Proposal does not exist");
        require(!proposals[id].executed, "Already executed");
        require(!proposals[id].vetoed, "Already vetoed");

        proposals[id].vetoed = true;

        emit ProposalVetoed(id, msg.sender);
    }

    function getProposal(string memory id) external view returns (Proposal memory) {
        require(bytes(proposals[id].id).length != 0, "Proposal does not exist");
        return proposals[id];
    }

    function getProposalCount() external view returns (uint256) {
        return proposalIds.length;
    }

    function listProposals() external view returns (Proposal[] memory) {
        Proposal[] memory allProposals = new Proposal[](proposalIds.length);
        for (uint i = 0; i < proposalIds.length; i++) {
            allProposals[i] = proposals[proposalIds[i]];
        }
        return allProposals;
    }
}
