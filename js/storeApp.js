'use strict'
//2
var apiHost ='http://127.0.0.1:8082/api';
//4
var remoteApiHost = 'http://127.0.0.1:8082/api';
//6
var storeApp = angular.module('storeApp',
    [
  'ngRoute',
  'ngResource',

  'navigatorModule',
  'navigatorService',

  'angular-md5',

  'platformAccountModule',
  'platformAccountService',

  'agentInformationModule',
  'agentInformationService',

  'agentPayModule',
  'agentPayService',

  'shopInformationModule',
  'shopInformationService',

  'shopPayModule',
  'shopPayService',

  'staffInformationModule',
  'staffInformationService',

  'bannerModule',
  'bannerService',

  'kitchenModule',
  'kitchenService',

  'lotteryModule',
  'lotteryService',

  'lotteryLogModule',
  'lotteryLogService',

  'memberInformationModule',
  'memberInformationService',

  'tableOperateModule',
  'tableOperateService',

  'dining_tableModule',
  'dining_tableService',
  
  'categoryModule',
  'categoryService',
  
  'productModule',
  'productService',
  
  'printerModule',
  'printerService',

  'orderLogModule',
  'orderLogService',

  'imageService',
  'dataUtilService',

  'syncService'


])

storeApp.run(function ($rootScope) {
    $rootScope.apiHost = apiHost;
    $rootScope.remoteApiHost = remoteApiHost;
})

storeApp.config(['$httpProvider','$provide',

    function ($httpProvider,$provide){

        $provide.decorator('$rootScope', ['$delegate', function($delegate){
            Object.defineProperty($delegate.constructor.prototype, '$onRootScope', {
                value: function(name, listener){

                 var unsubscribe = $delegate.$on(name, listener);

                 this.$on('$destroy', unsubscribe);

                 return unsubscribe;

              },

              enumerable: false
          });
          return $delegate;
      }]);

      $httpProvider.defaults.withCredentials = true;

      function myPromis (promise) {
          return promise.then(
              function (response) {
                  if (response.data && response.data.code && response.data.code == 401){
                  //console.log('需要登录')
                  window.location = './index.html'
                  }else if(response.data && response.data.code && response.data.code == 403) {
                      alert('权限不够')
                      return response
                  }else if (response.data && response.data.code && response.data.code == 500) {
                  //console.log(response.data.msg)
                      return response
                  }else if(response.data && response.data.code && response.data.code == 200) {
                      return response
                  } else {
                      return response
                  }
              },
              function (response) {
                  return $q.reject('服务器内部错误')
              }
          )
      }

    $httpProvider.responseInterceptors.push(function ($q) {
        return myPromis
    })
  } ])
