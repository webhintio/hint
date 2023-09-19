const fs = require('fs');

// Read the file content
const filePath = 'dist/release/tasks/get-packages.js';

fs.readFile(filePath, 'utf-8', (err, fileContent) => {
    if (err) {
        throw err;
    }

    // Replace the statement with a new one
    const newContent = fileContent.replace(/const latest_version_1 = require\("latest-version"\);/, /const latest_version_1 = await require\("latest-version"\);/);

    // Write the updated content back to the file
    fs.writeFile(filePath, newContent, 'utf-8', (err) => {
        if (err) {
            throw err;
        }
        console.log('File updated successfully!');
    });
});
