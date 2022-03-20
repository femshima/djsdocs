import express from 'express';

import search from './search';

const app = express();
app.get('/embed', async (req, res) => {
  const query = req.query.query?.toString() ?? '';
  return res.json(search(query));
});

app.listen(3030);
