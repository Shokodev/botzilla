const axios = require('axios')

const url = process.env.JDOWNLOADER;
//const link = "https://rapidrar.com/lq68byqqzg40"

async function addLink(link) {
    let res = await axios.get(url + "/linkcollector/addLinks",{params: {
            link: link,
            packageName: "",
            archivePassword: "",
            linkPassword:""
        }})
        console.log(res.data)
}

module.exports = {addLink: addLink}