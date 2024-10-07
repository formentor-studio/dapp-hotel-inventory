Feature: Manage hotel inventory and reservations

    Scenario: Hotel specifies the number of rooms on sale for a given date
        When "Hotel Mallorca" open sales for 36 "Deluxe Room" on "2025-06-13" at 25 coins
        Then there are 36 "Deluxe Room" available on "2025-06-13" at 25 coins
    
    Scenario: Traveller books a room for a date 
        Given "Hotel Mallorca" open sales for 2 "Deluxe Room" on "2025-06-13" at 25 coins
        When "Joaquin" books 1 "Deluxe Room" on "2025-06-13" and pays 25 coins
        Then "Joaquin" owns 1 room night of "Deluxe Room" for "2025-06-13"
        And there are 1 "Deluxe Room" available on "2025-06-13" at 25 coins

    Scenario: Traveller books a room for a date but there is no availability
        Given "Hotel Mallorca" open sales for 2 "Deluxe Room" on "2025-06-13" at 25 coins
        When "Joaquin" books 3 "Deluxe Room" on "2025-06-13" and pays 75 coins
        Then Request is rejected with error "NotEnoughAvailability"

    Scenario: Traveller pays less than the price of the room night
        Given "Hotel Mallorca" open sales for 2 "Deluxe Room" on "2025-06-13" at 25 coins
        When "Joaquin" books 1 "Deluxe Room" on "2025-06-13" and pays 23 coins
        Then Request is rejected with error "InvalidPayment"

    Scenario: Traveller makes checkin at the hotel
