'use strict'

var navigatorService = angular.module('navigatorService', [])

navigatorService.factory('Login', function () {
  return {

    nowKey: function () {
        return localStorage.getItem('now_keys')
    },
	userKey: function () {
		var user_keys = localStorage.getItem('user_keys');
        var strs = new Array(); //定义一数组
        strs = user_keys.split(","); //字符分割 
		return strs
	},
   
    authModules: function () {
      return localStorage.getItem('now_keys')
    }
    
  }
})
