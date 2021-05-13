const axios = require('axios')

const url = process.env.JDOWNLOADER;
//const link = "https://rapidrar.com/lq68byqqzg40"

async function addLink(link, folder) {
    let res = await axios.get(url + "/linkcollector/addLinks",{params: {
            links: link,
            packageName: "",
            extractPassword: "",
            downloadPassword:"",
            destinationFolder: folder

        }})
}

module.exports = {addLink: addLink}