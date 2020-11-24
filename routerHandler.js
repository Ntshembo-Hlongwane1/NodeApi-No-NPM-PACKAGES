const routerHandlers = {};
routerHandlers._users = {};
routerHandlers._tokens = {};
const libraries = require("./libs/data");
const Utils = require("./utils/utils");

routerHandlers.ping = (data, callback) => {
  callback(200, { name: "Server Alive And Kicking" });
};

routerHandlers.hello = (data, callback) => {
  callback(200, { msg: "Hello World check out our awesome server" });
};

routerHandlers.pageNotFound = (data, callback) => {
  callback(404);
};

routerHandlers.user = (data, callback) => {
  const acceptableMethods = ["GET", "POST", "PUT", "DELETE"];
  if (acceptableMethods.indexOf(data.requestMethod) > -1) {
    routerHandlers._users[data.requestMethod](data, callback);
  } else {
    callback(405, { Error: "Method not accepted" });
  }
};

routerHandlers._users.POST = (data, callback) => {
  const firstName =
    data.payload.firstName.trim().length > 0
      ? data.payload.firstName.trim()
      : false;
  const lastName =
    data.payload.lastName.trim().length > 0
      ? data.payload.lastName.trim()
      : false;
  const password =
    data.payload.password.trim().length > 0
      ? data.payload.password.trim()
      : false;
  const tosAgreement = data.payload.tosAgreement === true ? true : false;
  const phone =
    data.payload.phone.trim().length === 10 ? data.payload.phone.trim() : false;
  const lib = new libraries();
  const utils = new Utils();
  if (firstName && lastName && password && tosAgreement) {
    lib.readDataFile("user", phone, (error, data) => {
      if (error) {
        const hashedPassword = utils.Hash(password);

        if (hashedPassword) {
          const newUser = {
            firstName,
            lastName,
            phone,
            password: hashedPassword,
            tosAgreement: true,
          };

          lib.create("user", phone, newUser, (error) => {
            if (!error) {
              return callback(201, { msg: "User sucessfully created" });
            }
            return callback(400, { Error: "Failed to save new user" });
          });
        } else {
          return callback(400, { Error: "Failed to has your password" });
        }
      } else {
        return callback(400, {
          Error: "User with this phone number already exists",
        });
      }
    });
  } else {
    return callback(400, { Error: "All fields are required" });
  }
};
routerHandlers._users.GET = (data, callback) => {
  //We expect to get the phone from the queryString because this is a GET request not a post request.
  const libs = new libraries();
  if (data.queryStrings.phone === undefined) {
    callback(404, { Error: "User phone number not found" });
  } else {
    const phone =
      data.queryStrings.phone.trim().length === 10
        ? data.queryStrings.phone.trim()
        : false;
    const token = data.requestHeaders.token ? data.requestHeaders.token : false;

    if (phone) {
      libs.tokenVerifier(token, phone, (isTokenValid) => {
        if (isTokenValid) {
          libs.readDataFile("user", phone, (error, data) => {
            if (data) {
              delete data.password;
              return callback(200, data);
            } else {
              return callback(404, { Error: "User not found" });
            }
          });
        } else {
          callback(403, { Error: "Invalid headers" });
        }
      });
    } else {
      return callback(400, { Error: "Invalid user phone number" });
    }
  }
};
routerHandlers._users.DELETE = (data, callback) => {
  const libs = new libraries();
  if (data.queryStrings.phone === undefined) {
    callback(404, { Error: "User phone number not found" });
  } else {
    const phone =
      data.queryStrings.phone.trim().length === 10
        ? data.queryStrings.phone.trim()
        : false;
    const token = data.requestHeaders.token ? data.requestHeaders.token : false;

    if (phone) {
      libs.tokenVerifier(token, phone, (isTokenValid) => {
        if (isTokenValid) {
          libs.readDataFile("user", phone, (error, data) => {
            if (data) {
              libs.Delete("user", phone, (error) => {
                if (error) {
                  callback(500, { Error: "Error deleting user" });
                } else {
                  callback(200, { msg: "Succesfully deleted user" });
                }
              });
            } else {
              return callback(404, { Error: "User not found" });
            }
          });
        } else {
          callback(403, { Error: "Invalid Headers" });
        }
      });
    } else {
      return callback(400, { Error: "Invalid user phone number" });
    }
  }
};
routerHandlers._users.PUT = (data, callback) => {
  if (!data.payload) {
    callback(404, { Error: "Nothing to update" });
  } else {
    const phone =
      data.payload.phone.trim().length === 10
        ? data.payload.phone.trim()
        : false;
    const firstName =
      typeof data.payload.firstName === "string"
        ? data.payload.firstName.trim()
        : false;
    const lastName =
      typeof data.payload.lastName === "string"
        ? data.payload.lastName.trim()
        : false;

    const libs = new libraries();
    const token = data.requestHeaders.token ? data.requestHeaders.token : false;

    if (phone) {
      libs.tokenVerifier(token, phone, (isTokenValid) => {
        if (isTokenValid) {
          if (firstName || lastName) {
            libs.readDataFile("user", phone, (error, userData) => {
              if (userData) {
                if (firstName) {
                  userData.firstName = firstName;
                }

                if (lastName) {
                  userData.lastName = lastName;
                }

                libs.updateDataFile("user", phone, userData, (error) => {
                  if (error) {
                    callback(500, { Error: "Error updating user" });
                  } else {
                    callback(200, { msg: "Updated user data successfully" });
                  }
                });
              } else {
                callback(400, { Error: "No user data" });
              }
            });
          } else {
            callback(404, { Error: "No fields to update" });
          }
        } else {
          callback(403, { Error: "Invalid Headers" });
        }
      });
    } else {
      callback(404, { Error: "No user found" });
    }
  }
};

//===============================================Handlers for tokens====================================================

routerHandlers.token = (data, callback) => {
  const acceptableMethods = ["GET", "POST", "PUT", "DELETE"];
  if (acceptableMethods.indexOf(data.requestMethod) > -1) {
    routerHandlers._tokens[data.requestMethod](data, callback);
  } else {
    callback(405, { Error: "Method not accepted" });
  }
};

routerHandlers._tokens.POST = (data, callback) => {
  const password =
    data.payload.password.trim().length > 0
      ? data.payload.password.trim()
      : false;

  const phone =
    data.payload.phone.trim().length === 10 ? data.payload.phone.trim() : false;
  const libs = new libraries();
  const utils = new Utils();

  if (password && phone) {
    libs.readDataFile("user", phone, (error, userData) => {
      if (userData) {
        const hashedPassword = utils.Hash(password);

        if (hashedPassword !== userData.password) {
          callback(400, { Error: "Invalid credentials" });
        } else {
          const tokenID = utils.TokenGenerator(17);
          const tokenExpires = Date.now() + 60 * 60 * 1000;
          const tokenObject = {
            tokenID: tokenID,
            expires: tokenExpires,
            phone: phone,
          };

          libs.create("tokens", tokenID, tokenObject, (error) => {
            if (!error) {
              return callback(201, tokenObject);
            } else {
              callback(500, { Error: "Token could not be created" });
            }
          });
        }
      } else {
        callback(404, { Error: "User with this phone number was not found" });
      }
    });
  } else {
    callback(400, {
      Error: "All fields have to be filled in to create a token",
    });
  }
};

routerHandlers._tokens.GET = (data, callback) => {
  if (data.queryStrings.id === undefined) {
    callback(404, { Error: "User phone number not found" });
  } else {
    const id =
      data.queryStrings.id.trim().length === 17
        ? data.queryStrings.id.trim()
        : false;
    const libs = new libraries();
    console.log(id);
    if (id) {
      libs.readDataFile("tokens", id, (error, token) => {
        if (token) {
          return callback(200, token);
        } else {
          return callback(404, { Error: "User not found" });
        }
      });
    } else {
      return callback(400, { Error: "Invalid tokenID number" });
    }
  }
};

routerHandlers._tokens.PUT = (data, callback) => {
  const tokenID = data.payload.tokenID ? data.payload.tokenID : false;
  const extend = data.payload.extend === true ? true : false;
  const utils = new Utils();
  const libs = new libraries();
  if (tokenID && extend) {
    libs.readDataFile("tokens", tokenID, (error, tokenData) => {
      if (tokenData) {
        if (tokenData.expires > Date.now()) {
          tokenData.expires = Date.now() + 1000 * 60 * 60;

          libs.updateDataFile("tokens", tokenID, tokenData, (error) => {
            if (!error) {
              callback(200, { Error: "Token expiration extended" });
            } else {
              callback(500, { Error: "Failed to extend token" });
            }
          });
        } else {
          callback(400, { Error: "Token has already expired cannot extend" });
        }
      } else {
        callback(404, { Error: "No token with that ID" });
      }
    });
  } else {
    callback(400, { Error: "All fields are required" });
  }
};

routerHandlers._tokens.DELETE = (data, callback) => {
  if (data.queryStrings.id === undefined) {
    callback(404, { Error: "User phone number not found" });
  } else {
    const id =
      data.queryStrings.id.trim().length === 17
        ? data.queryStrings.id.trim()
        : false;

    const libs = new libraries();
    if (id) {
      libs.readDataFile("tokens", id, (error, data) => {
        if (data) {
          libs.Delete("tokens", id, (error) => {
            if (error) {
              callback(500, { Error: "Error deleting user" });
            } else {
              callback(200, { msg: "Succesfully deleted user" });
            }
          });
        } else {
          return callback(404, { Error: "User not found" });
        }
      });
    } else {
      return callback(400, { Error: "Invalid user token" });
    }
  }
};

module.exports = routerHandlers;
