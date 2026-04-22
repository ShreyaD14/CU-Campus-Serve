# Database Schema

CampusServe uses SQLite with `better-sqlite3` and WAL mode enabled for performance.

```mermaid
erDiagram
    USERS ||--o{ ORDERS : places
    USERS ||--o{ SHOPS : owns
    USERS ||--o| DELIVERY_AGENTS : "acts as"
    
    CLUSTERS ||--o{ SHOPS : contains
    
    SHOPS ||--o{ MENU_ITEMS : provides
    SHOPS ||--o{ ORDERS : fulfills
    
    LOCATIONS ||--o{ ORDERS : "delivered to"
    
    ORDERS ||--o{ ORDER_ITEMS : contains
    MENU_ITEMS ||--o{ ORDER_ITEMS : "added as"

    DELIVERY_AGENTS ||--o{ ORDERS : delivers
```

### Core Tables:

- **Users**: Phone-based identity, defines Roles (`user`, `vendor`, `delivery`, `admin`).
- **Clusters**: Logical grouping of shops at physical map points.
- **Shops**: Vendor storefronts mapped to clusters.
- **Menu_Items**: Products available per shop.
- **Locations**: Hostels and Pickup Points with Latitude/Longitude.
- **Orders**: Central transaction table recording `total_amount`, `status`, and `delivery_type`.
- **Order_Items**: Line items connecting menus to a specific order.
- **Delivery_Agents**: Extension table on Users to track `current_latitude` and `is_available`.
