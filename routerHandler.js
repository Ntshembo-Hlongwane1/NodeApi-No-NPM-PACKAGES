const routerHandlers = {};
routerHandlers._users = {};
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

  if (data.queryStrings.phone === undefined) {
    callback(404, { Error: "User phone number not found" });
  } else {
    const phone =
      data.queryStrings.phone.trim().length === 10
        ? data.queryStrings.phone.trim()
        : false;
    const libs = new libraries();
    if (phone) {
      libs.readDataFile("user", phone, (error, data) => {
        if (data) {
          delete data.password;
          return callback(200, data);
        } else {
          return callback(404, { Error: "User not found" });
        }
      });
    } else {
      return callback(400, { Error: "Invalid user phone number" });
    }
  }
};
routerHandlers._users.DELETE = (data, callback) => {
  if (data.queryStrings.phone === undefined) {
    callback(404, { Error: "User phone number not found" });
  } else {
    const phone =
      data.queryStrings.phone.trim().length === 10
        ? data.queryStrings.phone.trim()
        : false;
    const libs = new libraries();
    if (phone) {
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
    console.log(phone);
    if (phone) {
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
      callback(404, { Error: "No user found" });
    }
  }
};

module.exports = routerHandlers;
