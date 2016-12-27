function handleMessage(api, data) {
  const matchers = api.matchers || [];
  const text = data.text;

  matchers.forEach(function(matcher) {
    if (matcher.regex.test(text)) {
      console.log(matcher.description, ':', text);
      matcher.handler(api, data);
    }
  });
}

module.exports = handleMessage;
