'use strict'
function setActiveRouter(router_str) {
    $('#accordion').find('a[href="#'+router_str+'"] i').css('color','#26a2ff');
 }
var lotteryLogModule = angular.module('lotteryLogModule', ['ngTable', 'checklist-model'])

lotteryLogModule.controller('lotteryLogController', ['$scope', '$location', 'lotteryLogService', 'ngTableParams', '$filter',
function($scope, $location, lotteryLogService, ngTableParams, $filter) {

    $scope.listFilter = {};
    $scope.phone = '';
    $scope.isCash = '';
    $scope.list = [];
    $scope.initRouterActive=function(){
        setActiveRouter($location.$$path);
       }
    $scope.searchPhone = function() {
        if (!$scope.phone) return;
        lotteryLogService.list({
            id: $scope.phone
        }).$promise.then(function(response) {
            $scope.tableParams = new ngTableParams({
                page: 1,
                count: 25,
                sorting: {},
                filter: $scope.listFilter
            },
            {
                total: 0,
                getData: function($defer, params) {
                    var filteredData = $filter('filter')(response.msg, $scope.listFilter);
                    var sortedData = params.sorting() ? $filter('orderBy')(filteredData, params.orderBy()) : filteredData;

                    $scope.dataList = sortedData.slice((params.page() - 1) * params.count(), params.page() * params.count());
                    $scope.totalLength = sortedData.length; 
                    params.total(sortedData.length); 
                    $defer.resolve($scope.dataList);
                }
            }); 
            $scope.tableParams.settings().$scope = $scope;
            $scope.tableParams.reload();
        })
    }

    $scope.cash = function(lottery) {
        if (confirm("确定兑奖吗？")) {
            lottery.is_cash = 1;
            lotteryLogService.update(lottery,
            function(response) {
                if (!response == 200) {
                    alert("更新失败");
                } else {
                    $scope.searchPhone();
                }
            })
        }
    }

    $scope.delete = function(lottery) {
        if (confirm("确定删除该记录吗？")) {
            lotteryLogService.delete(lottery,
            function(response) {
                if (!response == 200) {
                    alert("删除失败");
                } else {
                    $scope.searchPhone();
                }
            })
        }
    }
}])

lotteryLogModule.controller('lotteryProductController',
    ['$scope', '$location', 'lotteryService', 'ngTableParams', '$filter','$window',
    function($scope, $location, lotteryService, ngTableParams, $filter,$window
        ) {

        var selectedShopId = localStorage.getItem('shop_id');
      $scope.lottery1 = {
                id: '',
                levels: 1,
                prize: "",
                quantity: 0,
                shop_id: selectedShopId
            };
            $scope.lottery2 = {
                id: '',
                levels: 2,
                prize: "",
                quantity: 0,
                shop_id: selectedShopId
            };
            $scope.lottery3 = {
                id: '',
                levels: 3,
                prize: "",
                quantity: 0,
                shop_id: selectedShopId
            };
            $scope.lottery4 = {
                id: '',
                levels: 4,
                prize: "",
                quantity: 0,
                shop_id: selectedShopId
            };
        lotteryService.list(
            {
                id: selectedShopId
            },
            function(response) {
                console.log("response")
                console.log(response)
                if (response.code == 500||response.msg.length<1) {
                    alert('获取奖品列表失败或空!') 
                    return
                }
                $scope.lotteryModule = response.msg; 
              
                for (var i = 0; i < $scope.lotteryModule.length; i++) {
                    var level = $scope.lotteryModule[i].levels;

                    if ($scope.lotteryModule[i].levels == 1) {
                        $scope.lottery1 = $scope.lotteryModule[i];
                    }
                    if ($scope.lotteryModule[i].levels == 2) {
                        $scope.lottery2 = $scope.lotteryModule[i];
                    }
                    if ($scope.lotteryModule[i].levels == 3) {
                        $scope.lottery3 = $scope.lotteryModule[i];
                    }
                    if ($scope.lotteryModule[i].levels == 4) {
                        $scope.lottery4 = $scope.lotteryModule[i];
                    }
                }
            },
            function(error) {}
        ); 

        $scope.update = function() {

            var sum = 4;
            var count = 0;
            if ($scope.lottery1.id == '') {

              //  $scope.lottery1.sync_status = syncStatus + 1;

                lotteryService.create(
                    $scope.lottery1,
                    function(response) {
                        if (response.code != 200) {
                            $scope.warnMessage = response.msg;
                        } else {
                            count++
                            if (count == sum) {
                                alert("修改成功")
                            }
                        }
                    }
                )
            } else {
                //if ($scope.lottery1.sync_status != syncStatus + 1) {
              //      $scope.lottery1.sync_status = syncStatus + 2;
              //  }
                lotteryService.update($scope.lottery1,
                function(response) {
                    if (response.code != 200) {
                        $scope.warnMessage = response.msg;
                    } else {
                        count++
                        if (count == sum) {
                            alert("修改成功")
                        }
                    }                  
                })
            }
            if ($scope.lottery2.id == '') {
                //$scope.lottery2.sync_status = syncStatus + 1;
                lotteryService.create($scope.lottery2,
                function(response) {
                    if (response.code != 200) {
                        $scope.warnMessage = response.msg;
                    } else {
                        count++
                        if (count == sum) {
                            alert("修改成功")
                        }
                    }              
                })
            } else {

             //   if ($scope.lottery2.sync_status != syncStatus + 1) {
             //      $scope.lottery2.sync_status = syncStatus + 2;
              //  }
                lotteryService.update($scope.lottery2,
                function(response) {
                    if (response.code != 200) {
                        $scope.warnMessage = response.msg;
                    } else {
                        count++
                        if (count == sum) {
                            alert("修改成功")
                        }
                    }
                })
            }
            if ($scope.lottery3.id == '') {
              //  $scope.lottery3.sync_status = syncStatus + 1;

                lotteryService.create($scope.lottery3,
                function(response) {
                    if (response.code != 200) {
                        $scope.warnMessage = response.msg;
                    } else {
                        count++
                        if (count == sum) {
                            alert("修改成功")
                        }
                    }
                })
            } else {
              //  if ($scope.lottery3.sync_status != syncStatus + 1) {
            //        $scope.lottery3.sync_status = syncStatus + 2;
             //   }
                lotteryService.update($scope.lottery3,
                function(response) {
                    if (response.code != 200) {
                        $scope.warnMessage = response.msg;
                    } else {
                        count++
                        if (count == sum) {
                            alert("修改成功")
                        }
                    }
                }

                )
            }
            if ($scope.lottery4.id == '') {
               // $scope.lottery4.sync_status = syncStatus + 1;
                lotteryService.create($scope.lottery4,
                function(response) {
                    if (response.code != 200) {
                        $scope.warnMessage = response.msg;
                    } else {
                        count++
                        if (count == sum) {
                            alert("修改成功")
                        }
                    }
                })

            } else {
             //   if ($scope.lottery4.sync_status != syncStatus + 1) {
          //          $scope.lottery4.sync_status = syncStatus + 2;
             //   }
                lotteryService.update($scope.lottery4,
                function(response) {
                    if (response.code != 200) {
                        $scope.warnMessage = response.msg;
                    } else {
                        count++
                        if (count == sum) {
                            alert("修改成功")
                        }
                    }              
                })
            }
           // $window.location.reload();
    }

}])