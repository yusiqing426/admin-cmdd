'use strict'

loginApp.config(['$routeProvider',
  function ($routeProvider) {
    $routeProvider.
      when('/login', {
        templateUrl: 'templates/login/login.html',
        controller: 'loginController'
      }).
      when('/forget-password', {
        templateUrl: 'templates/login/forget-password.html',
        controller: 'forgetPasswordController'
      }).
      when('/mail-reset-password-link-success', {
        templateUrl: 'templates/login/mail-reset-password-link-success.html'
      }).
      when('/set-password', {
        templateUrl: 'templates/login/set-password.html',
        controller: 'setPasswordController'
      }).
      when('/set-password-success', {
        templateUrl: 'templates/login/set-password-success.html'
      }).
      when('/set-password-fail', {
        templateUrl: 'templates/login/set-password-fail.html'
      }).
      otherwise({
        templateUrl: 'templates/login/login.html',
        controller: 'loginController'
      })
      //.
      //otherwise({
      //  templateUrl: 'templates/welcome.html'
      //})
  }
])
