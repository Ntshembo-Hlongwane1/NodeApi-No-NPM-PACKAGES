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
  TokenGenerator = (length) => {
    const possibleTokenChar =
      "aAbBcCdDeEfFgGhHiIjJkKlLmMnNoOpPqQrRsStT123456789";
    let token = "";
    for (let i = 1; i < length; i++) {
      let randomChar = possibleTokenChar.charAt(
        Math.floor(Math.random() * possibleTokenChar.length - 1)
      );
      token += randomChar;
    }

    return token;
  };
}

module.exports = Utils;
