import { signPaapiRequest } from './signer.js';

export async function getAmazonItemByTitle(title) {
  const payload = JSON.stringify({
    Keywords: title,
    Resources: [
      "Images.Primary.Medium",
      "ItemInfo.Title",
      "ItemInfo.ByLineInfo",
      "ItemInfo.ContentInfo",
      "Offers.Listings.Price"
    ],
    PartnerTag: process.env.ASSOCIATE_TAG,
    PartnerType: "Associates",
    Marketplace: "www.amazon.co.jp"
  });

  const { url, headers } = await signPaapiRequest({ payload });
  const response = await fetch(url, {
    method: 'POST',
    headers,
    body: payload,
  });

  const data = await response.json();

  if (!data.ItemsResult?.Items?.length) return null;

  const item = data.ItemsResult.Items[0];
  return {
    title: item.ItemInfo?.Title?.DisplayValue || '',
    author: item.ItemInfo?.ByLineInfo?.Contributors?.map(c => c.Name).join(', ') || '',
    publisher: item.ItemInfo?.ByLineInfo?.Manufacturer?.DisplayValue || '',
    price: item.Offers?.Listings?.[0]?.Price?.DisplayAmount || '',
    image: item.Images?.Primary?.Medium?.URL || '',
    links: {
      paper: item.DetailPageURL,
      kindle: item.DetailPageURL
    }
  };
}
