'use strict'

var staffInformationService = angular.module('staffInformationService', ['ngResource'])

staffInformationService.factory('staffInformationService', function ($resource) {
	return $resource(apiHost + '/staff/:id', {}, {
		list: {
			method: 'GET',
			url: apiHost+'/shop/'+localStorage.getItem('shop_id')+'/staff/list',
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
			url: apiHost+'/staff/:id/password',
			params: {id: '@id'},
			headers: {
				'X-Auth-Token': localStorage.getItem('token')
			}
		},
		update: {
			method: 'PUT',
			params: {id: '@id'},
			headers: {
				'X-Auth-Token': localStorage.getItem('token')
			}
		},
        saveById: {
            method: 'POST',
            url: remoteApiHost+'/staff',
            headers: {
                'X-Auth-Token': localStorage.getItem('token')
            }
        }
	})
})