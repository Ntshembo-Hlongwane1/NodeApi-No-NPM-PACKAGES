const crypto = require("crypto");
const _env = require("./environmentVariables");
class Utils {
  Hash = (password) => {
    if (password.lenghth < 5) {
      return false;
    }

    const hash = crypto
      .createHmac("sha256", _env.hashSecrete)
      .update(password)
      .digest("hex");

    return hash;
  };

  BodyParser = (payload) => {
    return JSON.parse(payload);
  };
}

module.exports = Utils;
