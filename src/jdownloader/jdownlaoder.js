const axios = require("axios");

const url = process.env.JDOWNLOADER;
const myLinkQuery = {params: ['{"maxResults":20,"startAt":0}']}
let linkcollectorIds = null;

//TODO Add password functionality for archive extraction
async function addLink(link, folder, password) {
    console.log(link + folder + password )
  await axios.get(url + "/linkcollector/addLinks", {
    params: {
      links: link,
      packageName: "",
      extractPassword: "",
      downloadPassword: "",
      destinationFolder: folder,
    },
  });
}

const getLinkIds = async function () {
  let res = await axios.get(url + "/linkcollector/queryLinks", {
    params: {
      myLinkQuery,
    },
  });
  console.log(res.data.data);
  linkcollectorIds = res.data
};

// TODO finish this function
const startDownload = async function () {
  let res = await axios.get(url + "/linkcollector/startDownloads", {
    params: {
      params: [[1620897177331]],
    },
  });
  console.log(res.data);
};

//getLinkIds();
//startDownload();
module.exports = { addLink: addLink };
