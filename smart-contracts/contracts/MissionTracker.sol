pragma solidity ^0.4.21;

struct ReviewerStruct {
	string name;
	string email;
	mapping (uint256 => bool[]) games;
}

contract MissionTracker {
 mapping (uint256 => ReviewerStruct) checkpoints;
 uint256 gameID = 0;
 uint256 reviewerID = 0;
 mapping (uint256 => string) games;

 function createReviewer(string _name, string _email) {
	reviewerID += 1;	
	checkpoints[reviewerID] = ReviewerStruct({name: _name, email: _email});
}

 function setCheckpoint(uint256 _reviewer, uint256 _game, uint256 _checkpoint) public returns (bool success) {
	checkpoints[_reviewer].games[_game][_checkpoint] = true;
	return true;
}

 function getCheckpoint(uint256 _reviewer, uint256 _game, uint256 _checkpoint) public returns (bool value) {
	return checkpoints[_reviewer].games[_game][_checkpoint];
}

 function addGame(string _game) public returns (bool success) {
	gameID += 1;
	games[gameID] = _game;
}


}
