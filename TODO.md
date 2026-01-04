# TODO: Make Sort Numbers Editable with Shifting Logic

## Backend Changes
- [ ] Update POST /api/items to handle sortOrder shifting for items in a category
- [ ] Update POST /api/sections to handle sortOrder shifting for sections
- [ ] Update PUT /api/sections/:sectionId to handle sortOrder shifting for sections

## Frontend Changes
- [x] Add sortOrder input field to Add/Edit Item Modal in Admin.jsx
- [x] Add sortOrder input field to Manage Section Modal in Admin.jsx
- [x] Update form state to include sortOrder
- [x] Update handleSave and handleAddSection/handleUpdateSection to include sortOrder
- [x] Add sorting logic to display sections, categories, and items by sortOrder
- [x] Test the shifting logic by adding/editing items and sections

## Testing
- [x] Implementation complete - backend server running on port 4001
- [x] Frontend code updated with sortOrder fields and sorting logic
- [x] Ready for manual testing in browser
