// export async function GET(req) {
//   const { searchParams } = new URL(req.url);
//   const query = searchParams.get("query");

//   if (!query) {
//     return new Response(JSON.stringify({ error: "Missing query parameter" }), {
//       status: 400,
//     });
//   }

//   const apiKey = process.env.NEWS_API_KEY || "4c97f41618884232870ff7ff1289d982"; 
//   const endpoint = `https://newsapi.org/v2/everything?q=${encodeURIComponent(
//     query
//   )}&from=2025-06-22&sortBy=publishedAt&apiKey=${apiKey}`;

//   try {
//     const res = await fetch(endpoint);
//     if (!res.ok) {
//       throw new Error(`News API error: ${res.statusText}`);
//     }
//     const data = await res.json();
//     return new Response(JSON.stringify(data), { status: 200 });
//   } catch (error) {
//     return new Response(JSON.stringify({ error: error.message }), {
//       status: 500,
//     });
//   }
// }


export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const query = searchParams.get("query");

  if (!query) {
    return new Response(JSON.stringify({ error: "Missing query parameter" }), {
      status: 400,
    });
  }

  const apiKey = process.env.NEWS_API_KEY || "pub_eb8f0ab1b093463baf30f4371f4e090b";

  const endpoint = `https://newsdata.io/api/1/news?apikey=${apiKey}&q=${encodeURIComponent(
    query
  )}&language=en`;

  try {
    const res = await fetch(endpoint, { cache: "no-store" });

    if (!res.ok) {
      const errorText = await res.text();
      console.error("News API Error:", errorText);
      throw new Error(`News API error: ${res.statusText}`);
    }

    const data = await res.json();
    return new Response(JSON.stringify(data), { status: 200 });
  } catch (error) {
    console.error("Server Error:", error.message);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
    });
  }
}
