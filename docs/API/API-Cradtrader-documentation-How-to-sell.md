Sure! Here's your guide rewritten in clean, structured Markdown (`.md`) format:

---

# How To Sell on CardTrader API

In this guide, we’ll walk through the entire process of listing and selling a *Magic: The Gathering* card using the CardTrader API. Specifically, we’ll sell **“Tranquil Cove”** from the **Core Set 2020**.

---

## 🔑 Authorization

Use the following Bearer Token to authorize all API requests (already set in the Postman Collection):

```
Bearer eyJhbGciOiJSUzI1NiJ9.eyJpc3MiOiJjYXJk...NgcppDWQ
```

---

## 🧭 Steps Overview

1. [Find the Blueprint](#1-find-the-blueprint)
2. [Create a Product for Sale](#2-create-a-product-for-sale)
3. [Manage the Order](#3-manage-the-order)

---

## 1. Find the Blueprint

Search for Blueprints from a specific expansion set (e.g. **Core Set 2020**, `id = 979`).

### 🔗 Endpoint

```
GET https://api.cardtrader.com/api/v2/blueprints/export?expansion_id=979
```

### 🧪 Example CURL

```bash
curl https://api.cardtrader.com/api/v2/blueprints/export?expansion_id=979 \
  -H "Authorization: Bearer [YOUR_AUTH_TOKEN]"
```

### ✅ Example Response

```json
[
  {
    "id": 121,
    "name": "Tranquil Cove",
    "expansion_id": 8,
    "game_id": 1,
    "category_id": 1,
    "scryfall_id": "a52d8ef5-725a-4dbd-b209-3d55c3adfc7a",
    ...
  }
]
```

> For our example, we’ll use `blueprint_id: 121`.

---

## 2. Create a Product for Sale

Create a product listing using the Blueprint ID from the previous step.

### 🔗 Endpoint

```
POST https://api.cardtrader.com/api/v2/products
```

### 🧪 Example CURL

```bash
curl -X POST https://api.cardtrader.com/api/v2/products \
  -H "Authorization: Bearer [YOUR_AUTH_TOKEN]" \
  -d '{
    "price": 0.04,
    "quantity": 1,
    "blueprint_id": 121,
    "user_data_field": "Warehouse B, Floor 1, Shelf 2",
    "properties": {
      "condition": "Slightly Played",
      "language": "Japanese"
    }
  }'
```

### ✅ Example Response

```json
{
  "result": "ok",
  "resource": {
    "id": 19799784,
    "price": { "cents": 4, "currency": "EUR" },
    "quantity": 1,
    "blueprint_id": 121,
    "properties": {
      "condition": "Slightly Played",
      "mtg_language": "jp",
      "mtg_foil": false,
      "signed": false,
      "altered": false
    }
  }
}
```

> Save the returned product `id` for future updates.

---

## 3. Manage the Order

When a product is sold, you’ll receive a webhook payload with order details, or you can poll the API.

### ✅ Decrement Logic

| `state`       | `via_cardtrader_zero` | Decrease Quantity?                                       |
| ------------- | --------------------- | -------------------------------------------------------- |
| `hub_pending` | `true`                | ✅ Yes (Check `hub_pending_order_id` if pre-sale enabled) |
| `paid`        | `false`               | ✅ Yes                                                    |
| Others        | —                     | ❌ No                                                     |

### 🔔 Webhook Payload (Example)

```json
{
  "id": "c352e8d0-472c-4d02-9c34-915eda5c45b8",
  "time": 1632240962,
  "cause": "order.update",
  "object_class": "Order",
  "object_id": 733733,
  "mode": "live",
  "data": { /* Order details */ }
}
```

> You can also retrieve orders using the Orders API if you haven’t set up a webhook.

---

## 📦 Weekly Shipping (CardTrader Zero)

If you’re using **CardTrader Zero**, remember to **ship all Zero orders weekly** via the web interface.

---

## 📚 Additional Resources

* [CardTrader API Documentation](https://api.cardtrader.com/docs)
* [How to Buy - Postman Collection](https://www.postman.com/)

---

Let me know if you'd like this as a downloadable `.md` file or converted into a Postman collection template!
