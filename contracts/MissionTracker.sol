pragma solidity ^0.4.21;

import "../node_modules/openzeppelin-solidity/contracts/token/ERC721/ERC721Token.sol";

contract MissionTracker {
    // Maps reviewer ID -> game address -> checkpoint ID -> complete
    mapping (address => mapping (address => mapping (uint256 => bool))) completedCheckpoints;
    // Maps game address -> checkpoint names (aligned with checkpoint IDs)
    mapping (address => string[]) allCheckpoints; 
	// ERC721Token templates for achievement-based tokens (checkpoints, etc.) and item-based tokens (future implementation)
	ERC721Token achievementToken = new ERC721Token("achievement", "achievement");
	ERC721Token itemToken = new ERC721Token("item", "item");
	// Unique ID representation of next token
	uint256 _tokenID = 0;

    /**
    Records on the blockchain that a reviewer has completed a game's checkpoint.

    The game is identified by the address of the function caller; that is, the game must have a 
    wallet which calls the function to register the checkpoint. This ensures that only the game 
    itself can record checkpoints.

    Args:
        _reviewer: the address of the reviewer
        _checkpoint: the index of the checkpoint in the game's `allCheckpoints` entry.
		_URI: the user passed-in value for the token data. Suggested format is "[reviewer address] [checkpoint name]"
     
     Returns:
        (bool) whether the operation was successfully performed.
     */
    function setCheckpointComplete(address _reviewer, uint256 _checkpoint, string _URI) public returns (bool success) {
		_tokenID += 1;
		achievementToken.create_token(_reviewer, _tokenID, _URI);
        completedCheckpoints[_reviewer][msg.sender][_checkpoint] = true;
        return true;
    }

    /**
    Returns whether a given reviewer has a achieved a certain checkpoint in a given game.

    Args:
        _reviewer: the address of the reviewer
        _game: the address of the game's wallet.
        _checkpoint: the index of the checkpoint in the game's `allCheckpoints` entry.
     
     Returns:
        (bool) whether the reviewer has completed the particular checkpoint.
     */
    function getCheckpointComplete(address _reviewer, address _game, uint256 _checkpoint) view public returns (bool complete) {
        return completedCheckpoints[_reviewer][_game][_checkpoint];
    }

    /**
    Registers the existence of a new checkpoint for a game.

    It is helpful to have a list of all possible checkpoints for a game, to determine
    what a reviewer was unable to complete. Games should register all possible checkpoints
    in advance using this function to build that list.

    Args:
        _checkpointName: the string name given to the checkpoint by the game creator.
     
     Returns:
        (bool) whether the transaction was successful.
     */
    function addGameCheckpoint(string _checkpointName) public returns (bool success) {
        allCheckpoints[msg.sender].push(_checkpointName);
        return true;
    }

    /**
    Returns the string names of a checkpoint with given numerical ID.

    Args:
        _game: the address of the game's wallet.
        _checkpoint: the numerical ID of the checkpoint.

    Returns:
        (string) the strings name of the game checkpoint.
     */
    function getGameCheckpointName(address _game, uint256 _checkpoint) view public returns (string name) {
        return allCheckpoints[_game][_checkpoint];
    }

    /**
     Returns the number of checkpoints in a particular game.

     This should primarily be used to iterate over the checkpoints of a game to acquire their names and completion status.
     
    Args:
        _game: the address of the game's wallet.
    
    Returns:
        (uint256) the number of checkpoints in the game.
     */
    function getGameCheckpointCount(address _game) view public returns (uint256 checkpointCount) {
        return allCheckpoints[_game].length;
    }
	
    /**
     Transfers token from one user to the next

     
    Args:
		_send: the address of the sender
		_receive: the address of the recipient
		_ID: the token ID
    
    Returns:
		(bool) success
     */
    function transferToken(address _send, address _receive, uint256 _ID) public returns (bool success) {
		require(!achievementToken.exists(_ID));
		achievementToken.safeTransferFrom(_send, _receive, _ID);
		return true;
    }

    /**
    Creates an item as a token and assigns ownership to a certain user

     
    Args:
        _reviewer: the address of the reviewer
		_URI: the user passed-in value for the token data. Suggested format is "[reviewer address] [item type] [stats] ..."
     
     Returns:
        (bool) whether the operation was successfully performed.
     */
	function itemAsToken(address _reviewer, string _URI) public returns (bool success) {
		_tokenID += 1;
		itemToken.create_token(_reviewer, _tokenID, _URI);
        return true;
    }
}
