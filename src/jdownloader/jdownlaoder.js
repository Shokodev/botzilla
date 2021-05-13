const axios = require("axios");

const url = process.env.JDOWNLOADER;
const myLinkQuery = { params: ['{"maxResults":20,"startAt":0}'] };
const myDeleteQuery = {
  params: [
    {
      linkIds: [],
      packageIds: [],
      action: "DELETE_FINISHED",
      mode: "REMOVE_LINKS_ONLY",
      selectionType: "ALL",
    },
  ],
};

let linkcollectorIds = [];

//TODO Add password functionality for archive extraction
async function addLink(link, folder, password) {
  await axios.get(url + "/linkcollector/addLinks", {
    params: {
      links: link,
      packageName: "",
      extractPassword: "",
      downloadPassword: "",
      destinationFolder: folder,
    },
  });

  await sleep(1000);
  return await getLinkIds();
}

async function getLinkIds() {
  let res = await axios.get(url + "/linkcollector/queryLinks", {
    params: {
      myLinkQuery,
    },
    
  });
  
  res.data.data.forEach((element) => {
    linkcollectorIds.push(element.uuid);
  });
  startDownload();
  return res.data.data[0];
};

// TODO finish this function
const startDownload = async function () {
  await axios.get(url + "/linkcollector/startDownloads", {
    params: {
      params: [linkcollectorIds],
    },
  });
  startDl();
};

function startDl() {
  axios.post(url + "/downloadcontroller/start");
}

const sleep = (milliseconds) => {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
};


async function getDlStatus(uuid) {
    let res = await axios.get(url + "/downloadsV2/queryLinks", {
        params: {
            params: [{bytesLoaded:true, bytesTotal:true, eta:true, finished:true, maxResults:20,startAt:0}] 
        }
    });

    return res.data.data.filter((title) => title.uuid === uuid)
  }

  
module.exports = { addLink: addLink,
                   getDlStatus: getDlStatus,
                sleep: sleep };
