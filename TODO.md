# Restructuring for Vercel Deployment

## Information Gathered
- Backend logic is in `backend/server.js` with multiple endpoints: GET /api/menu, POST /api/items, DELETE /api/items/:sectionId/:categoryId/:itemId, PATCH /api/items/:sectionId/:categoryId/:itemId/toggle, POST /api/sections, PUT /api/sections/:sectionId, DELETE /api/sections/:sectionId, POST /api/sections/:sectionId/categories, DELETE /api/sections/:sectionId/categories/:categoryId, POST /api/upload, POST /api/admin/login.
- Client API calls are in `src/api/client.js` using hardcoded 'http://localhost:4001'.
- Static images are stored in `backend/public/images/`.
- Menu data is in `backend/data/menu.json`.
- Root `public/` already has some images (bg images).
- Backend dependencies: cors, express, multer.

## Plan
- Create `api/` directory in root for serverless functions.
- Convert each endpoint to separate serverless function files in `api/`.
- Move menu data to `data/menu.json` in root.
- Move static images from `backend/public/images/` to `public/images/`, merging with existing.
- Update root `package.json` to include backend dependencies.
- Update `src/api/client.js` to use relative paths.
- Remove `backend/` folder after migration.

## Dependent Files to be edited
- New files: `api/menu.js`, `api/items.js`, `api/sections.js`, `api/categories.js`, `api/upload.js`, `api/admin.js`, `data/menu.json`.
- Existing: `package.json`, `src/api/client.js`.
- Remove: `backend/` folder.

## Followup steps
- Test the restructured app locally.
- Deploy to Vercel and verify functionality.
- Check file upload limits on Vercel (may need alternative for large uploads).
- Ensure CORS and other middleware work in serverless context.
