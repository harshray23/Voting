import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

export default buildModule("DaoVotingModule", (m) => {
  const daoVoting = m.contract("DaoVoting", []);

  return { daoVoting };
});
