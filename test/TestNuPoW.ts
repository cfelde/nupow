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
import { TestNuPoW } from "../typechain-types";

describe("TestNuPoW contract", function () {
    it("Deployment should start with default values", async function() {
        const TestNuPoW = await ethers.getContractFactory("TestNuPoW");
        const contract = (await TestNuPoW.deploy()) as TestNuPoW;

        expect(await contract.CHAIN_LENGTH_TARGET()).to.equal(BigNumber.from("5"));
        expect(await contract.MAX_MINT()).to.equal(BigNumber.from("0x1000000000000000"));
        expect(await contract.STALLED_DURATION()).to.equal(BigNumber.from("10"));

        expect(await contract.chainLength()).to.equal(BigNumber.from("0"));
        expect(await contract.nextMint()).to.equal(BigNumber.from("0x1000000000000000"));
        expect(await contract.stalledTimestamp()).to.be.equal(BigNumber.from("0"));
        expect(await contract.lastHash()).to.equal(BigNumber.from("0x0000000000000000000000000000000000000000000000000000000000000000"));
        expect(await contract.lastChallenger()).to.equal("0x0000000000000000000000000000000000000000");
    });

    it("First challenge is stalled", async function() {
        const [, miner] = await ethers.getSigners();

        const TestNuPoW = await ethers.getContractFactory("TestNuPoW");
        const contract = (await TestNuPoW.deploy()) as TestNuPoW;

        const seed = BigNumber.from(1234);

        const challenge = await contract.connect(miner).callStatic.challenge(seed, "");
        expect(challenge.progress).to.be.true
        expect(challenge.mint).to.equal(BigNumber.from("0x1000000000000000"));
        expect(challenge.receiver).to.equal(miner.address);

        await contract.ping();
        const t1 = await contract.pingTime();

        const tx = await contract.connect(miner).challenge(seed, "first tag");
        expect(await contract.lastHash()).to.equal("0xfdf27f678fc44efe65431276072ad0ed75fd466c1c255dcaa4619611e74be99d");
        expect(await contract.chainLength()).to.equal(BigNumber.from(1));
        expect(await contract.lastChallenger()).to.equal(miner.address);

        await contract.ping();
        const t2 = await contract.pingTime();

        const stalledTimestamp = await contract.stalledTimestamp();

        expect(stalledTimestamp.gt(t1.add(10))).to.be.true;
        expect(stalledTimestamp.lt(t2.add(10))).to.be.true;

        expect(tx).to.emit(contract, 'ChainProgress').withArgs(
            miner.address,
            1,
            "0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff",
            "0xfdf27f678fc44efe65431276072ad0ed75fd466c1c255dcaa4619611e74be99d",
            "0x1000000000000000",
            "first tag"
        );
    });

    it("It is possible to make chain progress", async function() {
        const [deployer] = await ethers.getSigners();
        const miner = await new ethers.Wallet("0x112233", deployer.provider);

        await deployer.sendTransaction({to: miner.address, value: ethers.utils.parseEther("10")});

        const TestNuPoW = await ethers.getContractFactory("TestNuPoW");
        const contract = (await TestNuPoW.deploy()) as TestNuPoW;

        const txParams = [
            {
                seed: "0x3283f3d25b89965fb75c6ac6f643668ac7a7f6eeecfc215388e2c4e28f632b8b",
                chainLength: 1,
                lastHash: "0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff",
                hash: "0x487e383e1ed26abb6be142926849434960e35f460d6dad5a614beeebfa179e42"
            },
            {
                seed: "0x219f8041c07742479e96d2a20c3608961330ac96c39bd9c908d1925826a877e4",
                chainLength: 2,
                lastHash: "0x487e383e1ed26abb6be142926849434960e35f460d6dad5a614beeebfa179e42",
                hash: "0x3a4b76a036ee528b3f38d8c45e7af7969c63894f8ae121b47acaafa3befdcddc"
            },
            {
                seed: "0x82063183e14e99c355bfd9588040a70cf320c22585c635936fc566b4ddaa9d9b",
                chainLength: 3,
                lastHash: "0x3a4b76a036ee528b3f38d8c45e7af7969c63894f8ae121b47acaafa3befdcddc",
                hash: "0x3582d24f3c29f1994502bb6175d91a4239678a39c27704095ef596cc9b80bddb"
            },
            {
                seed: "0x576214b35c84e2a106aac2c76997ee20e99d25823e01902d2da8eb1a2cdc37e0",
                chainLength: 4,
                lastHash: "0x3582d24f3c29f1994502bb6175d91a4239678a39c27704095ef596cc9b80bddb",
                hash: "0x248401e06360140b312ead245edac2bd3eef3dd6d8895cb8c0a6435dc5aa30ad"
            },
            {
                seed: "0x6f7f72dedca1fdd378c7178f566f7118f2c64aa147774b9110f36599dff3c0c",
                chainLength: 5,
                lastHash: "0x248401e06360140b312ead245edac2bd3eef3dd6d8895cb8c0a6435dc5aa30ad",
                hash: "0x23cf24619a0d45b982e1a534922b57bb14151878f08c38d54124f566656e0876"
            },
            {
                seed: "0x15ed30848e28bf62e44ef276aafca8fd964b62a369a6da358f12586d5f02a0e0",
                chainLength: 6,
                lastHash: "0x23cf24619a0d45b982e1a534922b57bb14151878f08c38d54124f566656e0876",
                hash: "0x1f67e6440a7aaee9b25b04fef6cfd576e204b7218d214d278e3eca64d6702982"
            }
        ];

        for (const v of txParams) {
            const seed = BigNumber.from(v.seed);
            const tx = await contract.connect(miner).challenge(seed, "tag " + v.seed);

            expect(tx).to.emit(contract, 'ChainProgress').withArgs(
                miner.address,
                v.chainLength,
                v.lastHash,
                v.hash,
                "0x1000000000000000",
                "tag " + v.seed
            );
        }

        expect(await contract.chainLength()).to.be.equal(BigNumber.from(txParams[txParams.length-1].chainLength));
    });

    it("It is possible to make only valid chain progress", async function() {
        const [deployer] = await ethers.getSigners();
        const miner = await new ethers.Wallet("0x112233", deployer.provider);

        await deployer.sendTransaction({to: miner.address, value: ethers.utils.parseEther("10")});

        const TestNuPoW = await ethers.getContractFactory("TestNuPoW");
        const contract = (await TestNuPoW.deploy()) as TestNuPoW;

        const txParams = [
            {
                seed: "0x3283f3d25b89965fb75c6ac6f643668ac7a7f6eeecfc215388e2c4e28f632b8b",
                chainLength: 1,
                lastHash: "0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff",
                hash: "0x487e383e1ed26abb6be142926849434960e35f460d6dad5a614beeebfa179e42"
            },
            {
                seed: "0x219f8041c07742479e96d2a20c3608961330ac96c39bd9c908d1925826a877e4",
                chainLength: 2,
                lastHash: "0x487e383e1ed26abb6be142926849434960e35f460d6dad5a614beeebfa179e42",
                hash: "0x3a4b76a036ee528b3f38d8c45e7af7969c63894f8ae121b47acaafa3befdcddc"
            },
            {
                seed: "0x82063183e14e99c355bfd9588040a70cf320c22585c635936fc566b4ddaa9d9b",
                chainLength: 3,
                lastHash: "0x3a4b76a036ee528b3f38d8c45e7af7969c63894f8ae121b47acaafa3befdcddc",
                hash: "0x3582d24f3c29f1994502bb6175d91a4239678a39c27704095ef596cc9b80bddb"
            },
            {
                seed: "0x576214b35c84e2a106aac2c76997ee20e99d25823e01902d2da8eb1a2cdc37e0",
                chainLength: 4,
                lastHash: "0x3582d24f3c29f1994502bb6175d91a4239678a39c27704095ef596cc9b80bddb",
                hash: "0x248401e06360140b312ead245edac2bd3eef3dd6d8895cb8c0a6435dc5aa30ad"
            },
            {
                seed: "0x6f7f72dedca1fdd378c7178f566f7118f2c64aa147774b9110f36599dff3c0c",
                chainLength: 5,
                lastHash: "0x248401e06360140b312ead245edac2bd3eef3dd6d8895cb8c0a6435dc5aa30ad",
                hash: "0x23cf24619a0d45b982e1a534922b57bb14151878f08c38d54124f566656e0876"
            },
            {
                seed: "0x15ed30848e28bf62e44ef276aafca8fd964b62a369a6da358f12586d5f02a0e0",
                chainLength: 6,
                lastHash: "0x23cf24619a0d45b982e1a534922b57bb14151878f08c38d54124f566656e0876",
                hash: "0x1f67e6440a7aaee9b25b04fef6cfd576e204b7218d214d278e3eca64d6702982"
            }
        ];

        for (const v of txParams.slice(0, 5)) {
            const seed = BigNumber.from(v.seed);
            const tx = await contract.connect(miner).challenge(seed, "tag " + v.seed);

            expect(tx).to.emit(contract, 'TestChallenge').withArgs(
                true,
                "0x1000000000000000",
                miner.address
            );

            expect(tx).to.emit(contract, 'ChainProgress').withArgs(
                miner.address,
                v.chainLength,
                v.lastHash,
                v.hash,
                "0x1000000000000000",
                "tag " + v.seed
            );
        }

        const seed4 = BigNumber.from(txParams[4].seed);
        const tx4 = await contract.connect(miner).challenge(seed4, "");

        expect(tx4).to.emit(contract, 'TestChallenge').withArgs(
            false,
            "0x0",
            miner.address
        );

        const seed5 = BigNumber.from(txParams[5].seed);
        const tx5 = await contract.connect(miner).challenge(seed5, "");

        expect(tx5).to.emit(contract, 'TestChallenge').withArgs(
            true,
            "0x1000000000000000",
            miner.address
        );

        expect(tx5).to.emit(contract, 'ChainProgress').withArgs(
            miner.address,
            txParams[5].chainLength,
            txParams[5].lastHash,
            txParams[5].hash,
            "0x1000000000000000",
            ""
        );

        expect(await contract.chainLength()).to.be.equal(BigNumber.from(txParams[txParams.length-1].chainLength));
    });

    it("Mint is adjusted based on previous chain length", async function() {
        const [deployer] = await ethers.getSigners();
        const miner = await new ethers.Wallet("0x112233", deployer.provider);

        await deployer.sendTransaction({to: miner.address, value: ethers.utils.parseEther("10")});

        const TestNuPoW = await ethers.getContractFactory("TestNuPoW");
        const contract = (await TestNuPoW.deploy()) as TestNuPoW;

        const txParams = [
            {
                seed: "0x3283f3d25b89965fb75c6ac6f643668ac7a7f6eeecfc215388e2c4e28f632b8b",
                chainLength: 1,
                lastHash: "0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff",
                hash: "0x487e383e1ed26abb6be142926849434960e35f460d6dad5a614beeebfa179e42"
            },
            {
                seed: "0x219f8041c07742479e96d2a20c3608961330ac96c39bd9c908d1925826a877e4",
                chainLength: 2,
                lastHash: "0x487e383e1ed26abb6be142926849434960e35f460d6dad5a614beeebfa179e42",
                hash: "0x3a4b76a036ee528b3f38d8c45e7af7969c63894f8ae121b47acaafa3befdcddc"
            },
            {
                seed: "0x82063183e14e99c355bfd9588040a70cf320c22585c635936fc566b4ddaa9d9b",
                chainLength: 3,
                lastHash: "0x3a4b76a036ee528b3f38d8c45e7af7969c63894f8ae121b47acaafa3befdcddc",
                hash: "0x3582d24f3c29f1994502bb6175d91a4239678a39c27704095ef596cc9b80bddb"
            },
            {
                seed: "0x576214b35c84e2a106aac2c76997ee20e99d25823e01902d2da8eb1a2cdc37e0",
                chainLength: 4,
                lastHash: "0x3582d24f3c29f1994502bb6175d91a4239678a39c27704095ef596cc9b80bddb",
                hash: "0x248401e06360140b312ead245edac2bd3eef3dd6d8895cb8c0a6435dc5aa30ad"
            },
            {
                seed: "0x6f7f72dedca1fdd378c7178f566f7118f2c64aa147774b9110f36599dff3c0c",
                chainLength: 5,
                lastHash: "0x248401e06360140b312ead245edac2bd3eef3dd6d8895cb8c0a6435dc5aa30ad",
                hash: "0x23cf24619a0d45b982e1a534922b57bb14151878f08c38d54124f566656e0876"
            },
            {
                seed: "0x15ed30848e28bf62e44ef276aafca8fd964b62a369a6da358f12586d5f02a0e0",
                chainLength: 6,
                lastHash: "0x23cf24619a0d45b982e1a534922b57bb14151878f08c38d54124f566656e0876",
                hash: "0x1f67e6440a7aaee9b25b04fef6cfd576e204b7218d214d278e3eca64d6702982"
            }
        ];

        // First run, does not exceed max chain length (TODO: Try overrun on first run + underrun)
        for (const v of txParams.slice(0, 5)) {
            const seed = BigNumber.from(v.seed);
            const tx = await contract.connect(miner).challenge(seed, "abc " + v.seed);

            // Should be equal to MAX_MINT
            expect(await contract.nextMint()).to.equal(BigNumber.from("0x1000000000000000"));

            expect(tx).to.emit(contract, 'TestChallenge').withArgs(
                true,
                "0x1000000000000000",
                miner.address
            );

            expect(tx).to.emit(contract, 'ChainProgress').withArgs(
                miner.address,
                v.chainLength,
                v.lastHash,
                v.hash,
                "0x1000000000000000",
                "abc " + v.seed
            );
        }

        expect(await contract.chainLength()).to.be.equal(BigNumber.from(txParams[txParams.length-2].chainLength));

        // Spend some time to stall..
        await contract.ping(); // Adds 1 second
        const lastPingValue1 = await contract.pingValue();
        for (let i = 0; i < 9; i++) {
            await contract.ping(); // Adds 1 second
        }

        expect(await contract.pingValue()).to.be.equal(lastPingValue1.add(9));

        // This overruns max chain length, halving nextMint in the next round
        for (const v of txParams.slice(0, 6)) {
            const seed = BigNumber.from(v.seed);
            const tx = await contract.connect(miner).challenge(seed, "***");

            expect(await contract.nextMint()).to.equal(BigNumber.from("0x1000000000000000"));

            expect(tx).to.emit(contract, 'TestChallenge').withArgs(
                true,
                "0x1000000000000000",
                miner.address
            );

            expect(tx).to.emit(contract, 'ChainProgress').withArgs(
                miner.address,
                v.chainLength,
                v.lastHash,
                v.hash,
                "0x1000000000000000",
                "***"
            );
        }

        expect(await contract.chainLength()).to.be.equal(BigNumber.from(txParams[txParams.length-1].chainLength));

        // Spend some time to stall..
        await contract.ping(); // Adds 1 second
        const lastPingValue2 = await contract.pingValue();
        for (let i = 0; i < 9; i++) {
            await contract.ping(); // Adds 1 second
        }

        expect(await contract.pingValue()).to.be.equal(lastPingValue2.add(9));

        // This run is less than max chain length, causing nextMint to increase after next stall
        for (const v of txParams.slice(0, 2)) {
            const seed = BigNumber.from(v.seed);
            const tx = await contract.connect(miner).challenge(seed, "cfelde was here");

            expect(await contract.nextMint()).to.equal(BigNumber.from("0x0800000000000000"));

            expect(tx).to.emit(contract, 'TestChallenge').withArgs(
                true,
                "0x0800000000000000",
                miner.address
            );

            expect(tx).to.emit(contract, 'ChainProgress').withArgs(
                miner.address,
                v.chainLength,
                v.lastHash,
                v.hash,
                "0x0800000000000000",
                "cfelde was here"
            );
        }

        // Spend some time to stall..
        await contract.ping(); // Adds 1 second
        const lastPingValue3 = await contract.pingValue();
        for (let i = 0; i < 9; i++) {
            await contract.ping(); // Adds 1 second
        }

        expect(await contract.pingValue()).to.be.equal(lastPingValue3.add(9));

        for (const v of txParams.slice(0, 2)) {
            const seed = BigNumber.from(v.seed);
            const tx = await contract.connect(miner).challenge(seed, "Slava Ukraini!");

            // This is back up to MAX_MINT as previous run didn't overrun max chain length
            expect(await contract.nextMint()).to.equal(BigNumber.from("0x1000000000000000"));

            expect(tx).to.emit(contract, 'TestChallenge').withArgs(
                true,
                "0x1000000000000000",
                miner.address
            );

            expect(tx).to.emit(contract, 'ChainProgress').withArgs(
                miner.address,
                v.chainLength,
                v.lastHash,
                v.hash,
                "0x1000000000000000",
                "Slava Ukraini!"
            );
        }

        // Spend some time to stall..
        await contract.ping(); // Adds 1 second
        const lastPingValue4 = await contract.pingValue();
        for (let i = 0; i < 9; i++) {
            await contract.ping(); // Adds 1 second
        }

        expect(await contract.pingValue()).to.be.equal(lastPingValue4.add(9));

        for (const v of txParams.slice(0, 2)) {
            const seed = BigNumber.from(v.seed);
            const tx = await contract.connect(miner).challenge(seed, "");

            // Not increasing past MAX_MINT
            expect(await contract.nextMint()).to.equal(BigNumber.from("0x1000000000000000"));

            expect(tx).to.emit(contract, 'TestChallenge').withArgs(
                true,
                "0x1000000000000000",
                miner.address
            );

            expect(tx).to.emit(contract, 'ChainProgress').withArgs(
                miner.address,
                v.chainLength,
                v.lastHash,
                v.hash,
                "0x1000000000000000",
                ""
            );
        }
    });

    it("Mint goes to zero and back depending on chain length", async function() {
        const [deployer] = await ethers.getSigners();
        const miner = await new ethers.Wallet("0x112233", deployer.provider);

        await deployer.sendTransaction({to: miner.address, value: ethers.utils.parseEther("10")});

        const TestNuPoW = await ethers.getContractFactory("TestNuPoW");
        const contract = (await TestNuPoW.deploy()) as TestNuPoW;

        const txParams = [
            {
                seed: "0x3283f3d25b89965fb75c6ac6f643668ac7a7f6eeecfc215388e2c4e28f632b8b",
                chainLength: 1,
                lastHash: "0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff",
                hash: "0x487e383e1ed26abb6be142926849434960e35f460d6dad5a614beeebfa179e42"
            },
            {
                seed: "0x219f8041c07742479e96d2a20c3608961330ac96c39bd9c908d1925826a877e4",
                chainLength: 2,
                lastHash: "0x487e383e1ed26abb6be142926849434960e35f460d6dad5a614beeebfa179e42",
                hash: "0x3a4b76a036ee528b3f38d8c45e7af7969c63894f8ae121b47acaafa3befdcddc"
            },
            {
                seed: "0x82063183e14e99c355bfd9588040a70cf320c22585c635936fc566b4ddaa9d9b",
                chainLength: 3,
                lastHash: "0x3a4b76a036ee528b3f38d8c45e7af7969c63894f8ae121b47acaafa3befdcddc",
                hash: "0x3582d24f3c29f1994502bb6175d91a4239678a39c27704095ef596cc9b80bddb"
            },
            {
                seed: "0x576214b35c84e2a106aac2c76997ee20e99d25823e01902d2da8eb1a2cdc37e0",
                chainLength: 4,
                lastHash: "0x3582d24f3c29f1994502bb6175d91a4239678a39c27704095ef596cc9b80bddb",
                hash: "0x248401e06360140b312ead245edac2bd3eef3dd6d8895cb8c0a6435dc5aa30ad"
            },
            {
                seed: "0x6f7f72dedca1fdd378c7178f566f7118f2c64aa147774b9110f36599dff3c0c",
                chainLength: 5,
                lastHash: "0x248401e06360140b312ead245edac2bd3eef3dd6d8895cb8c0a6435dc5aa30ad",
                hash: "0x23cf24619a0d45b982e1a534922b57bb14151878f08c38d54124f566656e0876"
            },
            {
                seed: "0x15ed30848e28bf62e44ef276aafca8fd964b62a369a6da358f12586d5f02a0e0",
                chainLength: 6,
                lastHash: "0x23cf24619a0d45b982e1a534922b57bb14151878f08c38d54124f566656e0876",
                hash: "0x1f67e6440a7aaee9b25b04fef6cfd576e204b7218d214d278e3eca64d6702982"
            }
        ];

        let nextMint = await contract.nextMint();

        while (nextMint.gt(BigNumber.from("0"))) {
            for (const v of txParams.slice(0, 6)) {
                const seed = BigNumber.from(v.seed);
                const tx = await contract.connect(miner).challenge(seed, "tag " + v.seed);

                expect(await contract.nextMint()).to.equal(nextMint);

                expect(tx).to.emit(contract, 'TestChallenge').withArgs(
                    true,
                    nextMint.toHexString(),
                    miner.address
                );

                expect(tx).to.emit(contract, 'ChainProgress').withArgs(
                    miner.address,
                    v.chainLength,
                    v.lastHash,
                    v.hash,
                    nextMint.toHexString(),
                    "tag " + v.seed
                );
            }

            expect(await contract.chainLength()).to.be.equal(BigNumber.from(txParams[txParams.length-1].chainLength));

            // Spend some time to stall..
            await contract.ping(); // Adds 1 second
            const lastPingValue1 = await contract.pingValue();
            for (let i = 0; i < 9; i++) {
                await contract.ping(); // Adds 1 second
            }

            expect(await contract.pingValue()).to.be.equal(lastPingValue1.add(9));

            nextMint = nextMint.shr(1);
        }

        for (const v of txParams.slice(0, 6)) {
            const seed = BigNumber.from(v.seed);
            const tx = await contract.connect(miner).challenge(seed, "zero");

            expect(await contract.nextMint()).to.equal(BigNumber.from(0));

            expect(tx).to.emit(contract, 'TestChallenge').withArgs(
                true,
                "0x0",
                miner.address
            );

            expect(tx).to.emit(contract, 'ChainProgress').withArgs(
                miner.address,
                v.chainLength,
                v.lastHash,
                v.hash,
                "0x0",
                "zero"
            );
        }

        expect(await contract.chainLength()).to.be.equal(BigNumber.from(txParams[txParams.length-1].chainLength));

        nextMint = await contract.nextMint();
        expect(nextMint).to.equal(BigNumber.from(0));

        // Spend some time to stall..
        await contract.ping(); // Adds 1 second
        const lastPingValue1 = await contract.pingValue();
        for (let i = 0; i < 9; i++) {
            await contract.ping(); // Adds 1 second
        }

        expect(await contract.pingValue()).to.be.equal(lastPingValue1.add(9));

        for (const v of txParams.slice(0, 5)) {
            const seed = BigNumber.from(v.seed);
            const tx = await contract.connect(miner).challenge(seed, "still zero");

            expect(await contract.nextMint()).to.equal(BigNumber.from(0));

            expect(tx).to.emit(contract, 'TestChallenge').withArgs(
                true,
                "0x0",
                miner.address
            );

            expect(tx).to.emit(contract, 'ChainProgress').withArgs(
                miner.address,
                v.chainLength,
                v.lastHash,
                v.hash,
                "0x0",
                "still zero"
            );
        }

        expect(await contract.chainLength()).to.be.equal(BigNumber.from(txParams[txParams.length-2].chainLength));

        nextMint = await contract.nextMint();
        expect(nextMint).to.equal(BigNumber.from(0));

        // Spend some time to stall..
        await contract.ping(); // Adds 1 second
        const lastPingValue2 = await contract.pingValue();
        for (let i = 0; i < 9; i++) {
            await contract.ping(); // Adds 1 second
        }

        expect(await contract.pingValue()).to.be.equal(lastPingValue2.add(9));

        while (nextMint.lt(BigNumber.from("0x1000000000000000"))) {
            for (const v of txParams.slice(0, 4)) {
                const seed = BigNumber.from(v.seed);
                const tx = await contract.connect(miner).challenge(seed, "maybe zero");

                expect(await contract.nextMint()).to.equal(nextMint);

                expect(tx).to.emit(contract, 'TestChallenge').withArgs(
                    true,
                    nextMint.toHexString(),
                    miner.address
                );

                expect(tx).to.emit(contract, 'ChainProgress').withArgs(
                    miner.address,
                    v.chainLength,
                    v.lastHash,
                    v.hash,
                    nextMint.toHexString(),
                    "maybe zero"
                );
            }

            expect(await contract.chainLength()).to.be.equal(BigNumber.from(txParams[txParams.length-3].chainLength));

            // Spend some time to stall..
            await contract.ping(); // Adds 1 second
            const lastPingValue1 = await contract.pingValue();
            for (let i = 0; i < 9; i++) {
                await contract.ping(); // Adds 1 second
            }

            expect(await contract.pingValue()).to.be.equal(lastPingValue1.add(9));

            if (nextMint.eq(BigNumber.from("0"))) nextMint = BigNumber.from(1);
            else nextMint = nextMint.shl(1);
        }

        for (const v of txParams.slice(0, 4)) {
            const seed = BigNumber.from(v.seed);
            const tx = await contract.connect(miner).challenge(seed, "tag");

            expect(await contract.nextMint()).to.equal(BigNumber.from("0x1000000000000000"));

            expect(tx).to.emit(contract, 'TestChallenge').withArgs(
                true,
                "0x1000000000000000",
                miner.address
            );

            expect(tx).to.emit(contract, 'ChainProgress').withArgs(
                miner.address,
                v.chainLength,
                v.lastHash,
                v.hash,
                "0x1000000000000000",
                "tag"
            );
        }

        expect(await contract.chainLength()).to.be.equal(BigNumber.from(txParams[txParams.length-3].chainLength));

        nextMint = await contract.nextMint();
        expect(nextMint).to.equal(BigNumber.from("0x1000000000000000"));

        // Spend some time to stall..
        await contract.ping(); // Adds 1 second
        const lastPingValue3 = await contract.pingValue();
        for (let i = 0; i < 9; i++) {
            await contract.ping(); // Adds 1 second
        }

        expect(await contract.pingValue()).to.be.equal(lastPingValue3.add(9));

        for (const v of txParams.slice(0, 5)) {
            const seed = BigNumber.from(v.seed);
            const tx = await contract.connect(miner).challenge(seed, "");

            expect(await contract.nextMint()).to.equal(BigNumber.from("0x1000000000000000"));

            expect(tx).to.emit(contract, 'TestChallenge').withArgs(
                true,
                "0x1000000000000000",
                miner.address
            );

            expect(tx).to.emit(contract, 'ChainProgress').withArgs(
                miner.address,
                v.chainLength,
                v.lastHash,
                v.hash,
                "0x1000000000000000",
                ""
            );
        }

        expect(await contract.chainLength()).to.be.equal(BigNumber.from(txParams[txParams.length-2].chainLength));

        nextMint = await contract.nextMint();
        expect(nextMint).to.equal(BigNumber.from("0x1000000000000000"));
    });
});