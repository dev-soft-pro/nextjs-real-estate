# 1. Preferences

| Shortcut     | Implementation                     |
| ------------ | ---------------------------------- |
| {Properties} | preferences.map.properties.enabled |
| {sider}      | ui.sider                           |
| {viewport}   | preferences.map.viewport           |

# 2. Data Fetch

## Hash

- Hash Update
  When somes properites of preference are changed
- Parse Hash
  When Hash is changed.
- Prevent infinite parse/update cycle

## List Properties

### Required:

- Sider opened with the list mode
- {Properties} is on

### Cases:

- 'Request More' by scrolling on the list
  [Load More]
- {filter}, {place} changes
  [Refresh:Reset]
- {sort}, {drawings} changes
  [Refresh:SWAP]
- !({drawings} || {place})
  - {viewport.bounds} changes
    [Refresh:Swap]

## Map Properties

### Required:

- {Properties} is on

### Cases:

- {filter}, {drawings}, {place} changes
  '\_isPropertyMode' ? [Refresh:Properties] : [Refresh:Aggregation]
- !({drawings} || {place})
  - {viewport.bounds} changes
    '\_isPropertyMode' ? [Refresh:Properties] : [Refresh:Aggregation]

## Analytics

- 'Parcel Level' ? [Refresh:Search] : [Refresh:Search]

## Zones

## Elevation

### Required:

- {elevation}

### Cases

- When selecting a parcel

# 3. Update Layers

- Map Style
  {store.preferences.map.mapType}
- Boundary Layer
- Properties Sources/Layers (Properties, Circle Layer)
- Analytics Layer
- Parcel Layer
- Elevation Layer
- Zone Layer

# 4. UI Changes

- Sider Changes
- Viewport Width Changes
  [Reset Padding]
- Hovered Property
