const fs = require('fs');
const path = require('path');

// Define paths directly
const postsDir = "C:/Users/User/Documents/hugo/portfolio/content/portfolio";
const attachmentsDir = "G:/My Drive/Notes/attachments";
const staticImagesDir = "C:/Users/User/Documents/hugo/portfolio/static/images";

console.log("Directories:");
console.log("Posts:", postsDir);
console.log("Attachments:", attachmentsDir);
console.log("Static Images:", staticImagesDir);

// Ensure the static images directory exists
if (!fs.existsSync(staticImagesDir)) {
    fs.mkdirSync(staticImagesDir, { recursive: true });
    console.log(`Created missing directory: ${staticImagesDir}`);
}

// Process files in the posts directory
fs.readdir(postsDir, (err, files) => {
    if (err) {
        console.error("Error reading posts directory:", err);
        return;
    }

    files.forEach((filename) => {
        if (!filename.endsWith(".md")) {
            console.log(`Skipping non-Markdown file: ${filename}`);
            return;
        }

        const filepath = path.join(postsDir, filename);

        // Read the content of the Markdown file
        fs.readFile(filepath, "utf-8", (err, content) => {
            if (err) {
                console.error(`Error reading file: ${filepath}`, err);
                return;
            }

            // Match image links in the format [[Image.png]]
            const imageMatches = content.match(/\[\[([^\]]+\.(png|jpg|jpeg|gif|svg))\]\]/gi);

            if (!imageMatches) {
                console.log(`No images found in: ${filepath}`);
                return;
            }

            imageMatches.forEach((match) => {
                const imageName = match.replace(/\[\[|\]\]/g, ""); // Extract the image name
                const figureShortcode = `{{< figure src="/images/${encodeURIComponent(imageName)}" title="${imageName}" >}}`;

                content = content.replace(match, figureShortcode); // Update Markdown content

                const imageSource = path.join(attachmentsDir, imageName);
                const imageDest = path.join(staticImagesDir, imageName);

                // Check if the image source exists before attempting to copy
                if (!fs.existsSync(imageSource)) {
                    console.warn(`Image not found: ${imageSource}`);
                    return;
                }

                // Copy image if it doesn't already exist in the destination
                if (!fs.existsSync(imageDest)) {
                    fs.copyFile(imageSource, imageDest, (err) => {
                        if (err) {
                            console.error(`Error copying file: ${imageSource} to ${imageDest}`, err);
                        } else {
                            console.log(`Copied: ${imageName}`);
                        }
                    });
                } else {
                    console.log(`Image already exists, skipping copy: ${imageName}`);
                }
            });

            // Write updated content back to the Markdown file
            fs.writeFile(filepath, content, "utf-8", (err) => {
                if (err) {
                    console.error(`Error writing file: ${filepath}`, err);
                } else {
                    console.log(`Updated file: ${filepath}`);
                }
            });
        });
    });
});

console.log("Markdown files processed and images copied successfully.");
