/*
 * Copyright (C) 2022  Christian Felde
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 *
 * SPDX-License-Identifier: GPL-3.0-or-later
 */
pragma solidity ^0.8.0;

import "../NuPoW.sol";

contract TestNuPoW is NuPoW {
    uint public pingValue;
    uint public pingTime;

    event TestChallenge(bool progress, uint mint, address receiver);

    constructor() NuPoW(5, 60, 10 seconds) {}

    function challenge(
        uint seed
    ) public returns (
        bool progress,
        uint mint,
        address receiver
    ) {
        _manage(bytes32(type(uint).max));
        mint = _challenge(seed);
        progress = mint > 0;
        receiver = msg.sender;
        emit TestChallenge(progress, mint, receiver);
    }

    function ping() public returns (bool) {
        pingValue = block.number;
        pingTime = block.timestamp;
        return true;
    }
}