'use strict'

var printerModule = angular.module('printerModule', ['ngTable', 'checklist-model'])

printerModule.controller('printerListController', 
	['$scope','PrinterService', 'ngTableParams', '$filter','ImageService','shopInformationService','CategoryService','$location',
	function ($scope, PrinterService, ngTableParams, $filter,ImageService,shopInformationService,CategoryService,$location
		)
	{
		$scope.listFilter = {};
		$scope.isUnify = 0;
		$scope.shop = {};
		$scope.newPrinter = {};
		$scope.addImage = function (files) {
			ImageService.generateThumb(files[0]);
			$scope.imageFile = files[0];
		}

		$scope.ifCLodp = 0;
		var getIfCLodop = function(){
			if(typeof(getCLodop)=='undefined'){
				$scope.ifCLodp = 0;
			}else{
				$scope.ifCLodp = 1;
			}
		}
		getIfCLodop();
		$scope.downloadLodop32 = function(){
			window.location.href=(apiHost+'/downloadLodop');
		}

		$scope.testPrint = function(){
			if(typeof(getCLodop)=='undefined'){
				alert("检测到您未安装打印所需插件,请先下载并安装!")
			}else{
				var Lodop = getCLodop();
				Lodop.ADD_PRINT_TEXT("12mm","12mm","40mm","8mm","测试成功,你可以进行正常打印了,请退出本页面");
				LODOP.SET_PRINT_STYLEA(0,"Bold",1);
				LODOP.SET_PRINT_STYLEA(0,"Horient",2)
				Lodop.PREVIEW();
			}
		}

		$scope.uploadPay_code_id = function () {
			ImageService.uploadImageToServer('/image?type=3', $scope.imageFile).then(
				function(ress){
					$scope.logo_id = ress.data.msg.image_id;
					$scope.shop.shop_id=localStorage.getItem("shop_id");
					$scope.shop.pay_code_id=$scope.logo_id;	
					console.log(shop);				  
					shopInformationService.update($scope.shop,function(response){
						if(response.code != 200){
							alert("更新失败");
							return;
						}else{

							$location.path('/dataentry/printer');
						}
					})
				})
		}

		var categoryList=new Array();
		CategoryService.list({},function(response){
			if(response.code!=200){
				alert("获取类别列表失败");
				return;
			}else{
				$scope.categoryList=response.msg;
                $scope.categoryList.push({id:777,name:"传菜部"});
				$scope.categoryList.push({id:888,name:"后厨"});
				$scope.categoryList.push({id:999,name:"结账单"});

			}
		})

		$scope.changeUnify = function(type){
		if(type==$scope.isUnify)
			return;
		if(type==0){
			var text = "是否确定切换为分窗口打印模式"
		}else{
			var text = "是否确定切换为统一打印模式"
		}

		if(confirm(text)){
			$scope.isUnify = type;
            localStorage.setItem('shop_is_unified_print', type);
			$scope.shop.is_unified_print = $scope.isUnify;
				shopInformationService.update($scope.shop,function(response){
					if(response.code != 200){
						alert("更新失败");
						return;
					}else{
						alert("设置成功")
						getPrinterList();
					}
				}
			)
		}
	}

		shopInformationService.view(
			{id:localStorage.getItem("shop_id")},
			function(response){
				$scope.shop = response.msg;
				console.log("response.msg ------ ",response.msg);

				if($scope.shop.pay_code_id){
					var img = {
						'dataUrl': apiHost + '/image/' + $scope.shop.pay_code_id
					}
					$scope.imageFile = img;
				}else{
					$scope.imageFile = null;
				}
				if($scope.shop.is_unified_print==null){
					$scope.shop.is_unified_print = 0;
				}
				$scope.isUnify = $scope.shop.is_unified_print;
		
			}
		)

		$scope.savePrinter = function(){

			if($scope.kitchenPrinter.name==''||$scope.kitchenPrinter.name==null){
				alert("请输入后厨打印机名称")
				return;
			}
			if($scope.kitchenPrinter.page_width==''||$scope.kitchenPrinter.page_width==null){
				alert("请输入后厨打印机纸张宽度")
				return;
			}
			if($scope.kitchenPrinter.id==''){

				PrinterService.create(

					$scope.kitchenPrinter,

					function(response){
						if(response.code!=200){
							 alert("创建失败");
							 return;
						}else{
							if($scope.orderPrinter.name==''||$scope.orderPrinter.name==null){
								alert("请输入结账单打印机名称")
								return;
							}
							if($scope.orderPrinter.page_width==''||$scope.orderPrinter.page_width==null){
								alert("请输入结账单打印机纸张宽度")
								return;
							}
							if($scope.orderPrinter.id==''){
								PrinterService.create(
									$scope.orderPrinter,
									function(response){
										if(response.code!=200){
											 alert("创建失败");
										}else{
											alert("设置成功,请重新登录！");
										}
										$location.path('/dataentry/printer');
									}
							    )
							}else{
								PrinterService.update(
								    $scope.orderPrinter,
                                    function(response){
                                        if(response.code != 200){
                                            alert("更新失败");
                                            return;
                                        }else{
                                            alert("设置成功,请重新登录！")
                                        }
								    }
								)
							}
						}
					}
			   )
			}else{
				PrinterService.update(
				    {id:$scope.kitchenPrinter.id},
                    $scope.kitchenPrinter,
                    function(response){
                        if(response.code != 200){

                            alert("更新失败");
                            return;

                        }else{

                            if($scope.orderPrinter.name==''||$scope.orderPrinter.name==null){
                                alert("请输入结账单打印机名称")
                                return;
                            }
                            if($scope.orderPrinter.page_width==''||$scope.orderPrinter.page_width==null){
                                alert("请输入结账单打印机纸张宽度")
                                return;
                            }
                            if($scope.orderPrinter.id==''){

                                PrinterService.create(
                                    $scope.orderPrinter,
                                    function(response){
                                        if(response.code!=200){
                                             alert("创建失败");
                                             return;
                                        }else{
                                            alert("设置成功,请重新登录！")
                                        }
                                        $location.path('/dataentry/printer')
                                    }
                                )
                            }else{

                                PrinterService.update(
                                    {id:$scope.orderPrinter.id},
                                    $scope.orderPrinter,
                                    function(response){
                                        if(response.code != 200){
                                            alert("更新失败");
                                            return;
                                        }else{
                                            alert("设置成功,请重新登录！")

                                        }
                                        $location.path('/dataentry/printer')
                                    }
                                )
                            }
                        }
				})
			}
		}

		$scope.uploadPay_code_id = function () {
			ImageService.uploadImageToServer('/image', $scope.imageFile).then(
				function(ress){
					$scope.logo_id = ress.data.msg.image_id;
					$scope.shop.shop_id=localStorage.getItem("shop_id");
					$scope.shop.pay_code_id=$scope.logo_id;
					shopInformationService.update($scope.shop,function(response){
						if(response.code != 200){
							alert("更新失败");
							return;
						}else{
							alert("上传成功")
						}
						$location.path('/dataentry/printer')
					})
				}
			)
		}

		$scope.deletePay_code_id = function () {
			if($scope.shop.pay_code_id==null)
				return;
			if(!confirm("是否确认删除付款码？"))
				return;

			PrinterService.deletePay_code($scope.shop,function(response){
				if(response.code != 200){
					alert("更新失败");
					return;
				}else{
					alert("删除成功")
					window.location.reload();
				}
			})
		}

		var getPrinterList = function(){
			PrinterService.list().$promise.then(
				 function (response) {
				//888 后厨
				//999 结账单
				var data = response.msg;
				console.log("data ------ ",data);
				var printerList = [];
				for(var i=0;i<data.length;i++){
					if(data[i].printer_type==888)continue;
					printerList.push(data[i]);
				}
				$scope.printerList = printerList;
                $scope.spreadVegetables = {
                    id: '',
                    category_name: '传菜部',
                    name: '',
                    printer_type: 777,
                    shop_id: localStorage.getItem("shop_id")
                };
				$scope.kitchenPrinter = {
					id: '',
					category_name: '后厨',
					name: '',
					printer_type: 888,
					shop_id: localStorage.getItem("shop_id")
				};
				$scope.orderPrinter = {
					id: '',
					category_name: '结账单',
					name: '',
					printer_type: 999,
					shop_id: localStorage.getItem("shop_id")
				};
				for(var i=0;i<data.length;i++){
                    if(data[i].printer_type==777){
                        $scope.spreadVegetables = data[i];
                    }
					if(data[i].printer_type==888){
						$scope.kitchenPrinter = data[i];
					}
					if(data[i].printer_type==999){
						$scope.orderPrinter = data[i];
					}
				}
				$scope.tableParams = new ngTableParams(
						{
							page: 1,
							count: 25,
							sorting: {},
							filter: $scope.listFilter
						}, {
								total: 0,
								getData: function ($defer, params) {
									var filteredData = $filter('filter')(response.msg, $scope.listFilter);
									var sortedData = params.sorting() ? $filter('orderBy')(filteredData, params.orderBy()) : filteredData;
									$scope.printerList = sortedData.slice((params.page() - 1) * params.count(), params.page() * params.count())
									$scope.totalLength = sortedData.length
									params.total(sortedData.length)
									$defer.resolve($scope.printer)
								}
							}
				 )
			})
		}
		getPrinterList();

		$scope.addPrinter = function(){
			if($scope.newPrinter.printer_type==''||$scope.newPrinter.printer_type==null){
				alert("请选择打印类型");
				return;
			}
			if($scope.newPrinter.name==''||$scope.newPrinter.name==null){
				alert("请输入打印机名称");
				return;
			}
			if($scope.newPrinter.page_width==''||$scope.newPrinter.page_width==null){
				alert("请输入纸张宽度");
				return;
			}
			for(var i=0;i<$scope.printerList.length;i++){
				if($scope.printerList[i].printer_type==$scope.newPrinter.printer_type){
					alert("不可重复设置")
					return;
				}
			}
			$scope.newPrinter.shop_id=localStorage.getItem("shop_id");

			PrinterService.create(
				$scope.newPrinter,
			   function(response){
					 if(!response==200){
						 alert("创建失败");
						 return;
					 }else{
						alert("添加成功,请重新登录")
						window.location.reload();
					 }
				}
			)
		}

		$scope.changeItem = function(printer){
			window.location.href = "#/dataentry/printer/"+printer.id;
		}

		$scope.deleteItem = function(printer){
			console.log("printer ------ ",printer);
            var printType = printer.printer_type;
            console.log("printType ------ ",printType);
			if (printType=='777'||printType=='888'||printType=='999'){
				alert('固定类型,无法删除');
				return;
			}
			if(confirm("是否确认删除")){
				PrinterService.delete(
					{id:printer.id},
				   function(response){
						 if(!response==200){
							 alert("创建失败");
							 return;
						 }else{
							alert("删除成功,请重新登录")
							window.location.reload();
						 }
					}
				)
			}
		}
}])

printerModule.controller('printerCreateController',
	[ '$scope', '$location', 'PrinterService','DataUtilService','CategoryService',
	function ($scope, $location, PrinterService,DataUtilService,CategoryService) {

		var categoryList=new Array();		
		CategoryService.list(
			{},
			function(response){
				if(response.code!=200){
					alert("获取类别列表失败");
					return;
				}else{
					$scope.categoryList=response.msg;
					$scope.categoryList.push({id:777,name:"传菜部打印"});
					$scope.categoryList.push({id:888,name:"后厨打印"});
					$scope.categoryList.push({id:999,name:"结账单打印"});
				}
			}
		)

		$scope.create = function () {

			$scope.printer.shop_id=localStorage.getItem("shop_id");

		    PrinterService.create(
		    	$scope.printer,
			   	function(response){
			         if(!response==200){
			        	 alert("创建失败");
			        	 return;
			         }else{
			         	alert("创建成功,请重新登录")
			        	$location.path('/dataentry/printer')
			         }
		   		}
		    )
		}
	}
])

printerModule.controller('printerController',['$scope','$location','PrinterService','$routeParams','DataUtilService','CategoryService',
	function($scope,$location,PrinterService,$routeParams,DataUtilService,CategoryService){
       var printerId=$routeParams.id;


		/*var categoryList=new Array();
		CategoryService.list(
			{},
			function(response){
				console.log("CategoryService.list ------ ",response);
				if(response.code!=200){
					alert("获取类别列表失败");
					return;
				}else{
					$scope.categoryList=response.msg;
					$scope.categoryList.push({id:777,name:"传菜部"});
					$scope.categoryList.push({id:999,name:"结账单打印"});
				}
			}
		)*/

		PrinterService.view(
			{id:printerId},
			function(response){
			    $scope.printer=response.msg;
			}
		)

		$scope.update=function(){
			PrinterService.update(
				$scope.printer,
				function(response){
					if(response.code!=200){
						alert("更新失败");
						return;
					}
					alert("修改成功,请重新登录");
					$location.path("/dataentry/printer");
				}
			)
			
		}
	}
])

	




