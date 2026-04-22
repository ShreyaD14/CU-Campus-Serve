# CampusServe API Documentation

Base URL: `http://localhost:3001/api`

## Authentication (`/auth`)

### `POST /auth/send-otp`
Sends an OTP to the given phone number.
- **Body**: `{ "phone": "9000000000" }`
- **Response**: `{ "success": true, "dev_otp": "123456" }`

### `POST /auth/verify-otp`
Verifies OTP and returns JWT.
- **Body**: `{ "phone": "...", "otp": "...", "name": "...", "uid": "..." }`
- **Response**: `{ "success": true, "token": "JWT...", "user": { ... } }`

---

## Shops & Menus (`/shops`)

### `GET /shops`
List all shops. Supports querying by `cluster_id` and `search`.

### `GET /shops/clusters`
List all food clusters.

### `GET /shops/:id/menu`
Get the menu for a specific shop.

---

## Orders (`/orders`)

*Requires Bearer Token*

### `POST /orders`
Place a new order.
- **Body**: `{ "shop_id": 1, "items": [{ "menu_item_id": 1, "quantity": 2 }], "delivery_location_id": 1, "delivery_type": "hostel" }`

### `GET /orders`
Customer: gets order history.

### `GET /orders/:id`
Get full details of a specific order including items and delivery agent info.

### `PUT /orders/:id/status`
Vendor/Admin: Update order status (`preparing`, `out_for_delivery`, `delivered`, etc.)

---

## Delivery (`/delivery`)

*Requires Bearer Token*

### `GET /delivery/active`
Delivery Agent: Get assigned orders that are currently active.

### `PUT /delivery/location`
Delivery Agent: Update current physical location.
- **Body**: `{ "latitude": 30.77, "longitude": 76.57 }`

### `PUT /delivery/assign/:orderId`
Vendor/Admin: Assign an order to a delivery agent.
