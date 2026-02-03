// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title MyContract
 * @dev A simple contract that stores and updates a string value
 */
contract MyContract {
    // State variable to store the string
    string private storedString;

    // Event emitted when the string is updated
    event StringUpdated(string newString, address updatedBy);

    /**
     * @dev Constructor that initializes the contract with an initial string
     * @param _initialString The initial string value to store
     */
    constructor(string memory _initialString) {
        storedString = _initialString;
        emit StringUpdated(_initialString, msg.sender);
    }

    /**
     * @dev Updates the stored string
     * @param _newString The new string value to store
     */
    function updateString(string memory _newString) public {
        storedString = _newString;
        emit StringUpdated(_newString, msg.sender);
    }

    /**
     * @dev Returns the currently stored string
     * @return The stored string value
     */
    function getString() public view returns (string memory) {
        return storedString;
    }
}


