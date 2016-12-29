function handleMessage(api, data, log = true) {
  const matchers = api.matchers || [];
  const text = data.text;

  matchers.forEach(function (matcher) {
    if (matcher.regex.test(text)) {
      if (log) {
        console.log(`Matched "${matcher.description}" (${matcher.regex}) in "${text}"`);
      }
      matcher.handler(api, data);
    }
  });
}

module.exports = handleMessage;
