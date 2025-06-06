#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');
const prettier = require('prettier');

// Source and destination directories
const sourceDir = '/Users/ianpilon/Desktop/Cardano Developer psycographic role profiles';
const destDir = '/Users/ianpilon/Desktop/cardano-docs/pages/developer-roles';

// Ensure destination directory exists
if (!fs.existsSync(destDir)) {
  fs.mkdirSync(destDir, { recursive: true });
}

// Helper to convert HTML filename to slug format
function toSlug(filename) {
  return filename
    .replace('.html', '')
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/_/g, '-')
    .replace(/[^\w-]/g, '');
}

// Process all HTML files
fs.readdir(sourceDir, (err, files) => {
  if (err) {
    console.error('Error reading directory:', err);
    return;
  }

  files.filter(file => file.endsWith('.html')).forEach(file => {
    const filePath = path.join(sourceDir, file);
    const content = fs.readFileSync(filePath, 'utf8');
    
    // Parse HTML using JSDOM
    const dom = new JSDOM(content);
    const document = dom.window.document;
    
    // Skip script tag that appears at the beginning of the HTML file
    const body = document.querySelector('body');
    if (!body) {
      console.error(`No body found in ${file}`);
      return;
    }

    // Start building MDX content
    let mdxContent = '';
    
    // Process each element in body
    Array.from(body.children).forEach(element => {
      if (['H1', 'H2', 'H3', 'H4', 'H5', 'H6'].includes(element.tagName)) {
        const level = parseInt(element.tagName.charAt(1));
        mdxContent += '#'.repeat(level) + ' ' + element.textContent.trim() + '\n\n';
      } else if (element.tagName === 'P') {
        // Process paragraph elements, handling bold tags
        let paragraphContent = element.innerHTML
          .replace(/<b>/g, '**')
          .replace(/<\/b>/g, '**')
          .replace(/&nbsp;/g, ' ');
          
        // Remove other HTML tags but keep their content
        paragraphContent = paragraphContent.replace(/<[^>]*>/g, '');
        
        mdxContent += paragraphContent.trim() + '\n\n';
      } else if (element.tagName === 'UL') {
        // Process lists
        Array.from(element.querySelectorAll('li')).forEach(li => {
          let listItemContent = li.innerHTML
            .replace(/<b>/g, '**')
            .replace(/<\/b>/g, '**')
            .replace(/&nbsp;/g, ' ');
            
          // Remove other HTML tags but keep their content
          listItemContent = listItemContent.replace(/<[^>]*>/g, '');
          
          mdxContent += '- ' + listItemContent.trim() + '\n';
        });
        mdxContent += '\n';
      } else if (element.tagName === 'DIV' && element.classList.contains('section')) {
        // Process section divs by recursively handling their children
        Array.from(element.children).forEach(child => {
          if (['H1', 'H2', 'H3', 'H4', 'H5', 'H6'].includes(child.tagName)) {
            const level = parseInt(child.tagName.charAt(1));
            mdxContent += '#'.repeat(level) + ' ' + child.textContent.trim() + '\n\n';
          } else if (child.tagName === 'P') {
            let paragraphContent = child.innerHTML
              .replace(/<b>/g, '**')
              .replace(/<\/b>/g, '**')
              .replace(/&nbsp;/g, ' ');
              
            // Remove other HTML tags but keep their content
            paragraphContent = paragraphContent.replace(/<[^>]*>/g, '');
            
            mdxContent += paragraphContent.trim() + '\n\n';
          } else if (child.tagName === 'UL') {
            Array.from(child.querySelectorAll('li')).forEach(li => {
              let listItemContent = li.innerHTML
                .replace(/<b>/g, '**')
                .replace(/<\/b>/g, '**')
                .replace(/&nbsp;/g, ' ');
                
              // Remove other HTML tags but keep their content
              listItemContent = listItemContent.replace(/<[^>]*>/g, '');
              
              mdxContent += '- ' + listItemContent.trim() + '\n';
            });
            mdxContent += '\n';
          }
        });
      }
    });
    
    // Format the MDX content with prettier
    prettier.format(mdxContent, { parser: 'markdown' })
      .then(formattedContent => {
        // Write the MDX file
        const slug = toSlug(file);
        const outputPath = path.join(destDir, `${slug}.mdx`);
        fs.writeFileSync(outputPath, formattedContent);
        console.log(`Converted ${file} to ${outputPath}`);
      })
      .catch(error => {
        console.error(`Error formatting ${file}:`, error);
        // If prettier fails, just write the unformatted content
        const slug = toSlug(file);
        const outputPath = path.join(destDir, `${slug}.mdx`);
        fs.writeFileSync(outputPath, mdxContent);
        console.log(`Converted ${file} to ${outputPath} (unformatted)`);
      });
  });
});
