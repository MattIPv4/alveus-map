import { readdirSync, readFileSync, writeFileSync } from 'fs';
import { basename, dirname, join } from 'path';
import { fileURLToPath } from 'url';

import markdown from 'markdown-it';
import markdownLinkAttributes from 'markdown-it-link-attributes';
import matter from 'gray-matter';

// Get all the MD files
const getFilesInDir = path => readdirSync(path, { withFileTypes: true })
  .flatMap(file => (file.isDirectory() ? getFilesInDir(join(path, file.name)) : join(path, file.name)));
const files = getFilesInDir(dirname(fileURLToPath(import.meta.url))).filter(file => file.endsWith('.md'));

// Create the MD renderer
const md = markdown({ typographer: true });
md.use(markdownLinkAttributes, {
  attrs: {
    target: '_blank',
    rel: 'noreferrer',
  },
});

// Read, parse and render all the files
const data = files.reduce((obj, file) => {
  const name = basename(file, '.md');
  if (Object.prototype.hasOwnProperty.call(obj, name)) throw new Error(`Duplicate data Id: ${name}`);

  const { data, content } = matter(readFileSync(file, 'utf8'));
  const rendered = md.render(content);
  return { ...obj, [name]: { data, content: rendered } };
}, {});

// Write the data object
writeFileSync(new URL('data.json', import.meta.url), JSON.stringify(data, null, 2));
