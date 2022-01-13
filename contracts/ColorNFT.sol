// SPDX-License-Identifier: UNLICENSED

pragma solidity ^0.8.0;

// Import OpenZeppelin contracts
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "hardhat/console.sol";

import { Base64 } from "./libraries/Base64.sol";

contract ColorNFT is ERC721URIStorage{
  // Counters given by OpenZeppelin
  using Counters for Counters.Counter;
  Counters.Counter private _tokenIds;

  constructor() ERC721 ("ColorNFT", "COLOR") {
      console.log("This is my NFT contract. Whoa!");
  }

  // Digits to generate hexadecimal color code
  string[] digits = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "A", "B", "C", "D", "E", "F"];

  event ColorNFTMinted(address sender, uint256 tokenId);

  // So, we make a baseSvg variable here that all our NFTs can use.
  string baseSvg = "<svg xmlns='http://www.w3.org/2000/svg' preserveAspectRatio='xMinYMin meet' viewBox='0 0 350 350'><rect width='100%' height='100%' fill='";

  // Pseudo randomly pick a digit from the list
  // salt parameter allows to get different results based on it
  function pickRandomDigit(uint256 tokenId, string memory salt) public view returns (string memory) {
    // I seed the random generator. More on this in the lesson.
    uint256 rand = random(string(abi.encodePacked(salt, Strings.toString(tokenId))));
    // Squash the # between 0 and the length of the array to avoid going out of bounds.
    rand = rand % digits.length;
    return digits[rand];
  }

  function random(string memory input) internal pure returns (uint256) {
    return uint256(keccak256(abi.encodePacked(input)));
  }

  function createNFT() public {
    // Get the current tokenId, this starts at 0.
    uint256 newItemId = _tokenIds.current();

    string memory digit1 = pickRandomDigit(newItemId, "first_digit");
    string memory digit2 = pickRandomDigit(newItemId, "second_digit");
    string memory digit3 = pickRandomDigit(newItemId, "third_digit");
    string memory digit4 = pickRandomDigit(newItemId, "fourth_digit");
    string memory digit5 = pickRandomDigit(newItemId, "fifth_digit");
    string memory digit6 = pickRandomDigit(newItemId, "sixth_digit");
    string memory colorCode = string(abi.encodePacked("#", digit1, digit2, digit3, digit4, digit5, digit6));

    // Concatenate it all together, and then close <svg> tag.
    string memory finalSvg = string(abi.encodePacked(baseSvg, colorCode, "'/></svg>"));

    // Get all the JSON metadata in place and base64 encode it.
    string memory json = Base64.encode(
        bytes(
            string(
                abi.encodePacked(
                    '{"name": "',
                    // Set the color code as title of the NFT
                    colorCode,
                    '", "description": "A collection of colors living in the metaverse.", "image": "data:image/svg+xml;base64,',
                    // Add data:image/svg+xml;base64 and then append our base64 encode our svg.
                    Base64.encode(bytes(finalSvg)),
                    '"}'
                )
            )
        )
    );

    string memory finalTokenUri = string(
      abi.encodePacked("data:application/json;base64,", json)
    );

    console.log("\n--------------------");
    console.log(finalTokenUri);
    console.log("--------------------\n");

    // Actually mint the NFT to the sender using msg.sender.
    _safeMint(msg.sender, newItemId);

    // Set the NFTs data.
    _setTokenURI(newItemId, finalTokenUri);

    // Increment the counter for when the next NFT is minted.
    _tokenIds.increment();

    console.log("An NFT w/ ID %s has been minted to %s", newItemId, msg.sender);

    emit ColorNFTMinted(msg.sender, newItemId);
  }
}
