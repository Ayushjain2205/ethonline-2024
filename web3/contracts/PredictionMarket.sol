// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract PredictionMarket is Ownable {
    struct Market {
        address creator;
        string question;
        uint256 endTime;
        bool resolved;
        uint256 yesShares;
        uint256 noShares;
        mapping(address => uint256) yesBalances;
        mapping(address => uint256) noBalances;
        address[] participants;
    }

    IERC20 public token;
    uint256 public marketCount;
    mapping(uint256 => Market) public markets;

    event MarketCreated(
        uint256 indexed marketId,
        address creator,
        string question,
        uint256 endTime
    );
    event SharesPurchased(
        uint256 indexed marketId,
        address buyer,
        bool isYes,
        uint256 amount
    );
    event MarketResolved(uint256 indexed marketId, bool outcome);
    event PayoutDistributed(
        uint256 indexed marketId,
        address recipient,
        uint256 amount
    );

    error InvalidEndTime();
    error MarketAlreadyResolved();
    error MarketNotEnded();
    error MarketEnded();
    error InsufficientAllowance();

    constructor(address _token, address initialOwner) Ownable(initialOwner) {
        token = IERC20(_token);
    }

    function createMarket(string memory _question, uint256 _endTime) external {
        if (_endTime <= block.timestamp) {
            revert InvalidEndTime();
        }

        marketCount++;
        Market storage newMarket = markets[marketCount];
        newMarket.creator = msg.sender;
        newMarket.question = _question;
        newMarket.endTime = _endTime;

        emit MarketCreated(marketCount, msg.sender, _question, _endTime);
    }

    function buyShares(
        uint256 _marketId,
        bool _isYes,
        uint256 _amount
    ) external {
        Market storage market = markets[_marketId];
        if (market.resolved) {
            revert MarketAlreadyResolved();
        }
        if (block.timestamp >= market.endTime) {
            revert MarketEnded();
        }

        if (token.allowance(msg.sender, address(this)) < _amount) {
            revert InsufficientAllowance();
        }

        require(
            token.transferFrom(msg.sender, address(this), _amount),
            "Token transfer failed"
        );

        if (_isYes) {
            market.yesShares += _amount;
            market.yesBalances[msg.sender] += _amount;
        } else {
            market.noShares += _amount;
            market.noBalances[msg.sender] += _amount;
        }

        if (
            (market.yesBalances[msg.sender] == _amount &&
                market.noBalances[msg.sender] == 0) ||
            (market.noBalances[msg.sender] == _amount &&
                market.yesBalances[msg.sender] == 0)
        ) {
            market.participants.push(msg.sender);
        }

        emit SharesPurchased(_marketId, msg.sender, _isYes, _amount);
    }

    function resolveMarket(
        uint256 _marketId,
        bool _outcome
    ) external onlyOwner {
        Market storage market = markets[_marketId];
        if (market.resolved) {
            revert MarketAlreadyResolved();
        }
        if (block.timestamp < market.endTime) {
            revert MarketNotEnded();
        }

        market.resolved = true;

        uint256 totalShares = market.yesShares + market.noShares;
        uint256 winningShares = _outcome ? market.yesShares : market.noShares;

        for (uint256 i = 0; i < market.participants.length; i++) {
            address participant = market.participants[i];
            uint256 participantShares = _outcome
                ? market.yesBalances[participant]
                : market.noBalances[participant];

            if (participantShares > 0) {
                uint256 payout = (participantShares * totalShares) /
                    winningShares;
                require(
                    token.transfer(participant, payout),
                    "Token transfer failed"
                );
                emit PayoutDistributed(_marketId, participant, payout);
            }
        }

        emit MarketResolved(_marketId, _outcome);
    }

    function getMarketDetails(
        uint256 _marketId
    )
        external
        view
        returns (
            address creator,
            string memory question,
            uint256 endTime,
            bool resolved,
            uint256 yesShares,
            uint256 noShares
        )
    {
        Market storage market = markets[_marketId];
        return (
            market.creator,
            market.question,
            market.endTime,
            market.resolved,
            market.yesShares,
            market.noShares
        );
    }

    function getUserShares(
        uint256 _marketId,
        address _user
    ) external view returns (uint256 yesShares, uint256 noShares) {
        Market storage market = markets[_marketId];
        return (market.yesBalances[_user], market.noBalances[_user]);
    }
}
