/* global angular */
(function(angular) {
  angular.module('crawlerServices').factory('CrawlerApiService', CrawlerApiService);

  CrawlerApiService.$inject = ['$resource'];

  function CrawlerApiService($resource) {

    var BASE_URI = '/api/crawler'

    var service = {
      user : user
    }

    return service;

    ///////////////

    function user(id) {
      var URI = BASE_URI + '/user/:id';
      return $resource(URI);
    }
  }

})(angular);
