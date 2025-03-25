# Notion-to-do-integration

Automatically generate a year long, week-by-week todo structure in Notion.

### Run

To install dependencies:

```bash
bun install
```

To run:

```bash
bun run index.ts
```
This project was created using `bun init` in bun v1.0.0. [Bun](https://bun.sh) is a fast all-in-one JavaScript runtime.


### Setup env:

```
NOTION_API_KEY=[insert_api_key_here]
PARENT_PAGE_ID=[insert_page_id_here]
```
- Generating an api key: 
    - Go to https://www.notion.so/profile/integrations
    - Create or use an existing `Internal Integration Secret` 
- Page id can be extracted directly from the url 
    - i.e from https://www.notion.so/test-page-3adfgb8e87a4903a8f5de217a2p025d6, the page id is `3adfgb8e87a4903a8f5de217a2p025d6`
- Note: need to go to page settings -> connections -> add the relevant integration (may need to search for it in the search bar)

