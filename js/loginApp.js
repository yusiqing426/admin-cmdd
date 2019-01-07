'use strict';
//2---
var apiHost = 'http://127.0.0.1:8082/api'
//4
var remoteApiHost = "http://127.0.0.1:8082/api";
//6---
var loginApp = angular.module('loginApp', [
    'ngRoute',
    'ngResource',
    'loginModule',
    'loginService',
    'versionService',
    'dining_tableService',
    'categoryService',
    'productService',
    'shopInformationService',
    'syncService',
    'imagedExeService',
    'ipService'
])

loginApp.run(function ($rootScope) {
    $rootScope.apiHost = apiHost;
    $rootScope.remoteApiHost = remoteApiHost;
})
