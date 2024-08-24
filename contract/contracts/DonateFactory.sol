// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./VTuberDonate.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/// @title VTuber Donate Factory Contract
/// @notice This contract creates and manages VTuberDonate contracts
contract VTuberDonateFactory is Ownable {
    address public defaultServiceFeeWallet;
    uint256 public defaultFeePercentage;

    mapping(address => address[]) public vtuberContracts;
    address[] public allContracts;

    uint256 public constant MAX_FEE = 2000; // 20%

    event DonateContractCreated(
        address indexed vtuber,
        address contractAddress
    );
    event DefaultServiceFeeWalletUpdated(address oldWallet, address newWallet);
    event DefaultFeePercentageUpdated(
        uint256 oldFeePercentage,
        uint256 newFeePercentage
    );

    /// @notice Contract constructor
    /// @param _defaultServiceFeeWallet Default service fee wallet address
    /// @param _defaultFeePercentage Default fee percentage (100 = 1%)
    constructor(
        address _defaultServiceFeeWallet,
        uint256 _defaultFeePercentage
    ) Ownable(msg.sender) {
        require(
            _defaultServiceFeeWallet != address(0),
            "Invalid service fee wallet"
        );
        require(
            _defaultFeePercentage <= MAX_FEE,
            "Fee percentage exceeds maximum"
        );

        defaultServiceFeeWallet = _defaultServiceFeeWallet;
        defaultFeePercentage = _defaultFeePercentage;
    }

    /// @notice Create a new VTuberDonate contract
    /// @param _vtuberWallet Address of the VTuber's wallet
    /// @return address of the newly created VTuberDonate contract
    function createDonateContract(
        address _vtuberWallet
    ) public returns (address) {
        VTuberDonate newContract = new VTuberDonate(
            _vtuberWallet,
            defaultServiceFeeWallet,
            defaultFeePercentage
        );

        newContract.transferOwnership(msg.sender);
        vtuberContracts[_vtuberWallet].push(address(newContract));
        allContracts.push(address(newContract));

        emit DonateContractCreated(_vtuberWallet, address(newContract));

        return address(newContract);
    }

    /// @notice Get all contracts for a specific VTuber
    /// @param _vtuberWallet Address of the VTuber's wallet
    /// @return Array of contract addresses
    function getVTuberContracts(
        address _vtuberWallet
    ) public view returns (address[] memory) {
        return vtuberContracts[_vtuberWallet];
    }

    /// @notice Get all created contracts
    /// @return Array of all contract addresses
    function getAllContracts() public view returns (address[] memory) {
        return allContracts;
    }

    /// @notice Get the total number of created contracts
    /// @return Number of contracts
    function contractCount() public view returns (uint256) {
        return allContracts.length;
    }

    /// @notice Set the default service fee wallet
    /// @param _newWallet New default service fee wallet address
    function setDefaultServiceFeeWallet(address _newWallet) public onlyOwner {
        require(_newWallet != address(0), "Invalid wallet address");
        address oldWallet = defaultServiceFeeWallet;
        defaultServiceFeeWallet = _newWallet;
        emit DefaultServiceFeeWalletUpdated(oldWallet, _newWallet);
    }

    /// @notice Set the default fee percentage
    /// @param _newFeePercentage New default fee percentage (100 = 1%)
    function setDefaultFeePercentage(
        uint256 _newFeePercentage
    ) public onlyOwner {
        require(_newFeePercentage <= MAX_FEE, "Fee percentage exceeds maximum");
        uint256 oldFeePercentage = defaultFeePercentage;
        defaultFeePercentage = _newFeePercentage;
        emit DefaultFeePercentageUpdated(oldFeePercentage, _newFeePercentage);
    }
}
