'use strict'

var lotteryModule = angular.module('lotteryModule', ['ngTable', 'checklist-model'])


  lotteryModule.controller('lotteryController', [ '$scope', '$location', 'shopInformationService','ngTableParams','$filter', '$routeParams','lotteryService',
  function ($scope, $location,shopInformationService,ngTableParams,$filter,$routeParams,lotteryService) {
    
          shopInformationService.list({},
            function (response) {
              if (response.code == 500) {
                alert('获取商户列表失败')
                return
              }
              $scope.ShopPayModule  = response.msg
            },
           function (error) {}
          )
         $scope.selectShop=function(selectedShopId){
            lotteryService.list({id:selectedShopId},
              function (response) {
                if (response.code == 500) {
                  alert('获取商户列表失败')
                  return
                }
                $scope.lotteryModule  = response.msg
                $scope.lottery1 = {id:'',
                                  levels:1,
                                  prize:"",
                                  quantity:'',
                                  shop_id:selectedShopId};
                $scope.lottery2 = {id:'',
                                  levels:2,
                                  prize:"",
                                  quantity:'',
                                  shop_id:selectedShopId};
                $scope.lottery3 = {id:'',
                                  levels:3,
                                  prize:"",
                                  quantity:'',
                                  shop_id:selectedShopId};
                $scope.lottery4 = {id:'',
                                  levels:4,
                                  prize:"",
                                  quantity:'',
                                  shop_id:selectedShopId};


                for(var i=0;i<$scope.lotteryModule.length;i++ ){
                   var level = $scope.lotteryModule[i].levels;

                   if($scope.lotteryModule[i].levels == 1){
                    $scope.lottery1 = $scope.lotteryModule[i];
                   }
                   if($scope.lotteryModule[i].levels == 2){
                    $scope.lottery2 = $scope.lotteryModule[i];
                   }
                   if($scope.lotteryModule[i].levels == 3){
                    $scope.lottery3 = $scope.lotteryModule[i];
                   }
                   if($scope.lotteryModule[i].levels == 4){
                    $scope.lottery4 = $scope.lotteryModule[i];
                   }                    
                }
              },
             function (error) {}
            )
          }  

            $scope.update=function(){
				var reg = /^([0]\d{0,0}|0)(\.\d{1,5})?$/;
				if(!reg.test($scope.lottery1.quantity)){
					alert("一等奖中奖概率格式不正确");
					return;
				}
				if(!reg.test($scope.lottery2.quantity)){
					alert("二等奖中奖概率格式不正确");
					return;
				}
				if(!reg.test($scope.lottery3.quantity)){
					alert("三等奖中奖概率格式不正确");
					return;
				}
				if(!reg.test($scope.lottery4.quantity)){
					alert("四等奖中奖概率格式不正确");
					return;
				}
				var sum = 4;
				var count = 0;
                if($scope.lottery1.id == ''){
                    lotteryService.create($scope.lottery1,
                      function(response){
                           if(response.code!=200){
                             $scope.warnMessage = response.msg;
                           }else{
							  count++
							  if(count==sum){
								  alert("修改成功")
							  }
                           }
                      })

                }else{
                    lotteryService.update($scope.lottery1,
                      function(response){
                           if(response.code!=200){
                             $scope.warnMessage = response.msg;
                           }else{
							  count++
							  if(count==sum){
								  alert("修改成功")
							  }
                           }
                    })                    
                }
                if($scope.lottery2.id == ''){
                    lotteryService.create($scope.lottery2,
                      function(response){
                           if(response.code!=200){
                             $scope.warnMessage = response.msg;
                           }else{
							  count++
							  if(count==sum){
								  alert("修改成功")
							  }
                           }
                      })

                }else{
                    lotteryService.update($scope.lottery2,
                      function(response){
                           if(response.code!=200){
                             $scope.warnMessage = response.msg;
                           }else{
							  count++
							  if(count==sum){
								  alert("修改成功")
							  }
                           }
                    })                    
                }
                if($scope.lottery3.id == ''){
                    lotteryService.create($scope.lottery3,
                      function(response){
                           if(response.code!=200){
                             $scope.warnMessage = response.msg;
                           }else{
							  count++
							  if(count==sum){
								  alert("修改成功")
							  }
                           }
                      })

                }else{
                    lotteryService.update($scope.lottery3,
                      function(response){
                           if(response.code!=200){
                             $scope.warnMessage = response.msg;
                           }else{
							  count++
							  if(count==sum){
								  alert("修改成功")
							  }
                           }
                    })                    
                }
                if($scope.lottery4.id == ''){
                    lotteryService.create($scope.lottery4,
                      function(response){
                           if(response.code!=200){
                             $scope.warnMessage = response.msg;
                           }else{
							  count++
							  if(count==sum){
								  alert("修改成功")
							  }
                           }
                      })

                }else{
                    lotteryService.update($scope.lottery4,
                      function(response){
                           if(response.code!=200){
                             $scope.warnMessage = response.msg;
                           }else{
							  count++
							  if(count==sum){
								  alert("修改成功")
							  }
                           }
                    })                    
                }

      }

}])


