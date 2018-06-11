pragma solidity ^0.4.21;

import "../node_modules/openzeppelin-solidity/contracts/token/ERC721/ERC721Token.sol";

contract MissionTracker is ERC721Token {
    mapping (uint256 => address) tokenToCreator;
    mapping (uint256 => uint256) tokenToRewardId;
    mapping (uint256 => string) rewardIdToName;
    mapping (address => uint256[]) creatorToAllowedRewards;
    mapping (address => string) gameAddressToName;
    
    uint256 internal _nextTokenId = 0;
    uint256 internal _nextRewardId = 0;

    event Token(uint256 _id);
    event Reward(uint256 _id, address _creator);

    constructor(string name_, string symbol_) ERC721Token(name_, symbol_) {}

    function getAllowedRewards(address _creator) public view returns (uint256[]) {
        return creatorToAllowedRewards[_creator];
    }

    function getRewardName(uint256 _rewardId) public view returns (string) {
        return rewardIdToName[_rewardId];
    }

    function getTokenReward(uint256 _tokenId) public view returns (uint256) {
        return tokenToRewardId[_tokenId];
    }

    function getTokenCreator(uint256 _tokenId) public view returns (address) {
        return tokenToCreator[_tokenId];
    }

    function getGameName(address _game) public view returns (string) {
        return gameAddressToName[_game];
    }

    function giveReward(address _recipient, uint256 _rewardId) public returns (bool) {
        _nextTokenId += 1;
        tokenToCreator[_nextTokenId] = msg.sender;
        tokenToRewardId[_nextTokenId] = _rewardId;
        super._mint(_recipient, _nextTokenId);
        emit Token(_nextTokenId);
        return true;
    }

    function createReward(string _name) public returns (uint256) {
        _nextRewardId += 1;
        rewardIdToName[_nextRewardId] = _name;
        emit Reward(_nextRewardId, msg.sender);
        return _nextRewardId;
    }

    function allowReward(uint256 _rewardId) public returns (bool) {
        creatorToAllowedRewards[msg.sender].push(_rewardId);
        return true;
    }

    function createAndAllowReward(string _name) public returns (bool) {
        return allowReward(createReward(_name));
    }

    function registerGame(string _name) public returns (bool) {
        gameAddressToName[msg.sender] = _name;
        return true;
    }
}
