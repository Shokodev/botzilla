const axios = require("axios");

const url = process.env.PLEX

async function getPlexLib(amount) {
    let res = await axios.get(url, {
        headers: {
            "X-Plex-Token": process.env.X_PLEX_TOKEN
        },
    });

    const plexRec = res.data.MediaContainer.Metadata.map((movie) => ({
        title: movie.type === "season" ? movie.parentTitle : movie.title, // movie.title,
        rating: movie.rating,
    }));
    return plexRec.slice(0, amount);
}

module.exports = { getPlexLib }