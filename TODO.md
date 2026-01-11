# Refactoring server.js to use db.js

## Steps to Complete:
- [x] Update imports to include writeMenuData from db.js
- [x] Remove file-based constants (DATA_PATH) and functions (readData, writeData)
- [x] Remove initial fs code for creating data folder
- [x] Make route handlers async where necessary
- [x] Replace readData() calls with await getMenuData()
- [x] Replace writeData(data) calls with await writeMenuData(data)
- [x] Verify all changes and ensure consistency
