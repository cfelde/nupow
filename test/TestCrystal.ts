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
import { Crystal, TestBorrower } from "../typechain-types";

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

    it("Max total mint can be found on the cap function", async function () {
        const Crystal = await ethers.getContractFactory("Crystal");
        const contract = (await Crystal.deploy(
            "NuPoW Quartz",
            "NPQ",
            "0x000000000000000000000000000000000000000000115eec47f6cf7e35000000"
        )) as Crystal;

        expect(await contract.MAX_TOTAL_MINT()).to.be.equal(BigNumber.from("0x000000000000000000000000000000000000000000115eec47f6cf7e35000000"));
        expect(await contract.cap()).to.be.equal(BigNumber.from("0x000000000000000000000000000000000000000000115eec47f6cf7e35000000"));
        expect(await contract.totalSupply()).to.be.equal(BigNumber.from("0"));
    });

    it("Flash fee equals nextMint", async function () {
        const Crystal = await ethers.getContractFactory("Crystal");
        const contract = (await Crystal.deploy(
            "NuPoW Quartz",
            "NPQ",
            "0xffff000cfe1de000cfe1de000cfe1de000cfe1de000cfe1de000cfe1de000000"
        )) as Crystal;

        const Borrower = await ethers.getContractFactory("TestBorrower");
        const borrower = (await Borrower.deploy()) as TestBorrower;

        expect(await contract.MAX_MINT()).to.equal(BigNumber.from("0x1000000000000000"));
        expect(await contract.nextMint()).to.equal(BigNumber.from("0x1000000000000000"));
        expect(await contract.flashFee(contract.address, "0xffff000cfe1de000cfe1de000cfe1de000cfe1de000cfe1de000cfe1de000000")).to.equal(BigNumber.from("0x1000000000000000"));
        expect(await contract.flashFee(contract.address, "0x000000000000000000000000000000000000000000115eec47f6cf7e35000000")).to.equal(BigNumber.from("0x1000000000000000"));
        expect(await contract.maxFlashLoan(contract.address)).to.equal(BigNumber.from("0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff"));

        await contract.mint("0x3283f3d25b89965fb75c6ac6f643668ac7a7f6eeecfc215388e2c4e28f632b8b", "");
        await contract.transfer(borrower.address, "0x1000000000000000");

        expect(await borrower.counter()).to.be.equal(BigNumber.from("0"));
        await contract.flashLoan(borrower.address, contract.address, "0xffff000cfe1de000cfe1de000cfe1de000cfe1de000cfe1de000cfe1de000000", [1, 2, 3]);
        expect(await borrower.counter()).to.be.equal(BigNumber.from("1"));
    });
});
