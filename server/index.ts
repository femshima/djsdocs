import express from 'express';
import DocumentationSearch from '../src/index';
import { load } from '../src/loader';

const app = express();
app.get('/embed', async (req, res) => {
  const query = req.query.q?.toString() ?? '';
  const includePrivate = req.query.includePrivate?.toString() === 'true';
  const src = req.query.src?.toString() ?? 'discord.js/stable';

  const data = await load(src);
  const search = new DocumentationSearch(src, data, includePrivate);
  return res.json(search.search(query));
});

app.listen(3030);
