'use strict'

var loginService = angular.module('loginService', ['ngResource'])

loginService.factory('LoginService', ['$resource', function(resource){

    return resource('', {}, {
        login: {
            url:apiHost+'/user/login',
            method: 'POST'
        },

       /* login_remote: {
            url:remoteApiHost+'/user/login',
		    method: 'POST'
	    },
        login_local: {
            url:apiHost+'/user/login',
            method: 'POST'
        },*/
	    getShopId: {
		    url:remoteApiHost+'/staff/:id',
		    params: {id: '@id'},
		    method: 'GET',
            headers: {
                'X-Auth-Token': localStorage.getItem('token')
            }
	    },
        getShopId_local: {
            url:apiHost+'/staff/:id',
            params: {id: '@id'},
            method: 'GET',
            headers: {
                'X-Auth-Token': localStorage.getItem('token')
            }
        },
        getShopInfo: {
            url:remoteApiHost+'/shop/:id',
            params: {id: '@id'},
            method: 'GET',
            headers: {
                'X-Auth-Token': localStorage.getItem('token')
            }
      }
  });
}]);


function _arrayBufferToBase64 (buffer) {
  var binary = ''
  var bytes = new Uint8Array(buffer)
  var len = bytes.byteLength

  for (var i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[ i ])
  }

  return window.btoa(binary)
}
