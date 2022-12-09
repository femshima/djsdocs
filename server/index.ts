import express from 'express';
import DocumentationSearch from '../src/index';

const app = express();
app.get('/embed', async (req, res) => {
  const query = req.query.q?.toString() ?? '';
  const includePrivate = req.query.includePrivate?.toString() === 'true';
  const src = req.query.src?.toString() ?? 'discord.js/stable';

  const search = await DocumentationSearch.loadAndConstruct(
    src,
    includePrivate
  );
  return res.json(search.search(query));
});

app.listen(3030);
