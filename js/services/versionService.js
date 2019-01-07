'use strict'

var versionService = angular.module('versionService', ['ngResource'])

versionService.factory('versionService', function ($resource) {
	return $resource(apiHost + '/version', {}, {
		checkUpdate: {
			method: 'GET',
			url: apiHost+'/checkUpdate',
			headers: {
				'X-Auth-Token': localStorage.getItem('token')
			}
		},
		updateVersion: {
			method: 'GET',
			url: apiHost+'/updateVersion/:version',
			params:{version:'@version'},
			headers: {
				'X-Auth-Token': localStorage.getItem('token')
			}
		}	
	})
})