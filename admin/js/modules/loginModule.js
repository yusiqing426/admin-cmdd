'use strict'

var loginModule = angular.module('loginModule', [])

loginModule.controller('loginController',
    ['$scope', '$window', 'LoginService',
        function ($scope, $window, LoginService) {

            $scope.error = "";

            $scope.login = function (user) {
                console.log(user);

                var account0 = user.account.charAt(0);
                /*if(account0=='f'){
                  login_local();
              }else {
                  login_remote();
              }*/
                login();

                function login() {
                    LoginService.login(
                        user,
                        function (response) {
                            console.log(response)
                            if (angular.isDefined(response.code) && response.code == '200') {



                                //前台
                                if (angular.isDefined(response.msg.printerListByShop)) {

                                    var printerListByShop = response.msg.printerListByShop;

                                    if (printerListByShop.length > 0) {
                                        for (var i = 0; i < printerListByShop.length; i++) {
                                            localStorage.setItem(
                                                printerListByShop[i].printer_type, [printerListByShop[i].name, printerListByShop[i].page_width]
                                            );
                                        }
                                    }
                                    var shop_is_unified_print = response.msg.shop_is_unified_print;
                                    localStorage.setItem('shop_is_unified_print', shop_is_unified_print);
                                }
                                var token = response.msg.token;
                                var id = response.msg.user_id;
                                var user_keys = response.msg.user_keys;


                                localStorage.setItem('token', token);
                                localStorage.setItem('id', id);


                                localStorage.setItem('user_keys', user_keys);
                                localStorage.setItem('is_remind', "1")
                                localStorage.setItem('name', response.msg.name)
                                //var strs = new Array(); //定义一数组
                                //strs = user_keys.split(","); //字符分割
                                localStorage.setItem('now_keys', user_keys);

                                //return
                                if (user_keys !='1' && user_keys != '2') {
                                    //除管理员除的商铺人员
                                    if (user_keys=='3') {
                                        localStorage.setItem('shop_id', id)
                                        //localStorage.setItem('name', '管理员')
                                    } else {
                                        //LoginService.getShopId(
                                            //{id: id},
                                            //function (response) {
                                        localStorage.setItem('shop_id', response.msg.shopId);
                                        //localStorage.setItem('name', response.msg.name);

                                            //}
                                        //)

                                    }

                                }

                                function loginInit() {

                                    $window.location.href = 'home.html';
                                }

                                setTimeout(loginInit, 2000);

                            } else {
                                $scope.error = response.msg
                            }
                        },
                        function (error) {
                            console.log(error);
                        }
                    );
                }

                /*	function login_remote(){
                     LoginService.login_remote(
                         user,
                         function(response) {

                             if(angular.isDefined(response.code) && response.code == 200) {

                                 console.log(response)

                               /!*  var printerListByShop = [];
                                 printerListByShop = response.msg.printerListByShop;
                                 if(printerListByShop.length>0){
                                     for (var i = 0; i < printerListByShop.length; i++) {
                                         localStorage.setItem(printerListByShop[i].printer_type,[printerListByShop[i].name,printerListByShop[i].page_width]);
                                     }
                                 }*!/
                                 var shop_is_unified_print = response.msg.shop_is_unified_print;
                                 localStorage.setItem('shop_is_unified_print', shop_is_unified_print);

                                 var token = response.msg.token;
                                 var id = response.msg.user_id;
                                 var user_keys = response.msg.user_keys;


                                 localStorage.setItem('token', token);
                                 localStorage.setItem('id', id);


                                 localStorage.setItem('user_keys', user_keys);
                                 localStorage.setItem('is_remind', "1")
                                 var strs= new Array(); //定义一数组
                                 strs=user_keys.split(","); //字符分割
                                 localStorage.setItem('now_keys', strs[0]);

                                 //return
                                 if(strs[0]!=1&&strs[0]!=2){
                                     //除管理员除的商铺人员
                                     if(strs[0]==3&&JSON.stringify(user_keys).indexOf(7)==-1){
                                         localStorage.setItem('shop_id', id)
                                         localStorage.setItem('name', '管理员')
                                         LoginService.getShopInfo(
                                             {id:id},
                                             function(response){
                                                 var service_charge = 0;
                                                 if(response.msg.service_charge!=null){
                                                     service_charge = response.msg.service_charge;
                                                 }
                                                 localStorage.setItem('service_charge', service_charge);

                                             }
                                         )
                                     }else{
                                         LoginService.getShopId(
                                             {id:id},
                                             function(response){
                                                 localStorage.setItem('shop_id', response.msg.shop_id);
                                                 localStorage.setItem('name', response.msg.name);
                                                 LoginService.getShopInfo(
                                                     {id:response.msg.shop_id},
                                                     function(response){
                                                         var service_charge = 0;
                                                         if(response.msg.service_charge!=null){
                                                             service_charge = response.msg.service_charge;
                                                         }
                                                         localStorage.setItem('service_charge', service_charge)
                                                     }
                                                 )
                                             }
                                         )
                                     }

                                 }
                                 $window.location.href = 'home.html';
                             }else{
                               $scope.error = response.msg
                             }
                         },
                         function(error) {
                             console.log(error);
                         }
                     );
                 }
                 function login_local(){
                     LoginService.login_local(user,
                         function(response) {
                             console.log(response);

                             if(angular.isDefined(response.code) && response.code == 200) {

                                 var token = response.msg.token;
                                 var id = response.msg.user_id;
                                 var user_keys = response.msg.user_keys;
                                 /!*var printerListByShop = [];
                                 printerListByShop = response.msg.printerListByShop;
                                 if(printerListByShop.length>0){
                                     for (var i = 0; i < printerListByShop.length; i++) {
                                         localStorage.setItem(printerListByShop[i].printer_type,[printerListByShop[i].name,printerListByShop[i].page_width]);
                                     }
                                 }*!/
                                 var shop_is_unified_print = response.msg.shop_is_unified_print;
                                 localStorage.setItem('shop_is_unified_print', shop_is_unified_print);

                                 localStorage.setItem('token', token);
                                 localStorage.setItem('id', id);

                                 localStorage.setItem('user_keys', user_keys);
                                 localStorage.setItem('is_remind', 1);
                                 var strs= new Array(); //定义一数组
                                 strs=user_keys.split(","); //字符分割
                                 localStorage.setItem('now_keys', strs[0]);

                                 if(strs[0]!=1&&strs[0]!=2){
                                     if(strs[0]==3&&JSON.stringify(user_keys).indexOf(7)==-1){
                                         localStorage.setItem('shop_id', id)
                                         localStorage.setItem('name', '管理员')
                                         LoginService.getShopInfo({id:id},function(response5){
                                             var service_charge = 0;

                                             if(response5.msg.service_charge!=null){
                                                 service_charge = response5.msg.service_charge;
                                                 localStorage.setItem('service_charge', service_charge)
                                             }
                                         })
                                     }else{
                                         LoginService.getShopId_local({id:id},function(response5){
                                             console.log(response5)
                                             localStorage.setItem('shop_id', response5.msg.shop_id)
                                             localStorage.setItem('name', response5.msg.name)
                                             LoginService.getShopInfo({id:response5.msg.shop_id},function(response){
                                                 var service_charge = 0;

                                                 if(response5.msg.service_charge!=null){
                                                     service_charge = response5.msg.service_charge;
                                                     localStorage.setItem('service_charge', service_charge)
                                                 }
                                             })
                                         })
                                     }
                                 }else{
                                     $window.location.href = 'home.html';
                                 }
                                 function loginInit(){
                                     //dev
                                     $window.location.href = 'home.html';
                                 }
                                 setTimeout(loginInit,3000);
                             }else{
                                 $scope.error = response.msg;
                             }
                         },
                         function(error) {
                             console.log(error);
                         }
                     );
                 }*/
            };
        }]);
