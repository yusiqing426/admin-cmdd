'use strict'

var agentInformationService = angular.module('agentInformationService', ['ngResource'])

agentInformationService.factory('agentInformationService', function ($resource) {
	return $resource(apiHost + '/agent/:id', {}, {
		list: {
			method: 'GET',
			url: apiHost+'/agent/list',
			headers: {
				'X-Auth-Token': localStorage.getItem('token')
			}
		},
		view: {
			method: 'GET',
			params: {id: '@id'},
			headers: {
				'X-Auth-Token': localStorage.getItem('token')
			}
		},
		create: {
			method: 'POST',
			headers: {
				'X-Auth-Token': localStorage.getItem('token')
			}
		},
		delete: {
			method: 'DELETE',
			headers: {
				'X-Auth-Token': localStorage.getItem('token')
			}
		},
		changePassword: {
			method: 'PUT',
			url: apiHost + '/agent/'+localStorage.getItem('id')+'/password',
			headers: {'X-Auth-Token': localStorage.getItem('token')},
		},
		/*resetPassword: {
			method: 'PUT',
			url: apiHost+'/agent/:id/resetPassword',
			params: {id: '@id'},
			headers: {
				'X-Auth-Token': localStorage.getItem('token')
			}
		},*/
		update: {
			method: 'PUT',
			params: {id: '@id'},
			headers: {
				'X-Auth-Token': localStorage.getItem('token')
			}
		}		
	})
})