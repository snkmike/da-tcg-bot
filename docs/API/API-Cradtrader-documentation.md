# API CardTrader Documentation

## Introduction
CardTrader organizes the API around REST. The base URL is:

```
https://api.cardtrader.com/api/v2
```

You have to authenticate each API call by using the `Authorization: Bearer [YOUR_AUTH_TOKEN]` header. You can obtain `[YOUR_AUTH_TOKEN]` inside the settings page on your CardTrader profile.

## Glossary

### Game
A game identifies a family of sellable items. Examples include "Magic the Gathering" and "Pokemon".

### Category
A Category groups similar items inside a Game. Examples include "Single Cards", "Booster Box", "Tokens", "T-Shirt", and "Dice".

### Expansion
A specific expansion of a Game, such as "Unglued" or "Core Set 2020".

### Blueprint
Blueprints are the items you can sell. Blueprints have properties to describe exactly what they are, for example, "language" and "condition".

### Product
A Product is an instance of a Blueprint, with a quantity and a price you define. Products represent physical items that you sell and ship to customers. Typically, the Product is located in your warehouse.

### Order
An Order is a purchase. You sold (or purchased) some Products.

---

## API Endpoints

### App Info

#### GET /info
Use this call to test the authentication.

```bash
curl https://api.cardtrader.com/api/v2/info \
  -H "Authorization: Bearer [YOUR_AUTH_TOKEN]"
```

**Response Example:**
```json
{
  "id": 3,
  "name": "Test App",
  "shared_secret": "5acf055640aa1712f90960c8a0b697bb"
}
```

---

### Games

#### GET /games
Retrieve the list of games. You will receive an array of Game objects.

```bash
curl https://api.cardtrader.com/api/v2/games \
  -H "Authorization: Bearer [YOUR_AUTH_TOKEN]"
```

**Game Object:**
- `id` (integer): A unique Game identifier.
- `name` (string): The name of the Game.
- `display_name` (string): The humanized name of the Game.

**Response Example:**
```json
[
  {
    "id": 1,
    "name": "Magic",
    "display_name": "Magic: the Gathering"
  }
]
```

---

### Categories

#### GET /categories
Retrieve the list of available categories.

**Accepted Parameters:**
- `game_id` (integer, optional): Filter results by `game_id`.

```bash
curl https://api.cardtrader.com/api/v2/categories \
  -H "Authorization: Bearer [YOUR_AUTH_TOKEN]"
```

**Category Object:**
- `id` (integer): A unique Category identifier.
- `name` (string): The Category name.
- `game_id` (integer): The ID of the Game to which the Category belongs.
- `properties` (array): An array of Property objects.

**Response Example:**
```json
[
  {
    "id": 1,
    "name": "Magic Single Card",
    "game_id": 1,
    "properties": []
  }
]
```

---

### Expansions

#### GET /expansions
Retrieve the list of expansions.

```bash
curl https://api.cardtrader.com/api/v2/expansions \
  -H "Authorization: Bearer [YOUR_AUTH_TOKEN]"
```

**Expansion Object:**
- `id` (integer): A unique Expansion identifier.
- `game_id` (integer): The ID of the Game to which the Expansion belongs.
- `code` (string): The code (generally 3 or 4 characters) that identifies the expansion.
- `name` (string): The name of the Expansion.

**Response Example:**
```json
[
  {
    "id": 1,
    "game_id": 1,
    "code": "gnt",
    "name": "Game Night"
  },
  {
    "id": 3,
    "game_id": 1,
    "code": "pgrn",
    "name": "Guilds of Ravnica Promos"
  }
]
```

---

### Blueprints

#### GET /blueprints/export
Retrieve the list of items that can be sold and/or purchased.

**Accepted Parameters:**
- `expansion_id` (integer, optional): Must match the ID field of an Expansion. If not specified or invalid, the endpoint will respond with a 404 error.

```bash
curl https://api.cardtrader.com/api/v2/blueprints/export?expansion_id=74 \
  -H "Authorization: Bearer [YOUR_AUTH_TOKEN]"
```

**Blueprint Object:**
- `id` (integer): A Blueprint unique identifier.
- `name` (string): The Blueprint name.
- `version` (string): The version of a specific card (almost always null).
- `game_id` (integer): The ID of the Game to which this Blueprint belongs.
- `category_id` (integer): The ID of the Category to which this Blueprint belongs.
- `expansion_id` (integer): The ID of the Expansion to which this Blueprint belongs.
- `image_url` (string): The URL to the image for this product.
- `editable_properties` (array): An array of acceptable properties (e.g., language, condition, foil).
- `scryfall_id` (string): The ID Scryfall uses to identify this Blueprint.
- `card_market_ids` (array): The Cardmarket IDs used to identify this Blueprint.
- `tcg_player_id` (string): The ID TCGplayer uses to identify this Blueprint.

**Response Example:**
```json
[
  {
    "id": 89,
    "name": "Beast // Plant",
    "version": null,
    "game_id": 1,
    "category_id": 2,
    "expansion_id": 8,
    "editable_properties": [],
    "card_market_ids": [362677],
    "tcg_player_id": null,
    "scryfall_id": "381854e2-7369-473e-a604-4dd7c010fc89"
  }
]
```

---

### Properties

Properties are objects that specify the details of the items you sell. For example, when selling a Black Lotus Alpha, you should specify the condition and the language. All these extra details are the Properties.

A die has a number of faces and a color (red die, 6 faces. Blue die, 20 faces). Number of faces and color are Properties.

The Property object tells you all the possible values it can take. For example, a condition can be Mint, Near Mint, Slightly Played, Moderately Played, Played, Heavily Played, or Poor, but not 'Very Poor'. Very Poor is not an acceptable value for the condition Property.

**Property: condition in Magic The Gathering**
```json
{
  "name": "condition",
  "type": "string",
  "possible_values": [
    "Mint",
    "Near Mint",
    "Slightly Played",
    "Moderately Played",
    "Played",
    "Heavily Played",
    "Poor"
  ]
}
```

**Property: foil in Magic The Gathering**
```json
{
  "name": "mtg_foil",
  "type": "boolean",
  "possible_values": [
    true,
    false
  ]
}
```

---

## Marketplace

### Search the marketplace for specific Products and buy them. Find the Products you want, add them to the cart, purchase the cart.

#### List Marketplace Products
GET /marketplace/products
Get the list of Products for sale, filtered by expansion or blueprint. One required param:
- `expansion_id` (the id of the expansion as in GET /expansions) or
- `blueprint_id` (the id of the blueprint as in GET /blueprints/export).

Please note that this endpoint is lightly cached and you may rarely see differences in price and quantity. Though, you will see the uncached price and quantity later in the cart API. This API is also limited to 1 call per second

You can also filter the results by foilness or language using these params:

- `foil` (boolean): Filter products by foil property
- `language` (string): The language of the products it must be a 2 letter country locale name like: en, it or fr.

```bash
GET /marketplace/products
curl -X GET https://api.cardtrader.com/api/v2/marketplace/products?expansion_id=:id \
  -H "Authorization: Bearer [YOUR_AUTH_TOKEN]"

GET /marketplace/products
curl -X GET https://api.cardtrader.com/api/v2/marketplace/products?blueprint_id=:id \
  -H "Authorization: Bearer [YOUR_AUTH_TOKEN]"

GET /marketplace/products?foil=true
curl -X GET https://api.cardtrader.com/api/v2/marketplace/products?blueprint_id=:id&foil=true \
  -H "Authorization: Bearer [YOUR_AUTH_TOKEN]"

GET /marketplace/products?language=en
curl -X GET https://api.cardtrader.com/api/v2/marketplace/products?blueprint_id=:id&language=en \
  -H "Authorization: Bearer [YOUR_AUTH_TOKEN]"
```

**Structure of Products response**
- `id` (integer): The ID of the Product. Use it to add the Product to the cart and purchase it.
- `blueprint_id` (integer): The ID of the Blueprint this Product is an instance of.
- `name_en` (string): The English name of the Product.
- `quantity` (integer): Quantity for sale.
- `price.cents` (integer): The price in cents, in your currency.
- `price.currency` (string): Currency of price.
- `description` (string): Seller's item description.
- `properties_hash` (object): Key-value product Properties.
- `expansion.id` (integer): The expansion ID.
- `expansion.code` (string): Expansion code.
- `expansion.name_en` (string): Expansion English name.
- `user.id` (integer): Seller ID
- `user.username` (string): Seller's username
- `user.can_sell_via_hub` (boolean): You can purchase this Product via CardTrader Zero
- `user.country_code` (string): Seller country code.
- `user.user_type` (string): Seller is normal or professional
- `user.max_sellable_in24h_quantity` (integer): The maximum number of copies the seller can sell in 24h.
- `graded` (boolean): Whether this Product is graded or not.
- `on_vacation` (boolean): Seller on vacation. You cannot buy from sellers in vacation
- `bundle_size` (integer): The number of items in the bundle.

**The response is an Object containing the ID of the blueprint (as key) and an array with the cheapest 25 Products (as value)**

**Response Example:**
```json
{
  "10050": [
    {
      "id": 101862104,
      "blueprint_id": 10050,
      "name_en": "Dragon Fodder",
      "quantity": 1,
      "price": {},
      "description": "protection from postofficer",
      "properties_hash": {},
      "expansion": {},
      "user": {},
      "graded": false,
      "on_vacation": false,
      "bundle_size": 1
    }
  ]
}
```

---

### Cart

#### Cart Status
GET /cart
Returns your Cart. You must put the Products in your Cart before purchasing them. Every Cart consists of subcarts - one for each seller plus the CardTrader Zero subcart. Each Subcarts has Cart Items: the items you are purchasing.

Please note that if a Product associated with a Cart Item becomes unavailable, the API will automatically remove that Cart Item from the response.

```bash
curl -X GET https://api.cardtrader.com/api/v2/cart \
  -H "Authorization: Bearer [YOUR_AUTH_TOKEN]"
```

**Cart Object:**
- `id` (integer): The Cart ID.
- `created_at` (datetime): Cart creation date.
- `updated_at` (datetime): Cart last update date
- `subcarts` (array): Array of Subcarts.

**Subcart Object:**
- `id` (integer): The Subcart ID.
- `cart_items` (array): The items contained in the Subcart. These are the items you are purchasing.
- `subtotal` (Money): Subcart subtotal.
- `safeguard_fee_amount` (Money): Subcart safeguard fees (if this is not the CardTrader Zero subcart).
- `ct_zero_fee_amount` (Money): CardTrader Zero fees (if this is the CardTrader Zero subcart).
- `payment_method_fee_percentage_amount` (Money): Payment fee percentage. It depends on the payment method.
- `payment_method_fee_fixed_amount` (Money): Payment fee fixed amount. It depends on the payment method.
- `shipping_cost` (Money): Shipping price. If this is CardTrader Zero, you do not pay the shipping price.
- `billing_address` (Address): Your billing address.
- `shipping_address` (Address): Your shipping address.

**Cart Item Object:**
- `quantity` (integer): The quantity you are purchasing.
- `price_cents` (integer): The price of the item, in cents.
- `price_currency` (string): The currency.
- `product.id` (string): The ID of the Product.
- `product.name_en` (string): The English name of the Product.

**Response Example:**
```json
{
  "id": 173757,
  "created_at": "2021-08-31T15:24:23.000Z",
  "updated_at": "2021-08-31T15:24:45.000Z",
  "subcarts": [
    {
      "id": 908392,
      "seller": {
        "id": 34089,
        "username": "CT Connect"
      },
      "cart_items": [
        {
          "quantity": 1,
          "price_cents": 2,
          "price_currency": "EUR",
          "product": {
            "id": 105234025,
            "name_en": "Celestial Unicorn"
          }
        },
        {
          "quantity": 1,
          "price_cents": 10,
          "price_currency": "EUR",
          "product": {
            "id": 104626767,
            "name_en": "Cleric Class"
          }
        }
      ],
      "shipping_cost": {
        "cents": 390,
        "currency": "EUR"
      }
    }
  ],
  "subtotal": {
    "cents": 12,
    "currency": "EUR"
  },
  "safeguard_fee_amount": {
    "cents": 0,
    "currency": "EUR"
  },
  "ct_zero_fee_amount": {
    "cents": 4,
    "currency": "EUR"
  },
  "payment_method_fee_percentage_amount": {
    "cents": 0,
    "currency": "EUR"
  },
  "payment_method_fee_fixed_amount": {
    "cents": 0,
    "currency": "EUR"
  },
  "shipping_cost": {
    "cents": 0,
    "currency": "EUR"
  },
  "billing_address": null,
  "shipping_address": null
}
```

---

#### Add Product to Cart
POST /cart/add
Add a Product to your Cart. Returns the updated Cart.

Please note that if a Product associated with a Cart Item becomes unavailable, the API will automatically remove that Cart Item from the response.

**Parameters:**
- `product_id` (integer): The ID of the Product to add
- `quantity` (integer): The quantity to add
- `via_cardtrader_zero` (boolean): Purchase via CardTrader Zero (true) or directly from the seller (false)
- `billing_address` (Address): The billing address. If specified more than once (2 add to cart calls), the last one will be used.
- `shipping_address` (Address): The shipping address. If specified more than once (2 add to cart calls), the last one will be used.

```bash
curl -X POST https://api.cardtrader.com/api/v2/cart/add \
  -H "Authorization: Bearer [YOUR_AUTH_TOKEN]" \
  -d '{
  "product_id": 105234025,
  "quantity": 1,
  "via_cardtrader_zero": true,
  "billing_address": {
    "name": "name",
    "street": "street",
    "zip": "50143",
    "city": "firenze",
    "state_or_province": "FI",
    "country_code": "IT"
  },
  "shipping_address": {
    "name": "name",
    "street": "street",
    "zip": "50143",
    "city": "firenze",
    "state_or_province": "FI",
    "country_code": "IT"
  }
}'
```

---

#### Remove Product from Cart
POST /cart/remove
Remove a Product from the Cart. Returns the updated Cart.

Please note that if a Product associated with a Cart Item becomes unavailable, the API will automatically remove that Cart Item from the response.

**Parameters:**
- `product_id` (integer): The ID of the Product to remove
- `quantity` (integer): How many item to remove. Cannot be lower than the number of items in Cart

```bash
curl https://api.cardtrader.com/api/v2/cart/remove \
  -H "Authorization: Bearer [YOUR_AUTH_TOKEN]" \
  -F  product_id=105234025 \
  -F  quantity=1 \
  -G
```

---

#### Purchase
POST /cart/purchase
Finalize and purchase the Cart. You must have enough credit on your wallet or you must have added a credit/debit card to your payment methods. Please add a credit/debit card via the website GUI.

Will return a Cart object if the purchase was successful, otherwise an error (for example missing payment method).

```bash
curl -X POST https://api.cardtrader.com/api/v2/cart/purchase \
  -H "Authorization: Bearer [YOUR_AUTH_TOKEN]"
```

**Example Error Response:**
```json
{
  "error_code": "validation_error",
  "errors": {
    "payment_method": [
      "cannot be blank"
    ]
  },
  "extra": {
    "message": "You need to have at least one payment method set."
  },
  "request_id": "a4f4c18e-1dc6-4804-a5c7-31bf2ac38e2b"
}
```

---

### Shipping Methods

#### List Shipping Methods
GET /shipping_methods
Get the list of Shipping Methods for a specific user from his country to yours. Required param:
- `username` (the username of the user as in GET /marketplace/products, properly URL-encoded)

Here some examples of the encoding expected to use on the username param:
- `ct connect` becomes `ct+connect`
- `My Awesome us3rn4m3!` becomes `My+Awesome+us3rn4m3%21%2C`

```bash
curl https://api.cardtrader.com/api/v2/shipping_methods?username=:username \
  -H "Authorization: Bearer [YOUR_AUTH_TOKEN]"
```

**Shipping Method object:**
- `id` (integer): A unique identifier for each Shipping Method.
- `name` (string): The name of this Shipping Method.
- `min_estimate_shipping_days` (integer): The expected minimum number of days that the delivery, with this Shipping Method, will take to be delivered. Can be null.
- `max_estimate_shipping_days` (integer): The expected maximum number of days that the delivery, with this Shipping Method, will take to be delivered. Can be null.
- `parcel` (boolean): True if the delivery is delivered with a parcel; false if it is delivered with an envelope.
- `tracked` (boolean): True if the Shipping Method provides a tracking service.
- `tracking_link` (string): The web tracking link used to check the delivery status (if the Shipping Method allows it). The placeholder `{code}` is where the tracking number must be inserted to use the link. Can be null or empty.
- `free_shipping_threshold_quantity` (integer): The minimum number of products required to use this Shipping Method for free. Can be null.
- `free_shipping_threshold_price` (Money): The minimum value for the sum of all the products' prices included in the delivery that is required to use this Shipping Method for free, indicated in cents in your currency. Can be null.
- `formatted_free_shipping_threshold_price` (string): The `free_shipping_threshold_price` in a string format, in your currency. Can be null.
- `max_cart_subtotal_price` (Money): The maximum value for the sum of all the products' prices included in the delivery that is allowed for this Shipping Method, indicated in cents in your currency. Can be null.
- `formatted_max_cart_subtotal_price` (string): The `max_cart_subtotal_price` in a string format, in your currency. Can be null.
- `shipping_method_costs` (array): An array of Shipping Method Costs that represents, for each weight interval, the price of the Shipping Method

**Response Example:**
```json
[
  {
    "id": 19044,
    "name": "Posta 1 con Codice Bidimensionale",
    "min_estimate_shipping_days": 1,
    "max_estimate_shipping_days": 2,
    "parcel": false,
    "tracked": true,
    "tracking_link": "https://www.poste.it/cerca/index.html#/risultati-spedizioni/{code}",
    "free_shipping_threshold_quantity": null,
    "free_shipping_threshold_price": null,
    "formatted_free_shipping_threshold_price": null,
    "max_cart_subtotal_price": {
      "cents": 15000,
      "currency": "EUR"
    },
    "formatted_max_cart_subtotal_price": "€150.00",
    "shipping_method_costs": []
  }
]
```

**Shipping Method Cost object:**
- `from_grams` (integer): The minimum number of grams (g) for this Shipping Method Cost.
- `to_grams` (integer): The maximum number of grams (g) for this Shipping Method Cost.
- `price` (Money): The price of this Shipping Method Cost, indicated in cents in your currency.
- `formatted_price` (string): The price in a string format, in your currency.

**Example Shipping Method Cost**
```json
{
  "from_grams": 14,
  "to_grams": 80,
  "price": {
    "cents": 330,
    "currency": "EUR"
  },
  "formatted_price": "€3.30"
}
```

---

## Wishlists

### List Wishlists
GET /wishlists
Retrieve a paginated list of wishlists for the current user. Optionally, wishlists can be filtered by game ID.

**Optional Parameters:**
- `page` (integer, default: 1): The page number to retrieve.
- `limit` (integer, default: 20): The number of results per page.
- `game_id` (integer, optional): Filter by game ID.

```bash
curl https://api.cardtrader.com/api/v2/wishlists?game_id=1 \
  -H "Authorization: Bearer [YOUR_AUTH_TOKEN]"
```

**Response Example:**
```json
[
  {
    "id": 2,
    "name": "Mono Red Goblin",
    "game_id": 1,
    "public": true,
    "created_at": "2021-08-31T15:24:23.000Z",
    "updated_at": "2021-08-31T15:24:23.000Z"
  }
]
```

---

### Show Wishlist

#### GET /wishlists/:id
Retrieve the details of a specific wishlist by its ID.

```bash
curl https://api.cardtrader.com/api/v2/wishlists/2 \
  -H "Authorization: Bearer [YOUR_AUTH_TOKEN]"
```

**Response Example:**
```json
{
  "id": 2,
  "name": "Mono Red Goblin",
  "game_id": 1,
  "public": true,
  "created_at": "2021-08-31T15:24:23.000Z",
  "updated_at": "2021-08-31T15:24:23.000Z",
  "items": [
    {
      "quantity": 2,
      "meta_name": "Conspicuous Snoop",
      "expansion_code": "m21",
      "collector_number": "139",
      "language": "en",
      "condition": "Near Mint",
      "foil": "false",
      "reverse": null,
      "first_edition": null
    }
  ]
}
```

---

### Create Wishlist
POST /wishlists
Create a new wishlist for the current user. This endpoint accepts various wishlist attributes.

**Required body params (JSON):**
- `deck`: Object containing deck attributes.
  - `name` (string, mandatory): The name of this wishlist.
  - `public` (boolean): A flag indicating whether the wishlist is public.
  - `game_id` (integer, mandatory): The CardTrader game ID of the items in the wishlist.
  - `deck_items_from_text_deck` (string, optional): Deck in MTGA format.
  - `deck_items_attributes` (array, optional): List of items in the wishlist.

**A DeckItem represents an object on the wishlist that identifies an item I desire. The more specific characteristics I specify, the more precise the represented object will be.**

**Parameters:**
- `quantity` (integer): The quantity of the item.
- `blueprint_id` (integer): The ID of the blueprint of the item. This is a shortcut to set the `meta_name` and `expansion_code` fields based on this blueprint.
- `meta_name` (string): A string that represents an object in a functionally equivalent way. In the case of magic it is the name of the card, for example "counterspell" indicates that the object is any counterspell of any edition or version. In the case of Pokemon it is the name of the card plus the move such as "pikachu-m-lv-45-thunderbolt".
- `expansion_code` (string): The code of the expansion.
- `collector_number` (string): The collector number of the item.
- `language` (string): The language of the item.
- `condition` (string): The condition of the item.
- `foil` (string): The foilness of the item.
- `reverse` (string): The reverse foilness of the item.
- `first_edition` (boolean): The item is a first edition.

```bash
curl -X POST https://api.cardtrader.com/api/v2/wishlists \
  -H "Authorization: Bearer [YOUR_AUTH_TOKEN]" \
  -d '{
  "game_id": 1,
  "name": "UW Control",
  "public": true,
  "deck_items_attributes": [
    {
      "blueprint_id": 12,
      "quantity": 2,
      "condition": "NM",
      "language": "jp"
    }
  ]
}'
```

---

### Delete Wishlist
DELETE /wishlists/:id
Delete a specific wishlist by its ID.

```bash
curl https://api.cardtrader.com/api/v2/wishlists/2 \
  -H "Authorization: Bearer [YOUR_AUTH_TOKEN]"
```

---

## Inventory Management

### List your Expansions
GET /expansions/export
The list of Expansions you have.

Returns the expansions of the products that you have in your inventory. This is useful for retrieving your products by their expansions.

```bash
curl -X GET https://api.cardtrader.com/api/v2/expansions/export \
  -H "Authorization: Bearer [YOUR_AUTH_TOKEN]"
```

**Response Example:**
```json
[
  {
    "id": 6,
    "game_id": 1,
    "code": "grn",
    "name": "Guilds of Ravnica"
  },
  {
    "id": 12,
    "game_id": 1,
    "code": "m19",
    "name": "Core Set 2019"
  }
]
```

---

### List your Products
GET /products/export
The list of Products you have.

A Product represents a specific item you have for sale, tied to a certain Blueprint. For example, you could have a Black Lotus Limited Edition Alpha expansion for sale for €35,000.

This call may take several seconds on large collections. Please make sure your read timeout is large enough (120-180 seconds). Many libraries have 10 or 30 seconds default.

You can optionally specify a `blueprint_id` param to export your products belonging to the specified blueprint.

You can optionally specify a `expansion_id` param to export your products belonging to the specified expansion.

```bash
curl -X GET https://api.cardtrader.com/api/v2/products/export \
  -H "Authorization: Bearer [YOUR_AUTH_TOKEN]"

curl -X GET https://api.cardtrader.com/api/v2/products/export?blueprint_id=123 \
  -H "Authorization: Bearer [YOUR_AUTH_TOKEN]"

curl -X GET https://api.cardtrader.com/api/v2/products/export?expansion_id=8 \
  -H "Authorization: Bearer [YOUR_AUTH_TOKEN]"
```

**The Product object:**
- `id` (integer): A unique Product identifier
- `name_en` (string): The English name of the Product
- `quantity` (integer): The quantity of the Product
- `description` (string): A description set by you, the seller, and visible to all
- `price_cents` (object): The price in cents of the Product, in your currency
- `price_currency` (string): Your currency
- `game_id` (integer): The ID of the Game the Product belongs to
- `category_id` (integer): The ID of the Category to which this Product belongs
- `blueprint_id` (integer): The Blueprint ID of this Product
- `properties_hash` (object): An object containing all the Property values fir this Product. The key is the name of a Property, the value is one of the possible values of the Property
- `user_id` (integer): The ID of the owner of the Product (your ID)
- `graded` (string): The grading value
- `tag` (string): Tag, visible only to your
- `user_data_field` (string): An additional text field to include metadata. You can use save the references on your local system, or save the location in the warehouse, or any other type of textual information
- `bundle_size` (integer): The number of the same products in the bundle
- `bundled_quantity` (integer): quantity x bundle_size
- `uploaded_images` (array): The list of images uploaded for that specific Product

**Response Example:**
```json
[
  {
    "uploaded_images": [],
    "quantity": 2,
    "description": "",
    "price_cents": 2,
    "bundled_quantity": 2,
    "blueprint_id": 7480,
    "properties_hash": {},
    "category_id": 1,
    "user_id": 51242,
    "graded": false,
    "id": 108455069,
    "tag": "",
    "user_data_field": "warehouse B, shelf 10C",
    "bundle_size": 1,
    "price_currency": "EUR",
    "game_id": 1,
    "name_en": "Tranquil Cove"
  }
]
```

---

### One Product Operations

#### Create
POST /products
Use this endpoint to sell one Product.

**Parameters:**
- `blueprint_id` (integer, mandatory): The ID of the Blueprint you want to sell
- `price` (float, mandatory): The price of the Product, in your currency
- `quantity` (integer, mandatory): The quantity. If you already have one such Product, it will just increment the quantity (not create a new Product)
- `description` (string, optional): The description of the Product. Visible to all
- `error_mode` (string, optional): If specified and set to "strict", the API will fail and not create a Product if you pass a wrong Property. Otherwise, it will return a warning and accept the Product, automatically fixing the wrong Property with its default value. If, for example, you send condition "Plaied" in strict mode, the Product will not be created. In non-strict error_mode instead, the Product will be created with the default condition "Near Mint"
- `user_data_field` (string, optional): Any text string you want to attach to the Product. You can use it to hold information for interfacing with your local system, your warehouse, or the id on your portal. Not visible anywhere, only visible via API
- `properties` (object, optional): An object with the Property of this Product. The key is a name of a Property, the value is always one of the possible_values of the Property of the Blueprint you are instantiating
- `graded` (boolean, optional): If the Product is graded

```bash
curl -X POST https://api.cardtrader.com/api/v2/products \
  -H "Authorization: Bearer [YOUR_AUTH_TOKEN]" \
  -d '{
  "price": 62.58,
  "quantity": 1,
  "blueprint_id": 16
}'

curl -X POST https://api.cardtrader.com/api/v2/products \
  -H "Authorization: Bearer [YOUR_AUTH_TOKEN]" \
  -d '{
  "price": 62.58,
  "quantity": 1,
  "blueprint_id": 16,
  "error_mode": "strict",
  "user_data_field": "Room 1, shelf 82",
  "properties": {
    "condition": "Slightly Played",
    "mtg_language": "French"
  },
  "graded": false
}'
```

**Response Example:**
```json
{
  "result": "ok",
  "warnings": {},
  "resource": {}
}
```

---

#### Update
PUT /products/:id
Edit an existing Product. The request must contain the ID of the Product you want to modify.

**Parameters:**
- `id` (integer, mandatory): The ID of the Product you are editing
- `price` (float, optional): The price of the Product, in your currency
- `quantity` (integer, optional): The quantity. If you already have one such Product, it will just increment the quantity (not create a new Product)
- `description` (string, optional): The description of the Product. Visible to all
- `error_mode` (string, optional): If specified and set to "strict", the API will fail and not create a Product if you pass a wrong Property. Otherwise, it will return a warning and accept the Product, automatically fixing the wrong Property with its default value. If, for example, you send condition "Plaied" in strict mode, the Product will not be created. In non-strict error_mode instead, the Product will be created with the default condition "Near Mint"
- `user_data_field` (string, optional): Any text string you want to attach to the Product. You can use it to hold information for interfacing with your local system, your warehouse, or the id on your portal. Not visible anywhere, only visible via API
- `properties` (object, optional): An object with the Property of this Product. The key is a name of a Property, the value is always one of the possible_values of the Property of the Blueprint you are instantiating
- `graded` (boolean, optional): If the Product is graded

```bash
curl -X PUT https://api.cardtrader.com/api/v2/products/108902392 \
  -H "Authorization: Bearer [YOUR_AUTH_TOKEN]" \
  -d '{
  "quantity": 4,
  "properties": {
    "condition": "Near Mint"
  }
}'
```

**Response Example:**
```json
{
  "result": "ok",
  "warnings": {},
  "resource": {
    "id": 108902392,
    "quantity": 4,
    "bundle_size": 1,
    "description": null,
    "graded": 0,
    "game_id": 1,
    "category_id": 1,
    "expansion_id": 1,
    "blueprint_id": 16,
    "price": {
      "cents": 170,
      "currency": "EUR"
    },
    "properties": {
      "mtg_language": "en",
      "mtg_foil": false,
      "condition": "Near Mint",
      "signed": false,
      "altered": false
    }
  }
}
```

---

#### Delete
DELETE /products/:id
Delete a Product, regardless of its quantity. If you want to edit attributes, you should not delete & recreate but rather edit the value.

```bash
curl -X DELETE https://api.cardtrader.com/api/v2/products/3936985 \
  -H "Authorization: Bearer [YOUR_AUTH_TOKEN]"
```

**Example Response:**
```json
{
  "result": "ok",
  "warnings": [],
  "resource": {}
}
```

---

#### Increment or Decrement
POST /products/:id/increment
Increment or decrement a Product quantity. The request contains the Product ID and the `delta_quantity`. The other values of the Product will not change, for example the price will remain unchanged.

**Parameters:**
- `delta_quantity` (integer, mandatory): The quantity to increase a decrease, positive or negative

If you send a `delta_quantity` such that the resulting new quantity is 0 or less, the Product will be deleted.

```bash
curl -X POST https://api.cardtrader.com/api/v2/products/108944328/increment \
  -H "Authorization: Bearer [YOUR_AUTH_TOKEN]" \
  -d '{
  "delta_quantity": 4
}'
```

**Response Example:**
```json
{
  "result": "ok",
  "warnings": {},
  "resource": {}
}
```

---

### Batch Product Operations
Batch operations are the preferred way to operate on many Products at the same time (create, update or delete them). The create, update and delete operations have 3 endpoints, each accepting an array of Products.

Product operations are asynchronous: the endpoint returns immediately and the response is a job. A job has only a string value, the uuid code. You can check the status of the job at the endpoint /jobs using that code.

#### Create
POST /products/bulk_create
Create multiple Products. The request has a `products` key containing an array of JSON objects describing the many products you want to create.

You can specify the "error_mode" key for each product to have better control over the validation of the products you are about to create.

**Parameters:**
- `blueprint_id` (integer, mandatory): The ID of the Blueprint you want to sell
- `price` (float, mandatory): The price of the Product, in your currency
- `quantity` (integer, mandatory): The quantity. If you already have one such Product, it will just increment the quantity (not create a new Product)
- `description` (string, optional): The description of the Product. Visible to all
- `error_mode` (string, optional): If specified and set to "strict", the API will fail and not create a Product if you pass a wrong Property. Otherwise, it will return a warning and accept the Product, automatically fixing the wrong Property with its default value. If, for example, you send condition "Plaied" in strict mode, the Product will not be created. In non-strict error_mode instead, the Product will be created with the default condition "Near Mint"
- `user_data_field` (string, optional): Any text string you want to attach to the Product. You can use it to hold information for interfacing with your local system, your warehouse, or the id on your portal. Not visible anywhere, only visible via API
- `properties` (object, optional): An object with the Property of this Product. The key is a name of a Property, the value is always one of the possible_values of the Property of the Blueprint you are instantiating
- `graded` (boolean, optional): If the Product is graded

```bash
curl -X POST https://api.cardtrader.com/api/v2/products/bulk_create \
  -H "Authorization: Bearer [YOUR_AUTH_TOKEN]" \
  -d '{
  "products": [
    {
      "blueprint_id": 13,
      "price": 3.5,
      "quantity": 4,
      "user_data_field": "id431445914"
    },
    {
      "blueprint_id": 13,
      "price": 2.5,
      "quantity": 4,
      "error_mode": "strict",
      "user_data_field": "id431445915",
      "properties": {
        "condition": "Played"
      },
      "graded": false
    }
  ]
}'
```

**Response Example:**
```json
{
  "job": "95a4d81c-e8c4-40ea-bc7d-ac4d41d2e634"
}
```

---

#### Update
POST /products/bulk_update
The endpoint to call to change products currently on sale.

Be sure to add the id of each Product.

You can modify a Product by specifying the following attributes.

**Parameters:**
- `id` (integer, mandatory): The ID of the Product you are editing
- `price` (float, optional): The price of the Product, in your currency
- `quantity` (integer, optional): The quantity. If you already have one such Product, it will just increment the quantity (not create a new Product)
- `description` (string, optional): The description of the Product. Visible to all
- `error_mode` (string, optional): If specified and set to "strict", the API will fail and not create a Product if you pass a wrong Property. Otherwise, it will return a warning and accept the Product, automatically fixing the wrong Property with its default value. If, for example, you send condition "Plaied" in strict mode, the Product will not be created. In non-strict error_mode instead, the Product will be created with the default condition "Near Mint"
- `user_data_field` (string, optional): Any text string you want to attach to the Product. You can use it to hold information for interfacing with your local system, your warehouse, or the id on your portal. Not visible anywhere, only visible via API
- `properties` (object, optional): An object with the Property of this Product. The key is a name of a Property, the value is always one of the possible_values of the Property of the Blueprint you are instantiating
- `graded` (boolean, optional): If the Product is graded

```bash
curl -X POST https://api.cardtrader.com/api/v2/products/bulk_update \
  -H "Authorization: Bearer [YOUR_AUTH_TOKEN]" \
  -d '{
  "products": [
    {
      "id": 3936985,
      "quantity": 4,
      "user_data_field": "from_internal_user_4323",
      "properties": {
        "condition": "Near Mint"
      }
    },
    {
      "id": 3936986,
      "quantity": 4,
      "price": 2.5,
      "user_data_field": "from_internal_user_4324",
      "properties": {
        "foil": false
      },
      "graded": false
    }
  ]
}'
```

**Response Example:**
```json
{
  "job": "95a4d81c-e8c4-40ea-bc7d-ac4d41d2e634"
}
```

---

#### Delete
POST /products/bulk_destroy
Delete Products. The request must contain an array of Product IDs you want to delete.

**Parameters:**
- `id` (integer, mandatory): The ID of the product to be deleted

```bash
curl -X POST https://api.cardtrader.com/api/v2/products/bulk_destroy \
  -H "Authorization: Bearer [YOUR_AUTH_TOKEN]" \
  -d '{
  "products": [
    {
      "id": 3936985
    },
    {
      "id": 3936986
    }
  ]
}'
```

**Response Example:**
```json
{
  "job": "95a4d81c-e8c4-40ea-bc7d-ac4d41d2e634"
}
```

---

## Jobs

### Job Status
GET /jobs/:uuid
The endpoint for inspecting a Job.

The state of the Job indicates the progress: `pending` means that it has not begun yet, `running` means the Job is in progress, `unprocessable` means there was an error, `completed` means the Job finished successfully.

The stats indicate the number of Products processed correctly (`ok`), processed but with warnings (`warning`) or not processed at all (`error`).

Each product specified in the payload appears in the results section, along with the status and the `product_id` created/updated/deleted on CardTrader. The products keep the same position they had in the payload (`job_index`) so you know, for example, that the second element in the payload will be the second element in the results. In the example we created 3 products, so we got 3 results.

```bash
curl https://api.cardtrader.com/api/v2/jobs/daca4458-e953-456c-ba71-33b469fd264c \
  -H "Authorization: Bearer [YOUR_AUTH_TOKEN]"
```

**The Job object:**
- `uuid` (integer): A unique identifier for each job
- `state` (string): Job status
- `spawned_children` (integer): The number of operations to be performed
- `stats` (object): The JobStats object, which specifies how many operations were successful, have warnings, have errors or are still pending
- `results` (array): An array of results, one for every item you specified in the payload

**Response Example:**
```json
{
  "uuid": "daca4458-e953-456c-ba71-33b469fd264c",
  "state": "completed",
  "spawned_children": 3,
  "stats": {
    "ok": 1,
    "warning": 1,
    "error": 1
  },
  "results": [
    {
      "result": "ok",
      "job_index": 0,
      "product_id": 101950096
    },
    {
      "result": "error",
      "job_index": 1,
      "errors": {
        "blueprint_id": [
          "Blueprint cant be blank"
        ]
      }
    },
    {
      "result": "warning",
      "job_index": 2,
      "product_id": 102043807,
      "warnings": {
        "properties": {
          "mtg_foil": [
            "Read only property mtg_foil has been ignored"
          ]
        }
      }
    }
  ]
}
```

---

## CSV Product Operations
You can also manage your Products using CSV files.

### Upload
POST /product_imports
You can totally replace your inventory with the content of a CSV file or you can just add new Products. You have to upload one CSV per Game because each Game has different properties. Also, you cannot import more than one file per Game at a time. Differently from other APIs, the POST body is a multipart form containing the following parameters:

```bash
curl https://api.cardtrader.com/api/v2/product_imports \
  -H "Authorization: Bearer [YOUR_AUTH_TOKEN]" \
  -F  csv=path_to_csv.csv \
  -F  game_id=1 \
  -F  replace_stock_or_add_to_stock=replace_stock \
  -F  column_names=expansion_code|_|name|quantity|language|condition|_|price_cents \
  -G
```

**Order object:**
- `csv` (file): The file to upload
- `game_id` (text): This parameter is the id of the game of your products.
- `error_mode` (strict | null): If specified and set to "strict", the API will fail and not create a Product if you pass a wrong Property. Otherwise, it will return a warning and accept the Product, automatically fixing the wrong Property with its default value. If, for example, you send condition "Plaied" in strict mode, the Product will not be created. In non-strict error_mode instead, the Product will be created with the default condition "Near Mint"
- `replace_stock_or_add_to_stock` (text): This parameter, as the name suggests, can have 2 values: "replace_stock" or "add_to_stock". If you use the first option, your entire stock for that game will be replaced at the end of the import (this option is good if you have your inventory on another platform and want to sync CardTrader to it). If you choose this at the end of the import your entire inventory(per game) is replaced with the content of the csv. Otherwise, the API will add the items you specified to your Products.
- `column_names` (text): This parameter allows you to specify the structure of your CSV file. It's a string composed of the names of the columns separated by a "|" char. You can use any name in the section below.

**Allowed Column Names:**
- `name`
- `quantity`
- `bundle`
- `expansion_code`
- `expansion_name`
- `expansion_id`
- `price`
- `price_cents`
- `language`
- `condition`
- `foil`
- `signed`
- `altered`
- `first_edition`
- `expansion_code`
- `mkm_id`
- `user_data_field`
- `tcgplayer_id`
- `scryfall_id`
- `scryfall_id`
- `description`
- `rarity`

If there's a column you don't want CardTrader to handle instead of writing its name you can put a `_`.

A valid .csv must contain at least one of the following combinations of columns, to allow CardTrader to identify the product:

- `name, expansion_code`
- `name, expansion_name`
- `name, expansion_id` (expansion_id is the CardTrader internal Expansion ID)
- `name, collector_number, expansion_code`
- `name, collector_number, expansion_name`
- `name, collector_number, expansion_id`
- `collector_number, expansion_code`
- `collector_number, expansion_name`
- `collector_number, expansion_id`
- `mkm_id`
- `tcgplayer_id`
- `scryfall_id`
- `blueprint_id`

The API is asynchronous, so it will immediately return a JSON object containing the id of the import operation. You can check its status with the following API.

**Example Response:**
```json
{
  "id": 54345,
  "csv_filename": "mini.csv",
  "csv_size": 213
}
```

**Example Failure Response:**
```json
{
  "errors": [
    {
      "scheduler": "Another synchronization is in progress. Please retry later."
    }
  ]
}
```

**Example CSV:**
```
168824,0,130,"",Lucemon,2583,BT-04: Booster Great Legend,bt4,8,0,7700,EUR,1,Near Mint
168756,0,130,"",MirageGaogamon,2583,BT-04: Booster Great Legend,bt4,8,0,550,EUR,2,Near Mint
168796,0,130,"",Gogmamon,2583,BT-04: Booster Great Legend,bt4,8,0,244,EUR,1,Near Mint
168815,0,130,"",Plutomon,2583,BT-04: Booster Great Legend,bt4,8,0,248,EUR,1,Near Mint
168813,0,130,"",DanDevimon,2583,BT-04: Booster Great Legend,bt4,8,0,242,EUR,1,Near Mint
```

**Example CSV Header:**
```
blueprint_id,bundle,category_id,description,name_en,expansion_id,expansion_name,expansion_code,game_id,graded,price_cents,price_currency,quantity,mtg_rarity,condition
```

---

### Status
GET /product_imports/:id
This API will update you on the state of the CSV import

```bash
curl -X GET https://api.cardtrader.com/api/v2/product_imports/:id \
  -H "Authorization: Bearer [YOUR_AUTH_TOKEN]"
```

**Response Example:**
```json
{
  "id": 54345,
  "count": 10,
  "imported_count": 8,
  "skipped_count": 2,
  "create_count": 8,
  "update_count": 0,
  "delete_count": 0,
  "error": null,
  "sync_started_at": "2019-05-15T12:47:01.000Z",
  "sync_ended_at": "2019-05-15T12:47:05.000Z",
  "csv_filename": "mini.csv",
  "csv_size": 213
}
```

If some items have some errors in them, they will fail to be imported. In this case on the "skipped_items" field will have a value greater than 0.

In this case, you can use this API to gather information on the skipped items.

GET /product_imports/:id/skipped
This API will update you on the state of the CSV import

```bash
curl -X GET https://api.cardtrader.com/api/v2/product_imports/:id/skipped  \
  -H "Authorization: Bearer [YOUR_AUTH_TOKEN]"
```

This API will send you back another CSV file containing the rows skipped.

---

## Order Management

### Order Lifecycle
Each order has 8 different possible states.

Those states will change over time. They are different depending on if the order was created with CardTraderzero or not.

**Standard CardTrader order**
- Once a customer buys something, this will create an order in a paid state. That means that the store that receives the order has to send it.
- Once the seller sends the order, the state of it will go to sent
- When the buyer receives the order it will go to arrived
- Once the buyer is reviewed or a timeout has expired order will go to done.

**CardTrader Zero order**
For CardTrader Zero, there's one additional state: `hub_pending`. The seller will receive every order from CardTrader itself in this state. That means that the card is sold but has not to be sent yet.

Once per week, it will be created a new order in paid state, with all the items of the others. The other orders are set to closed. The seller has to send to CardTrader the merged order. If you are using an external system to manage your stock, for CardTrader Zero orders you should decrement your stock ONLY for hub_pending orders, otherwise you risk to do it twice.

You have to check 3 fields inside the payload:
- `via_cardtrader_zero`
- `state`
- `hub_pending_order_id` of each order_item (only if you do pre-sales, otherwise this check is not needed)

| state        | via_cardtrader_zero | Should you decrement your stock? |
|--------------|----------------------|----------------------------------|
| hub_pending  | true                 | Yes*                             |
| paid         | true                 | No                               |
| paid         | false                | Yes                              |

\* For accounts with pre-sale enabled, you also need to check if order id is equal to order_item hub_pending_order_id

**Special States**
If something goes wrong an order can go to these states:
- `request_for_cancel`: if one of the seller or the buyer requested cancellation.
- `canceled`: if the cancellation request has been accepted
- `lost`: if the order gets lost before being arrived

---

### List your Orders
GET /orders
The list of orders you received, from date to date and from_id to_id, sorted by sort. An Order is a user purchasing your Products.

**Optional Parameters:**
- `page` (integer, default: 1): The page number to retrieve.
- `limit` (integer, default: 20): The number of results per page.
- `from` (date, format: YYYY-MM-DD, default: 1970-01-01): Start date for filtering orders.
- `to` (date, format: YYYY-MM-DD, default: current date): End date for filtering orders.
- `from_id` (integer, default: 0): Filters the results excluding the Orders with id equal or less than from_id
- `to_id` (integer, default: infinite): Filters the results excluding the Orders with id greater than to_id
- `state` (string, optional): Return orders in the specified state.
- `order_as` (string, optional): Your role in the order. It can be either "seller" or "buyer".
- `sort` (string, format: <id|date>.<asc|desc>, default: date.desc): Sort by id or by date, in ascending or descending order.

```bash
curl https://api.cardtrader.com/api/v2/orders \
  -H "Authorization: Bearer [YOUR_AUTH_TOKEN]" \
  -d  sort=date.desc \
  -d  from=2019-01-01 \
  -d  to=2019-03-01 \
  -d  from_id=35102 \
  -d  to_id=37192 \
  -G
```

**Order object:**
- `id` (integer): A unique identifier for each Order
- `code` (string): A code to identify this Order
- `transaction_code` (string): The transaction code of the order
- `via_cardtrader_zero` (bool): If this order is received with CardTrader Zero
- `seller` (User): seller's user, it is visible only if you are the buyer
- `buyer` (User): buyer's user, it is visible only if you are the seller
- `order_as` (string): Your role in the order, it can be either "seller" or "buyer"
- `state` (string): The current state of the order picked from the 8 described above
- `size` (integer): The number of items sold in this Order
- `paid_at` (datetime): The date the order was paid
- `credit_added_to_seller_at` (datetime): The date the credit was transferred to the seller
- `sent_at` (datetime): The date this Order was sent, this field can be empty depending on the order state.
- `cancelled_at` (datetime): The date this Order was canceled, this field can be empty depending on the order state.
- `cancel_requester` (User): username of the person who requested the cancellation. It can be empty
- `buyer_total` (Money): The total for this order, indicated in cents and currency indicated in cents in the currency of the buyer. You will see this field only if you are the buyer
- `seller_total` (Money): The total for this order, indicated in cents and currency indicated in cents in the currency of the seller. You will see this field only if you are the seller
- `presale_ended_at` (datetime): If the order was a presale, it indicates the date the presale ended
- `fee_percentage` (float): The commission percentage on this Order
- `fee_amount` (Money): The commission for this order, indicated in cents and currency, in your currency
- `seller_fee_amount` (Money): The total commission for this order, indicated in cents and currency, in your currency
- `seller_subtotal` (Money): The subtotal for this order for the seller, indicated in cents in the currency of the seller. You will see this field only if you are the seller
- `buyer_subtotal` (Money): The subtotal for this order for the seller, indicated in cents in the currency of the seller. You will see this field only if you are the buyer
- `packing_number` (integer): A unique number of orders not yet shipped, to help package them during shipment
- `order_shipping_address` (Address): The address to send the order to
- `order_billing_address` (Address): The billing address
- `order_shipping_method` (ShippingMethod): The shipping method
- `formatted_subtotal` (string): The subtotal of the order formatted "[value_as_float] [currencysymbol]"
- `formatted_total` (string): The subtotal of the order formatted "[value_as_float] [currencysymbol]"
- `presale` (boolean): Indicates whether the order was a presale or not
- `order_items` (array): An array of items sold in this order

**Response Example:**
```json
[
  {
    "order_as": "seller",
    "buyer": {},
    "cancel_requester": null,
    "id": 733733,
    "code": "202109213e70f5",
    "state": "hub_pending",
    "size": 1,
    "paid_at": null,
    "via_cardtrader_zero": true,
    "credit_added_to_seller_at": "2021-09-21T16:16:00.000Z",
    "sent_at": null,
    "cancelled_at": null,
    "presale_ended_at": null,
    "fee_percentage": "5.0",
    "packing_number": 11,
    "order_shipping_address": {},
    "order_billing_address": {},
    "seller_total": {
      "cents": 4,
      "currency": "EUR"
    },
    "fee_amount": {
      "cents": 1,
      "currency": "USD"
    },
    "seller_fee_amount": {
      "cents": 1,
      "currency": "EUR"
    },
    "subtotal": {
      "cents": 5,
      "currency": "USD"
    },
    "seller_subtotal": {
      "cents": 4,
      "currency": "EUR"
    },
    "formatted_subtotal": "€0.04",
    "formatted_total": "€0.04",
    "presale": null,
    "order_shipping_method": null,
    "order_items": []
  }
]
```

**Description of Address fields**
- `id` (integer): A unique identifier for each address
- `name` (string): The full name for this address
- `street` (string): The street related to this address
- `zip` (string): The ZIP code of this address
- `city` (string): The city of this address
- `state_or_province` (string): The state/province of this address
- `country` (string): The country where this address is located
- `country_code` (string): The ISO3166 country code
- `note` (string): Any notes left by the addressee

**Address Example:**
```json
{
  "id": 1503007,
  "name": "name",
  "street": "street",
  "zip": "zip",
  "city": "Wien",
  "state_or_province": "Wien",
  "country_code": "AT",
  "note": null,
  "country": "Austria"
}
```

**ShippingMethod Example:**
```json
{
  "id": 463937,
  "name": "Priority Letter (Lettre Prioritaire)",
  "tracked": false,
  "price": {
    "cents": 178,
    "currency": "USD"
  },
  "tracking_code": null,
  "max_estimate_shipping_days": 14,
  "seller_price": {
    "cents": 150,
    "currency": "EUR"
  },
  "buyer_price": {
    "cents": 150,
    "currency": "EUR"
  },
  "formatted_price": "€1.50"
}
```

---

### Order Details
GET /orders/:id
The call to retrieve information from a single Order.

The request does not require any body.

The structure of the returned object is the same of the index of orders.

```bash
curl https://api.cardtrader.com/api/v2/orders/1234567 \
  -H "Authorization: Bearer [YOUR_AUTH_TOKEN]"
```

---

### Update Order
Once an order is created, you cannot directly edit every field of it. You have the following endpoint that allows you to mark it as shipped, request cancellation, accept the cancellation, and set a tracking code.

#### Set Tracking Code
PUT /orders/:id/tracking_code
Set a tracking code for the order.

If the order is a CardTrader Zero one you have to set the tracking code BEFORE shipping it

You have to specify the Tracking Code only if you are the seller in this order.

**Parameters:**
- `tracking_code` (string, mandatory): Order tracking code

```bash
curl https://api.cardtrader.com/api/v2/orders/1234567/tracking_code \
  -H "Authorization: Bearer [YOUR_AUTH_TOKEN]"
```

---

#### Ship
PUT /orders/:id/ship
This operation marks the order as sent. If the order is in a state where this operation is not allowed the API will return an error message.

This request does not require any body.

```bash
curl https://api.cardtrader.com/api/v2/orders/1234567/ship \
  -H "Authorization: Bearer [YOUR_AUTH_TOKEN]"
```

---

#### Request Cancellation
PUT /orders/:id/request-cancellation
Depending on whether you are the seller or the buyer, this request will send a request for order cancellation to the other person. This state change can happen if the order is in paid or sent state.

**Parameters:**
- `cancel_explanation` (string, mandatory): Reason of the cancellation. Must be at least 50 characters.
- `relist_if_cancelled` (boolean): Sets the relist cancel in case the cancellation is confirmed.

```bash
curl https://api.cardtrader.com/api/v2/orders/1234567/request-cancellation \
  -H "Authorization: Bearer [YOUR_AUTH_TOKEN]"
```

---

#### Confirm Cancellation
PUT /orders/:id/confirm-cancellation
Confirm order cancellation if the current order state permits the transition.

If it is not available it will return an error

If you are the seller you can specify the following attributes:
- `relist_if_cancelled` (boolean): Sets the relist cancel in case the cancellation is confirmed.

```bash
curl https://api.cardtrader.com/api/v2/orders/1234567/confirm-cancellation \
  -H "Authorization: Bearer [YOUR_AUTH_TOKEN]"
```

---

## CT0 Box Items

### List your CT0 Box Items
GET /ct0_box_items
The list of CT0 Box items you purchased.

A CT0 Box Item is a product you purchased with CardTrader Zero that has not yet been sent to you directly.

```bash
curl https://api.cardtrader.com/api/v2/ct0_box_items \
  -H "Authorization: Bearer [YOUR_AUTH_TOKEN]"
```

**CT0 Box Item object:**
- `id` (integer): A unique identifier for each CT0 Box Item.
- `quantity` (object): The quantity purchased by state. The three allowed states are: ok for items in your CT0 Box, ready to be delivered; pending for items that are getting to your CT0 Box; missing for items not available anymore and refunded.
- `seller` (User): Seller's user.
- `product_id` (integer): The id of the Product this CT0 Box Item was created from.
- `blueprint_id` (integer): The id of the Blueprint this CT0 Box Item's Product is an instance of.
- `category_id` (integer): The id of the Category this CT0 Box Item belongs to.
- `game_id` (integer): The id of the Game this CT0 Box Item belongs to.
- `name` (string): The name of this CT0 Box Item's Product.
- `expansion` (string): The name of the expansion this CT0 Box Item belongs to.
- `bundle_size` (integer): The number of items in the bundle.
- `description` (string): The description of this CT0 Box Item's Product.
- `graded` (string): If present, the indication on the grading.
- `properties` (object): The properties of this CT0 Box Item. The key is a name of a Property, the value is always one of the possible_values of that Property object.
- `buyer_price` (Money): The price of the product for the buyer, indicated in cents in the buyer currency.
- `formatted_price` (string): The buyer price in a string format, in the buyer's currency.
- `mkm_id` (string): If present, the id used by Card Market to identify the Blueprint corresponding to this CT0 Box Item.
- `tcg_player_id` (string): If present, the id used by Tcg Player to identify the Blueprint corresponding to this CT0 Box Item.
- `scryfall_id` (string): If present, the id used by SCRYFALL to identify the Blueprint corresponding to this CT0 Box Item.
- `presale` (boolean): Indicates whether the CT0 Box Item was a presale or not.
- `presale_ended_at` (datetime): If the CT0 Box Item was a presale, it indicates the date the presale ended.
- `paid_at` (datetime): The date the CT0 Box Item was paid.
- `estimated_arrived_at` (datetime): The date the CT0 Box Item is expected to arrive (if it's in a pending state).
- `arrived_at` (datetime): The date the CT0 Box Item is arrived (if it's in a ok state).
- `cancelled_at` (datetime): The date this CT0 Box Item was canceled, this field can be empty depending on the CT0 Box Item state.

**Response Example:**
```json
[
  {
    "id": 1917020,
    "quantity": {
      "pending": 1
    },
    "seller": {},
    "product_id": 99947732,
    "blueprint_id": 7842,
    "category_id": 1,
    "game_id": 1,
    "name": "Deathcap Cultivator",
    "expansion": "Shadows over Innistrad",
    "bundle_size": 1,
    "description": "Express delivery",
    "graded": false,
    "properties": {
      "mtg_rarity": "Rare",
      "condition": "Slightly Played",
      "mtg_language": "en",
      "mtg_foil": false,
      "signed": false,
      "altered": false,
      "collector_number": "202",
      "cmc": "2.0",
      "mtg_card_colors": "G",
      "tournament_legal": true
    },
    "buyer_price": {
      "cents": 8,
      "currency": "EUR"
    },
    "formatted_price": "€0.08",
    "mkm_id": 288973,
    "tcg_player_id": 115889,
    "scryfall_id": "fc4aee46-ac42-4ede-ad06-906e2955a9d3",
    "presale": null,
    "presale_ended_at": null,
    "paid_at": "2021-10-02T16:14:54.000Z",
    "estimated_arrived_at": "2021-10-14T16:14:54.000Z",
    "arrived_at": null,
    "cancelled_at": null
  }
]
```

---

### CT0 Box Item Details
GET /ct0_box/:id
The call to retrieve information from a single CT0 Box item.

The request does not require any body.

The structure of the returned object is the same of the index of CT0 Box items.

```bash
curl https://api.cardtrader.com/api/v2/ct0_box_items/1234567 \
  -H "Authorization: Bearer [YOUR_AUTH_TOKEN]"
```

---

## Errors
There are some standard error response that you can encounter when using CardTrader API

### Error 401 Unauthorized
If the authentication is incorrect, for example because the Bearer Token is absent or incorrect, API responds with a 401 Unauthorized error.

**Response Example:**
```json
{
  "error_code": "unauthorized",
  "errors": [],
  "extra": {
    "message": "You are not authorized to access this page"
  },
  "request_id": "a30bd6bd-1acc-4c0b-849e-e0622b9578ef"
}
```

---

### Error 404 Not Found
If a resource is not present, API responds with a 404 Not Found error.

**Response Example:**
```json
{
  "error_code": "not_found",
  "errors": [],
  "extra": {
    "message": "Data is not ready for blueprints_cat_200"
  },
  "request_id": "44d54918-9dd4-412f-8a5b-5dde6ea30fc9"
}
```

---

### Error 422 Unprocessable Entity
If a mandatory parameter is not present, API responds with a 422 Unprocessable Entity error.

**Response Example:**
```json
{
  "error_code": "missing_parameter",
  "errors": [],
  "extra": {
    "message": "Missing required parameter(s) game_id"
  },
  "request_id": "2835d714-be5d-4fc2-866c-7d49ed68e7ff"
}
```

---

## Webhooks
If your app is enabled to receive https calls, and you have entered an endpoint, Full API will notify your endpoint whenever an Order is created, modified or deleted.

For example, the endpoint is called:
- When another user orders from you
- When setting the order from the graphic interface as shipped or changing its status
- When another user marks your order as received

**Webhook Payload:**
- `id` (integer): A unique UUID for each call to your endpoint
- `time` (integer): Request time as an integer number of seconds since the Epoch
- `cause` (string): The cause of the endpoint call. It may be the creation, updating or removal of an Order
- `object_class` (string): The object that was created, updated or removed
- `object_id` (integer): The id of the object
- `mode` (string): If the webhook is in production (live) or is in a test
- `data` (json): The webhook payload. In the case of create or update, it is the object itself. In the case of destroy, it is empty.

**Content-Type: application/json**
```json
{
  "id": "c352e8d0-472c-4d02-9c34-915eda5c45b8",
  "time": 1632240962,
  "cause": "order.update",
  "object_class": "Order",
  "object_id": 733733,
  "mode": "live",
  "data": {}
}
```

**DataPayload:**
- When the webhook is of type `order.create` or `order.update`, DataPayload is the object of type Order that has been created or modified.
- When the webhook is of type `order.destroy`, DataPayload is empty.

### Check the Webhook Signature
It is possible to verify that the received webhook really comes from CardTrader Full API.

Each original request coming from the Full API is signed by a Signature header, which is the base64 representation of the HMAC digest via sha256 of the request body, signed with the app's shared_secret.