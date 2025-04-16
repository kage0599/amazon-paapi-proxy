import crypto from 'crypto';

export async function signPaapiRequest({ payload }) {
  const accessKey = process.env.ACCESS_KEY;
  const secretKey = process.env.SECRET_KEY;
  const region = process.env.AMAZON_REGION || "us-east-1";
  const host = "webservices.amazon.co.jp";
  const service = "ProductAdvertisingAPI";
  const path = "/paapi5/searchitems";

  const amzDate = new Date().toISOString().replace(/[:\-]|\.\d{3}/g, "") + "Z";
  const dateStamp = amzDate.substring(0, 8);

  const canonicalHeaders = `content-encoding:amz-1.0\ncontent-type:application/json; charset=utf-8\nhost:${host}\nx-amz-date:${amzDate}\n`;
  const signedHeaders = "content-encoding;content-type;host;x-amz-date";

  const payloadHash = crypto.createHash("sha256").update(payload).digest("hex");
  const canonicalRequest = [
    "POST",
    path,
    "",
    canonicalHeaders,
    signedHeaders,
    payloadHash
  ].join("\n");

  const algorithm = "AWS4-HMAC-SHA256";
  const credentialScope = `${dateStamp}/${region}/${service}/aws4_request`;
  const stringToSign = [
    algorithm,
    amzDate,
    credentialScope,
    crypto.createHash("sha256").update(canonicalRequest).digest("hex")
  ].join("\n");

  const kDate = hmac("AWS4" + secretKey, dateStamp);
  const kRegion = hmac(kDate, region);
  const kService = hmac(kRegion, service);
  const kSigning = hmac(kService, "aws4_request");
  const signature = crypto.createHmac("sha256", kSigning).update(stringToSign).digest("hex");

  const authorizationHeader = `${algorithm} Credential=${accessKey}/${credentialScope}, SignedHeaders=${signedHeaders}, Signature=${signature}`;

  return {
    url: `https://${host}${path}`,
    headers: {
      "Content-Encoding": "amz-1.0",
      "Content-Type": "application/json; charset=utf-8",
      "Host": host,
      "X-Amz-Date": amzDate,
      "Authorization": authorizationHeader
    }
  };
}

function hmac(key, data) {
  return crypto.createHmac("sha256", key).update(data).digest();
}
