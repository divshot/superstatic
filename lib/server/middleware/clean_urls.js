var path = require('path');
var qs = require('querystring');
var url = require('url');

module.exports = function (settings) {
  return function (req, res, next) {
    if (!req.config) return next();

    var pathname = url.parse(req.url).pathname;
    var root = req.config.root || settings.configuration.root || './';
    var filePath = path.join('/', root, pathname + '.html');

    if (req.config.spa) req.config.clean_urls = true;
    if (!req.config.clean_urls || pathname === '/') return next();
    if (isHtml(pathname)) return redirectAsCleanUrl(req, res);
    if (!isCleanUrl(pathname, settings)) return next();

    res.send(filePath);
  };
};

function redirectAsCleanUrl (req, res) {
  var pathname = url.parse(req.url).pathname;
  var query = qs.stringify(req.query);

  var redirectUrl = (isDirectoryIndexFile(pathname, req.config.index))
    ? path.dirname(pathname)
    : path.join('/', path.dirname(pathname), path.basename(pathname.split('?')[0], '.html'));

  redirectUrl += (query) ? '?' + query : '';
  res.writeHead(301, { Location: redirectUrl });
  res.end();
}

function isDirectoryIndexFile (pathname, index) {
  return (pathname.split('/')[pathname.split('/').length - 1]) === index;
}

function isHtml (pathname) {
  return path.extname(pathname.split('?')[0]) === '.html';
}

function isCleanUrl (pathname, settings) {
  return settings.isFile(settings.rootPathname(pathname) + '.html');
}
