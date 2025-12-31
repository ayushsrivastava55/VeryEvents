// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "@openzeppelin/contracts/utils/Base64.sol";

contract EventTicket is ERC721URIStorage, Ownable {
    using Strings for uint256;

    struct EventData {
        string name;
        uint256 date;
        uint256 ticketPrice;
        uint256 maxTickets;
        uint256 minted;
        bool active;
        string imageUrl;
    }

    EventData public eventData;
    mapping(uint256 => bool) public ticketUsed;

    constructor(
        string memory _name,
        uint256 _date,
        uint256 _price,
        uint256 _maxTickets,
        string memory _imageUrl
    ) ERC721("VeryEventTicket", "VET") Ownable(msg.sender) {
        eventData = EventData(_name, _date, _price, _maxTickets, 0, true, _imageUrl);
    }

    function mintTicket() external payable {
        require(eventData.active, "Event not active");
        require(eventData.minted < eventData.maxTickets, "Sold out");
        require(msg.value >= eventData.ticketPrice, "Insufficient payment");

        eventData.minted++;
        uint256 tokenId = eventData.minted;
        _mint(msg.sender, tokenId);
        
        // Set token metadata
        _setTokenURI(tokenId, _generateTokenURI(tokenId));

        // Refund excess payment
        if (msg.value > eventData.ticketPrice) {
            payable(msg.sender).transfer(msg.value - eventData.ticketPrice);
        }
    }

    function _generateTokenURI(uint256 tokenId) internal view returns (string memory) {
        string memory json = Base64.encode(
            bytes(
                string(
                    abi.encodePacked(
                        '{"name": "',
                        eventData.name,
                        ' - Ticket #',
                        tokenId.toString(),
                        '", "description": "NFT ticket for ',
                        eventData.name,
                        '. Valid proof of attendance and access.", "image": "',
                        eventData.imageUrl,
                        '", "attributes": [',
                        '{"trait_type": "Event", "value": "',
                        eventData.name,
                        '"},',
                        '{"trait_type": "Ticket Number", "value": "',
                        tokenId.toString(),
                        '"},',
                        '{"trait_type": "Price", "value": "',
                        (eventData.ticketPrice / 1e18).toString(),
                        ' VERY"},',
                        '{"trait_type": "Status", "value": "',
                        ticketUsed[tokenId] ? "Used" : "Valid",
                        '"}',
                        ']}'
                    )
                )
            )
        );
        return string(abi.encodePacked("data:application/json;base64,", json));
    }

    function getEventInfo() external view returns (
        string memory name,
        uint256 date,
        uint256 ticketPrice,
        uint256 maxTickets,
        uint256 minted,
        bool active
    ) {
        return (
            eventData.name,
            eventData.date,
            eventData.ticketPrice,
            eventData.maxTickets,
            eventData.minted,
            eventData.active
        );
    }

    function checkIn(uint256 tokenId) external {
        require(ownerOf(tokenId) == msg.sender, "Not ticket owner");
        ticketUsed[tokenId] = true;
    }

    function withdrawFunds() external onlyOwner {
        require(!eventData.active || block.timestamp > eventData.date, "Cannot withdraw yet");
        payable(owner()).transfer(address(this).balance);
    }

    function deactivateEvent() external onlyOwner {
        eventData.active = false;
    }
}
