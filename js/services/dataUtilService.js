'use strict'

var dataUtilService = angular.module('dataUtilService', ['ngResource'])

var MaleOrFemale = [{id: 0,value: '女'}, {id: 1,value: '男'}]

var OpenOrClose = [{id: 0,value: '锁定'}, {id: 1,value: '激活'}]

var YesOrNo = [{id: 0,value: '未缴'}, {id: 1,value: '已缴'}]

var PayType = [{id: 0,value: '现金'}, {id: 1,value: '银行卡'},{id: 2,value: '微信'}, {id: 3,value: '支付宝'}]

var YesNoModel=[{id:0,value:'否'},{id:1,value:'是'}];

var Is_EnableModel=[{id:0,value:'不启用'},{id:1,value:'启用'}];

var getNowTime = function(){
	  	var now = new Date();
	  	//console.log(new now);
	  	var year = now.getFullYear(); //getFullYear getYear
	  	var month = now.getMonth();
	  	var date = now.getDate();
		//var day = now.getDay();
		var hour = now.getHours();
		var minu = now.getMinutes();
		var sec = now.getSeconds();
	  	//var week;
	 	month = month + 1;
	  	if (month < 10) month = "0" + month;
	  	if (date < 10) date = "0" + date;
	 	if (hour < 10) hour = "0" + hour;
	  	if (minu < 10) minu = "0" + minu;
	  	if (sec < 10) sec = "0" + sec;
	  	//var arr_week = new Array("星期日", "星期一", "星期二", "星期三", "星期四", "星期五", "星期六");
	  	//week = arr_week[day];
	  	//var time = "";
	  	//time = year + "年" + month + "月" + date + "日" + " " + hour + ":" + minu + ":" + sec + " " + week;
  	 	var retTime = retTime;
  	 	retTime =	year + "-" + month + "-" + date + " " + hour + ":" + minu + ":" + sec
  		//$("#bgclock").html(time);
  		//var timer = setTimeout("clockon()", 200);
  		return retTime;
};
dataUtilService.factory('DataUtilService', function ($resource) {
  return {
    MaleOrFemale: MaleOrFemale,
    OpenOrClose:OpenOrClose,
    YesOrNo:YesOrNo,
	PayType:PayType,
	YesNoModel:YesNoModel,
	Is_EnableModel:Is_EnableModel,
	getNowTime:getNowTime
  }
})
