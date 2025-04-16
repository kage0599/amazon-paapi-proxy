// pages/api/amazon.js

import { getAmazonItemByTitle } from '../../lib/paapi.js';

export default async function handler(req, res) {
  const { title } = req.query;

  if (!title) {
    return res.status(400).json({ error: "タイトルが必要です" });
  }

  try {
    const result = await getAmazonItemByTitle(title);
    if (!result) {
      return res.status(404).json({ error: "該当商品が見つかりませんでした" });
    }
    return res.status(200).json(result);
  } catch (error) {
    console.error("APIエラー", error);
    return res.status(500).json({ error: "サーバーエラー", detail: error.message });
  }
}
