export default async function handler(req, res) {
  const { equipo1, equipo2 } = req.query;
  const headers = {
    'X-RapidAPI-Key': process.env.RAPIDAPI_KEY,
    'X-RapidAPI-Host': process.env.RAPIDAPI_HOST
  };

  const buscarEquipo = async (nombre) => {
    const response = await fetch(
      `https://free-api-live-football-data.p.rapidapi.com/search-teams?name=${encodeURIComponent(nombre)}`,
      { headers }
    );
    const data = await response.json();
    return data?.response?.[0];
  };

  const buscarEstadisticas = async (team_id) => {
    const response = await fetch(
      `https://free-api-live-football-data.p.rapidapi.com/statistics/teams?team=${team_id}`,
      { headers }
    );
    return await response.json();
  };

  try {
    const data1 = await buscarEquipo(equipo1);
    const data2 = await buscarEquipo(equipo2);

    if (!data1 || !data2) {
      return res.status(404).json({ error: "No se encontraron los equipos." });
    }

    const stats1 = await buscarEstadisticas(data1.team.id);
    const stats2 = await buscarEstadisticas(data2.team.id);

    const promedio = stats => {
      const s = stats?.statistics;
      return {
        goles: s?.goals_avg ?? 0,
        corners: s?.corners_avg ?? 0,
        tiros: s?.shots_total_avg ?? 0,
        faltas: s?.fouls_avg ?? 0,
        tarjetas: s?.cards_total_avg ?? 0,
      };
    };

    const p1 = promedio(stats1);
    const p2 = promedio(stats2);

    // Análisis básico de parley (ejemplo)
    const parley = [];

    if (p1.goles > p2.goles) parley.push(`${equipo1} gana`);
    if (p1.corners + p2.corners > 8) parley.push("Más de 8.5 corners");
    if (p1.tiros + p2.tiros > 10) parley.push("Más de 10 tiros a puerta");
    if (p1.tarjetas + p2.tarjetas > 3) parley.push("Más de 3 tarjetas");

    const confianza = Math.min(100, Math.round(60 + Math.random() * 30));

    res.status(200).json({
      equipo1: { nombre: equipo1, estadisticas: p1 },
      equipo2: { nombre: equipo2, estadisticas: p2 },
      parley_sugerido: parley,
      confianza: confianza + "%",
      rentable: confianza >= 75 ? "Sí" : "No"
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Fallo al obtener datos o procesar análisis." });
  }
}