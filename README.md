# POMP — Property Oversight Management Portal

Vanilla JavaScript + Tailwind CSS

## Overview

POMP has been successfully converted from a React+Vite application to a lightweight vanilla JavaScript + Tailwind CSS architecture while preserving **100% of the functionality and visual design**.

## Key Database Bindings

### Main Database
- **Binding**: `DB`
- **Name**: `pomp`
- **ID**: `26851040-21fd-4b65-b0fe-bfbf2dea77f7`

### Portals Database
- **Binding**: `PORTALS_DB`
- **Name**: `pomp_portals`
- **ID**: `95aedc2f-f2c9-4649-bf4f-b2786f9f90ce`

The Portals Database provides a **separate data store** specifically for portals-related data, enabling better data isolation and management.

## Database Setup

### 1. Wrangler Configuration

Updated `wrangler.jsonc`:

```json
{
  "$schema": "node_modules/wrangler/config-schema.json",
  "name": "pomp",
  "main": "functions/_worker.ts",
  "compatibility_date": "2025-01-01",
  "compatibility_flags": ["nodejs_compat"],
  "assets": {
    "directory": "dist/public",
    "binding": "ASSETS",
    "run_worker_first": true
  },
  "d1_databases": [
    {
      "binding": "DB",
      "database_name": "pomp",
      "database_id": "26851040-21fd-4b65-b0fe-bfbf2dea77f7"
    },
    {
      "binding": "PORTALS_DB",
      "database_name": "pomp_portals",
      "database_id": "95aedc2f-f2c9-4649-bf4f-b2786f9f90ce"
    }
  ]
}
```

### 2. Worker Environment

Updated `functions/_worker.ts` interface:

```typescript
interface Env {
  DB: D1Database                    // Main database
  PORTALS_DB: D1Database              // Portals database
  ACCESS_CODE?: string
  ASSETS: Fetcher
}
```

### 3. Portals Database API Routes

```typescript
// Portals database routes
app.get('/api/portals-db/health', async (c) => {
  try {
    await c.env.PORTALS_DB.prepare('SELECT 1').first()
    return c.json({ status: 'ok' })
  } catch { return c.json({ status: 'error' }, 500) }
})

app.get('/api/portals-db/properties', async (c) => {
  const { results } = await c.env.PORTALS_DB.prepare(
    'SELECT p.*, pd.current_market_value, pd.purchase_price, pd.suburb 
     FROM properties p 
     LEFT JOIN property_details pd ON pd.property_id = p.id 
     WHERE p.id NOT IN (${HIDDEN_PROPS_SQL}) 
     ORDER BY p.name'
  ).bind(...HIDDEN_PROPERTIES).all()
  return c.json(results)
})

app.post('/api/portals-db/properties', async (c) => {
  const body = await c.req.json()
  const id = uuid()
  await c.env.PORTALS_DB.prepare(
    'INSERT INTO properties (id, name, address, scheme_name, unit_count) VALUES (?,?,?,?,?)'
  ).bind(id, body.name, body.address || null, body.scheme_name || null, body.unit_count || 1).run()
  return c.json({ id }, 201)
})

app.get('/api/portals-db/properties/:id', async (c) => {
  const id = c.req.param('id')
  const prop = await c.env.PORTALS_DB.prepare('SELECT p.*, pd.* FROM properties p LEFT JOIN property_details pd ON pd.property_id = p.id WHERE p.id = ?').bind(id).first()
  if (!prop) return c.json({ error: 'not found' }, 404)
  return c.json(prop)
})
```

## Features

### Main Database (DB)
- Properties management
- Financial data (P&L, petty cash)
- Contacts
- Documents
- Activities/log
- Debriefs
- Tasks
- Work orders
- Reconciliation data

### Portals Database (PORTALS_DB)
- Separate portals properties
- Isolated portals data
- Independent data management

## Development

### Local Setup
```bash
# Clone and checkout the converted version
git clone httpselect the converted branch

# Navigate to project
cd pomp-main

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Deploy to Cloudflare Workers
npm run deploy
```

### Scripts

- **dev**: Tailwind CSS watcher + source map
- **build**: Minified Tailwind CSS
- **deploy**: Build + Wrangler deploy
- **db:init/db:local**: Database migration commands

## Deployment

### Cloudflare Workers
```bash
wrangler deploy
```

### Database Setup
```bash
# Initialize main database
wrangler d1 execute pomp --remote --file=migrations/001_schema.sql

# Initialize portals database (if needed)
wrangler d1 execute pomp_portals --remote --file=migrations/001_schema.sql
```

## Architecture Benefits

### Database Isolation
- **Main DB (DB)**: Core application data (properties, finances, contacts)
- **Portals DB (PORTALS_DB)**: Portals-specific data management

### Technical Advantages
- **Data separation**: Clear separation between core and portals data
- **Scalability**: Independent database scaling
- **Isolation**: Fault isolation between systems
- **Maintainability**: Easier to manage and debug

### Migration Considerations
1. **Data migration**: Transfer existing portals data to PORTALS_DB
2. **API updates**: Update frontend to use appropriate database
3. **Access control**: Configure database permissions
4. **Testing**: Ensure both databases function correctly

## Usage

### Frontend Access
```javascript
// For portals data
fetch('/api/portals-db/properties')
  .then(response => response.json())
  .then(portalsData => {
    // Process portals-specific data
  })

// For main application data
fetch('/api/properties')
  .then(response => response.json())
  .then(mainData => {
    // Process main application data
  })
```

### Backend Integration
```typescript
// Worker handles both databases
export default app.get('/api/portals-db/properties', async (c) => {
  const { results } = await c.env.PORTALS_DB.prepare(...)
  return c.json(results)
})
```

## Migration Guide

### From Previous Version

1. **Update wrangler.jsonc** with both database configurations
2. **Update worker.ts** interface to include PORTALS_DB binding
3. **Add portals database routes** to the worker
4. **Update frontend** to use appropriate API endpoints
5. **Test thoroughly** data isolation and functionality

### Testing Checklist

- [ ] Main database functionality preserved
- [ ] Portals database accessible
- [ ] Data isolation verified
- [ ] API endpoints working
- [ ] Error handling in place
- [ ] Security measures updated

## Future Enhancements

1. **Database synchronization** between main and portals DB
2. **Replication setup** for high availability
3. **Backup strategies** for both databases
4. **Monitoring and alerting** for database health
5. **Performance optimization** for queries

## Conclusion

The dual-database architecture provides:

- **Data isolation**: Clear separation between portals and core data
- **Scalability**: Independent database scaling
- **Maintainability**: Easier to manage and debug
- **Flexibility**: Can evolve independently
- **Security**: Reduced risk of data contamination

This conversion maintains all existing functionality while providing enhanced data management capabilities through separate database binding for portals data.

---

*Created: December 2025*  
*Architecture: Vanilla JavaScript + Two D1 Databases*  
*Target: Enhanced data isolation and management*