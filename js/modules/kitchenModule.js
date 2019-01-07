'use strict'

var kitchenModule = angular.module('kitchenModule', ['ngTable', 'ui.bootstrap'])

kitchenModule.controller('kitchenListController', ['$scope', '$location', 'kitchenService', 'ngTableParams', '$filter', 'shopInformationService',
function($scope, $location, kitchenService, ngTableParams, $filter, shopInformationService) {

    $scope.listFilter = {};

    kitchenService.list().$promise.then(function(response) {
        $scope.tableParams = new ngTableParams({
            page: 1,
            count: 25,
            sorting: {},
            filter: $scope.listFilter
        },
        {
            total: 0,
            getData: function($defer, params) {
                for (var i = 0; i < response.msg.length; i++) {
                    response.msg[i].dataUrl = apiHost + '/image/' + response.msg[i].logo_id;
                }
                var filteredData = $filter('filter')(response.msg, $scope.listFilter);
                var sortedData = params.sorting() ? $filter('orderBy')(filteredData, params.orderBy()) : filteredData;

                $scope.dataList = sortedData.slice((params.page() - 1) * params.count(), params.page() * params.count()); 
                $scope.totalLength = sortedData.length; 
                params.total(sortedData.length); 
                $defer.resolve($scope.dataList);
            }
        })
    })

    $scope.delete = function(kitchen) {
        if (confirm("确认删除该后厨？")) {
            kitchenService.delete({
                id: kitchen.id
            },
            function(response) {
                if (response && response.code == 500) {
                    alert(response.msg) 
                    return
                } else {
                    alert("删除成功") 
                    location.reload()
                }
            },
            function(err) {
                location.reload()
            })
        }
    }

}])

kitchenModule.controller('kitchenCreateController', ['$scope', '$location', 'ImageService', 'kitchenService', 'DataUtilService',
function($scope, $location, ImageService, kitchenService, DataUtilService) {

    var imageChanged = false;
    $scope.warnMessage = "";

    $scope.addImage = function(files) {

        ImageService.generateThumb(files[0]); 
        $scope.imageFile = files[0]

    }

    $scope.kitchen = {};

    var createkitchen = function(image_id) {
        $scope.kitchen.logo_id = image_id;
        $scope.kitchen.shop_id = localStorage.getItem('id');

        kitchenService.create($scope.kitchen,
        function(response) {
            if (response && response.code == 500) {
                alert(response.msg); 
                return;
            } else {
                alert("创建成功") 
                $location.path('/kitchenDataentry/kitchen');
            }
        })
    }

    $scope.create = function() {

       // $scope.kitchen.sync_status = syncStatus + 1;

        if ($scope.imageFile == null) {
            createkitchen(0);
        }

        ImageService.uploadImageToServer('/image', $scope.imageFile).then(function(ress) {
            var kitchen_id = ress.data.msg.image_id;
            createkitchen(kitchen_id);
        })
    }
}])

kitchenModule.controller('kitchenController', ['$scope', '$location', 'ImageService', 'kitchenService', '$routeParams',
function($scope, $location, ImageService, kitchenService, $routeParams) {

    var imageChanged = false;
    var kitchenId = $routeParams.id;

    kitchenService.view({
        id: kitchenId
    },
    function(response) {
        $scope.kitchen = response.msg
        var img = {
            'dataUrl': apiHost + '/image/' + $scope.kitchen.logo_id
        }
        $scope.imageFile = img
    });

    $scope.addImage = function(files) {
        ImageService.generateThumb(files[0]);
        $scope.imageFile = files[0];
        imageChanged = true;
    }

    var updatekitchen = function() {

        kitchenService.update(
          $scope.kitchen,
        function(response) {
          console.log(response)
            if (response.code!=200) {
                alert(response.msg);
                return;
            }
            $location.path('/kitchenDataentry/kitchen');           
        },
        function(error) {
            alert(JSON.stringify(error))
        })
    }

    $scope.update = function() {

       /* if ($scope.kitchen.sync_status != syncStatus + 1) {
            $scope.kitchen.sync_status = syncStatus + 2;
        }*/

        if ($scope.imageFile == null || imageChanged == false) {
            updatekitchen();
        }

        ImageService.uploadImageToServer('/image?id=' + $scope.kitchen.logo_id, $scope.imageFile).then(function(ress) {
            updatekitchen();
          }
        )

    }
    $scope.delete = function() {
        if (confirm("确认删除该后厨？")) {
            kitchenService.delete({
                id: $routeParams.id
            },
            function(response) {
                if (response && response.code == 500) {
                    alert(response.msg); 
                    return
                } else {
                    alert("删除成功"); 
                    $location.path('/kitchenDataentry/kitchen')
                }
            },
            function(err) {
                $location.path('/kitchenDataentry/kitchen')
            })
        }
    }
}])