pragma solidity ^0.4.21;

contract MissionTracker {
    // Maps reviewer ID -> game address -> checkpoint ID -> complete
    mapping (uint256 => mapping (address => mapping (uint256 => bool))) completedCheckpoints;
    // Maps game address -> checkpoint names (aligned with checkpoint IDs)
    mapping (address => string[]) allCheckpoints;

    /**
    Records on the blockchain that a reviewer has completed a game's checkpoint.

    The game is identified by the address of the function caller; that is, the game must have a 
    wallet which calls the function to register the checkpoint. This ensures that only the game 
    itself can record checkpoints.

    Args:
        _reviewer: the ID of the reviewer who completed the checkpoint. The ID should be mapped to
            the reviewer's identity externally.
        _checkpoint: the index of the checkpoint in the game's `allCheckpoints` entry.
     */
    function setCheckpointComplete(uint256 _reviewer, address _game, uint256 _checkpoint) public returns (bool success) {
        completedCheckpoints[_reviewer][_game][_checkpoint] = true;
        return true;
    }

    /**
    Returns whether a given reviewer has a achieved a certain checkpoint in a given game.

    Args:
        _reviewer: the ID of the reviewer whose completion status is to be checked.
        _game: the address of the game's wallet.
        _checkpoint: the index of the checkpoint in the game's `allCheckpoints` entry.
     */
    function getCheckpointComplete(uint256 _reviewer, address _game, uint256 _checkpoint) view public returns (bool complete) {
        return completedCheckpoints[_reviewer][_game][_checkpoint];
    }

    /**
    Registers the existence of a new checkpoint for a game.

    It is helpful to have a list of all possible checkpoints for a game, to determine
    what a reviewer was unable to complete. Games should register all possible checkpoints
    in advance using this function to build that list.

    Args:
        _checkpointName: the string name given to the checkpoint by the game creator.
     */
    function addGameCheckpoint(string _checkpointName) public returns (uint256 checkpointId) {
        allCheckpoints[msg.sender].push(_checkpointName);
        return allCheckpoints[msg.sender].length;
    }
}
