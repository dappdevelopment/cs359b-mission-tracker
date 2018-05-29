var Mission = artifacts.require("MissionTracker");

module.exports = function(deployer) {
	deployer.deploy(Mission, "VirtualItem", "VITM");
};
