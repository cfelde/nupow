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
import { expect } from "chai";
import { ethers } from "hardhat";
import { BigNumber} from "ethers";
import { Crystal } from "../typechain-types";

describe("Crystal contract", function () {
    it("Deployment should start with default values", async function () {
        const Crystal = await ethers.getContractFactory("Crystal");
        const contract = (await Crystal.deploy(
            "NuPoW Quartz",
            "NPQ",
            "0xffff000cfe1de000cfe1de000cfe1de000cfe1de000cfe1de000cfe1de000000"
        )) as Crystal;

        expect(await contract.name()).to.be.equal("NuPoW Quartz");
        expect(await contract.symbol()).to.be.equal("NPQ");
        expect(await contract.MAX_TOTAL_MINT()).to.be.equal(BigNumber.from("0xffff000cfe1de000cfe1de000cfe1de000cfe1de000cfe1de000cfe1de000000"));

        expect(await contract.totalSupply()).to.be.equal(BigNumber.from("0"));

        expect(await contract.CHAIN_LENGTH_TARGET()).to.equal(BigNumber.from("37"));
        expect(await contract.MAX_MINT()).to.equal(BigNumber.from("0x1000000000000000"));
        expect(await contract.STALLED_DURATION()).to.equal(BigNumber.from(60 * 30));

        expect(await contract.chainLength()).to.equal(BigNumber.from("0"));
        expect(await contract.nextMint()).to.equal(BigNumber.from("0x1000000000000000"));
        expect(await contract.stalledTimestamp()).to.be.equal(BigNumber.from("0"));
        expect(await contract.lastHash()).to.equal(BigNumber.from("0x0000000000000000000000000000000000000000000000000000000000000000"));
        expect(await contract.lastChallenger()).to.equal("0x0000000000000000000000000000000000000000");
    });

    // TODO Test flashFee, cap
});
