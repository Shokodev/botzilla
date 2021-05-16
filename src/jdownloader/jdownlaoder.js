const axios = require("axios");
const logger = require("../logger");

const url = process.env.JDOWNLOADER;
const myLinkQuery = { params: ['{"maxResults":20,"startAt":0}'] };
const myDeleteQuery = {
  params: [
    '{"linkIds": [],"packageIds": [],"action": "DELETE_FINISHED","mode": "REMOVE_LINKS_ONLY","selectionType": "ALL",}',
  ],
};

let linkcollectorIds = [];

//TODO Add password functionality for archive extraction
const addLink = async function (link, folder, password) {
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
  let isLinkDead = await checkAvailability();
  console.log(isLinkDead)
  if (!isLinkDead) {
    logger.info("link is dead")
    return "offline";
  } else return await getLinkIds();
};

const getLinkIds = async function () {
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
async function startDownload() {
  await axios.get(url + "/linkcollector/startDownloads", {
    params: {
      params: [linkcollectorIds],
    },
  });
  startDl();
}

function startDl() {
  axios.post(url + "/downloadcontroller/start");
}

async function cleanUp(id) {
  await axios.get(
    url +
      `/downloadsV2/cleanup?linkIds=[${id}]&packageIds=[]&action=DELETE_FINISHED&mode=REMOVE_LINKS_ONLY&selectionType=ALL`
  );
}

async function getDlStatus(uuid) {
  let res = await axios.get(url + "/downloadsV2/queryLinks", {
    params: {
      params: [
        {
          bytesLoaded: true,
          bytesTotal: true,
          eta: true,
          finished: true,
          status: "",
        },
      ],
    },
  });

  return res.data.data.filter((title) => title.uuid === uuid);
}

async function checkAvailability() {
  let res = await axios.get(url + "/linkgrabberv2/queryLinks", {
    params: {
      myCrawledLinkQuery: {
        availability: true,
        bytesTotal: true,
        comment: true,
        enabled: true,
        host: true,
        jobUUIDs: [],
        maxResults: 10,
        packageUUIDs: [],
        password: true,
        priority: true,
        startAt: 0,
        status: true,
        url: true,
        variantID: true,
        variantIcon: true,
        variantName: true,
        variants: true,
      },
    },
  });
  console.log(res.data)
  return res.data.data[0].availability === "ONLINE" ? true : false;
  // EXAMPLE DATA
  /*   data: [
    {
      host: "rapidrar.com",
      name: "0j25wcxowyz8",
      availability: "OFFLINE",
      packageUUID: 1621172091883,
      uuid: 1621172091884,
      url: "https://rapidrar.com/0j25wcxowyz8",
      enabled: true,
    },
  ],
 */
}

const sleep = (milliseconds) => {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
};
module.exports = {
  addLink: addLink,
  getDlStatus: getDlStatus,
  sleep: sleep,
  cleanUp: cleanUp,
};
