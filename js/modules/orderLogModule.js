'use strict'
function setActiveRouter(router_str) {
    $('#accordion').find('a[href="#'+router_str+'"] i').css('color','#26a2ff');
 }

var orderLogModule  = angular.module('orderLogModule', ['ngTable', 'checklist-model'])

orderLogModule .controller('orderLogListController',
    [ '$scope','$location','orderLogService','PrinterService','DataUtilService',
    function ($scope,$location, orderLogService,PrinterService,DataUtilService) {
	$scope.filter = {
		  page_no: '1',
		  page_size: '25',
		  dining_id: '',
		  start_time: '',
		  end_time: '',
		  pay_type: ''
	  };
	  $scope.totalPage = 1;

	  $scope.initRouterActive=function(){
        setActiveRouter($location.$$path);
       }
	var getNowFormatDate = function () {
		var date = new Date();

		var month = date.getMonth() + 1;
		var strDate = date.getDate();
		if (month >= 1 && month <= 9) {
			month = "0" + month;
		}
		if (strDate >= 0 && strDate <= 9) {
			strDate = "0" + strDate;
		}
		var currentdate = date.getFullYear() + "-" + month + "-" + strDate;
		return currentdate;
	} 
	$scope.today = getNowFormatDate();

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

	orderLogService.tableList({},
		function (response) {
			if (response.code == 500) {
				alert('获取桌位列表失败')
				return
			}
			$scope.tableList = response.msg; 
		},
		function (error) {}
	);

	$scope.filterOrders = function(){
		var url = "#orderLog/list?"
		if($scope.filter.page_no!=""&&$scope.filter.page_no!=null){
			url += "page_no="+$scope.filter.page_no+"&&";
		}
		if($scope.filter.page_size!=""&&$scope.filter.page_size!=null){
			url += "page_size="+$scope.filter.page_size+"&&";
		}
		if($scope.filter.dining_id!=""&&$scope.filter.dining_id!=null){
			url += "dining_id="+$scope.filter.dining_id+"&&";
		}
		if($scope.filter.start_time!=""&&$scope.filter.start_time!=null){
			url += "start_time="+$scope.filter.start_time+"&&";
		}
		if($scope.filter.end_time!=""&&$scope.filter.end_time!=null){
			url += "end_time="+$scope.filter.end_time+"&&";
		}
		if($scope.filter.pay_type!=""&&$scope.filter.pay_type!=null){
			url += "pay_type="+$scope.filter.pay_type+"&&";
		}
		var str = url.charAt(url.length-1);
		if(str=='&'){
			var strs = url.substring(0,url.length-2);
		}else if(str=='?'){
			var strs = url.substring(0,url.length-1);
		}

		window.location.href = strs;
	}

	$scope.getFilterOrders = function(){
		if($location.search().page_no)
			$scope.filter.page_no = $location.search().page_no;
		if($location.search().page_size)
			$scope.filter.page_size = $location.search().page_size;
		if($location.search().dining_id)
			$scope.filter.dining_id = $location.search().dining_id;
		if($location.search().start_time)
			$scope.filter.start_time = $location.search().start_time;
		if($location.search().end_time)
			$scope.filter.end_time = $location.search().end_time;
		if($location.search().pay_type)
			$scope.filter.pay_type = $location.search().pay_type;
	}

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
   $('#datetimepicker3').datetimepicker({  
        format: 'yyyy-mm-dd',
		pickerPosition: "bottom-left",
		autoclose: true,
		language: 'zh-CN',
		minView: 2
    });
	$scope.changePageSize = function(page_size){
		$scope.filter.page_size = page_size;
		$scope.filter.page_no = 1;
		$scope.filterOrders();
	}
	$scope.changePageNo = function(page_no){
		if(page_no>$scope.totalPage||page_no<=0)
			return;
		
		$scope.filter.page_no = page_no;
		$scope.filterOrders();
	}
	$scope.getOrderLogList = function(type){
		$scope.getFilterOrders();

		var url = 'page_no='+$scope.filter.page_no+'&page_size='+$scope.filter.page_size
		if($scope.filter.dining_id!=''){
			url += '&dining_id='+$scope.filter.dining_id;
		}
		if($scope.filter.start_time!=''&&$scope.filter.end_time!=''){

			url += '&start_time='+encodeURI($scope.filter.start_time)
				+'&end_time='+encodeURI($scope.filter.end_time);
		}
		if($scope.filter.pay_type!=''){
			url += '&pay_type='+$scope.filter.pay_type;
		}

		var export_excel = url;
		if(type!=''){
			url +='&type=query'
		}
       
		orderLogService.orderLogList({url:url},
			function (response) {
				if (response.code == 500) {
					alert('获取订单列表失败')
					return
				}
				var orderLogList = response.msg;
				console.log(orderLogList)
				var list = orderLogList.orderList;
				for(var i=0;i<list.length;i++){
					var date1=new Date(list[i].create_time);  //开始时间
					if(list[i].status_id==1){
						var date2=new Date(list[i].pay_time);    //结束时间
					}else if(list[i].status_id==2){
						var date2=new Date(list[i].back_time);    //结束时间
					}

					var date3=date2.getTime()-date1.getTime()  //时间差的毫秒数
					var leave1=date3%(24*3600*1000)    //计算天数后剩余的毫秒数
					var hours=Math.floor(leave1/(3600*1000))
					//计算相差分钟数
					var leave2=leave1%(3600*1000)        //计算小时数后剩余的毫秒数
					var minutes=Math.floor(leave2/(60*1000))
					//计算相差秒数
					var leave3=leave2%(60*1000)      //计算分钟数后剩余的毫秒数
					var seconds=Math.round(leave3/1000)

					minutes = minutes>9? minutes : '0'+minutes;
					seconds = seconds>9? seconds : '0'+seconds;
					list[i].time_difference = hours+":"+minutes+":"+seconds;
				}
				orderLogList.list = list;
				console.log(list);
				$scope.orderLogList  = orderLogList;
				var sumIncome = orderLogList.sumTradeCash+orderLogList.sumTradeCreditCard+orderLogList.sumTradeWechat+orderLogList.sumTradeAlipay+orderLogList.sumMemberRecharge;
				$scope.sumIncomeToFixed2 = sumIncome.toFixed(2);
				$scope.totalPage = Math.ceil($scope.orderLogList.totalNum/$scope.filter.page_size);
				if($scope.totalPage==0){
					$scope.filter.page_no = 1;
				}else{
					$scope.filter.page_no = parseInt($scope.filter.page_no);
				}

				if(type=='print'){
					var nowTime = DataUtilService.getNowTime();
					var orderCount= $scope.orderLogList;
						PrinterService.getPrinterByPrinter_type(
							{printer_type:999},
							function(response){
								if (response.code==200) {
									var printer=response.msg;
									console.log(printer)
									if(printer==null){
										alert("未查询到对应打印机");
										return;
									}

									var LODOP = getCLodop();
									LODOP.SET_LICENSES("","3E893A594C00D5D9C1DBE7CD18C9E8DB","C94CEE276DB2187AE6B65D56B3FC2848","");							
									LODOP.PRINT_INITA(1,1,700,600,'商铺_'+localStorage.getItem('shop_id')+"_订单统计报表"+nowTime);
									
									var printer_name = printer.name;

									var pageWidth = printer.page_width;
									if(pageWidth == null||pageWidth==0){
										alert("打印机名称:"+printer.category_name+"-对应打印机纸张宽度设置不符合要求,请在打印设置中重新设置");
										return;
									}

									//var pagesizesList = LODOP.GET_PAGESIZES_LIST(printer_name,"\n")
					                //var pageWidth = pagesizesList.substring(0,2);

					               	LODOP.SET_PRINT_PAGESIZE(3, pageWidth+'mm',"","");

									var flag  = LODOP.SET_PRINTER_INDEXA(printer_name);	
									if(!flag){
										alert("设置打印设备不存在");	
										return;									
									}
	
									LODOP.SET_PRINT_PAGESIZE(3,pageWidth+'mm',0,'');

									var top = 1;
									LODOP.ADD_PRINT_TEXT(top+"mm","10mm","40mm","8mm","     订单统计报表");
									LODOP.SET_PRINT_STYLEA(0,"Bold",1);
									LODOP.SET_PRINT_STYLEA(0,"Horient",2);
									
									top+=6;																	
									LODOP.ADD_PRINT_TEXT(top+"mm","1mm","100%","6mm","操作员:"+localStorage.getItem("name"));

									top+=6;																	
									LODOP.ADD_PRINT_TEXT(top+"mm","1mm","100%","6mm","打印时间:"+nowTime);

									top+=6;									
									LODOP.ADD_PRINT_TEXT(top+"mm","1mm",180,"6mm","开始时期:"+$scope.filter.start_time);

									top+=6;
									LODOP.ADD_PRINT_TEXT(top+"mm","1mm",180,"6mm","结束日期:"+$scope.filter.end_time);

									top+=5;
									LODOP.ADD_PRINT_TEXT(top+"mm",0,"100%","2mm","=== 订单统计 ==========================================================");
									
									top+=4;
									LODOP.ADD_PRINT_TEXT(top+"mm","3.3mm","100%","6mm","应收金额: "+orderCount.sumReceivable);	

									top+=6;
									LODOP.ADD_PRINT_TEXT(top+"mm","3.3mm","100%","6mm","实收金额: "+orderCount.sumReceived);								

									top+=6;
									var sumTradeCash = orderCount.sumTradeCash;
									sumTradeCash = sumTradeCash==null?0:sumTradeCash;
									LODOP.ADD_PRINT_TEXT(top+"mm","3.3mm","100%","6mm","现金收入: "+sumTradeCash);

									top+=6;
									var sumTradeWechat = orderCount.sumTradeWechat;
									sumTradeWechat = sumTradeWechat==null?0:sumTradeWechat;
									LODOP.ADD_PRINT_TEXT(top+"mm","3.3mm","100%","6mm","微信收入: "+sumTradeWechat);

									top+=6;
									var sumTradeAlipay = orderCount.sumTradeAlipay 
									sumTradeAlipay = sumTradeAlipay==null?0:sumTradeAlipay;
									LODOP.ADD_PRINT_TEXT(top+"mm","3.3mm","100%","6mm","支付宝收入: "+sumTradeAlipay);

									top+=6;
									var sumTradeCreditCard = orderCount.sumTradeCreditCard;
									sumTradeCreditCard = sumTradeCreditCard==null?0:sumTradeCreditCard;
									LODOP.ADD_PRINT_TEXT(top+"mm","3.3mm","100%","6mm","银行卡收入: "+sumTradeCreditCard);

									/*top+=6;
									LODOP.ADD_PRINT_TEXT(top+"mm","3.3mm","100%","6mm","混合付款: "+orderCount.sumCombinationPayment);*/

									top+=6;
									LODOP.ADD_PRINT_TEXT(top+"mm","3.3mm","100%","6mm","退单金额: "+orderCount.sumCancelOrder);

									top+=6;
									LODOP.ADD_PRINT_TEXT(top+"mm","3.3mm","100%","6mm","免单金额: "+orderCount.sumFreeOrder);
									
									top+=6;
									LODOP.ADD_PRINT_TEXT(top+"mm","3.3mm","100%","6mm","赠送金额: "+orderCount.sumLottery);
									
									top+=6;
									var sumResidue = orderCount.sumResidue;
									sumResidue = sumResidue==null?0:sumResidue;
									LODOP.ADD_PRINT_TEXT(top+"mm","3.3mm","100%","6mm","抹零总计："+(sumResidue).toFixed(2));
									
									top+=6;
									LODOP.ADD_PRINT_TEXT(top+"mm","3.3mm","100%","6mm","折扣总计："+(orderCount.sumDiscountPreferential).toFixed(2));

									top+=6;
									//Error: preferentialMoney.toFixed is not a function
									var preferentialMoney =(orderCount.sumCancelOrder+orderCount.sumFreeOrder+orderCount.sumLottery+orderCount.sumResidue+orderCount.sumDiscountPreferential).toFixed(2);		
									LODOP.ADD_PRINT_TEXT(top+"mm","3.3mm","100%","6mm","优惠总计: "+preferentialMoney);

                                    top+=4;
                                    LODOP.ADD_PRINT_TEXT(top+"mm",0,"100%","2mm","=== 会员卡统计 =========================================================");

                                    top+=6;
                                    LODOP.ADD_PRINT_TEXT(top+"mm","","100%","6mm","会员卡充值金额: "+orderCount.sumMemberRecharge);

                                    //0-xj,1-银行卡,2-微信,3-支付宝

                                    var memberTradeLogCountList =  orderCount.memberTradeLogCountList;
                                    for (var i = 0; i < memberTradeLogCountList.length; i++) {
                                        var payType = memberTradeLogCountList[i].payType;
                                        var payTypeName = '';
                                        switch (payType){
                                            case 0 :	payTypeName = '现  金';break;
                                            case 1 :	payTypeName = '银行卡';break;
                                            case 2 :	payTypeName = '微  信';break;
                                            case 3 :	payTypeName = '支付宝';break;
                                        }

                                        top+=6;
                                        LODOP.ADD_PRINT_TEXT(top+"mm","","100%","6mm",'     '+payTypeName+': '+orderCount.memberTradeLogCountList[i].payTypeMoney);
                                    }
									
									top+=6;
									var sumMemberGiveMoney = orderCount.sumMemberGiveMoney;
									sumMemberGiveMoney = sumMemberGiveMoney==null?0:sumMemberGiveMoney;
									LODOP.ADD_PRINT_TEXT(top+"mm","","100%","6mm","会员卡赠送: "+sumMemberGiveMoney);

									top+=6;
									var sumMemberConsume = orderCount.sumMemberConsume;
									sumMemberConsume = sumMemberConsume==null?0:sumMemberConsume;
									LODOP.ADD_PRINT_TEXT(top+"mm","","100%","6mm","会员卡消费: "+sumMemberConsume);
									
									top+=4;
									LODOP.ADD_PRINT_TEXT(top+"mm",0,"100%","2mm","- - - - - - - - - - - -  - - - -- - - - - -- - - - -");
									
									top+=6;
									LODOP.ADD_PRINT_TEXT(top+"mm","","100%","6mm","挂账金额: "+orderCount.sumBill);
									
									LODOP.PREVIEW();
									//LODOP.PRINT();
								
								}else{
									alert('orderLogListControllerM_$scope.getOrderLogListF_if(type=print)_PrinterService.viewF_ERRO');
								}
							}
						)									  				
  					};
				},
			function (error) {}
		);
		if(type=='export_excel'){
				var url_export_excel = export_excel+'&type='+type;
				window.location.href=(apiHost+'/shop/'+localStorage.getItem("shop_id")+'/orders/list?'+url_export_excel);
		}
	}
	$scope.getOrderLogList('query');

	$scope.printTodayOrderList = function(){
		var filter = {
			  page_no: '1',
			  page_size: '25',
			  dining_id: '',
			  start_time: $scope.today,
			  end_time: $scope.today
		};
		var type = 'print';
		var url = 'page_no='+filter.page_no+'&page_size='+filter.page_size
		if(filter.dining_id!=''){
			url += '&dining_id='+filter.dining_id;
		}
		if(filter.start_time!=''&&filter.end_time!=''){

			url += '&start_time='+encodeURI(filter.start_time)
				+'&end_time='+encodeURI(filter.end_time);
		}

		url +='&type=query'

		orderLogService.orderLogList(
		    {url:url},
			function (response)  {
				if (response.code == 500) {
					alert('获取订单列表失败')
					return
				}
				var orderLogList = response.msg;
				console.log(orderLogList)
					var nowTime = DataUtilService.getNowTime();
					var orderCount= orderLogList;

						PrinterService.getPrinterByPrinter_type(
							{printer_type:999},
							function(response){
								if (response.code==200) {
									var printer=response.msg;
									
									if(printer==null){
										alert("未查询到对应打印机");
										return;
									}

									var LODOP = getCLodop();
									LODOP.SET_LICENSES("","3E893A594C00D5D9C1DBE7CD18C9E8DB","C94CEE276DB2187AE6B65D56B3FC2848","");							
									LODOP.PRINT_INITA(1,1,700,600,'商铺_'+localStorage.getItem('shop_id')+"_订单统计报表"+nowTime);
									
									var printer_name = printer.name; 

									var pageWidth = printer.page_width;
									if(pageWidth == null||pageWidth==0){
										alert("打印机名称:"+printer.category_name+"-对应打印机纸张宽度设置不符合要求,请在打印设置中重新设置");
										return;
									}									
					               	LODOP.SET_PRINT_PAGESIZE(3, pageWidth+'mm',"","");

									//var pagesizesList = LODOP.GET_PAGESIZES_LIST(printer_name,"\n")
					                //var pageWidth = pagesizesList.substring(0,2);

					               	LODOP.SET_PRINTER_INDEX(printer.name);	
									var flag  = LODOP.SET_PRINTER_INDEX(printer_name);
									if(!flag){
										alert("打印设备不存在");
									}

									var top = 1;
									LODOP.ADD_PRINT_TEXT(top+"mm","10mm","40mm","8mm","     交班统计报表");
									LODOP.SET_PRINT_STYLEA(0,"Bold",1);
									LODOP.SET_PRINT_STYLEA(0,"Horient",2);
									
									top+=6;																	
									LODOP.ADD_PRINT_TEXT(top+"mm","1mm","100%","6mm","操作员:"+localStorage.getItem("name"));

									top+=6;																	
									LODOP.ADD_PRINT_TEXT(top+"mm","1mm","100%","6mm","打印时间:"+nowTime);

									top+=6;									
									LODOP.ADD_PRINT_TEXT(top+"mm","1mm",180,"6mm","开始时期:"+$scope.today);

									top+=6;
									LODOP.ADD_PRINT_TEXT(top+"mm","1mm",180,"6mm","结束日期:"+$scope.today);

									top+=5;
									LODOP.ADD_PRINT_TEXT(top+"mm",0,"100%","2mm","=== 订单统计 >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>");
									
									top+=4;
									LODOP.ADD_PRINT_TEXT(top+"mm","3.3mm","100%","6mm","应收金额: "+orderCount.sumReceivable);	

									top+=6;
									LODOP.ADD_PRINT_TEXT(top+"mm","3.3mm","100%","6mm","实收金额: "+orderCount.sumReceived);

									top+=6;
									var sumTradeCash = orderCount.sumTradeCash;
									sumTradeCash = sumTradeCash==null?0:sumTradeCash;
									LODOP.ADD_PRINT_TEXT(top+"mm","9.9mm","100%","6mm","		现金收入: "+sumTradeCash);

									top+=6;
									var sumTradeWechat = orderCount.sumTradeWechat;
									sumTradeWechat = sumTradeWechat==null?0:sumTradeWechat;
									LODOP.ADD_PRINT_TEXT(top+"mm","9.9mm","100%","6mm","	微信收入: "+sumTradeWechat);

									top+=6;
									var sumTradeAlipay = orderCount.sumTradeAlipay 
									sumTradeAlipay = sumTradeAlipay==null?0:sumTradeAlipay;
									LODOP.ADD_PRINT_TEXT(top+"mm","9.9mm","100%","6mm","	支付宝收入: "+sumTradeAlipay);

									top+=6;
									var sumTradeCreditCard = orderCount.sumTradeCreditCard;
									sumTradeCreditCard = sumTradeCreditCard==null?0:sumTradeCreditCard;
									LODOP.ADD_PRINT_TEXT(top+"mm","9.9mm","100%","6mm","	银行卡收入: "+sumTradeCreditCard);

									/*top+=6;
									LODOP.ADD_PRINT_TEXT(top+"mm","3.3mm","100%","6mm","混合付款: "+orderCount.sumCombinationPayment);*/

									top+=6;
									LODOP.ADD_PRINT_TEXT(top+"mm","3.3mm","100%","6mm","退单金额: "+orderCount.sumCancelOrder);

									top+=6;
									LODOP.ADD_PRINT_TEXT(top+"mm","3.3mm","100%","6mm","免单金额: "+orderCount.sumFreeOrder);
									
									top+=6;
									LODOP.ADD_PRINT_TEXT(top+"mm","3.3mm","100%","6mm","赠送金额: "+orderCount.sumLottery);
									
									top+=6;
									var sumResidue = orderCount.sumResidue;
									sumResidue = sumResidue==null?0:sumResidue;
									LODOP.ADD_PRINT_TEXT(top+"mm","3.3mm","100%","6mm","抹零总计："+(sumResidue).toFixed(2));
									
									top+=6;
									LODOP.ADD_PRINT_TEXT(top+"mm","3.3mm","100%","6mm","折扣总计："+(orderCount.sumDiscountPreferential).toFixed(2));

									top+=6;
									//Error: preferentialMoney.toFixed is not a function
									var preferentialMoney =(orderCount.sumCancelOrder+orderCount.sumFreeOrder+orderCount.sumLottery+orderCount.sumResidue+orderCount.sumDiscountPreferential).toFixed(2);		
									LODOP.ADD_PRINT_TEXT(top+"mm","3.3mm","100%","6mm","优惠总计: "+preferentialMoney);
									
									/*top+=4;
									LODOP.ADD_PRINT_TEXT(top+"mm",0,"100%","2mm","- - - - - - - - - - - -  - - - -- - - - - -- - - - -");								
									
									top+=6;
									LODOP.ADD_PRINT_TEXT(top+"mm","","100%","6mm","会员卡收入: "+orderCount.sumMemberRecharge);*/


                                    top+=4;
                                    LODOP.ADD_PRINT_TEXT(top+"mm",0,"100%","2mm","=== 会员卡统计 =========================================================");

                                    top+=6;
                                    LODOP.ADD_PRINT_TEXT(top+"mm","","100%","6mm","会员卡充值金额: "+orderCount.sumMemberRecharge);

                                    //0-xj,1-银行卡,2-微信,3-支付宝

                                    var memberTradeLogCountList =  orderCount.memberTradeLogCountList;
                                    for (var i = 0; i < memberTradeLogCountList.length; i++) {
                                        var payType = memberTradeLogCountList[i].payType;
                                        var payTypeName = '';
                                    	switch (payType){
											case 0 :	payTypeName = '现  金';break;
											case 1 :	payTypeName = '银行卡';break;
											case 2 :	payTypeName = '微  信';break;
											case 3 :	payTypeName = '支付宝';break;
										}

                                        top+=6;
                                        LODOP.ADD_PRINT_TEXT(top+"mm","","100%","6mm",'     '+payTypeName+': '+orderCount.memberTradeLogCountList[i].payTypeMoney);
                                    }
									
									top+=6;
									var sumMemberGiveMoney = orderCount.sumMemberGiveMoney;
									sumMemberGiveMoney = sumMemberGiveMoney==null?0:sumMemberGiveMoney;
									LODOP.ADD_PRINT_TEXT(top+"mm","","100%","6mm","会员卡赠送: "+sumMemberGiveMoney);

									top+=6;
									var sumMemberConsume = orderCount.sumMemberConsume;
									sumMemberConsume = sumMemberConsume==null?0:sumMemberConsume;
									LODOP.ADD_PRINT_TEXT(top+"mm","","100%","6mm","会员卡消费: "+sumMemberConsume);
									
									top+=4;
									LODOP.ADD_PRINT_TEXT(top+"mm",0,"100%","2mm","- - - - - - - - - - - -  - - - -- - - - - -- - - - -");
									
									top+=6;
									LODOP.ADD_PRINT_TEXT(top+"mm","","100%","6mm","挂账金额: "+orderCount.sumBill);
									
									LODOP.PREVIEW();
									//LODOP.PRINT();

								}else{
									alert('orderLogListControllerM_$scope.getOrderLogListF_if(type=print)_PrinterService.viewF_ERRO');
								}
							}
						)									  				
				},				
			function (error) {}
		);
	}
}])



orderLogModule .controller('productLogListController', [ '$scope','$location', 'ngTableParams', '$filter','orderLogService','ProductService','CategoryService','PrinterService','DataUtilService',
  function ($scope,$location,ngTableParams, $filter, orderLogService,ProductService,CategoryService,PrinterService,DataUtilService){
		$scope.filter = {
			  category_id: '',
			  product_id: '',
			  start_time: '',
			  end_time: ''
		  };
		$scope.dataUrlForepart=apiHost + '/image/';

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

	    $scope.listFilter = {};
		CategoryService.list({},
			function(response){
				if(!response.code==200){
				alert('获取类别失败');
				return;
			}
			$scope.categoryList=response.msg;
		})
		ProductService.list({},
			function(response){
				if(!response.code==200){
				alert('获取类别失败');
				return;
			}
			$scope.productList=response.msg;
		})

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

		$scope.changeCategory = function(){
			$scope.filter.product_id = "";
			if($scope.filter.category_id!=""&&$scope.filter.category_id!=null){
				ProductService.categoryProductList({id:$scope.filter.category_id},
					function(response){
						if(!response.code==200){
						alert('获取菜品失败');
						return;
					}
					$scope.productList=response.msg;
				})
			}else{
				ProductService.list({},
					function(response){
						if(!response.code==200){
						alert('获取类别失败');
						return;
					}
					$scope.productList=response.msg;
				})
			}
		}

		$scope.getProductLogList = function(type){
			var url = "";
			if($scope.filter.category_id!=''){
				url += '&category_id='+$scope.filter.category_id;
			}
			if($scope.filter.product_id!=''){
				url += '&product_id='+$scope.filter.product_id;
			}
			if($scope.filter.start_time!=''&&$scope.filter.end_time!=''){

				url += '&start_time='+encodeURI($scope.filter.start_time)
					+'&end_time='+encodeURI($scope.filter.end_time);
			}
			/*
			var str = url.charAt(url.length-1);
			if(str=='&'){
				var strs = url.substring(0,url.length-2);
			}else if(str=='?'){
				var strs = url.substring(0,url.length-1);
			}
			*/
			var export_excel = url;
			//console.log(export_excel);
			if(type!=''){
				/*url += '&type='+type;*/
				url +='&type=query'
			}

		  	orderLogService.productLogList({url:url}).$promise.then(function (response) {
				if(response.msg==null)
					response.msg = [];
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
				});
				$scope.tableParams.settings().$scope = $scope;
				$scope.tableParams.reload();
				var nowTime = DataUtilService.getNowTime();
				if(type=='print'){					
					var printerList = response.msg;
					console.log(printerList);
					function compare(property){
					    return function(a,b){
					        var value1 = a[property];
					        var value2 = b[property];
					        return value1 - value2;
				    	}
					}
				
					printerList.sort(compare('category_name'));
					var product_printList=[];
					var changed = false;
					for (var i = 0; i < printerList.length; i++) {
						var product_categoryList;
						if(i==0 || changed == true){
							changed = false;
							product_categoryList = [];
							product_categoryList.push(printerList[i]);				
						}
						if(i+2 > printerList.length){
								product_printList.push(product_categoryList);
								//console.log(product_printList);
								break;
						}			
						if(printerList[i+1].category_name == printerList[i].category_name){
							product_categoryList.push(printerList[i+1]);								
						}else{
							product_printList.push(product_categoryList);
							changed=true;
						}
							
					}					
					var productList = product_printList;
					PrinterService.getPrinterByPrinter_type(
							{printer_type:999},
							function(response){
								if(response.code==200){
									var printer = response.msg;
									
									var LODOP= getCLodop();								
									LODOP.SET_LICENSES("","3E893A594C00D5D9C1DBE7CD18C9E8DB","C94CEE276DB2187AE6B65D56B3FC2848","");
									LODOP.PRINT_INITA(1,1,700,600,'商铺'+localStorage.getItem('shop_id')+'_销售报表'+nowTime);
									
									var pageWidth = printer.page_width;
									if(pageWidth == null||pageWidth==0){
										alert("打印机名称:"+printer.category_name+"-对应打印机纸张宽度设置不符合要求,请在打印设置中重新设置");
										return;
									}
								
									//var pagesizesList = LODOP.GET_PAGESIZES_LIST(printer_name,"\n")
					                //var pageWidth = pagesizesList.substring(0,2);

					                LODOP.SET_PRINT_PAGESIZE(3, pageWidth+'mm',"","");
					              	
					                var printer_name = printer.name;

					              	var flag = LODOP.SET_PRINTER_INDEX(printer_name);				               	
									if(!flag){
										alert("打印设备不存在");
									}

									var top = 1;
									LODOP.ADD_PRINT_TEXT(top+"mm","4mm","26mm","8mm","     销售报表");
									LODOP.SET_PRINT_STYLEA(0,"Bold",1);
									LODOP.SET_PRINT_STYLEA(0,"Horient",2);
									//top+=6;
									//LODOP.ADD_PRINT_TEXT(top+"mm","","100%","4mm","统计类别:");
									top+=4;
									LODOP.ADD_PRINT_TEXT(top+"mm","","100%","4mm","统计时间:"+nowTime);
									top+=4;
									LODOP.ADD_PRINT_TEXT(top+"mm","","100%","4mm","开始日期:"+$scope.filter.start_time);
									top+=4;
									LODOP.ADD_PRINT_TEXT(top+"mm","","100%","4mm","结束日期:"+$scope.filter.end_time);
									top+=4;
									LODOP.ADD_PRINT_TEXT(top+"mm","","100%","4mm","操作员:"+localStorage.getItem("name"));
									top+=4;
									LODOP.ADD_PRINT_TEXT(top+"mm","","100%","2mm","- - - - - - - - - - - - - - - - - - - - - ");
									top+=4;
									LODOP.ADD_PRINT_TEXT(top+"mm",0,"100%","6mm","品名:");
									LODOP.ADD_PRINT_TEXT(top+"mm","70%","100%","6mm","数量:");								

										 
									for (var i = 0; i < productList.length; i++) {

										top+=6;	
										LODOP.ADD_PRINT_TEXT(top+"mm","5%","100%","4mm",productList[i][0].category_name);
										LODOP.SET_PRINT_STYLEA(0,"Bold",1);
										for (var j = 0; j < productList[i].length; j++) {

											top+=6;	
											LODOP.ADD_PRINT_TEXT(top+"mm",0,"100%","4mm",productList[i][j].name);
											LODOP.ADD_PRINT_TEXT(top+"mm","70%","100%","4mm",productList[i][j].sumCount);											
										}													
									};

									top+=4;									

									LODOP.PREVIEW();
									//LODOP.PRINT();

								}else{
									alert('productLogListControllerM_orderLogService.productLogListF_if(type==print)_PrinterService.view_ERROR');
								}
							}
					);											
				}
			 	if(type=='export_excel'){
					var url_export_excel = export_excel+'&type='+type;
					window.location.href=(apiHost+'/shop/'+localStorage.getItem("shop_id")+'/productCount?'+url_export_excel);
				};
			});
		}
	}
])

orderLogModule .controller('orderDetailListController', [ '$scope','$location','$routeParams','orderLogService','ProductService','DataUtilService','shopInformationService','tableOperateService','PrinterService',
function ($scope,$location,$routeParams, orderLogService,ProductService,DataUtilService,shopInformationService,tableOperateService,PrinterService) {
	$scope.dataUrlForepart=apiHost + '/image/';
	orderLogService.orderDetail({id:$routeParams.id},
		function (response) {
			if (response.code == 500) {
				alert('获取订单详情失败')
				return
			}
			$scope.orderList =[response.msg];
			tableOperateService.tableView({id:$scope.orderList[0].dining_table_id},
				function (response) {
					if (response.code == 500) {
						alert('获取桌位信息失败')
						return
					}
					$scope.tableInf  = response.msg;
				},
				function (error) {}
			);
			var reg = /^\d+(\.\d+)?$/;

			for(var i=0;i<$scope.orderList.length;i++){
				for(var j=0;j<$scope.orderList[i].loi.length;j++){
					var product = $scope.orderList[i].loi[j];		//商品
					var price = 0;									//总价
					//是否赠送
					if(product.is_lottery==1){
						$scope.orderList[i].loi[j].total_price = parseFloat(0).toFixed(2);;
						continue;
					}
					//是否断货/取消
					if(product.status_id==6||product.status_id==7){
						$scope.orderList[i].loi[j].total_price = parseFloat(0).toFixed(2);;
						continue;
					}
					//是否促销
					if(product.p.is_promotion==1){
						price = product.p.promotion_price*product.quantity;
					}else{
						price = product.p.unit_price*product.quantity;
					}
					//是否会员
					if($scope.orderList.isUseMember==1&&reg.test($scope.orderList.memberCardDiscount)){
						if(product.p.isMemberDiscount==1){
							price = price*$scope.orderList.memberCardDiscount;
						}
					}else if($scope.orderList.isUseMember==0&&reg.test($scope.orderList.discount)){
						if(product.p.is_discount==1){
							price = price*$scope.orderList.discount;
						}
					}
					price = parseFloat(price).toFixed(2);

					$scope.orderList[i].loi[j].total_price = price;
				}
			}
		},
		function (error) {}
	)
	//2017-11-03\
	//获取对应桌位信息
	$scope.tableInf ={};

	//获取对应商铺信息
	var shop = {}; 
	shopInformationService.view(
		{id:localStorage.getItem("shop_id")},
		function(response){
			if(response.code==200){
				shop = response.msg;			
			}else{
				alert("printerOrderController_shopInformationService.view");
			}
		},
		function (error) {}
	);
	//打印订单详情
	$scope.printPay =function(){
		//alert("打印订单详情");		
		PrinterService.getPrinterByPrinter_type(
			{printer_type:999},
			function(response){
				if(response.code==200){

					var nowTime = DataUtilService.getNowTime();
					var printer = response.msg;

					var LODOP= getCLodop();	
					LODOP.SET_LICENSES("","3E893A594C00D5D9C1DBE7CD18C9E8DB","C94CEE276DB2187AE6B65D56B3FC2848","");								
					LODOP.PRINT_INITA(1,1,700,600,'商铺'+localStorage.getItem('shop_id')+'订单详情');

					var printer_name = printer.name;

					var pageWidth = printer.page_width;
					if(pageWidth==null||pageWidth==0){
						alert("纸张宽度不能为空或零");
						return;
					}
					LODOP.SET_PRINT_PAGESIZE(3, pageWidth+"mm","","");
				
					var flag = LODOP.SET_PRINTER_INDEXA(printer_name);									
					if (flag) {																
						var top= 1;			
					LODOP.ADD_PRINT_TEXT(top+"mm","45%",pageWidth+"mm","6mm","           订单详情");
					LODOP.SET_PRINT_STYLEA(0,"Bold",1)
					LODOP.SET_PRINT_STYLEA(0,"Horient",2);	
					
					top+=5;
					LODOP.ADD_PRINT_TEXT(top+"mm",0,"100%","6mm","订单编号:"+$scope.orderList[0].order_no);

					top+=5;
					LODOP.ADD_PRINT_TEXT(top+"mm",0,"100%","6mm","收款员:"+localStorage.getItem("name"));	
					
					top+=5;
					var payTime = $scope.orderList[0].pay_time
					if(payTime){
						LODOP.ADD_PRINT_TEXT(top+"mm",0,"100%","6mm","结账时间:"+$scope.orderList[0].pay_time);
					}

					top+=5;				
					LODOP.ADD_PRINT_TEXT(top+"mm",0,"100%","2mm","- - - - - - - - - - - - - - -- - - - - - - - -- - -- - ");
					
					top+=5;
					LODOP.ADD_PRINT_TEXT(top+"mm",0,"100%","6mm","品名");
					LODOP.ADD_PRINT_TEXT(top+"mm","42%","100%","6mm","单价");										
					LODOP.ADD_PRINT_TEXT(top+"mm","62%","100%","6mm","数量");
					LODOP.ADD_PRINT_TEXT(top+"mm","81%","100%","6mm","金额");
						

					var orderList = $scope.orderList;
					for (var l = 0; l< orderList.length; l++) {
						
						//以category_id分组
						var orderItemList = orderList[l].loi; 			
						function compare(property){
							return function(a,b){
								var value1 = a[property];
								var value2 = b[property];
								return value1 - value2;
							}
						}
						orderItemList.sort(compare('category_id'));

						var orderItemListCategoryId = []
						var orderItemList_category = [];					
						for (var i = 0; i < orderItemList.length; i++) {
							if(i==0||orderItemList[i].category_id == orderItemList[i-1].category_id){

								orderItemListCategoryId.push(orderItemList[i]);
								
							}else{
								orderItemListCategoryId.sort(compare('product_id'));
								orderItemList_category.push(orderItemListCategoryId);

								orderItemListCategoryId = [];

								orderItemListCategoryId.push(orderItemList[i]);

							}
							if(i==orderItemList.length-1){

								orderItemListCategoryId.sort(compare('product_id'));

								orderItemList_category.push(orderItemListCategoryId)	
							}					
						}
					

						var orderItemList_category_productId =[];	

						for (var i = 0; i < orderItemList_category.length; i++) {
												
							var productId_orderItemList = [];

							var orderItemList_categoryProductId = [];

							var orderItemList_category_productIdNormal = []
							//商品ID分组
							for (var j = 0; j < orderItemList_category[i].length;j++) {
											
								if(j==0||orderItemList_category[i][j].product_id==orderItemList_category[i][j-1].product_id){

									if(orderItemList_category[i][j].is_lottery!=1&&orderItemList_category[i][j].status_id!=6&&orderItemList_category[i][j].status_id!=7){
																
										orderItemList_category_productIdNormal.push(orderItemList_category[i][j])	

									}else{
										
										productId_orderItemList.push(orderItemList_category[i][j]);			
									}
									
									if(j==orderItemList_category[i].length-1){
										
										if(orderItemList_category_productIdNormal.length>0){
											
											if (orderItemList_category_productIdNormal.length==1) {

												productId_orderItemList.push(orderItemList_category_productIdNormal[0])
												
											}
											if (orderItemList_category_productIdNormal.length>1) {
												
												for (var f = 1; f < orderItemList_category_productIdNormal.length; f++) {
													
													orderItemList_category_productIdNormal[0].quantity+=orderItemList_category_productIdNormal[f].quantity;
													
													console.log(orderItemList_category_productIdNormal)
												
												}
												productId_orderItemList.push(orderItemList_category_productIdNormal[0])
												
											}	
										}
										orderItemList_categoryProductId.push(productId_orderItemList);	
										
										orderItemList_category_productIdNormal = []						
									}	

								}else{

									if(orderItemList_category_productIdNormal.length>0){

										if (orderItemList_category_productIdNormal.length==1) {

											productId_orderItemList.push(orderItemList_category_productIdNormal[0])

										}
										if (orderItemList_category_productIdNormal.length>1) {
											for (var k = 1; k < orderItemList_category_productIdNormal.length; k++) {
												orderItemList_category_productIdNormal[0].quantity+=orderItemList_category_productIdNormal[k].quantity;
											}
											productId_orderItemList.push(orderItemList_category_productIdNormal[0])
											
										}	
									}

									orderItemList_categoryProductId.push(productId_orderItemList);

									productId_orderItemList=[]	
									orderItemList_category_productIdNormal=[]
										
									if(orderItemList_category[i][j].is_lottery!=1&&orderItemList_category[i][j].status_id!=6&&orderItemList_category[i][j].status_id!=7){
																
										orderItemList_category_productIdNormal.push(orderItemList_category[i][j])	
										
									}else{
										productId_orderItemList.push(orderItemList_category[i][j]);
									}
									if(j==orderItemList_category[i].length-1){

										if(orderItemList_category_productIdNormal.length>0){
											if (orderItemList_category_productIdNormal.length==1) {productId_orderItemList.push(orderItemList_category_productIdNormal[0])}
											if (orderItemList_category_productIdNormal.length>1) {
												for (var k = 1; k < orderItemList_category_productIdNormal.length; k++) {

													orderItemList_category_productIdNormal[0].quantity+=orderItemList_category_productIdNormal[k].quantity;
												}
												productId_orderItemList.push(orderItemList_category_productIdNormal[0])
												
											}	
										}
										orderItemList_categoryProductId.push(productId_orderItemList);
										orderItemList_category_productIdNormal=[]
									}				
								}							
							}
							
							orderItemList_category_productId.push(orderItemList_categoryProductId);

							orderItemList_categoryProductId=[]
						}
						
						//console.log("orderItemList_category_productId")
						//console.log(orderItemList_category_productId)

						top+=5;
						LODOP.ADD_PRINT_TEXT(top+"mm",0,"100%","2mm","- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - ");
						top+=3;
						console.log("orderList[l]------->")
						console.log(orderList[l])
						LODOP.ADD_PRINT_TEXT(top+"mm",0,"100%","4mm", "桌位:"+orderList[l].serial_id+(orderList[l].length>1&&k==0?"[主订单]":""));				
						for (var p = 0; p < orderItemList_category_productId.length; p++) {
								top+=6;										
								LODOP.ADD_PRINT_TEXT(top+"mm","5%","100%","4mm",orderItemList_category_productId[p][0][0].category_name);
								LODOP.SET_PRINT_STYLEA(0,"Bold",1);
							for (var t= 0; t < orderItemList_category_productId[p].length; t++) {
								
								for(var y = 0; y < orderItemList_category_productId[p][t].length; y++){									
									top+=6;					
									LODOP.ADD_PRINT_TEXT(top+"mm",0,"100%","3mm",orderItemList_category_productId[p][t][y].p.name);
									LODOP.ADD_PRINT_TEXT(top+"mm","55%","100%","4mm",orderItemList_category_productId[p][t][y].p.is_promotion==1?orderItemList_category_productId[p][t][y].p.promotion_price:orderItemList_category_productId[p][t][y].p.unit_price);
									LODOP.ADD_PRINT_TEXT(top+"mm","67%","100%","4mm",orderItemList_category_productId[p][t][y].quantity)
									LODOP.ADD_PRINT_TEXT(top+"mm","79%","100%","4mm",orderItemList_category_productId[p][t][y].is_lottery==1?"赠送":orderItemList_category_productId[p][t][y].status_id==6?'退菜':orderItemList_category_productId[p][t][y].status_id==7?'断货':orderItemList_category_productId[p][t][y].p.is_promotion==1?(orderItemList_category_productId[p][t][y].p.promotion_price*orderItemList_category_productId[p][t][y].quantity).toFixed(2):(orderItemList_category_productId[p][t][y].p.unit_price*orderItemList_category_productId[p][t][y].quantity).toFixed(2));                                                         
								}									
							}
						}
					
						top+=6;
						if(!$scope.tableInf.is_out==1){								
							LODOP.ADD_PRINT_TEXT(top+"mm",0,"100%","3mm","一元换购");
							LODOP.ADD_PRINT_TEXT(top+"mm","55%","100%","4mm",shop.service_charge);
							LODOP.ADD_PRINT_TEXT(top+"mm","67%","100%","4mm","1");
							LODOP.ADD_PRINT_TEXT(top+"mm","79%","100%","4mm",shop.service_charge);
						}											
					}																				
					top+=6									
					LODOP.ADD_PRINT_TEXT(top+"mm",0,"100%","2mm","- - - - - - - - - - - - - - - - - - - - - - - - - - - -");
					function isNull(x){
						if(x==null){
							return 0;
						}else{
							return x;
						}

					}
				
				
				if(orderList[0].tradeCash!=null&&orderList[0].tradeCash!=0){
					top+=6;
					LODOP.ADD_PRINT_TEXT(top+"mm","6.6mm","100%","6mm","现金支付: "+orderList[0].tradeCash);
				}
				
				

				if(orderList[0].tradeWechat!=null&&orderList[0].tradeWechat!=0){
					top+=6;
					LODOP.ADD_PRINT_TEXT(top+"mm","6.6mm","100%","6mm","微信支付: "+orderList[0].tradeWechat);
				}
				
				

				if(orderList[0].tradeAlipay!=null&&orderList[0].tradeAlipay!=0){
					top+=6;
					LODOP.ADD_PRINT_TEXT(top+"mm","6.6mm","100%","6mm","支付宝支付: "+orderList[0].tradeAlipay);
				}
				
				

				if(orderList[0].tradeCreditCard!=null&&orderList[0].tradeCreditCard!=0){
						top+=6;
				LODOP.ADD_PRINT_TEXT(top+"mm","6.6mm","100%","6mm","银行卡支付: "+orderList[0].tradeCreditCard);
				}
				
			

				if(orderList[0].tradeMemberMoney!=null&&orderList[0].tradeMemberMoney!=0){
					top+=6;
				LODOP.ADD_PRINT_TEXT(top+"mm","6.6mm","100%","6mm","余额支付: "+orderList[0].tradeMemberMoney);
				}
				
				

				if(orderList[0].tradeMemberIntegral!=null&&orderList[0].tradeMemberIntegral!=0){
					top+=6;
				LODOP.ADD_PRINT_TEXT(top+"mm","6.6mm","100%","6mm","积分支付: "+orderList[0].tradeMemberIntegral);
				}
				
				

				if(orderList[0].real_pay!=null&&orderList[0].real_pay!=0){	
					top+=6;
				LODOP.ADD_PRINT_TEXT(top+"mm","6.6mm","100%","6mm","合计应收: "+orderList[0].real_pay);
				}
				
				
				if(orderList[0].discount!=null&&orderList[0].discount!=0){
					top+=6;
					LODOP.ADD_PRINT_TEXT(top+"mm","6.6mm","100%","6mm","折扣: "+orderList[0].discount);	
				}
				
				if(orderList[0].residue!=null&&orderList[0].residue!=0){
					top+=6;
					LODOP.ADD_PRINT_TEXT(top+"mm","6.6mm","100%","6mm","抹零: "+orderList[0].residue);
				}
				
				
			
				
				var isFreeSingleOrIsBill= orderList[0].pay_type==120?"免单支付":orderList[0].pay_type==130?"挂账支付":false;
				if(isFreeSingleOrIsBill){
					top+=4;
					LODOP.ADD_PRINT_TEXT(top+"mm",0,"100%","2mm","- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - ");
					top+=6;
					LODOP.ADD_PRINT_TEXT(top+"mm","6.6mm","100%","6mm",isFreeSingleOrIsBill);
					LODOP.SET_PRINT_STYLEA(0,"Bold",1);
					top+=4;
				}
										   
			    if(shop.pay_code_id!=null){
			    	top+=6;	
					LODOP.ADD_PRINT_TEXT(top+"mm","1mm","100%","6mm","付款码: ");
					top+=6;
					var imgUrl = apiHost+'/image/'+ shop.pay_code_id;	
					LODOP.ADD_PRINT_BARCODE(top+"mm","15%","22%","22%","QRCode","<div><img src="+imgUrl+"/></div>");				
					//http://test-admin.lbcy.com.cn/www/#/table/
					//LODOP.ADD_PRINT_BARCODE(top+"mm","15%","22%","22%","QRCode","http://test-admin.lbcy.com.cn/www/#/table/10036");		 		   
					//LODOP. ADD_PRINT_IMAGE (1,"5%","100%","100%","<img src="+imgUrl+"/>"); 
					//LODOP. ADD_PRINT_HTML (top+"mm","5%","100%","100%","<div><img src="+imgUrl+"/></div>"); 
					//LODOP.SET_PRINT_STYLEA(0,"HtmWaitMilSecs",1000);         
					top+=40;
				}
				top+=4;	
				LODOP.ADD_PRINT_TEXT(top+"mm",0,"100%","2mm","- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - ");
				
				top+=4;
				LODOP.ADD_PRINT_TEXT(top+"mm","1mm","100%","6mm","商铺名称:"+shop.shop_name);

				top+=4;
				LODOP.ADD_PRINT_TEXT(top+"mm","1mm","100%","6mm","联系方式:"+shop.phone);
				
				top+=4;	
				LODOP.ADD_PRINT_TEXT(top+"mm",0,"100%","2mm","- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - ");

				top+=4;
				LODOP.ADD_PRINT_TEXT(top+"mm","1mm","100%","6mm","技术支持：河北玄宇通网络科技有限公司");

				top+=4;
				LODOP.ADD_PRINT_TEXT(top+"mm","1mm","100%","6mm","服务热线：400－0217－123");
					/*top+=6;

					top+=6;
					LODOP.ADD_PRINT_TEXT(top+"mm","6.6mm","100%","6mm","微信支付: "+isNull(orderList[0].tradeWechat));

					top+=6;
					LODOP.ADD_PRINT_TEXT(top+"mm","6.6mm","100%","6mm","支付宝支付: "+isNull(orderList[0].tradeAlipay));

					top+=6;
					LODOP.ADD_PRINT_TEXT(top+"mm","6.6mm","100%","6mm","银行卡支付: "+isNull(orderList[0].tradeCreditCard));

					top+=6;
					LODOP.ADD_PRINT_TEXT(top+"mm","6.6mm","100%","6mm","余额支付: "+isNull(orderList[0].tradeMemberMoney));

					top+=6;
					LODOP.ADD_PRINT_TEXT(top+"mm","6.6mm","100%","6mm","积分支付: "+isNull(orderList[0].tradeMemberIntegral));

					top+=6;
					LODOP.ADD_PRINT_TEXT(top+"mm","6.6mm","100%","6mm","合计: "+isNull(orderList[0].real_pay));
					
					var orderListDiscount =orderList[0].discount==null?(orderList[0].memberCardDiscount==null?false:orderList[0].discount):orderList[0].discount;
					if(orderListDiscount){
						top+=6;
						LODOP.ADD_PRINT_TEXT(top+"mm","6.6mm","100%","6mm","折扣: "+orderListDiscount);	
					}
					top+=6;
					LODOP.ADD_PRINT_TEXT(top+"mm","6.6mm","100%","6mm","抹零: "+isNull(orderList[0].residue))
					
					top+=6;
					LODOP.ADD_PRINT_TEXT(top+"mm","6.6mm","100%","6mm","应付: "+isNull(orderList[0].total_free));
					
					

					var isFreeSingleOrIsBill= orderList[0].pay_type==120?"免单支付":orderList[0].pay_type==130?"挂账支付":false;
					if(isFreeSingleOrIsBill){
						top+=4;
						LODOP.ADD_PRINT_TEXT(top+"mm",0,"100%","2mm","- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - ");
						top+=6;
						LODOP.ADD_PRINT_TEXT(top+"mm","6.6mm","100%","6mm",isFreeSingleOrIsBill);
						LODOP.SET_PRINT_STYLEA(0,"Bold",1);
						top+=4;
					}
					
					
						   
				    if(shop.pay_code_id!=null){
				    	top+=6;		
						LODOP.ADD_PRINT_TEXT(top+"mm","1mm","100%","6mm","付款码: ");
						top+=6;
						var imgUrl = apiHost+'/image/'+ shop.pay_code_id;	
						LODOP.ADD_PRINT_BARCODE(top+"mm","15%","22%","22%","QRCode","<div><img src="+imgUrl+"/></div>");				
						//http://test-admin.lbcy.com.cn/www/#/table/
						//LODOP.ADD_PRINT_BARCODE(top+"mm","15%","22%","22%","QRCode","http://test-admin.lbcy.com.cn/www/#/table/10036");		 		   
						//LODOP. ADD_PRINT_IMAGE (1,"5%","100%","100%","<img src="+imgUrl+"/>"); 
						//LODOP. ADD_PRINT_HTML (top+"mm","5%","100%","100%","<div><img src="+imgUrl+"/></div>"); 
						//LODOP.SET_PRINT_STYLEA(0,"HtmWaitMilSecs",1000);         
						top+=40;	
						
					}
					top+=4;
					LODOP.ADD_PRINT_TEXT(top+"mm",0,"100%","2mm","- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - ");

					top+=4;
					LODOP.ADD_PRINT_TEXT(top+"mm","1mm","100%","6mm","商铺名称:"+shop.shop_name);

					top+=4;
					LODOP.ADD_PRINT_TEXT(top+"mm","1mm","100%","6mm","联系方式:"+shop.phone);*/
												
					//LODOP.PREVIEW();
					LODOP.PRINT();

					}else{
						alert("对应名称打印设备不存在");
					}									
				}else{
					alert("获取对应打印机名称失败");
				}
			}
		)
	}
}])