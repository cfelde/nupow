The problem with Proof of Work and how we can solve it
======================================================

Proof of Work is great, but has some major flaws.

By its very design it's meant to be inefficient, to force computers to slow down. Only by slowing the
miners down can a decentralized system manage to come to an agreement, otherwise they would be flooded
with block proposals. As more computers join, the system slows them all down more, by increasing the
mining difficulty.

But this inefficiency is also its greatest problem. It leads to high energy usage, which isn't good for
the planet or for power consumers, as the source is often dirty, and we could surely use this energy for
something better?

Having said that, Proof of Work is simple, easy to understand, and easy to implement. While we today
have more energy efficient methods, like Proof of Stake, these bring with them other drawbacks.

Besides the added technical complexity, Proof of Stake also limits who can participate by requiring an
upfront capital investment. It's no longer enough to boot up a miner and let it run, you need to boot
up a validator, add the required capital, and ensure you manage the technical complexity that comes
with this. If your Proof of Work miner stops running, you risk not making money. If your Proof of Stake
validator stops running, not only do you risk not making money, you also risk your capital.

Introducing NuPoW
-----------------

NuPoW, or New Proof of Work, is the next generation Proof of Work algorithm. Realizing that we can build
on top of existing blockchain systems, we can change the incentive mechanism while keeping the algorithm
simple.

With NuPoW, miners participate to find the secret value, just like with traditional Proof of Work. But,
if too many miners are involved, and hence, the energy use becomes too large, the algorithm will
automatically lower the rewards.

As the reward is lowered, less tokens are minted, and it becomes economically unprofitable to run a
large mining rig. Thereby, we are incentivizing mining on smaller devices, like a cheap PC or a small
Raspberry Pi computer. The algorithm automatically maintains the required balance between rewarding
miners and keeping total resource usage under control.

Doing this allows everyone to participate, without the need for big investments in mining hardware.
This again allows NuPoW tokens to be mined in a more decentralized manner, as the typical economies of
scale that apply to traditional Proof of Work mining no longer apply to NuPoW mining.

We could maybe label this approach Proof of Indifference, as the average miner has no compulsion to
be overly invested in mining hardware. It's important to understand that there's no clear link
between the efforts needed to mine a token or coin, and their underlying value. The value of a token
is driven by supply and demand. However, if anything, it could be argued that NuPoW tokens are
harder to mine than traditional Proof of Work, because we can't simply spend more money on hardware to
obtain more of them. They are harder to mine without this implying more energy usage. Spend too much
energy mining a NuPoW token, and you'll end up with less minted tokens than if you didn't go past the
indifference threshold. And the indifference threshold is a collective threshold, keeping the whole
mining community in check.

Read the rest of the [NuPoW whitepaper](https://nupow.fi/whitepaper/)
