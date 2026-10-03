# API Documentation

Base URL: `http://localhost:5000`

Protected endpoints need this header: `Authorization: Bearer <token>` (the token comes from login or register).

Errors always look like this: `{ "message": "Reason of the error" }` with status 400 (bad input), 401 (not logged in), 403 (wrong role), 404 (not found), 409 (conflict) or 500 (server error).

## Auth (F01)

### POST /api/auth/register — Public
Creates a customer account (the role is always `customer`).

Request:
```json
{ "name": "Ali", "email": "ali@test.com", "phone": "03001112222", "password": "123456" }
```
Response 201:
```json
{ "token": "eyJhbGciOi...", "user": { "id": "6abe...", "name": "Ali", "email": "ali@test.com", "phone": "03001112222", "role": "customer" } }
```

### POST /api/auth/login — Public
Request:
```json
{ "email": "seller@test.com", "password": "Test@1234" }
```
Response 200: same shape as register.

### GET /api/auth/me — Logged in
Response 200:
```json
{ "user": { "id": "6abe...", "name": "Store Owner", "email": "seller@test.com", "phone": "03001234567", "role": "seller" } }
```

## Store settings (F02)

### GET /api/settings — Public
Response 200:
```json
{
  "_id": "6abe...",
  "storeName": "DukaanDost Store",
  "city": "Faisalabad",
  "whatsappNumber": "03001234567",
  "deliveryPolicy": "Delivery in 2-3 days in Faisalabad...",
  "faqs": [ { "question": "Do you offer Cash on Delivery?", "answer": "Yes..." } ]
}
```

### PUT /api/settings — Seller
Needs storeName, city, whatsappNumber, deliveryPolicy and at least 3 FAQs.

Request:
```json
{
  "storeName": "DukaanDost Store", "city": "Faisalabad", "whatsappNumber": "03001234567",
  "deliveryPolicy": "Delivery in 2-3 days.",
  "faqs": [ { "question": "Q1?", "answer": "A1" }, { "question": "Q2?", "answer": "A2" }, { "question": "Q3?", "answer": "A3" } ]
}
```
Response 200: the saved settings (same shape as GET).

## Products (F02, F03)

### GET /api/products?category= — Public
`category` is optional (for example `?category=Food`).

Response 200:
```json
[ { "_id": "6abe...", "title": "Red Cotton Kurta", "description": "Plain red cotton kurta...", "price": 2500, "stock": 12, "category": "Clothes", "images": ["https://..."], "averageRating": 0, "reviewCount": 0 } ]
```

### GET /api/products/:id — Public
Response 200: one product (same shape). 404 if not found.

### POST /api/products — Seller
Price must be greater than 0, stock cannot be negative, all fields and at least one image are required.

Request:
```json
{ "title": "Test Product", "description": "Testing", "price": 500, "stock": 5, "category": "Clothes", "images": ["https://placehold.co/600"] }
```
Response 201: the created product.

### PUT /api/products/:id — Seller
Request: same as POST. Response 200: the updated product.

### DELETE /api/products/:id — Seller
Response 200:
```json
{ "message": "Product deleted" }
```

## Orders (F03, F04)

### POST /api/orders — Customer
Prices and titles are taken from the database. Stock is reduced. Phone must match `03XXXXXXXXX`.

Request:
```json
{
  "items": [ { "product": "6abe...", "quantity": 2 } ],
  "shippingAddress": { "name": "Ali", "phone": "03001234567", "city": "Faisalabad", "address": "House 1, Street 2" }
}
```
Response 201:
```json
{
  "_id": "6abe...", "orderNumber": "DD-1759...-123", "customer": "6abe...",
  "items": [ { "product": "6abe...", "title": "Red Cotton Kurta", "price": 2500, "quantity": 2 } ],
  "totalAmount": 5000, "paymentMethod": "Cash on Delivery",
  "shippingAddress": { "name": "Ali", "phone": "03001234567", "city": "Faisalabad", "address": "House 1, Street 2" },
  "status": "Pending"
}
```
Errors: 400 for an empty cart, invalid phone, or not enough stock.

### GET /api/orders/my — Customer
Response 200: an array of the customer's own orders (same shape as above), newest first.

### GET /api/orders — Seller
Response 200: an array of all orders. `customer` contains `name`, `email` and `phone`.

### PATCH /api/orders/:id/status — Seller
Allowed changes: Pending to Confirmed, Confirmed to Delivered, Pending to Cancelled (stock is returned). Any other change returns 400.

Request:
```json
{ "status": "Confirmed" }
```
Response 200: the updated order. Example error: `{ "message": "Cannot change status from Delivered to Pending" }`.

### PATCH /api/orders/:id/cancel — Customer (owner)
Only the owner can cancel, and only while the order is Pending. Stock is returned. No request body.

Response 200: the order with `"status": "Cancelled"`. Error 400: `{ "message": "Only pending orders can be cancelled" }`.

## AI assistant (F05)

### POST /api/chat — Public
Sends the new message and the last 10 messages of the conversation.

Request:
```json
{ "message": "koi red kurta hai 3000 se kam?", "history": [ { "role": "assistant", "content": "Assalam o Alaikum!" } ] }
```
Response 200:
```json
{ "reply": "Ji haan, Red Cotton Kurta available hai, price Rs 2500..." }
```
If the LLM fails: status 503 with `{ "message": "Sorry, the assistant is not available right now..." }`.

## Reviews (F06)

### POST /api/reviews — Customer
Only a customer with a Delivered order of the product can review it, once per product. The review text is sent to the Hugging Face sentiment model.

Request:
```json
{ "product": "6abe...", "rating": 5, "text": "yeh lawn suit bohot acha hai" }
```
Response 201:
```json
{ "_id": "6abe...", "product": "6abe...", "customer": "6abe...", "rating": 5, "text": "yeh lawn suit bohot acha hai", "sentiment": "positive" }
```
Errors: 400 (invalid rating or empty text), 403 (no delivered order), 409 (already reviewed).

### GET /api/products/:id/reviews — Public
Response 200:
```json
[ { "_id": "6abe...", "rating": 5, "text": "yeh lawn suit bohot acha hai", "sentiment": "positive", "customer": { "name": "Test Customer" }, "createdAt": "2026-10-03T10:00:00.000Z" } ]
```

### GET /api/reviews/eligibility/:productId — Customer (extra)
Tells the frontend whether to show the review form.

Response 200:
```json
{ "eligible": false, "reason": "not_delivered" }
```
`reason` is `null`, `not_delivered` or `already_reviewed`.

### GET /api/reviews — Seller (extra)
Response 200:
```json
{ "counts": { "positive": 1, "neutral": 0, "negative": 2 }, "reviews": [ { "_id": "6abe...", "product": { "title": "Red Cotton Kurta" }, "customer": { "name": "Test Customer" }, "rating": 1, "text": "...", "sentiment": "negative" } ] }
```
