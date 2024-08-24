// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "@openzeppelin/contracts/utils/Base64.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "@openzeppelin/contracts/utils/cryptography/MessageHashUtils.sol";

contract StreamMementoNFT is ERC721, Ownable {
    using Strings for uint256;

    uint256 private _nextTokenId;

    struct StreamData {
        string name;
        string thumbnailUrl;
        uint256 streamDate;
        uint256 viewCount;
        uint256 likeCount;
    }

    mapping(uint256 => StreamData) private _streamData;

    bool public signatureCheckEnabled;
    address public signerAddress;

    event StreamMementoMinted(
        uint256 indexed tokenId,
        address indexed owner,
        string name
    );
    event SignatureCheckToggled(bool isEnabled);
    event SignerAddressUpdated(address newSigner);

    constructor() ERC721("StreamMementoNFT", "SMNFT") Ownable(msg.sender) {
        signerAddress = _msgSender();
        signatureCheckEnabled = true;
        _nextTokenId = 1; // トークンIDを1から開始
    }

    function toggleSignatureCheck(bool _enabled) public onlyOwner {
        signatureCheckEnabled = _enabled;
        emit SignatureCheckToggled(_enabled);
    }

    function setSignerAddress(address _newSigner) public onlyOwner {
        signerAddress = _newSigner;
        emit SignerAddressUpdated(_newSigner);
    }

    function mintStreamMemento(
        string memory name,
        string memory thumbnailUrl,
        uint256 streamDate,
        uint256 viewCount,
        uint256 likeCount,
        bytes memory signature
    ) public returns (uint256) {
        if (signatureCheckEnabled) {
            bytes32 messageHash = keccak256(
                abi.encodePacked(
                    name,
                    thumbnailUrl,
                    streamDate,
                    viewCount,
                    likeCount,
                    msg.sender
                )
            );
            bytes32 ethSignedMessageHash = MessageHashUtils
                .toEthSignedMessageHash(messageHash);
            address recoveredSigner = ECDSA.recover(
                ethSignedMessageHash,
                signature
            );
            require(recoveredSigner == signerAddress, "Invalid signature");
        }

        uint256 newTokenId = _nextTokenId++;
        _safeMint(msg.sender, newTokenId);

        _streamData[newTokenId] = StreamData(
            name,
            thumbnailUrl,
            streamDate,
            viewCount,
            likeCount
        );

        emit StreamMementoMinted(newTokenId, msg.sender, name);

        return newTokenId;
    }

    function getStreamData(
        uint256 tokenId
    ) public view returns (StreamData memory) {
        require(
            _ownerOf(tokenId) != address(0),
            "StreamMementoNFT: Query for nonexistent token"
        );
        return _streamData[tokenId];
    }

    function tokenURI(
        uint256 tokenId
    ) public view virtual override returns (string memory) {
        require(
            _ownerOf(tokenId) != address(0),
            "ERC721Metadata: URI query for nonexistent token"
        );

        StreamData memory data = _streamData[tokenId];

        string memory json = Base64.encode(
            bytes(
                string(
                    abi.encodePacked(
                        '{"name": "',
                        data.name,
                        '",',
                        '"description": "Stream Memento NFT for ',
                        data.name,
                        '",',
                        '"image": "',
                        data.thumbnailUrl,
                        '",',
                        '"attributes": [',
                        '{"trait_type": "Stream Date", "value": "',
                        data.streamDate.toString(),
                        '"},',
                        '{"trait_type": "View Count", "value": "',
                        data.viewCount.toString(),
                        '"},',
                        '{"trait_type": "Like Count", "value": "',
                        data.likeCount.toString(),
                        '"}',
                        "]}"
                    )
                )
            )
        );
        return string(abi.encodePacked("data:application/json;base64,", json));
    }
}
