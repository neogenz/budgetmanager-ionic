(function init() {
  'use strict';

  neogenz.utilities.defineNamespace(budgetManager, 'config');
  neogenz.utilities.defineNamespace(budgetManager, 'endpoints');

  budgetManager.config.webApi = (function () {
    var _subdomain = 'budgetmanager',
    _domain = 'localhost',//'mdesogus.com',
    _port = '3000', //80
    _protocol = 'http',
    _baseUrl = _protocol + '://' + _domain;
    return {
      subdomain: _subdomain,
      domain: _domain,
      port: _port, //80
      protocol: _protocol,
      baseUrl: _baseUrl
    };
  })();

  budgetManager.endpoints = {
    nodeEndpoint: budgetManager.config.webApi.protocol + '://' +
    budgetManager.config.webApi.subdomain + '.' +
    budgetManager.config.webApi.domain + ':' +
    budgetManager.config.webApi.port
  };
})();
