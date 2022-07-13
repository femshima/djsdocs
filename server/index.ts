import express from 'express';
import DocumentationSearch from '../src/index';
import data from '../data';

const search = new DocumentationSearch(data);

const app = express();
app.get('/embed', async (req, res) => {
  const query = req.query.query?.toString() ?? '';
  return res.json(search.search(query));
});

app.listen(3030);
