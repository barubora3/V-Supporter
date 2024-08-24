// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/IERC20Metadata.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/// @title VTuber Donation Contract
/// @notice This contract manages donations to VTubers in ETH and ERC20 tokens
contract VTuberDonate is Ownable, ReentrancyGuard {
    address public vtuberWallet;
    address public serviceFeeWallet;
    uint256 public feePercentage; // 100 = 1%, 1000 = 10%
    uint256 public constant MAX_FEE = 2000; // 20%

    mapping(address => bool) public isTokenAllowed;

    struct Donation {
        address donor;
        address token;
        string tokenSymbol;
        uint256 amount;
        string message;
        uint256 timestamp;
    }

    Donation[] private donations;

    event NewDonation(
        address indexed donor,
        address indexed token,
        string tokenSymbol,
        uint256 amount,
        string message,
        uint256 timestamp
    );
    event FeeUpdated(uint256 oldFeePercentage, uint256 newFeePercentage);
    event VTuberWalletUpdated(address oldWallet, address newWallet);
    event ServiceFeeWalletUpdated(address oldWallet, address newWallet);
    event TokenAllowlistUpdated(address token, bool isAllowed);
    event EthWithdrawn(address indexed to, uint256 amount);

    /// @notice Contract constructor
    /// @param _vtuberWallet Address of the VTuber's wallet
    /// @param _serviceFeeWallet Address of the service fee wallet
    /// @param _initialFeePercentage Initial fee percentage (100 = 1%)
    constructor(
        address _vtuberWallet,
        address _serviceFeeWallet,
        uint256 _initialFeePercentage
    ) Ownable(msg.sender) {
        require(_vtuberWallet != address(0), "Invalid VTuber wallet");
        require(_serviceFeeWallet != address(0), "Invalid service fee wallet");
        require(
            _initialFeePercentage <= MAX_FEE,
            "Fee percentage exceeds maximum"
        );

        vtuberWallet = _vtuberWallet;
        serviceFeeWallet = _serviceFeeWallet;
        feePercentage = _initialFeePercentage;

        isTokenAllowed[address(0)] = true; // Allow ETH by default
    }

    receive() external payable {
        // Allow receiving ETH
    }

    /// @notice Donate ERC20 tokens
    /// @param _token Address of the ERC20 token
    /// @param _amount Amount of tokens to donate
    /// @param _message Donation message
    function donateToken(
        address _token,
        uint256 _amount,
        string memory _message
    ) public nonReentrant {
        require(isTokenAllowed[_token], "Token not allowed");
        require(_amount > 0, "Donation amount must be greater than 0");

        IERC20 token = IERC20(_token);
        require(
            token.balanceOf(msg.sender) >= _amount,
            "Insufficient token balance"
        );
        require(
            token.allowance(msg.sender, address(this)) >= _amount,
            "Insufficient token allowance"
        );

        uint256 fee = (_amount * feePercentage) / 10000;
        uint256 vtuberAmount = _amount - fee;

        require(
            token.transferFrom(msg.sender, address(this), _amount),
            "Token transfer failed"
        );
        require(
            token.transfer(vtuberWallet, vtuberAmount),
            "VTuber token transfer failed"
        );
        if (fee > 0) {
            require(
                token.transfer(serviceFeeWallet, fee),
                "Fee token transfer failed"
            );
        }

        string memory tokenSymbol = "UNKNOWN";
        try IERC20Metadata(_token).symbol() returns (string memory symbol) {
            tokenSymbol = symbol;
        } catch {
            // Keep "UNKNOWN" if symbol retrieval fails
        }

        donations.push(
            Donation(
                msg.sender,
                _token,
                tokenSymbol,
                _amount,
                _message,
                block.timestamp
            )
        );
        emit NewDonation(
            msg.sender,
            _token,
            tokenSymbol,
            _amount,
            _message,
            block.timestamp
        );
    }

    function donateEth(string memory _message) public payable nonReentrant {
        require(msg.value > 0, "Donation amount must be greater than 0");

        uint256 fee = (msg.value * feePercentage) / 10000;
        uint256 vtuberAmount = msg.value - fee;

        (bool vtuberSent, ) = vtuberWallet.call{value: vtuberAmount}("");
        require(vtuberSent, "Failed to send ETH to VTuber");

        if (fee > 0) {
            (bool feeSent, ) = serviceFeeWallet.call{value: fee}("");
            require(feeSent, "Failed to send fee");
        }

        donations.push(
            Donation(
                msg.sender,
                address(0),
                "ETH",
                msg.value,
                _message,
                block.timestamp
            )
        );
        emit NewDonation(
            msg.sender,
            address(0),
            "ETH",
            msg.value,
            _message,
            block.timestamp
        );
    }

    /// @notice Withdraw accidentally sent ETH
    /// @dev Only the contract owner can call this function
    function withdrawEth() public onlyOwner {
        uint256 balance = address(this).balance;
        require(balance > 0, "No ETH to withdraw");

        address owner = owner();
        (bool sent, ) = owner.call{value: balance}("");
        require(sent, "Failed to send ETH");

        emit EthWithdrawn(owner, balance);
    }

    /// @notice Set the fee percentage
    /// @param _newFeePercentage New fee percentage (100 = 1%)
    function setFeePercentage(uint256 _newFeePercentage) public onlyOwner {
        require(
            _newFeePercentage <= MAX_FEE,
            "Fee percentage cannot exceed 20%"
        );
        uint256 oldFeePercentage = feePercentage;
        feePercentage = _newFeePercentage;
        emit FeeUpdated(oldFeePercentage, _newFeePercentage);
    }

    /// @notice Update the VTuber's wallet address
    /// @param _newWallet New VTuber wallet address
    function updateVTuberWallet(address _newWallet) public onlyOwner {
        require(_newWallet != address(0), "Invalid wallet address");
        address oldWallet = vtuberWallet;
        vtuberWallet = _newWallet;
        emit VTuberWalletUpdated(oldWallet, _newWallet);
    }

    /// @notice Update the service fee wallet address
    /// @param _newWallet New service fee wallet address
    function updateServiceFeeWallet(address _newWallet) public onlyOwner {
        require(_newWallet != address(0), "Invalid wallet address");
        address oldWallet = serviceFeeWallet;
        serviceFeeWallet = _newWallet;
        emit ServiceFeeWalletUpdated(oldWallet, _newWallet);
    }

    /// @notice Set token allowlist status
    /// @param _token Token address
    /// @param _isAllowed Whether the token is allowed
    function setTokenAllowlist(
        address _token,
        bool _isAllowed
    ) public onlyOwner {
        require(_token != address(0), "Cannot change ETH allowlist status");
        isTokenAllowed[_token] = _isAllowed;
        emit TokenAllowlistUpdated(_token, _isAllowed);
    }

    /// @notice Get the total number of donations
    /// @return The number of donations
    function getDonationCount() public view returns (uint256) {
        return donations.length;
    }

    /// @notice Get a specific donation by index
    /// @param _index The index of the donation
    /// @return Donation details
    function getDonation(
        uint256 _index
    )
        public
        view
        returns (
            address,
            address,
            string memory,
            uint256,
            string memory,
            uint256
        )
    {
        require(_index < donations.length, "Invalid donation index");
        Donation memory donation = donations[_index];
        return (
            donation.donor,
            donation.token,
            donation.tokenSymbol,
            donation.amount,
            donation.message,
            donation.timestamp
        );
    }

    /// @notice Get paginated donations
    /// @param _startIndex Start index for pagination
    /// @param _limit Maximum number of donations to return
    /// @return result Array of donations
    /// @return hasMore Whether there are more donations to fetch
    function getDonationsPaginated(
        uint256 _startIndex,
        uint256 _limit
    ) public view returns (Donation[] memory result, bool hasMore) {
        require(_startIndex < donations.length, "Start index out of bounds");

        uint256 endIndex = _startIndex + _limit;
        if (endIndex > donations.length) {
            endIndex = donations.length;
        }

        uint256 itemsCount = endIndex - _startIndex;
        result = new Donation[](itemsCount);

        for (uint256 i = 0; i < itemsCount; i++) {
            result[i] = donations[_startIndex + i];
        }

        hasMore = endIndex < donations.length;
    }
}
