# Header Configuration ("header")

- **Logo** ("logo")
  - Specifies the logo image used in the header.
- **Text** ('text')
  - Defines the text displayed in the header.
- **Background Color** ('backgroundColor')
  - Defines the background color for the header.

# Footer Components ("footer")

Each component ("components") in the footer is defined by the following fields:

- **Title** ("title")
  - The title or heading of the component.
- **Href** ("href")
  - The hyperlink reference associated with the component.
- **Text** ("text")
  - The descriptive text.

These fields are used to create various components within the footer, such as 'Terms of Service', 'Privacy Policy', and 'Acknowledgement of Country'.

# Object Page Configuration ("object")

## Default ("default")

Defines the default view for object page

## Options ("options")

This section defines the different types of views (`new` and `old`) for the object page and their specific properties.

### 'new' View ("new")

- **Icon** ("icon")
  - Specifies the icon image
- **Iframe** ("iframe")
  - Specifies the properties values that are used for display within an iframe in the `new` view type.
- **BlockedField** ("blockedField")
  - Specifies the properties that are to be excluded from display in the `new` view type.
- **MainSection** ("mainSection")
  - Highlights the properties that are displayed in the main section of the `new` view type, typically consisting of long texts.

# View Configuration ('view')

## Default View ('default')

Specifies the default view type in main page

## Options ("options")

Defines different view types on seach page and their specific properties.

### List View ("list")

- **Default** ("default"): Defines the default view type in List view
- **Options** ("options"): Defines different layouts within the list view.

#### Tile View under "list"

- **Name** ("name")
  - Specifies the name of the view type.
- **Icon** ("icon")
  - The image file used as an icon for this view type.
- **Title** ("title")
  - The title of the view type.
- **Properties** ("properties")

  - Lists the properties that are shown in each tile of the Tile View.

- **Color** ("color")
  - **Field** ("field")
    - Indicates the property used for color mapping in the Tile View.
  - **Map** ("map")
    - Defines the background color mapping rule for each tile, based on specific criteria or categories.

#### Table View under "list"

- **PageSize** ("pageSize")
  - Specifies the maximum number of entities displayed on each page in the table.
- **Properties** ("properties")
  - Provides a detailed configuration for each property displayed in the table. Each property configuration includes:
    - **Name** ("name"): The properties names of the entity to be displayed in the table.
    - **Display** ("display"): The label used for display in the table header.
    - **Width** ("width"): Defines the default width of the column for this property in the table.
    - **Visible** ("visible"): Indicates whether this property is displayed in the table by default.

### Map View ("map")

- **Default** ("default")

  - Sets the default map view type

- **Options** ("options")

  - Defines the different map view type included.

  #### Cluster Map View under "map"

  - **Name** ("name"): The name of the map view
  - **Icon** ("icon"): The icon used for label of this map view.
  - **Title** ("title"): The title of the map view

- **PopUp** ("popUp")

  - Lists the properties of the object that are used for display in the map pin pop-up, applied to all map type.

- **Color** ("color")
  - Provides color mapping for map pins, applied to all map typw
  - **Field** ("field"): - Indicates the property used for color mapping in the map pin pop up/
  - **Map** ("map"): Defines the background color mapping rule for each map pin.

### Icons Configuration ("icons")

- **Field** ("field"): Indicates the property used for icon mapping.
- **Map** ("map"): Defined the icon mapping rule.

### CSV Configuration ("csv")

- **Exclude** ("exclude")
  - This section defines the properties of the object that are to be excluded from the CSV download.

# Elasticsearch Configuration ("elastic")

## Aggregations ("aggregations")

- **sortBy** ("sortBy")
  - This parameter defines how the aggregation results are sorted.
  - By default is sorts by frequenct.
  - When `sortBy` is set to `"name"`, the aggregation results are sorted alphabetically by the name of the field.
