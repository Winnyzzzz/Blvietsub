import { Router, type IRouter } from "express";
import * as cheerio from "cheerio";

const router: IRouter = Router();
const BASE_URL = "https://www.blvietsub.online";
const USER_AGENT =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36";

const COUNTRY_MAP: Record<string, string> = {
  "trung-quoc": "Trung Quốc",
  "viet-nam": "Việt Nam",
  "thai-lan": "Thái Lan",
  "han-quoc": "Hàn Quốc",
  "nhat-ban": "Nhật Bản",
  "my": "Mỹ",
  "dai-loan": "Đài Loan",
  "phap": "Pháp",
  "duc": "Đức",
  "hong-kong": "Hồng Kông",
  "philippines": "Philippines",
  "tay-ban-nha": "Tây Ban Nha",
  "thuy-dien": "Thụy Điển",
  "ao": "Áo",
  "ha-lan": "Hà Lan",
  "uc": "Úc",
  "anh": "Anh",
  "canada": "Canada",
  "italia": "Ý",
  "indonesia": "Indonesia",
};

async function fetchPage(url: string): Promise<string> {
  const res = await fetch(url, {
    headers: {
      "User-Agent": USER_AGENT,
      Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
      "Accept-Language": "vi-VN,vi;q=0.9,en-US;q=0.8,en;q=0.7",
      Referer: BASE_URL,
    },
  });
  if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
  return res.text();
}

function parseThumbnail(src: string | undefined): string {
  if (!src || src.startsWith("data:")) return "";
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
    title: string; url: string; thumbnail: string;
    quality: string; year: string; episode: string; labels: string[];
  }[] = [];

  $(".phimitem").each((_i, el) => {
    const $el = $(el);
    const linkEl = $el.find("a.lable-about").first();
    const href = linkEl.attr("href") || "";
    const url = href.startsWith("http") ? href : BASE_URL + href;
    const titleAttr = linkEl.attr("title") || "";
    const titleH3 = cleanTitle($el.find("h3.lable-home").first().text().trim());
    const title = titleH3 || titleAttr;

    // Use data-image on .lable-update for best quality, then fallback
    const dataImage = $el.find(".lable-update").attr("data-image") || "";
    const img = $el.find("img.img-lable").first();
    const thumbnail = parseThumbnail(
      dataImage || img.attr("data-src") || img.attr("data-original") || img.attr("src") || ""
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
  return $("#blog-pager a[href]").first().attr("href") || "";
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
    const url = cursor || `${BASE_URL}/search/label/${encodeURIComponent(label)}`;
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
    if (!url) { res.status(400).json({ error: "url parameter is required" }); return; }

    const fullUrl = url.startsWith("http") ? url : BASE_URL + url;
    const html = await fetchPage(fullUrl);
    const $ = cheerio.load(html);

    const title =
      $("meta[property='og:title']").attr("content")?.trim() ||
      $("h1.post-title, h1.entry-title, h1").first().text().trim();

    // Best quality poster: .page-cover img data-src
    const coverImg = $(".page-cover img").first();
    const thumbnail = parseThumbnail(
      coverImg.attr("data-src") || coverImg.attr("src") || ""
    );

    const bodyText = $(".post-body, .entry-content").first().text();
    let description = "";
    const ndMatch = bodyText.match(/\[nd\]([\s\S]*?)(?:\[\/nd\]|$)/);
    if (ndMatch) description = ndMatch[1].trim();

    const statusText = $(".trangthai_remove").first().text();
    const episode = parseEpisode(statusText);
    const year = (title.match(/\((\d{4})\)/) || [])[1] || "";

    // Extract embed video URLs: [01|url] format
    const embedUrls: string[] = [];
    const embedPattern = /\[(\d+)\|([^\]]+)\]/g;
    let m: RegExpExecArray | null;
    while ((m = embedPattern.exec(bodyText)) !== null) {
      embedUrls.push(m[2].trim());
    }
    const iframeUrl = embedUrls[0] || "";

    // Extract structured metadata from .listitem divs
    let duration = "";
    let country = "";
    let actors = "";
    let director = "";
    const numSoTap = "";

    $(".listitem").each((_i, el) => {
      const strongText = $(el).find("strong").first().text().trim();
      const rawText = $(el).clone().children("strong").remove().end().text().trim();

      if (strongText.includes("Thời lượng")) {
        duration = rawText;
      } else if (strongText.includes("Diễn viên")) {
        actors = rawText;
      } else if (strongText.includes("Đạo diễn")) {
        director = rawText;
      } else if (strongText.includes("Quốc gia")) {
        // Map country slugs to display names
        const countryLinks: string[] = [];
        $(el).find("a.quoc-gia, a[title]").each((_j, a) => {
          const slug = $(a).attr("title") || "";
          const mapped = COUNTRY_MAP[slug];
          if (mapped && !countryLinks.includes(mapped)) {
            countryLinks.push(mapped);
          }
        });
        country = countryLinks.join(", ");
      }
    });

    // Extract labels from .theloai links
    const labels: string[] = [];
    $(".theloai a.the-loai, .theloai a").each((_i, el) => {
      const slug = $(el).attr("title") || "";
      const text = $(el).text().trim();
      // Skip year slugs (pure numbers) and type slugs handled separately
      const isYear = /^\d{4}$/.test(slug);
      if (!isYear && slug && !labels.includes(slug)) {
        const display = COUNTRY_MAP[slug] || text || slug;
        if (display && !labels.includes(display)) labels.push(display);
      }
    });
    $(".post-labels a").each((_i, el) => {
      const t = $(el).text().trim();
      if (t && !labels.includes(t)) labels.push(t);
    });

    // Related movies
    const relatedMovies: {
      title: string; url: string; thumbnail: string;
      quality: string; year: string; episode: string; labels: string[];
    }[] = [];
    $(".phimitem").each((_i, el) => {
      const $el = $(el);
      const linkEl = $el.find("a.lable-about").first();
      const href = linkEl.attr("href") || "";
      const relUrl = href.startsWith("http") ? href : BASE_URL + href;
      const relTitle = cleanTitle($el.find("h3.lable-home").first().text().trim());
      const dataImage = $el.find(".lable-update").attr("data-image") || "";
      const relImg = $el.find("img.img-lable").first();
      const relThumb = parseThumbnail(dataImage || relImg.attr("data-src") || relImg.attr("src") || "");
      if (relTitle) {
        relatedMovies.push({ title: relTitle, url: relUrl, thumbnail: relThumb, quality: "HD", year: "", episode: "", labels: [] });
      }
    });

    res.json({
      title, url: fullUrl, thumbnail, description, quality: "HD",
      year, episode, duration, country, director, actors,
      labels, iframeUrl, embedUrl: iframeUrl, relatedMovies,
    });
  } catch (err) {
    req.log.error({ err }, "Error fetching movie detail");
    res.status(500).json({ error: "Failed to fetch movie detail" });
  }
});

export default router;
