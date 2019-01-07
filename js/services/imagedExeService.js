'use strict'

var imagedExeService = angular.module('imagedExeService', ['ngResource'])

imagedExeService.factory('imagedExeService', function ($resource) {
	return $resource( apiHost + '/version',{}, {
        startUpImagedExe: {
			method: 'GET',
			url: apiHost+'/startUpImagedExe',
			headers: {
				'X-Auth-Token': localStorage.getItem('token')
			}
		}
	})
})