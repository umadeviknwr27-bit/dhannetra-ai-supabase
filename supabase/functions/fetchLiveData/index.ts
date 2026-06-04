// supabase/functions/fetchLiveData/index.ts
import { serve } from "https://deno.land/std/http/server.ts";

serve(async (req) => {
  const API_KEY = Deno.env.get("ALPHA_VANTAGE_KEY")!;
  const SYMBOL = "AAPL"; // change to your stock/crypto
  const INTERVAL = "5min";

  const url = `https://www.alphavantage.co/query?function=TIME_SERIES_INTRADAY&symbol=${SYMBOL}&interval=${INTERVAL}&apikey=${API_KEY}`;
  const res = await fetch(url);
  const data = await res.json();

  const timeSeries = data["Time Series (5min)"];
  const entries = Object.entries(timeSeries).map(([timestamp, values]) => ({
    symbol: SYMBOL,
    timestamp,
    open: parseFloat(values["1. open"]),
    high: parseFloat(values["2. high"]),
    low: parseFloat(values["3. low"]),
    close: parseFloat(values["4. close"]),
    volume: parseFloat(values["5. volume"]),
  }));

  // Insert into Supabase
  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const { createClient } = await import("https://esm.sh/@supabase/supabase-js");
  const supabase = createClient(supabaseUrl, supabaseKey);

  const { error } = await supabase.from("live_data").insert(entries);
  if (error) console.error(error);

  return new Response("Data inserted");
});
