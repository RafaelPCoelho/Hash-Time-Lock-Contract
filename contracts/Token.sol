// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import '../node_modules/@openzeppelin/contracts/token/ERC721/ERC721.sol';
import "../node_modules/@openzeppelin/contracts/access/Ownable.sol";

contract Token is ERC721 , Ownable{
  constructor(
    string memory name, 
    string memory ticker
  ) 
    ERC721(name, ticker) 
  {
    _mint(msg.sender, 1);
  }
}
