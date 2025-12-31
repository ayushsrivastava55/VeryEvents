// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./EventTicket.sol";

contract EventFactory {
    address[] public deployedEvents;

    event EventCreated(address indexed eventAddress, string name, address indexed organizer);

    function createEvent(
        string memory _name,
        uint256 _date,
        uint256 _price,
        uint256 _maxTickets,
        string memory _imageUrl
    ) external {
        EventTicket newEvent = new EventTicket(_name, _date, _price, _maxTickets, _imageUrl);
        newEvent.transferOwnership(msg.sender);
        deployedEvents.push(address(newEvent));
        emit EventCreated(address(newEvent), _name, msg.sender);
    }

    function getDeployedEvents() external view returns (address[] memory) {
        return deployedEvents;
    }
}
