// SPDX-License-Identifier: MIT
// Compatible with OpenZeppelin Contracts ^5.0.0
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/ERC721/utils/ERC721Holder.sol";

contract HTLC is ERC721Holder {
    uint public startTime;
    uint public lockTime = 10000 seconds;
    string public secret; //abracadabra
    bytes32 public hash = 0xfd69353b27210d2567bc0ade61674bbc3fc01a558a61c2a0cb2b13d96f9387cd;
    address public recipient;
    address public owner;
    uint public tokenId;
    IERC721 public token;

    event Funded(address indexed funder, uint256 tokenId);
    event Withdrawn(address indexed recipient, uint256 tokenId);
    event Refunded(address indexed owner, uint256 tokenId);

    constructor(address _recipient, address _token, uint _tokenId) {
        recipient = _recipient;
        owner = msg.sender;
        tokenId = _tokenId;
        token = IERC721(_token);
    }

    function fund() external {
        require(token.ownerOf(tokenId) == msg.sender, "HTLC721: Only the owner can fund");
        require(token.getApproved(tokenId) == address(this) || token.isApprovedForAll(msg.sender, address(this)), "HTLC721: Contract is not approved to transfer this token");
        startTime = block.timestamp;
        token.safeTransferFrom(msg.sender, address(this), tokenId);
        emit Funded(msg.sender, tokenId);
    }

    function withdraw(string memory _secret) external {
        require(keccak256(abi.encodePacked(_secret)) == hash, 'HTLC721: Wrong secret');
        require(msg.sender == recipient, 'HTLC721: Only recipient can withdraw');
        secret = _secret;
        token.safeTransferFrom(address(this), recipient, tokenId);
        emit Withdrawn(recipient, tokenId);
    }

    function refund() external {
        require(block.timestamp > startTime + lockTime, 'HTLC721: Too early');
        require(msg.sender == owner, 'HTLC721: Only owner can refund');
        token.safeTransferFrom(address(this), owner, tokenId);
        emit Refunded(owner, tokenId);
    }

}
