const axios = require("axios");
const log = require("../logger");
const url = process.env.JDOWNLOADER;
const myLinkQuery = { params: ['{"maxResults":20,"startAt":0}'] };
const myDeleteQuery = {
  params: [
    '{"linkIds": [],"packageIds": [],"action": "DELETE_FINISHED","mode": "REMOVE_LINKS_ONLY","selectionType": "ALL",}',
  ],
};

let linkcollectorIds = [];

class JDownloader {
  constructor(ctx) {
    this.ctx = ctx;
  }
  //TODO Add password functionality for archive extraction
  async addLink(links, folder, password) {
    try {
      await axios.get(url + "/linkgrabberv2/addLinks", {
        params: {
          myAddLinksQuery: [
            {
              assignJobID: null,
              autoExtract: null,
              autostart: null,
              dataURLs: [],
              deepDecrypt: null,
              destinationFolder: folder,
              downloadPassword: password,
              extractPassword: "",
              links: links.text,
              overwritePackagizerRules: null,
              packageName: "",
              priority: "HIGH",
              sourceUrl: "",
            },
          ],
        },
      });
    } catch (err) {
      //TODO return a different error if jdownloader is not reachable
      log.error(`Add links failed: ${err}`);
      return "offline";
    }
    await this.sleep(3000);
    let isLinkDead = await this.checkAvailability();
    if (!isLinkDead) {
      log.error("link is dead");
      return "dead";
    } else return await this.getLinkIds();
  }

  async getLinkIds() {
    let res = null;
    try {
      res = await axios.get(url + "/linkcollector/queryLinks", {
        params: {
          myLinkQuery,
        },
      });
      res.data.data.forEach((element) => {
        linkcollectorIds.push(element.uuid);
      });
      this.startDownload();
      return res.data.data[0];
    } catch (err) {
      log.error(`Get link Ids failed: ${err}`);
      return "offline";
    }
  }

  async startDownload() {
    try {
      await axios.get(url + "/linkcollector/startDownloads", {
        params: {
          params: [linkcollectorIds],
        },
      });
      this.startDl();
    } catch (err) {
      log.error(`start download failed: ${err}`);
      this.ctx.reply(`start download failed: ${err}`);
    }
  }

  startDl() {
    axios.post(url + "/downloadcontroller/start");
  }

  async cleanUp(id) {
    await axios.get(
      url +
        `/downloadsV2/cleanup?linkIds=[${id}]&packageIds=[]&action=DELETE_FINISHED&mode=REMOVE_LINKS_ONLY&selectionType=ALL`
    );
  }

  //TODO replace /queryLinks with /queryPackages
  async getDlStatus(uuid) {
    try {
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
    } catch (error) {
      log.error(err);
    }
  }

  async checkAvailability() {
    let res = null;
    try {
      res = await axios.get(url + "/linkgrabberv2/queryLinks", {
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
      return res.data.data[0].availability === "ONLINE" ? true : false;
    } catch (err) {
      log.error(`Check link failed: ${err}`);
      return false;
    }
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

  sleep(milliseconds) {
    return new Promise((resolve) => setTimeout(resolve, milliseconds));
  }
}

module.exports = JDownloader;
