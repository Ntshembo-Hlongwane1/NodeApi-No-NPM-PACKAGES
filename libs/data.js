const fs = require("fs");
const path = require("path");
const Utils = require("../utils/utils");
class libraries {
  create = (dir, file, data, callback) => {
    const dataDirectory = this.dataDirectory();

    fs.open(
      dataDirectory + dir + "/" + file + ".json",
      "wx",
      (error, descriptor) => {
        if (!error && descriptor) {
          const receivedData = JSON.stringify(data);

          fs.writeFileSync(descriptor, receivedData, (error) => {
            if (!error) {
              fs.close(descriptor, (error) => {
                if (!error) {
                  callback(false);
                } else {
                  callback("Error closing new file");
                }
              });
            } else {
              callback("Error writing in new file");
            }
          });
        } else {
          callback("Could not create new file could already exist");
        }
      }
    );
  };

  readDataFile = (dir, file, callback) => {
    const dataDirectory = this.dataDirectory();
    const utils = new Utils();
    fs.readFile(
      dataDirectory + dir + "/" + file + ".json",
      "utf-8",
      (error, data) => {
        if (!error && data) {
          const parsedData = utils.BodyParser(data);

          callback(200, parsedData);
        } else {
          callback(400, data);
        }
      }
    );
  };

  updateDataFile = (dir, file, data, callback) => {
    const dataDirectory = this.dataDirectory();

    fs.open(
      dataDirectory + dir + "/" + file + ".json",
      "r+",
      (error, descriptor) => {
        if (!error) {
          const receivedData = JSON.stringify(data);

          fs.ftruncate(descriptor, (error) => {
            if (!error) {
              fs.writeFile(descriptor, receivedData, (error) => {
                if (!error) {
                  fs.close(descriptor, (error) => {
                    if (!error) {
                      callback(false);
                    } else {
                      console.log("Error closing file");
                    }
                  });
                } else {
                  console.log("Error wrinting to FIle");
                }
              });
            } else {
              callback("Error truncating FIle");
            }
          });
        } else {
          callback("Error opening File to edit");
        }
      }
    );
  };

  Delete = (dir, file, callback) => {
    const dataDirectory = this.dataDirectory();

    fs.unlink(dataDirectory + dir + "/" + file + ".json", (error) => {
      if (!error) {
        callback(false);
      } else {
        callback("Error deleting file");
      }
    });
  };

  dataDirectory = () => {
    return path.join(__dirname, "../.data/");
  };

  tokenVerifier = (tokenID, phone, callback) => {
    this.readDataFile("tokens", tokenID, (error, tokenData) => {
      if (tokenData) {
        if (tokenData.id === tokenID && tokenData.expires > Date.now()) {
          callback(true);
        } else {
          callback(false);
        }
      } else {
        callback(false);
      }
    });
  };
}

module.exports = libraries;
