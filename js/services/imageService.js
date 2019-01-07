'use strict'

var imageService = angular.module('imageService', ['ngResource','angularFileUpload'])
imageService.factory('ImageService', function($timeout, $upload) {
  var fileReaderSupported = window.FileReader != null && window.FileAPI == null;
  return {
      generateThumb: function(file) {
        if (file != null) {
          if (fileReaderSupported && file.type.indexOf('image') > -1) {
            $timeout(function() {
              var fileReader = new FileReader();
              fileReader.readAsDataURL(file);
              fileReader.onload = function(e) {
                $timeout(function() {
                  file.dataUrl = e.target.result;
                });
              }
            });
          }
        }
      },

      uploadImageToServer: function(url, file) {
        return $upload.upload({
          url: apiHost+'/shop/'+localStorage.getItem('shop_id')+url,
          method: 'POST',
          headers: {
            'Content-Type': file.type,
            'X-Auth-Token': localStorage.getItem('token')
          },
          file: file
        })
      },
      uploadShopInfoCode: function(url, file) {
          return $upload.upload({
              url: apiHost+url,
              method: 'POST',
              headers: {
                  'Content-Type': file.type,
                  'X-Auth-Token': localStorage.getItem('token')
              },
              file: file
          })
      }
  };
});