import { NextApiHandler } from "next";
import { getScreenshot } from "./_lib/chromium";
import { parseRequest } from "./_lib/parser";
import { getHtml } from "./_lib/template";

const isDev = !process.env.RAILWAY_STATIC_URL;

const FAKE_API_URL = "http://localhost:8888";

const getPageDetails = async id => {
  const res = await fetch(`${FAKE_API_URL}/claim/${id}`);
  const data = await res.json();
  return data;
};
const handler: NextApiHandler = async (req, res) => {
  try {
    let config = parseRequest(req);
    const pageDetails = await getPageDetails(config.slug);

    config = { ...config, ...pageDetails };

    console.log("\n\n--- /api/image");
    console.log("CONFIG", config);
    const html = getHtml(config);
    const { fileType } = config;
    const file = await getScreenshot(html, fileType, isDev);

    res.statusCode = 200;
    res.setHeader("Content-Type", `image/${fileType}`);
    res.setHeader(
      "Cache-Control",
      `public, immutable, no-transform, s-maxage=31536000, max-age=31536000`,
    );
    res.end(file);
  } catch (e) {
    res.statusCode = 500;
    res.setHeader("Content-Type", "text/html");
    res.end("<h1>Internal Error</h1><p>Sorry, there was a problem</p>");
    console.error(e);
  }
};

export default handler;
