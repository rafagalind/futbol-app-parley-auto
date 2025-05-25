export default async function handler(req, res) {
  const headers = {
    'X-RapidAPI-Key': process.env.RAPIDAPI_KEY,
    'X-RapidAPI-Host': process.env.RAPIDAPI_HOST,
  };

  try {
    const response = await fetch("https://free-api-live-football-data.p.rapidapi.com/teams", {
      headers,
    });
    const data = await response.json();
    const equipos = data?.response?.map(e => e.name).sort();
    res.status(200).json(equipos);
  } catch (err) {
    res.status(500).json({ error: "Error al cargar equipos" });
  }
}
