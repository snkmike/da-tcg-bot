# Overview
Lorcast provides a REST-like API for ingesting our card data programatically. The API exposes information available on the regular site in easy-to-consume formats.

## Endpoint Details
The API is available at:

https://api.lorcast.com
The API (and site) are served over HTTPS. Requests made over regular HTTP will receive a 301 HTTP status code redirecting them to the HTTPS scheme.

The minimum TLS version is 1.2.

## Current Version
The current API version is v0. This is considered a Beta API. It is missing some features, but future versions of it will be backward compatible. It is safe to use for production code.

The full root URL for this version is:

https://api.lorcast.com/v0
Please note that this API is currently beta, and is subject to breaking changes until it reaches a stable release. Please join the Discord if you want heads up on breaking changes.

# Rate Limits
We kindly ask that you insert 50–100 milliseconds of delay between the requests you send to the server at api.lorcast.com. For example, 10 requests per second on average.

Submitting excessive requests to the server may result in a HTTP 429 Too Many Requests status code. Continuing to overload the API after this point may result in a temporary or permanent ban of your IP address.

The file origins used by the API, located at *.lorcast.io do not have these rate limits.

We encourage you to cache the data you download from Lorcast or process it locally in your own database, at least for 24 hours.

While we make incremental updates to card data daily, take note that:

We only update prices for cards once per day. Fetching card data more frequently than 24 hours will not yield new prices.
Updates to gameplay data (such as card names, text, costs, etc) are much less frequent. If you only need gameplay information, downloading card data once per week or right after set releases would most likely be sufficient.
Communication.
If you have questions or feature requests, please join the Discord. Breaking changes will also be announced on The Changelog and Discord.

# Images
Card images are served through the Lorcast CDN. The CDN has no API rate limits and is hosted on a different domain:

*.lorcast.io
For example, the card images are found at: https://cards.lorcast.io. However, you should not assume that the URL structure or domain will stay the same forever. Instead, use the card URIs returned from the API to locate the card image.

The URIs each have a query parameter at the end that represent the timestamp the image was last updated. Images should update infrequently, most commonly once the full set has been spoiled and high definition images are acquired. If you are storing images locally, you can compare the query parameter or the entire URI.

The Card object has a key image_uris which will contain the URIs for the images. Lorcast has several different sizes and formats for each card.

Image	Size	Format	Description
full	1468x2048	JPG	The full size image of the card.
large	674x940	AVIF	A large version of the card, suitable for primary usage in apps.
normal	488x681	AVIF	A normal sized image of the card.
small	146x204	AVIF	A small image, suitable for thumbnails.
"image_uris": {
  "digital": {
    "small": "https://cards.lorcast.io/card/digital/small/crd_d9f3b86af85f48579ed9d0d7ce0de129.avif?1709690747",
    "normal": "https://cards.lorcast.io/card/digital/normal/crd_d9f3b86af85f48579ed9d0d7ce0de129.avif?1709690747",
    "large": "https://cards.lorcast.io/card/digital/large/crd_d9f3b86af85f48579ed9d0d7ce0de129.avif?1709690747"
  }
}

# Set API
This part of the API focuses on providing robust and detailed information about each card set in the Lorcana Trading Card Game. Through the /sets endpoint, users can access comprehensive lists of all card sets, including standard and promotional releases, each uniquely identified and rich with data like release dates and set codes.

For more targeted queries, the /sets/:code and /sets/:id endpoints allow retrieval of specific set details by either their code or unique identifier.

Whether integrating Lorcana data into third-party applications or creating tools for managing card collections, these endpoints serve as critical resources for developers and users alike, ensuring access to current and accurate set information.

Set Model
The Set model represents a collection of Lorcana cards grouped under a specific theme or release. Each set is uniquely identified by an id and has distinct attributes.

Properties
id (string): A unique identifier for the set, such as set_7ecb0e0c71af496a9e0110e23824e0a5.
name (string): The official name of the set, e.g., "The First Chapter".
code (string): A short, unique code that represents the set, such as "1".
released_at (datetime): The official release date of the set in UTC format, marking when the cards become available for public purchase.
prereleased_at (datetime): The date when the set was available for limited early release, often used for promotional events or early access games.
GET /sets
The /sets endpoint provides a comprehensive list of all card sets available in the Lorcana Trading Card Game, including both standard and promotional sets. By accessing this endpoint, developers and users can retrieve detailed information about each set, which is crucial for tracking game expansions and managing collections.

Endpoint:
GET https://api.lorcast.com/v0/sets
This API always return an object that contains a results key. Within this key is the set data. In the future, additional keys will provide more information on the results.

Currently, the /sets endpoint does not support pagination, which may affect performance when handling large amounts of data. Considering the low number of sets, this is not currently a problem. However, pagination is planned for future updates to enhance usability and efficiency.

Example Request
curl https://api.lorcast.com/v0/sets
{
  "results": [
    {
      "id": "set_7ecb0e0c71af496a9e0110e23824e0a5",
      "name": "The First Chapter",
      "code": "1",
      "released_at": "2023-08-18",
      "prereleased_at": "2023-08-18"
    },
    {
      "id": "set_142d2dfb5d4b4b739a1017dc4bb0fcd2",
      "name": "Rise of the Floodborn",
      "code": "2",
      "released_at": "2023-11-17",
      "prereleased_at": "2023-11-17"
    },
    {
      "id": "set_934a6eeaf96149caaa349b08dbeb0545",
      "name": "Disney 100",
      "code": "D100",
      "released_at": "2023-12-01",
      "prereleased_at": "2023-12-01"
    }
  ]
}
GET /sets/:id
This endpoint allows you to retrieve detailed information about a specific Lorcana card set by using either the set's code or its unique identifier (ID). This flexibility enables developers and users to access set data conveniently based on the available information.

Set Code: GET https://api.lorcast.com/v0/sets/:code
Use a set code, such as 1 or D100, to fetch information about a specific set.

Set ID: GET https://api.lorcast.com/v0/sets/:id
Use a set ID, which always begins with set_ followed by a uuid (e.g., set_7ecb0e0c71af496a9e0110e23824e0a5). Set IDs can be retrieved from the /sets endpoint and provide a unique way to reference each set.

Example Request
curl https://api.lorcast.com/v0/sets/1
{
  "id": "set_7ecb0e0c71af496a9e0110e23824e0a5",
  "name": "The First Chapter",
  "code": "1",
  "released_at": "2023-08-18T00:00:00.000Z",
  "prereleased_at": "2023-08-18T00:00:00.000Z"
}
GET /sets/:id/cards
This endpoint returns all of the cards in a given set, by id or code. Look at the card docs model for card details.

curl https://api.lorcast.com/v0/sets/1/cards
[
    {
    "id": "crd_d9f3b86af85f48579ed9d0d7ce0de129",
    "name": "Ariel",
    "version": "On Human Legs",
    "layout": "normal",
    "released_at": "2023-08-18",
    "image_uris": {
      "digital": {
        "small": "https://cards.lorcast.io/card/digital/small/crd_d9f3b86af85f48579ed9d0d7ce0de129.avif?1709690747",
        "normal": "https://cards.lorcast.io/card/digital/normal/crd_d9f3b86af85f48579ed9d0d7ce0de129.avif?1709690747",
        "large": "https://cards.lorcast.io/card/digital/large/crd_d9f3b86af85f48579ed9d0d7ce0de129.avif?1709690747"
      }
    },
    "cost": 4,
    "inkwell": true,
    "ink": "Amber",
    "type": [
      "Character"
    ],
    "classifications": [
      "Storyborn",
      "Hero",
      "Princess"
    ],
    "text": "VOICELESS This character can't {E} to sing songs.",
    "keywords": [],
    "move_cost": null,
    "strength": 3,
    "willpower": 4,
    "lore": 2,
    "rarity": "Uncommon",
    "illustrators": [
      "Matthew Robert Davies"
    ],
    "collector_number": "1",
    "lang": "en",
    "flavor_text": "“...”",
    "tcgplayer_id": 494102,
    "legalities": {
      "core": "legal"
    },
    "set": {
      "id": "set_7ecb0e0c71af496a9e0110e23824e0a5",
      "code": "1",
      "name": "The First Chapter"
    },
    "prices": {
      "usd": "0.06"
    }
  },
  //... the rest of the cards
]

# Cards
This section of the API documentation is dedicated to managing and accessing data related to individual cards within the Lorcana Trading Card Game. Featuring a couple of powerful endpoints, it enables developers and users to engage deeply with card-specific information.

Card Model
id (string): A unique identifier for the card. This ID is used to reference the card within the API.
name (string): The name of the card.
version (string): A variant of the card, indicating a specific version or edition, if applicable.
layout (string): Describes the card's layout. Currently either landscape (for Locations) or normal.
released_at (string): The release date of the card in YYYY-MM-DD format.
image_uris (object): Contains URLs to various sizes of the card's digital images. Each size (small, normal, large) is provided in AVIF format.
digital (object):
small (string): URL for a small-sized image of the card.
normal (string): URL for a normal-sized image of the card.
large (string): URL for a large-sized image of the card.
cost (integer): The ink cost required to play the card.
inkwell (boolean): Indicates whether the card can be inked.
ink (string): Specifies the color of Ink for the card. If the card has no ink it will be null. Values will be one of:
Amber
Amethyst
Emerald
Ruby
Sapphire
Steel
type (string array): Lists the types assigned to the card (e.g., ["Action", "Song"]).
classifications (string array | null): A list of classifications for Characters (e.g., ["Floodborn", "Hero", "Queen", "Sorcerer"]).
text (string): Describes the card's abilities or rules text, formatted as plain text. This includes reminder text.
move_cost (integer | null): The cost required to move a Character to a Location, if applicable.
strength (integer | null): The strength attribute of the card.
willpower (integer | null): The willpower attribute of the card.
lore (integer | null): The lore attribute of the card, indicating its knowledge or wisdom.
rarity (string): The rarity level of the card (e.g., "Enchanted").
Common
Uncommon
Rare
Super_rare
Legendary
Enchanted
Promo
illustrators (array of string): Names of the illustrators who created artwork for the card.
collector_number (string): The card's number within its set. This value may not be an integer value.
lang (string): The language code for the card (e.g., "en" for English).
flavor_text (string | null): A narrative text providing background about the card, can be null if not applicable.
tcgplayer_id (integer): An identifier used by TCGPlayer for linking to their platform.
legalities (object): Contains information about the legality of the card in different game formats. The valid strings are legal, not_legal, and banned.
core (string): Legal status in the core format (e.g., "legal").
set (object): Information about the set to which the card belongs.
id (string): Unique identifier for the set.
code (string): A short code representing the set.
name (string): The full name of the set.
prices (object): Contains pricing information for the card in different conditions.
usd (string | null): The price in USD for the normal version of the card.
usd_foil (string | null): The price in USD for a foil version of the card.
GET /cards/search
The /cards/search endpoint allows users to perform full-text searches on the card database using a query string that supports the full-text search syntax the main site uses. This endpoint is designed to facilitate complex queries to locate specific cards based on various attributes and conditions.

This endpoint is not currently paginated, but in the future it will be.

Query Parameters
q (string): The query string used for searching the card database. This parameter supports a robust full-text search syntax allowing users to specify conditions and attributes. Ensure that it is URL encoded.
Endpoint:
GET https://api.lorcast.com/v0/cards/search
Example Request
curl https://api.lorcast.com/v0/cards/search?q=elsa+set:1+rarity:enchanted
{
  "results": [
    {
      "id": "crd_cbc18e77d7ec4d50bf19650a9a559686",
      "name": "Elsa",
      "version": "Spirit of Winter",
      "layout": "normal",
      "released_at": "2023-08-18",
      "image_uris": {
        "digital": {
          "small": "https://cards.lorcast.io/card/digital/small/crd_cbc18e77d7ec4d50bf19650a9a559686.avif?1709690747",
          "normal": "https://cards.lorcast.io/card/digital/normal/crd_cbc18e77d7ec4d50bf19650a9a559686.avif?1709690747",
          "large": "https://cards.lorcast.io/card/digital/large/crd_cbc18e77d7ec4d50bf19650a9a559686.avif?1709690747"
        }
      },
      "cost": 8,
      "inkwell": false,
      "ink": "Amethyst",
      "type": ["Character"],
      "classifications": ["Floodborn", "Hero", "Queen", "Sorcerer"],
      "text": "Shift 6 (You may pay 6 {I} to play this on top of one of your characters named Elsa.)\nDEEP FREEZE When you play this character, exert up to 2 chosen characters. They can't ready at the start of their next turn.",
      "move_cost": null,
      "strength": 4,
      "willpower": 6,
      "lore": 3,
      "rarity": "Enchanted",
      "illustrators": ["Matthew Robert Davies"],
      "collector_number": "207",
      "lang": "en",
      "flavor_text": null,
      "tcgplayer_id": 510153,
      "legalities": {
        "core": "legal"
      },
      "set": {
        "id": "set_7ecb0e0c71af496a9e0110e23824e0a5",
        "code": "1",
        "name": "The First Chapter"
      },
      "prices": {
        "usd": null,
        "usd_foil": 1267.58
      }
    }
  ]
}
GET /cards/:set/:number
The /cards/:set/:number endpoint provides a method to retrieve a single card by specifying its set identifier and collector number. This endpoint is designed for precise lookups where the user knows the exact set and number of the card they wish to query.

Path Parameters
set (string): The identifier for the set to which the card belongs. This should match the set's unique code or ID.
number (string): The collector number of the card within its set. This number identifies the card's position or sequence in the set.
Endpoint:
GET https://api.lorcast.com/v0/cards/:set/:number
Example Request
curl https://api.lorcast.com/v0/cards/1/207
A successful request returns a single Card object. If no card matches the given set and number, a 404 error is returned.

{
  "id": "crd_cbc18e77d7ec4d50bf19650a9a559686",
  "name": "Elsa",
  "version": "Spirit of Winter",
  "layout": "normal",
  "released_at": "2023-08-18",
  "image_uris": {
    "digital": {
      "small": "https://cards.lorcast.io/card/digital/small/crd_cbc18e77d7ec4d50bf19650a9a559686.avif?1709690747",
      "normal": "https://cards.lorcast.io/card/digital/normal/crd_cbc18e77d7ec4d50bf19650a9a559686.avif?1709690747",
      "large": "https://cards.lorcast.io/card/digital/large/crd_cbc18e77d7ec4d50bf19650a9a559686.avif?1709690747"
    }
  },
  "cost": 8,
  "inkwell": false,
  "ink": "Amethyst",
  "type": ["Character"],
  "classifications": ["Floodborn", "Hero", "Queen", "Sorcerer"],
  "text": "Shift 6 (You may pay 6 {I} to play this on top of one of your characters named Elsa.)\nDEEP FREEZE When you play this character, exert up to 2 chosen characters. They can't ready at the start of their next turn.",
  "move_cost": null,
  "strength": 4,
  "willpower": 6,
  "lore": 3,
  "rarity": "Enchanted",
  "illustrators": ["Matthew Robert Davies"],
  "collector_number": "207",
  "lang": "en",
  "flavor_text": null,
  "tcgplayer_id": 510153,
  "legalities": {
    "core": "legal"
  },
  "set": {
    "id": "set_7ecb0e0c71af496a9e0110e23824e0a5",
    "code": "1",
    "name": "The First Chapter"
  },
  "prices": {
    "usd": null,
    "usd_foil": 1267.58
  }
}