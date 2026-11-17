
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

const defaults = {
  site_name: "Mariah Crafts",
  site_tagline: "Creative Technologist",
  browser_title: "Mariah Crafts | Creative Technologist",
  seo_description:
    "Explore the creative portfolio of Mariah Crafts, featuring graphic design, UI/UX, web development, game design, and interactive digital experiences.",
  seo_indexing: "true",
  seo_image_url: "",
  site_favicon_url: "",
  footer_name: "Mariah Crafts",
  footer_tagline: "Design. Code. Create.",
};

function setMeta(selector, attribute, content) {
  let element = document.head.querySelector(selector);

  if (!element) {
    element = document.createElement("meta");

    if (attribute === "property") {
      element.setAttribute(
        "property",
        selector.includes("og:image")
          ? "og:image"
          : selector.includes("og:description")
            ? "og:description"
            : "og:title"
      );
    } else {
      element.setAttribute(
        "name",
        selector.includes("robots")
          ? "robots"
          : "description"
      );
    }

    document.head.appendChild(element);
  }

  element.setAttribute("content", content);
}

export default function useSiteSettings() {
  const [settings, setSettings] = useState(defaults);

  useEffect(() => {
    let active = true;

    async function load() {
      const { data, error } = await supabase
        .from("portfolio_site_settings")
        .select("key, value")
        .in("key", Object.keys(defaults));

      if (!active) return;

      if (error) {
        console.error("Site settings loading error:", error);
        return;
      }

      const values = {
        ...defaults,
        ...Object.fromEntries(
          (data || []).map((item) => [
            item.key,
            item.value,
          ])
        ),
      };

      setSettings(values);
    }

    load();

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    document.title = settings.browser_title;

    setMeta(
      'meta[name="description"]',
      "name",
      settings.seo_description
    );

    setMeta(
      'meta[name="robots"]',
      "name",
      settings.seo_indexing === "true"
        ? "index, follow"
        : "noindex, nofollow"
    );

    setMeta(
      'meta[property="og:title"]',
      "property",
      settings.browser_title
    );

    setMeta(
      'meta[property="og:description"]',
      "property",
      settings.seo_description
    );

    if (settings.seo_image_url) {
      setMeta(
        'meta[property="og:image"]',
        "property",
        settings.seo_image_url
      );
    } else {
      document.head
        .querySelector('meta[property="og:image"]')
        ?.remove();
    }

    let favicon = document.querySelector(
      'link[rel="icon"]'
    );

    if (!favicon) {
      favicon = document.createElement("link");
      favicon.rel = "icon";
      document.head.appendChild(favicon);
    }

    favicon.href =
      settings.site_favicon_url || "/favicon.png";

    favicon.type = favicon.href.endsWith(".svg")
      ? "image/svg+xml"
      : favicon.href.endsWith(".webp")
        ? "image/webp"
        : "image/png";
  }, [settings]);

  return settings;
}