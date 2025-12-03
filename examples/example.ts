import { getPostData } from '../src/index';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function main() {
  const args = process.argv.slice(2);
  const postId = args[0] || '20'; // Default to Jack's first tweet if no ID provided

  console.log(`Fetching post: ${postId}...`);

  try {
    const post = await getPostData(postId);
    if (post) {
      console.log('Successfully fetched post:');
      console.log(JSON.stringify(post, null, 2));

      // Create results directory structure: examples/results/{postId}/
      const resultsDir = path.join(__dirname, 'results', post.id);
      fs.mkdirSync(resultsDir, { recursive: true });

      // Save text to markdown file
      const mdFilename = path.join(resultsDir, `${post.id}.md`);
      let fileContent = post.text;
      if (post.quotedPost) {
        fileContent += `\n\n> Quoted Post from @${post.quotedPost.author.screenName}:\n> ${post.quotedPost.text.replace(/\n/g, '\n> ')}`;
      }
      fs.writeFileSync(mdFilename, fileContent);

      // Save full JSON response
      const jsonFilename = path.join(resultsDir, `${post.id}.json`);
      fs.writeFileSync(jsonFilename, JSON.stringify(post, null, 2));

      console.log(`\nSaved results to ${resultsDir}/`);
      console.log(`  - ${post.id}.md (text content)`);
      console.log(`  - ${post.id}.json (full data)`);
    } else {
      console.log('Post not found or null result.');
    }
  } catch (error) {
    console.error('Error fetching post:', error);
  }
}

main();
