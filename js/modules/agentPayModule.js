'use strict'

var agentPayModule = angular.module('agentPayModule', ['ngTable', 'checklist-model'])

agentPayModule.controller('agentPayListController', [ '$scope','$location','agentPayService', 'ngTableParams', '$filter',
  function ($scope,$location, agentPayService,ngTableParams, $filter) {
    
          $scope.listFilter = {};
		  $scope.AgentId1 = "";
          agentPayService.agentList({},
            function (response) {
              if (response.code == 500) {
                alert('获取缴费列表失败')
                return
              }
              $scope.AgentModule  = response.msg
            },
           function (error) {}
          )
         
          $scope.selectAgent=function(){
       
			  if($scope.AgentId1==""||$scope.AgentId1==null){
				  $scope.listFilter = {};
			  }else{
				  $scope.listFilter.agent_id = $scope.AgentId1;
			  }
			getAgentPayList();
          }

	var getAgentPayList = function(){
      agentPayService.list().$promise.then(function (response) {
        $scope.tableParams = new ngTableParams({
            page: 1,
            count: 25,
            sorting: {},
            filter: $scope.listFilter
          }, {
          total: 0,
          getData: function ($defer, params) {
            var filteredData = $filter('filter')(response.msg, $scope.listFilter);
            var sortedData = params.sorting() ? $filter('orderBy')(filteredData, params.orderBy()) : filteredData;

            $scope.dataList = sortedData.slice((params.page() - 1) * params.count(), params.page() * params.count())
            $scope.totalLength = sortedData.length
            params.total(sortedData.length)
            $defer.resolve($scope.dataList)
          }
        })
		$scope.tableParams.settings().$scope = $scope;
		$scope.tableParams.reload();
      })
	}
	getAgentPayList();
  }])    

agentPayModule.controller('agentPayHistoryController', [ '$scope','$location','agentPayService', 'ngTableParams', '$filter',
  function ($scope,$location, agentPayService,ngTableParams, $filter) {
    
        $scope.listFilter = {};
  
        agentPayService.agentList({},
            function (response) {
              if (response.code == 500) {
                alert('获取缴费列表失败')
                return
              }
              $scope.AgentModule  = response.msg
            },
           function (error) {}
          )

        $scope.selectAgent = function(){
			if(!$scope.selectedAgentId)
				return;
			agentPayService.agentPaylist({id: $scope.selectedAgentId}).$promise.then(function (response) {
				$scope.tableParams = new ngTableParams({
					page: 1,
					count: 25,
					sorting: {},
					filter: $scope.listFilter
				}, {
					total: 0,
					getData: function ($defer, params) {
						var filteredData = $filter('filter')(response.msg, $scope.listFilter);
						var sortedData = params.sorting() ? $filter('orderBy')(filteredData, params.orderBy()) : filteredData;

						$scope.dataList = sortedData.slice((params.page() - 1) * params.count(), params.page() * params.count())
						$scope.totalLength = sortedData.length
						params.total(sortedData.length)
						$defer.resolve($scope.dataList)

					}
				})
				$scope.tableParams.settings().$scope = $scope;
				$scope.tableParams.reload();

			})
        }

  }])    

agentPayModule.controller('agentPayCreateController', [ '$scope', '$location', 'agentPayService','DataUtilService',
  function ($scope, $location, agentPayService,DataUtilService) {

  $scope.MaleOrFemale = DataUtilService.MaleOrFemale;
  $scope.OpenOrClose = DataUtilService.OpenOrClose;

  $scope.warnMessage = "";
    $scope.create = function () {
      $scope.agent.agent_id = localStorage.getItem('id');
      $scope.agent.user_key = "2";
       agentPayService.create($scope.agent,
         function(response){
               if(!response==200){
                 //alert("创建失败")
                 $scope.warnMessage = response.msg;
               }else{
                $location.path('/agentDataentry/agentPay')
               }
          }
       )
    }
  }])





  agentPayModule.controller('agentPayController', [ '$scope', '$location', 'agentPayService', '$routeParams','DataUtilService',
  function ($scope, $location, agentPayService, $routeParams,DataUtilService) {
    $scope.YesNoModel = DataUtilService.YesNoModel;
    $scope.OpenOrClose = DataUtilService.OpenOrClose;
    $scope.YesOrNo = DataUtilService.YesOrNo;

    var agentPayId = $routeParams.id;
    agentPayService.view({id:agentPayId},function(response){
      $scope.agentPay=response.msg;
    })
	
    $scope.update=function(){
		agentPayService.update($scope.agentPay,		//有未交费变为已缴费
          function(response){
            if(response.code!=200){
              alert("更新失败");
			  return;
            }
			alert("修改成功")
            $location.path("/agentDataentry/agentPay");
          }
		)
		/*
		通过缴费表的agent_id，得到代理商信息表
		*/
		/*
		$scope.agentId = $scope.agentPay.agent_id;
		
		
		agentPayService.getAgent({id:$scope.agentId},function(response){
			$scope.agent=response.msg;
			
			$scope.agent_pay_date = $scope.agent.pay_date;
			$scope.agentPay_pay_date = $scope.agentPay.pay_date;
			$scope.payDate = $scope.agentPay_pay_date.split("-");
			$scope.date = $scope.payDate[0]+"-"+$scope.payDate[1]+"-"+$scope.agent_pay_date;
			
			$scope.agentPay={
				payable_expenses:$scope.agent.payable_expenses,	
				agent_id:$scope.agent.id,
				company_name:$scope.agent.company_name,
				name:$scope.agent.name
			}
			
			agentPayService.createNextMonthAgentPay($scope.agentPay,function(response){	//添加下一个月的未缴费记录
				
				if(!response==200){
					//alert("创建失败")
					$scope.warnMessage = response.msg;
				}else{
					$location.path('/agentDataentry/agentPay');
			   }
				   
			})
			
		})				
		*/
    }

}])


agentPayModule.controller('agentPayParametersController', [ '$scope', '$location', '$filter', 'agentPayService', '$routeParams','DataUtilService',
  function ($scope, $location, $filter, agentPayService, $routeParams,DataUtilService) {
    $scope.YesNoModel = DataUtilService.YesNoModel;
    $scope.OpenOrClose = DataUtilService.OpenOrClose;
    $scope.YesOrNo = DataUtilService.YesOrNo;
    $scope.selectedAgentId = $location.search().id;


	$scope.getUrlId = function(){
		var urlId = $location.search().id;
		if(urlId)
			$scope.selectAgent(urlId);
	}

    agentPayService.agentList({},
      function (response) {
        if (response.code == 500) {
          alert('获取缴费列表失败')
          return
        }
        $scope.AgentModule  = response.msg
		$scope.getUrlId();
      },
     function (error) {}
    )

	$scope.isShowDatetimepicker = false;
	$scope.openDatetimepicker = function(){
		$scope.isShowDatetimepicker = true;
	}
	$scope.selectDate = function(value){
		$scope.agent.payable_date = value;
		$scope.payable_date_text = '每月'+$scope.agent.payable_date+'日';
		$scope.isShowDatetimepicker = false;
	}

    $scope.selectAgent=function(selectedAgentId){
		$scope.selectedAgentId = selectedAgentId;
		if(!selectedAgentId)
			return;

		agentPayService.agentView({id:selectedAgentId},function(response){
			$scope.agent=response.msg;
			$scope.payable_date_text = '每月'+$scope.agent.payable_date+'日';

			if($scope.agent.payable_expenses==null && $scope.agent.pay_date==null){
				$scope.dt1 = new Date();
				$scope.dt2 = $filter("date")($scope.dt1, "yyyy-MM-dd")+"";
				$scope.str = $scope.dt2.split("-");
				$scope.date1 = $scope.str[0]+"-"+$scope.str[1];
				
				$scope.update=function(){
					var reg = /^\d+(\.\d+)?$/;
					if(!reg.test($scope.agent.payable_expenses)){
						alert("应缴费用格式不正确");
						return;
					}
					$scope.agentPay={
						agent_id:$scope.agent.id,
						company_name:$scope.agent.company_name,
						name:$scope.agent.name,
						payable_expenses:$scope.agent.payable_expenses,
						pay_date:$scope.date1+"-"+$scope.agent.pay_date,
						is_pay:0
					};			
					agentPayService.updateAgent($scope.agent,
						function(response){
						  if(response.code!=200){
							alert("更新失败");
							return;
						  }
						  alert("修改成功")
						  	var url = "#/agentDataentry/agentPay/";
						  window.location.href = url;
						}
					)	
					/*
					agentPayService.create($scope.agentPay,
						function(response){
						  if(response.code!=200){
							alert("更新失败");
							return;
						  }
						  alert("创建成功")
						  $location.path("/agentDataentry/agentPay");
						}
					)
					*/
				}
			
			}else{
				$scope.dt1 = new Date();
				$scope.dt2 = $filter("date")($scope.dt1, "yyyy-MM-dd")+"";
				$scope.str = $scope.dt2.split("-");
				$scope.date1 = $scope.str[0]+"-"+$scope.str[1];
				
				$scope.update=function(){
					var reg = /^\d+(\.\d+)?$/;
					if(!reg.test($scope.agent.payable_expenses)){
						alert("应缴费用格式不正确");
						return;
					}
					$scope.agentPay={
						agent_id:$scope.agent.id,
						company_name:$scope.agent.company_name,
						name:$scope.agent.name,
						payable_expenses:$scope.agent.payable_expenses,
						pay_date:$scope.date1+"-"+$scope.agent.pay_date,
						is_pay:0
					};			
					agentPayService.updateAgent($scope.agent,
						function(response){
						  if(response.code!=200){
							alert("更新失败");
							return;
						  }
						  alert("修改成功")
						  	var url = "#/agentDataentry/agentPay/";
						  
						  window.location.href = url;
						}
					)
				}
			}
        }) 
	}

}])
  
  
agentPayModule.controller('agentShopPayListController', [ '$scope','$location','agentPayService','shopInformationService', 'ngTableParams', '$filter',
  function ($scope,$location, agentPayService,shopInformationService,ngTableParams, $filter) {
	$scope.filter = {
		agent_id: '',
		shop_id: '',
		start_time: '',
		end_time: ''
	};

    agentPayService.agentList({},
		  function (response) {
			if (response.code == 500) {
			  alert('获取缴费列表失败')
			  return
			}
			$scope.agentList  = response.msg
		  },
		 function (error) {}
    )

   $('#datetimepicker1').datetimepicker({  
        format: 'yyyy-mm-dd',
		pickerPosition: "bottom-left",
		autoclose: true,
		language: 'zh-CN',
		minView: 2
    }); 
   $('#datetimepicker2').datetimepicker({  
        format: 'yyyy-mm-dd',
		pickerPosition: "bottom-left",
		autoclose: true,
		language: 'zh-CN',
		minView: 2
    });

	$scope.payData = {
		payable: 0,
		paid: 0,
		unpaid: 0
	};
	$scope.getShopPay = function(){

		var url = "";
		if($scope.filter.agent_id!=''){
			url += '&agent_id='+$scope.filter.agent_id;
		}
		if($scope.filter.start_time!=''&&$scope.filter.end_time!=''){

			url += '&start_time='+encodeURI($scope.filter.start_time)
				+'&end_time='+encodeURI($scope.filter.end_time);
		}

		agentPayService.agentShopPaylist({url:url},
			function (response) {
				if (response.code == 500) {
					alert(response.msg);
					$scope.payData = {
						payable: 0,
						paid: 0,
						unpaid: 0
					};
					return;
				}
				$scope.payData = response.msg;
			},
			function (error) {}
		);
	}
}])

agentPayModule.controller('agentShopPayParametersController', [ '$scope', '$location', '$filter', 'agentPayService', 'shopInformationService','$routeParams','DataUtilService',
  function ($scope, $location, $filter, agentPayService,shopInformationService, $routeParams,DataUtilService) {
    $scope.YesNoModel = DataUtilService.YesNoModel;
    $scope.OpenOrClose = DataUtilService.OpenOrClose;
    $scope.YesOrNo = DataUtilService.YesOrNo;
    $scope.selectedAgentId = $location.search().id;

    $scope.shopModule = [];

	$scope.getUrlId = function(){
		var urlId = $location.search().id;
		if(urlId)
			$scope.selectAgent(urlId);
	}

    agentPayService.agentList({},
      function (response) {
        if (response.code == 500) {
          alert('获取缴费列表失败')
          return
        }
        $scope.AgentModule  = response.msg
		//$scope.getUrlId();
      },
     function (error) {}
    )


    $scope.selectAgent=function(selectedAgentId){
		$scope.selectedAgentId = selectedAgentId;
		if(!selectedAgentId)
			return;

		agentPayService.shopList({id:selectedAgentId},function(response){
			$scope.shopModule = response.msg;
        }) 
	}

    $scope.selectShop=function(selectedShopId){
		$scope.selectedShopId = selectedShopId;
		if(!selectedShopId)
			return;

		shopInformationService.view({id:selectedShopId},function(response){
			$scope.shop=response.msg;
				
			$scope.update=function(){
				var reg = /^\d+(\.\d+)?$/;
				if(!reg.test($scope.shop.service_charge)){
					alert("服务费格式不正确");
					return;
				}
				var data = {
					shop_id:$scope.shop.id,
					service_charge:$scope.shop.service_charge,
				};
				shopInformationService.update($scope.shop,
					function(response){
					  if(response.code!=200){
						alert("修改失败");
						return;
					  }
					  alert("修改成功")
						var url = "#/agentDataentry/agentShopPay";
						window.location.href = url;
					}
				)	
			}
        }) 
	}

  }])


