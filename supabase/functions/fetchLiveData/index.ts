import { serve } from "https://deno.land/std/http/server.ts";

serve(async () => {
  // 🔑 Read secrets from Vault (environment variables)
  const API_KEY = Deno.env.get("3ATRDLV6MWB9W6I7")!;
  const supabaseUrl = Deno.env.get("https://mrmpldrrnebdaufrtdlj.supabase.co")!;
  const supabaseKey = Deno.env.get("eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1ybXBsZHJybmViZGF1ZnJ0ZGxqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MDU4MTAxOCwiZXhwIjoyMDk2MTU3MDE4fQ.0cUxcS7GsW_Xq33Hd2E2k_jKZevqdeAYnLzMn4AHyck")!;

  // Example: fetch AAPL stock data
  const SYMBOL = "AAPL";
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

  // Connect to Supabase
  const { createClient } = await import("https://esm.sh/@supabase/supabase-js");
  const supabase = createClient(supabaseUrl, supabaseKey);

  // Insert into live_data table
  const { error } = await supabase.from("live_data").insert(entries);
  if (error) console.error(error);

  return new Response("Data inserted successfully");
});
