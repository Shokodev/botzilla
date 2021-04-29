const axios = require("axios");


async function getPlexLib(amount) {
    url = "http://192.168.0.123:32400/library/recentlyAdded";
    let res = await axios.get(url, {
      headers: { "X-Plex-Token": "AQcGWezcruGz65h6NSNw" },
    });
  
    const plexRec = res.data.MediaContainer.Metadata.map((movie) => ({
      title: movie.title,
      rating: movie.rating,
    }));
    console.log(plexRec)
    return plexRec.slice(0, amount);
  }

  module.exports = {getPlexLib}