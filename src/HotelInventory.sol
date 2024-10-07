// SPDX-License-Identifier: MIT

pragma solidity ^0.8.20;

contract HotelInventory {
    /**
     * Storage
     *****/
    address payable private _hotel; // Account of the hotel.
    string private _room;           // Room type of "room night"
    uint256 private _date;          // Date of the "room night". UTC timezone as unix epoch time.
    uint256 private _price;         // Price of the "room night".
    mapping(address owner => uint256 units) private _balances; // Number of "room nights" by account - hotel or guest -.

    /**
     * Events
     ****/
    /**
     * @dev Emitted when `guest` account books `units` rooms.
     *
     * Note that `value` may be zero.
     */
    event Book(address indexed guest, uint256 units);

    /**
     * Errors
     ****/
    /**
     * @dev Invalid payment.
     * @param payment actual payment.
     * @param expected expected payment.
     */
    error InvalidPayment(uint256 payment, uint256 expected);

    /**
     * @dev Not enough availability for the booking.
     * @param units units to be booked.
     * @param availability current availablity of rooms.
     */
    error NotEnoughAvailability(uint256 units, uint256 availability);

    constructor(string memory room_, uint256 date_, uint256 price_, uint256 units) {
        _hotel = payable(msg.sender);
        _room = room_;
        _date = date_;
        _price = price_;
        _balances[_hotel] = units;
    }

    /**
     * @dev Returns the room of room night
     */
    function room() public view virtual returns (string memory) {
        return _room;
    }

    /**
     * @dev Returns the date of the room night
     */
    function date() public view virtual returns (uint256) {
        return _date;
    }

    /**
     * @dev Returns the price by room night
     */
    function price() public view virtual returns (uint256) {
        return _price;
    }

    /**
     * @dev Returns availability of room nights
     */
    function availability() public view virtual returns (uint256) {
        return _balances[_hotel];
    }

    /**
     * @dev Balance of `rooms` of `guest` account
     */
    function balanceOf(address account) public view virtual returns (uint256) {
        return _balances[account];
    }
    
    /**
     * @dev Transfers `units` amount of room nights from `hotel` to `traveller`
     *
     * Emits a {Book} event.
     */
    function book(uint256 units) payable public {
        // Check availability
        uint256 hotelAvailability = _balances[_hotel];
        if (hotelAvailability < units)
            revert NotEnoughAvailability(units, hotelAvailability);

        // Check payment
        uint256 payment = msg.value;
        uint256 cost = units * _price;
        if (payment != cost)
            revert InvalidPayment(payment, cost);

        // Transfer rooms from hotel to guest
        _balances[_hotel] = hotelAvailability - units;
        address guest = msg.sender;
        _balances[guest] += units;

        emit Book(guest, units);
    }
}