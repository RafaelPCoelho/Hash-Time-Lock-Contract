// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "../node_modules/@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "../node_modules/@openzeppelin/contracts/access/Ownable.sol";

contract HTLC {
    uint public startTime;
    uint public lockTime = 10000 seconds;
    string public secret; //abracadabra
    bytes32 public hash = 0xfd69353b27210d2567bc0ade61674bbc3fc01a558a61c2a0cb2b13d96f9387cd;
    address public recipient;
    address public owner;
    uint public amount;

    constructor(
        address _token,
        address _recipient,
        uint256 _amount 
    ) {
        recipient = _recipient;
        owner = msg.sender; 
        amount = _amount;
    }

    function withdraw(string memory _secret) external {
        require(keccak256(abi.encodePacked(_secret)) == hash, "wrong secret");
        secret = _secret;
        payable(recipient).transfer(amount);
    }

    function refund() external {
        require(block.timestamp > startTime + lockTime, "too early");
        require(owner == msg.sender, "Not the token owner");
        payable(owner).transfer(amount);
    }
}
