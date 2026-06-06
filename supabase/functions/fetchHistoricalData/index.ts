import { serve } from "https://deno.land/std/http/server.ts";

serve(async () => {
  // 🔑 Read secrets from Vault
  const API_KEY = Deno.env.get("ALPHA_VANTAGE_KEY")!;
  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

  // Example: fetch AAPL daily adjusted data
  const SYMBOL = "AAPL";
  const url = `https://www.alphavantage.co/query?function=TIME_SERIES_DAILY_ADJUSTED&symbol=${SYMBOL}&apikey=${API_KEY}`;

  const res = await fetch(url);
  const data = await res.json();

  const timeSeries = data["Time Series (Daily)"];
  const entries = Object.entries(timeSeries).map(([date, values]) => ({
    symbol: SYMBOL,
    date,
    open: parseFloat(values["1. open"]),
    high: parseFloat(values["2. high"]),
    low: parseFloat(values["3. low"]),
    close: parseFloat(values["4. close"]),
    adjusted_close: parseFloat(values["5. adjusted close"]),
    volume: parseInt(values["6. volume"]),
  }));

  // Connect to Supabase
  const { createClient } = await import("https://esm.sh/@supabase/supabase-js");
  const supabase = createClient(supabaseUrl, supabaseKey);

  // Insert into historical_data table
  const { error } = await supabase.from("historical_data").insert(entries);
  if (error) console.error(error);

  return new Response("Historical data inserted successfully");
});
