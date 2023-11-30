export function readValue(item, propertyName) {
  let res = [];

  if (!item.hasOwnProperty(propertyName)) {
    return res;
  }

  if (item.hasOwnProperty(propertyName)) {
    if (Array.isArray(item[propertyName])) {
      item[propertyName].forEach((item) => {
        if (typeof item === "string") {
          res.push(item);
        } else {
          if (item.hasOwnProperty("name")) {
            if (Array.isArray(item["name"])) {
              item["name"].forEach((name) => {
                if (name.hasOwnProperty("@value")) {
                  res.push(name["@value"]);
                }
              });
            } else {
              if (item["name"].hasOwnProperty("@value")) {
                res.push(item["name"]["@value"]);
              }
            }
          } else if (item.hasOwnProperty("@value")) {
            res.push(item["@value"]);
          } else if (item.hasOwnProperty("@id")) {
            res.push(item["@id"]);
          }
        }
      });
    } else {
      res.push(item[propertyName]);
    }
  }
  return res;
}

export function isUrl(str) {
  var urlPattern =
    /^(https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|www\.[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9]+\.[^\s]{2,}|www\.[a-zA-Z0-9]+\.[^\s]{2,})$/gi;
  var urlRegex = new RegExp(urlPattern);
  return urlRegex.test(str);
}

// Remove leading '@' or '_'
// Split camelCase and capitalize first letter
export function getLabelDisplay(label) {
  if (label.startsWith("@") || label.startsWith("_")) {
    label = label.substring(1);
  }

  return label.replace(/([A-Z])/g, " $1").replace(/^./, function (str) {
    return str.toUpperCase();
  });
}
