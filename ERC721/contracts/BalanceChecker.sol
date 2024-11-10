// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract BalanceChecker {
    function getBalance(address account) external view returns (uint256) {
        return account.balance;
    }
}
