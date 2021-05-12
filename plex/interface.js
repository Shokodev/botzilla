const axios = require("axios");

const plex = "http://192.168.0.123:32400/library/recentlyAdded";

async function getPlexLib(amount) {
    url = plex;
    let res = await axios.get(url, {
      headers: { 
        "X-Plex-Token": process.env.X-PLEX-TOKEN},
    });
  
    const plexRec = res.data.MediaContainer.Metadata.map((movie) => ({
      title: movie.title,
      rating: movie.rating,
    }));
    console.log(plexRec)
    return plexRec.slice(0, amount);
  }

  module.exports = {getPlexLib}