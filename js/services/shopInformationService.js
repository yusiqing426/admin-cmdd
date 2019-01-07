'use strict'


var shopInformationService = angular.module('shopInformationService', ['ngResource'])

shopInformationService.factory('shopInformationService', function ($resource) {
  
    return $resource(apiHost + '/shop/:id', {}, {
    
        list:{
            method:'GET',
                  url:apiHost+'/agent/'+localStorage.getItem('id')+'/shop/list',
                  isArray: false,
                  headers: {
                    'X-Auth-Token': localStorage.getItem('token')
                  }
          },
        view: {
          method: 'GET',
          params: {id: '@id'},
          isArray: false,
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

        update: {
                method: 'PUT',
                params: {id: '@id'},
                headers: {
                    'X-Auth-Token': localStorage.getItem('token')
                }
    },


        changePassword: {
          method: 'PUT',
          url: apiHost + '/shop/'+localStorage.getItem('id')+'/password',
          headers: {'X-Auth-Token': localStorage.getItem('token')},
        },

        //shop/{id}/banner/list /shop/{id}/banner/list
        queryBannerByShopId: {
            method: 'GET',
            url: remoteApiHost + '/shop/'+localStorage.getItem('id')+'/banner/list',
            headers: {'X-Auth-Token': localStorage.getItem('token')},
        },

        syncList_remote:{
            method:'GET',
            url:remoteApiHost+/shop/+localStorage.getItem('id')+'/sync',
              headers: {
                  'X-Auth-Token': localStorage.getItem('token')
              }
            },
            saveById:{
                method: 'POST',
                url:apiHost+'/shop/id',
                headers: {
                    'X-Auth-Token': localStorage.getItem('token')
                }
            },
        saveById_remote:{
            method: 'POST',
            url:remoteApiHost+'/shop/id',
            headers: {
                'X-Auth-Token': localStorage.getItem('token')
            }
        },
            update_remote: {
              method: 'PUT',
              params: {id: '@id'},
              url:remoteApiHost+'/shop/:id',
              headers: {
                  'X-Auth-Token': localStorage.getItem('token')
            }
        }
    })
})
