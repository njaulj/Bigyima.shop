var express = require('express');
var router = express.Router();
var redis = require("redis");
//var client = redis.createClient(6379, '127.0.0.1', {connect_timeout: 1});
var group = require('../controllers/group')
var category = require('../controllers/category')
var brand = require('../controllers/brand')
var product = require('../controllers/product')
var differ = require('../controllers/differ')
var comment = require('../controllers/comment')
var pic = require('../controllers/pic')

var user = require('../controllers/user')
var cart = require('../controllers/cart')
var address = require('../controllers/address')
var order = require('../controllers/order')
var site = require('../controllers/site')
var node = require('../controllers/node')
var detail = require('../controllers/detail')
var ship=require('../controllers/ship')
var my = require('../controllers/my')
var search =  require('../controllers/search')

    /* GET home page. */	
router.get('/',site.index)						//商城首页
router.get('/combineResource',search.combine) //setimtout 自动执行 生成一条条便于搜索的条目信息
router.post('/search',site.search)		//搜索商品，目前是按照 商品名称正则匹配，表单提交方式
router.get('/search',site.search)		//搜索商品，url直接查询模式，目前也是按照 商品名称正则匹配
router.get('/logout',user.logout)		//注销
	

router.get('/signup',user.showSignup)	//注册界面
router.post('/signup',user.signup)		//表单提交注册信息
router.get('/signin',user.showSignin)	//登陆界面
router.post('/signin',user.signin)		//表单提交登陆信息
router.get('/upload',product.showupload);	//废弃
router.post('/upload',product.upload);	//废弃
router.get('/newcomment',comment.new);	//废弃
router.get('/ajaxcomm',comment.ajaxcomm)	//商品详情页 ，ajax方式获得商品的评价

router.post('/address/new',address.new)	//新增收货地址



router.get('/addCart/:bid/:pid/:did/:num',user.signinRequired,cart.addCart)	//往购物车放东西 ajax方式


router.get('/product',product.showProduct)	//商品详情页


router.get('/cart',user.signinRequired,cart.cart) //我的购物车
router.get('/cart/add/:cid/:num',user.signinRequired,cart.addOnce)	//ajax,对我的购物车中的单个商品进行数量加1操作
router.get('/cart/minus/:cid/:num',user.signinRequired,cart.minusOnce) //ajax,对我的购物车中的单个商品进行数量减1操作
router.get('/cart/set/:cid/:num',user.signinRequired,cart.setOnce) //ajax,对我的购物车中的单个商品进行数量直接赋值操作
router.post('/cart/del/:cid/:state',user.signinRequired,cart.delOnce)	//ajax,对我的购物车中的单个商品进行删除操作
router.post('/cart/po',user.signinRequired,cart.cartpo)	//表单方式提交，对我的购物车中的勾选的商品－》结算环节
router.get('/cart/buy',user.signinRequired,cart.cartbuy)	//结算页面，用户确认收货信息以及付款方式以及本次购物商品条目生成订单


/**************************/
router.get('/admin/product/edit',product.edit)	//	管理员添加商品
router.post('/admin/product/update',product.update)	//表单方式提交 ，新增商品
router.post('/pic/upload',pic.upload) //ajax 方式 上传 商品－单品图片，返回图片唯一码
router.post('/pic/blog',pic.blog)	//ajax 方式 上传 商品详情，商品参数中的 图片，返回图片唯一码
router.get('/admin/differ/list',differ.list)	//管理员管理商品单品列表页
router.post('/admin/differ/list',differ.line)	//ajax 方式对管理员批量操作商品单品列表页反馈
router.post('/admin/differ/delete',differ.delete)	//ajax方式对管理员在 admin/product/modify 中删除单品进行反馈


router.get('/admin/product/list',product.list)	//管理员管理商品列表页
router.post('/admin/product/list',product.line)	//ajax 管理员批量操作商品页操作
router.get('/admin/product/modify',product.modify)	//管理员对商品属性进行修改
router.post('/admin/product/commit',product.commit)	//表单方式提交管理员对于商品属性的修改


router.get('/node/tree',node.tree)		//管理员商城结构树页面
router.get('/node',node.node)	//	ajax 方式获得某个parent node 下一层的childnode
router.get('/show/tree',group.showtree)	//ajax，管理员在 admin/product/edit ||modify 中的商品类别中获得目录树
router.post('/node/nodeUpdate',node.update)	//ajax，方式在 node.tree页面中进行目录树名称的更新
router.post('/node/nodeCreate',node.create)	//ajax 方式创建新的node 节点
router.post('/node/nodeDelete',node.delete)	//ajax 方式删除node节点


router.get('/admin/order/list',order.list)	//管理员管理订单列表
router.post('/admin/order/list',order.line)	//ajax 管理员批量操作订单的反馈
router.get('/order',order.show) //显示单个订单的详细情况
router.post('/order/pay',order.pay)	//订单付款，未实现


router.get('/admin/detail/list',detail.list)    //管理员管理订单单个商品的列表
router.post('/admin/detail/list',detail.line)	//ajax 管理员批量对订单中的所有商品进行操作的反馈


router.post('/ship/save',ship.save)	//表单方式 提交物流信息保存
router.post('/ship/list',ship.list)	//ajax方式 获得物流列表
router.get('/ship/query',ship.query)	//利用聚合数据提供的接口，跟踪订单状态


router.get('/myzone/index',my.index)	//用户后台首页
router.get('/myzone/analyses/order',my.anaorder)	//ajax 用户后台 分析订单数据
router.get('/ajaxcart',cart.ajaxcart)	//ajax 获得购物车中的商品
router.get('/ajaxnewp',product.ajaxnewp)	//ajax 获得最新商品
router.get('/ajaxsp',product.ajaxsp)	//ajax 获得单个商品的详细信息 供fastview 调用
router.get('/ajaxintro',site.intro) //ajax 获得大姨妈推荐商品列表
router.get('/ajaxtop',site.top)	//ajax 获得数据中排名前10的商品列表


router.get('/admin/brandPic',brand.brandPic)	//管理员 品牌图片管理页
router.get('/ajaxbrand',brand.ajaxbrand)	//ajax 获得单个品牌的信息
router.post('/pic/brand',pic.brand)	//ajax 提交品牌图片 dropzone.js

router.get('/ajaxbrands',brand.ajaxbrands)	//ajax 获得入住品牌列表 用于前台导购


router.get('/productlist',product.brandtoproduct)	//前台单一品牌下的所有商品信息

router.get('/profile',site.profile)
router.post('/score',site.score)

router.get('/ranking',site.ranking)

router.get('/paiwei',site.paiwei)

router.get('/paiweino',site.paiweino)
// category.getChild('555ac529673f9aaa25013036')
// group.getChild('555aa9aa2358a563251002b0')

module.exports = router;