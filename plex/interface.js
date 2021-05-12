const axios = require("axios");

const plex = process.env.PLEX
console.log(plex)

async function getPlexLib(amount) {
  console.log(plex)
    url = plex;
    let res = await axios.get(url, {
      headers: { 
        "X-Plex-Token": process.env.X_PLEX_TOKEN},
    });
  
    const plexRec = res.data.MediaContainer.Metadata.map((movie) => ({
      title: movie.title,
      rating: movie.rating,
    }));
    console.log(plexRec)
    return plexRec.slice(0, amount);
  }

  module.exports = {getPlexLib}