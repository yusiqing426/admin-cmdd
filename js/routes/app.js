'use strict'

var appRoutes = [
  ['/orderLog/list',           'orderLog/order-list.html',    'orderLogListController'],
  ['/productLog/list',           'orderLog/product-list.html',    'productLogListController'],
  ['/orderDetailList/:id',           'orderLog/detail-list.html',    'orderDetailListController'],

  ['/kitchenOperate/:status',           'tableOperate/kitchen-list.html',    'kitchenOperateController'],
  ['/printerOrder/:tableId',           'tableOperate/printer-list.html',    'printerOrderController'],
  ['/payOrder/:tableId',           'tableOperate/pay-list.html',    'payOrderController'],
  ['/mergeTable/:tableId',           'tableOperate/merge-table.html',    'mergeTableController'],
  ['/changeTable/:tableId',           'tableOperate/change-table.html',    'changeTableController'],
  ['/servingList/:tableId',           'tableOperate/serving-list.html',    'servingListController'],
  ['/orderDetail/:tableId',           'tableOperate/order-detail.html',    'orderDetailController'],
  ['/takingOrder/:tableId',           'tableOperate/taking-order-list.html',    'takingOrderListController'],
  ['/cartList/:tableId',           'tableOperate/cart-list.html',    'cartListController'],
  ['/searchList/:tableId',           'tableOperate/search-list.html',    'searchListController'],
  ['/addOrder/:tableId/:isTakeOut',           'tableOperate/add-order-list.html',    'addOrderController'],
  ['/callService/list',           'tableOperate/call-service-list.html',    'callServiceListController'],
  ['/tableOperate/list',           'tableOperate/list.html',    'tableOperateListController'],
  ['/takeout/list',           'tableOperate/take_out_list.html',    'takeOutController'],

  ['/dataentry/dining_table',           'dining_table/list.html',    'dining_tableListController'],
  ['/dataentry/dining_table/create',    'dining_table/create.html',  'dining_tableCreateController'],
  ['/dataentry/dining_table/:id',       'dining_table/view.html',    'dining_tableController'],

  ['/dataentry/category',           'category/list.html',    'categoryListController'],
  ['/dataentry/category/create',    'category/create.html',  'categoryCreateController'],
  ['/dataentry/category/:id',       'category/view.html',    'categoryController'],

  ['/dataentry/product',           'product/list.html',    'productListController'],
  ['/dataentry/product/create',    'product/create.html',  'productCreateController'],
  ['/dataentry/product/:id',       'product/view.html',    'productController'],
  
  ['/dataentry/printer',           'printer/list.html',    'printerListController'],
  ['/dataentry/printer/create',    'printer/create.html',  'printerCreateController'],
  ['/dataentry/printer/:id',       'printer/view.html',    'printerController'],

  ['/memberDataentry/pointsRule',           'memberInformation/pointsRule.html',    'pointsRuleController'],
  ['/memberDataentry/cardView/:id',           'memberInformation/cardView.html',    'cardViewController'],
  ['/memberDataentry/cardCreate',           'memberInformation/cardCreate.html',    'cardCreateController'],
  ['/memberDataentry/cardList',           'memberInformation/cardList.html',    'cardListController'],
  
  ['/memberDataentry/index',           'memberInformation/index.html',    'memberIndexController'],
  ['/memberDataentry/memberInformation',           'memberInformation/list.html',    'memberInformationListController'],
  ['/memberDataentry/memberInformation/create',    'memberInformation/create.html',  'memberInformationCreateController'],
  ['/memberDataentry/memberInformation/view/:id',       'memberInformation/view.html',    'memberInformationController'],
  ['/memberDataentry/memberInformation/profile/:id',   'memberInformation/change-password.html',    'memberChangePasswordController'],
  ['/memberDataentry/memberInformation/recharge/:id',   'memberInformation/recharge.html',    'memberRechargeController'],
  ['/memberDataentry/memberInformation/exchange/:id',   'memberInformation/exchange.html',    'memberExchangeController'],
  ['/memberDataentry/memberInformation/payList',   'memberInformation/pay_list.html',    'memberPayListController'],

  ['/lotteryLog',           'lotteryLog/list.html',    'lotteryLogController'],
  ['/lotteryProduct',           'lotteryLog/view.html',    'lotteryProductController'],

  ['/kitchenDataentry/kitchen',           'kitchen/list.html',    'kitchenListController'],
  ['/kitchenDataentry/kitchen/create',    'kitchen/create.html',  'kitchenCreateController'],
  ['/kitchenDataentry/kitchen/:id',       'kitchen/view.html',    'kitchenController'],

  ['/staffDataentry/staffInformation',           'staffInformation/list.html',    'staffInformationListController'],
  ['/staffDataentry/staffInformation/create',    'staffInformation/create.html',  'staffInformationCreateController'],
  ['/staffDataentry/staffInformation/view/:id',       'staffInformation/view.html',    'staffInformationController'],
  ['/staffDataentry/staffInformation/profile/:id',   'staffInformation/change-password.html',    'staffChangePasswordController'],

  ['/shopDataentry/shopInformation',           'shopInformation/list.html',    'shopInformationListController'],
  ['/shopDataentry/shopInformation/create',    'shopInformation/create.html',  'shopInformationCreateController'],
  ['/shopDataentry/shopInformation/view/:id',       'shopInformation/view.html',    'shopInformationController'],
  ['/shopDataentry/shopInformation/profile',   'shopInformation/change-password.html',    'shopChangePasswordController'],
  ['/shopDataentry/shopInformation/change-password-success',  'shopInformation/change-password-success.html', ''],

  ['/shopDataentry/shopPay',           'shopPay/list.html',    'shopPayListController'],
  ['/shopDataentry/shopPay/create',    'shopPay/create.html',  'shopPayCreateController'],
  ['/shopDataentry/shopPay/view/:id',       'shopPay/view.html',    'shopPayController'],
  ['/shopDataentry/shopPay/history',           'shopPay/historyPay.html',    'shopPayHistoryController'],
  ['/shopDataentry/shopPay/Parameters',           'shopPay/payParameters.html',    'shopParametersController'],

  ['/Bannerdataentry/banner',           'banner/list.html',    'bannerListController'],
  ['/Bannerdataentry/banner/create',    'banner/create.html',  'bannerCreateController'],
  ['/Bannerdataentry/banner/:id',       'banner/view.html',    'bannerController'],

  ['/shopDataentry/lottery',       'lottery/view.html',    'lotteryController'],
  

  ['/agentDataentry/agentInformation',                  'agentInformation/list.html',         'agentInformationListController'],
  ['/agentDataentry/agentInformation/create',           'agentInformation/create.html',       'agentInformationCreateController'],
  ['/agentDataentry/agentInformation/profile',    'agentInformation/change-password.html',  'agentChangePasswordController'],
  ['/agentDataentry/agentInformation/view/:id',              'agentInformation/view.html',         'agentInformationController'],
  
  ['/agentDataentry/agentShopPay/Parameters',          'agentPay/shopPayParameters.html',         'agentShopPayParametersController'],
  ['/agentDataentry/agentShopPay',          'agentPay/shopPayList.html',         'agentShopPayListController'],
  ['/agentDataentry/agentPay',              'agentPay/list.html',         'agentPayListController'],
  ['/agentDataentry/agentPay/create',       'agentPay/create.html',       'agentPayCreateController'],
  ['/agentDataentry/agentPay/history',      'agentPay/historyPay.html',     'agentPayHistoryController'],
  ['/agentDataentry/agentPay/Parameters',   'agentPay/payParameters.html',  'agentPayParametersController'],
  ['/agentDataentry/agentPay/view/:id',     'agentPay/view.html',         'agentPayController'],
  
  ['/platformAccount/change-password',          'platform/change-password.html',         'plantformChangePasswordController'],
  ['/',          'welcome.html',         'homeController'],
  
  ['/dataentry/dining_table',           'dining_table/list.html',    'dining_tableListController'],
  ['/dataentry/dining_table/create',    'dining_table/create.html',  'dining_tableCreateController'],
  ['/dataentry/dining_table/:id',       'dining_table/view.html',    'dining_tableController'],

  ['/dataentry/category',           'category/list.html',    'categoryListController'],
  ['/dataentry/category/create',    'category/create.html',  'categoryCreateController'],
  ['/dataentry/category/:id',       'category/view.html',    'categoryController'],

  ['/dataentry/product',           'product/list.html',    'productListController'],
  ['/dataentry/product/create',    'product/create.html',  'productCreateController'],
  ['/dataentry/product/:id',       'product/view.html',    'productController'],
  
  ['/dataentry/printer',           'printer/list.html',    'printerListController'],
  ['/dataentry/printer/create',    'printer/create.html',  'printerCreateController'],
  ['/dataentry/printer/:id',       'printer/view.html',    'printerController']
];

storeApp.config(['$routeProvider', function($routeProvider) {

  appRoutes.forEach(function(route){
    $routeProvider.when(route[0], {templateUrl: 'templates/' + route[1], controller: route[2]});
  });

  $routeProvider.otherwise({templateUrl: 'templates/welcome.html'});

}]);
