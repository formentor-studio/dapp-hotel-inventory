import assert from "assert"
import HotelInventory from "../../../dist/HotelInventory.json"
import { Before, Then, When } from "@cucumber/cucumber";
import { ethers } from "hardhat"
import "@nomicfoundation/hardhat-ethers"

import { BaseContract, Signer } from 'ethers'

type HotelInventoryContract = BaseContract & {
    availability: () => any,
    room: () => any,
    date: () => any,
    price: () => any,
    book: (units: number, overrides: any) => void,
    balanceOf: (account: any) => any,
}

const state: {
    hotel?: Signer,
    traveller?: Signer,
    contract?: HotelInventoryContract,
    lastError?: any,
} = {}

// Set up
Before(async function() {
    const accounts = await ethers.getSigners();
    state.hotel = accounts[0]
    state.traveller = accounts[1]
    state.lastError = null
})

// When "Hotel Mallorca" open sales for 36 "Deluxe Room" on "2025-06-13" at 25 coins
When('{string} open sales for {int} {string} on {string} at {int} coins', async function (hotel: string, units: number, room: string, date: string, price: number) {
    const factory = new ethers.ContractFactory(HotelInventory.abi, HotelInventory.bytecode, state.hotel)
    const contract = await factory.deploy(
        room, 
        (new Date(date)).getTime(),
        price,
        units
    ) as HotelInventoryContract;

    state.contract = contract
});

// Then there are 36 "Deluxe Room" available on "2025-06-13" at 25 coins
Then('there are {int} {string} available on {string} at {int} coins', async function (units: number, room: string, date: string, price: number) {
    const actual_availability = await state.contract?.availability()
    assert.equal(actual_availability, units)

    const actual_room = await state.contract?.room()
    assert.equal(actual_room, room)

    const actual_date = await state.contract?.date()
    assert.equal(actual_date, (new Date(date)).getTime())

    const actual_price = await state.contract?.price()
    assert.equal(actual_price, price)
});

//  When "Joaquin" books 1 "Deluxe Room" on "2025-06-13" and pays 25 coins
When('{string} books {int} {string} on {string} and pays {int} coins', async function (_traveller: string, units: number, _room: string, _date: string, payment: number) {
    const travellerAccount = state.traveller as Signer
    const hotelInventory = state.contract?.connect(travellerAccount) as HotelInventoryContract
    try {
        await hotelInventory.book(units, {value: payment})
    } catch(error: any) {
        state.lastError = deriveRevertCustomError(state.contract as HotelInventoryContract, error)
    }
});

// Then "Joaquin" owns 1 room night of "Deluxe Room" for "2025-06-13"
Then('{string} owns {int} room night of {string} for {string}', async function (_traveller, expectedRooms: number, _room: string, _date: string) {
    const travellerAccount = state.traveller as Signer
    const actualRooms = await state.contract?.balanceOf(travellerAccount.getAddress())

    assert.equal(actualRooms, expectedRooms)
});

// Then Request is rejected with error "InvalidPayment"
Then('Request is rejected with error {string}', function (expectedErrorName: string) {
    assert.equal(state.lastError, expectedErrorName)
});

/**
 * Helpers
 */
function deriveRevertCustomError(contract: HotelInventoryContract, error: any) {
    const revertData = error.data
    return contract.interface.parseError(revertData)?.name
}