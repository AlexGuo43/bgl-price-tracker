import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

const URL = "https://sls.g2g.com/offer/search?seo_term=growtopia-item&filter_attr=8c768452:fce4a5f7%7Cfbe410c8:1110885b&sort=lowest_price&page_size=20&group=0&currency=CAD&country=CA&v=v2";

async function fetchPrice() {
  const res = await fetch(URL);
  const json = await res.json();

  const results = json.payload.results;

  if (!results || results.length === 0) {
    throw new Error("No results from API");
  }

  // extract prices
  const prices = results.map(r => r.converted_unit_price);

  // compute lowest
  const lowest = Math.min(...prices);

  return lowest;
}

async function fetchAndStore() {
  try {
    const price = await fetchPrice();

    console.log("Fetched price:", price);

    const { error } = await supabase
      .from("prices")
      .insert([{ price }]);

    if (error) {
      console.error("Insert error:", error);
    } else {
      console.log("Stored successfully");
    }
  } catch (err) {
    console.error("Error:", err.message);
  }
}

fetchAndStore();