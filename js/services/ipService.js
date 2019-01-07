'use strict'

var ipService = angular.module('ipService', ['ngResource'])

ipService.factory('ipService', function ($resource) {
	return $resource(apiHost + '/version', {}, {
		//remote
        saveById_remote: {
			method: 'POST',
			url: remoteApiHost+'/ip/saveById',
			params:{version:'@version'},
			headers: {
				'X-Auth-Token': localStorage.getItem('token')
			}
		},
		//local
        checkAndSet_local: {
            method: 'GET',
            url: "http://47.94.101.5:8082/api/ip/checkAndSet/shop/:id",
			params:{id:"@id"},
            headers: {
                'X-Auth-Token': localStorage.getItem('token')
            }
        }

	})
})