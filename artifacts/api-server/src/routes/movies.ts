import { Router, type IRouter } from "express";
import * as cheerio from "cheerio";

const router: IRouter = Router();

const BASE_URL = "https://www.blvietsub.online";

const USER_AGENT =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36";

async function fetchPage(url: string): Promise<string> {
  const res = await fetch(url, {
    headers: {
      "User-Agent": USER_AGENT,
      Accept:
        "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
      "Accept-Language": "vi-VN,vi;q=0.9,en-US;q=0.8,en;q=0.7",
      Referer: BASE_URL,
    },
  });
  if (!res.ok) {
    throw new Error(`HTTP error! status: ${res.status}`);
  }
  return res.text();
}

function parseThumbnail(src: string | undefined): string {
  if (!src) return "";
  if (src.startsWith("data:")) return "";
  if (src.startsWith("http")) return src;
  if (src.startsWith("//")) return "https:" + src;
  return BASE_URL + src;
}

function cleanTitle(raw: string): string {
  return raw.replace(/^\[|\]$/g, "").trim();
}

function parseEpisode(content: string): string {
  const match = content.match(/\[stt\/([^\]]+)\]/);
  return match ? match[1].trim() : "";
}

function parseMoviesFromPage(html: string) {
  const $ = cheerio.load(html);
  const movies: {
    title: string;
    url: string;
    thumbnail: string;
    quality: string;
    year: string;
    episode: string;
    labels: string[];
  }[] = [];

  $(".phimitem").each((_i, el) => {
    const $el = $(el);
    const linkEl = $el.find("a.lable-about").first();
    const href = linkEl.attr("href") || "";
    const url = href.startsWith("http") ? href : BASE_URL + href;

    const titleAttr = linkEl.attr("title") || "";
    const titleH3 = cleanTitle($el.find("h3.lable-home").first().text().trim());
    const title = titleH3 || titleAttr;

    const img = $el.find("img.img-lable").first();
    const thumbnail = parseThumbnail(
      img.attr("data-src") || img.attr("data-original") || img.attr("src") || ""
    );

    const mainContent = $el.find(".main-movie-content").first().text().trim();
    const episode = parseEpisode(mainContent);
    const year = (titleAttr.match(/\((\d{4})\)/) || [])[1] || "";

    if (title || url) {
      movies.push({ title, url, thumbnail, quality: "HD", year, episode, labels: [] });
    }
  });

  return movies;
}

function extractNextCursor(html: string): string {
  const $ = cheerio.load(html);
  const nextHref = $("#blog-pager a[href]").first().attr("href") || "";
  return nextHref;
}

router.get("/movies", async (req, res) => {
  try {
    const cursor = (req.query.cursor as string) || "";
    const page = cursor ? 2 : 1;

    const url = cursor || `${BASE_URL}/?m=1`;
    const html = await fetchPage(url);
    const movies = parseMoviesFromPage(html);
    const nextCursor = extractNextCursor(html);

    res.json({ movies, nextCursor, hasNextPage: !!nextCursor, page });
  } catch (err) {
    req.log.error({ err }, "Error fetching movies");
    res.status(500).json({ error: "Failed to fetch movies" });
  }
});

router.get("/movies/search", async (req, res) => {
  try {
    const q = (req.query.q as string) || "";
    const cursor = (req.query.cursor as string) || "";
    const page = cursor ? 2 : 1;

    const url = cursor || `${BASE_URL}/search?q=${encodeURIComponent(q)}`;
    const html = await fetchPage(url);
    const movies = parseMoviesFromPage(html);
    const nextCursor = extractNextCursor(html);

    res.json({ movies, nextCursor, hasNextPage: !!nextCursor, page });
  } catch (err) {
    req.log.error({ err }, "Error searching movies");
    res.status(500).json({ error: "Failed to search movies" });
  }
});

router.get("/movies/category", async (req, res) => {
  try {
    const label = (req.query.label as string) || "";
    const cursor = (req.query.cursor as string) || "";
    const page = cursor ? 2 : 1;

    const url =
      cursor ||
      `${BASE_URL}/search/label/${encodeURIComponent(label)}`;
    const html = await fetchPage(url);
    const movies = parseMoviesFromPage(html);
    const nextCursor = extractNextCursor(html);

    res.json({ movies, nextCursor, hasNextPage: !!nextCursor, page });
  } catch (err) {
    req.log.error({ err }, "Error fetching category movies");
    res.status(500).json({ error: "Failed to fetch category movies" });
  }
});

router.get("/movies/detail", async (req, res) => {
  try {
    const url = (req.query.url as string) || "";
    if (!url) {
      res.status(400).json({ error: "url parameter is required" });
      return;
    }

    const fullUrl = url.startsWith("http") ? url : BASE_URL + url;
    const html = await fetchPage(fullUrl);
    const $ = cheerio.load(html);

    const title = $("h1.post-title, h1.entry-title, h1").first().text().trim();

    const img = $(".post-body img, .entry-content img").first();
    const thumbnail = parseThumbnail(
      img.attr("data-src") ||
        img.attr("data-original") ||
        img.attr("src") ||
        ""
    );

    const bodyText = $(".post-body, .entry-content").first().text();

    let description = "";
    const ndMatch = bodyText.match(/\[nd\]([\s\S]*?)(?:\[\/nd\]|$)/);
    if (ndMatch) description = ndMatch[1].trim();

    const mainMovieContent = $("[name='main-movie-content']").first().text();
    const episode = parseEpisode(mainMovieContent);
    const year = (title.match(/\((\d{4})\)/) || [])[1] || "";

    const embedUrls: string[] = [];
    const embedPattern = /\[(\d+)\|([^\]]+)\]/g;
    let m: RegExpExecArray | null;
    while ((m = embedPattern.exec(bodyText)) !== null) {
      embedUrls.push(m[2].trim());
    }
    const iframeUrl = embedUrls[0] || "";

    const metaInfo: Record<string, string> = {};
    const infoMatch = bodyText.match(/\[info\]([\s\S]*?)\[\/info\]/);
    if (infoMatch) {
      const infoText = infoMatch[1];
      for (const line of infoText.split("\n").filter((l) => l.trim())) {
        const colonIdx = line.indexOf(":");
        if (colonIdx > 0) {
          metaInfo[line.slice(0, colonIdx).trim().toLowerCase()] = line.slice(colonIdx + 1).trim();
        }
      }
    }

    const labels: string[] = [];
    $(".post-labels a, .label a").each((_i, el) => {
      const t = $(el).text().trim();
      if (t && !labels.includes(t)) labels.push(t);
    });

    const relatedMovies: {
      title: string;
      url: string;
      thumbnail: string;
      quality: string;
      year: string;
      episode: string;
      labels: string[];
    }[] = [];

    $(".phimitem").each((_i, el) => {
      const $el = $(el);
      const linkEl = $el.find("a.lable-about").first();
      const href = linkEl.attr("href") || "";
      const relUrl = href.startsWith("http") ? href : BASE_URL + href;
      const relTitle = cleanTitle($el.find("h3.lable-home").first().text().trim());
      const relImg = $el.find("img.img-lable").first();
      const relThumb = parseThumbnail(relImg.attr("data-src") || relImg.attr("src") || "");
      if (relTitle) {
        relatedMovies.push({ title: relTitle, url: relUrl, thumbnail: relThumb, quality: "HD", year: "", episode: "", labels: [] });
      }
    });

    res.json({
      title,
      url: fullUrl,
      thumbnail,
      description,
      quality: "HD",
      year,
      episode,
      duration: metaInfo["thời lượng"] || metaInfo["duration"] || "",
      country: metaInfo["quốc gia"] || metaInfo["country"] || "",
      director: metaInfo["đạo diễn"] || metaInfo["director"] || "",
      actors: metaInfo["diễn viên"] || metaInfo["cast"] || "",
      labels,
      iframeUrl,
      embedUrl: iframeUrl,
      relatedMovies,
    });
  } catch (err) {
    req.log.error({ err }, "Error fetching movie detail");
    res.status(500).json({ error: "Failed to fetch movie detail" });
  }
});

export default router;
