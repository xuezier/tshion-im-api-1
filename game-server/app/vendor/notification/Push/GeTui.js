'use strict';

var GeTui = require('../../getui/sdk/GT.push');
var Target = require('../../getui/sdk/getui/Target');

var APNTemplate = require('../../getui/sdk/getui/template/APNTemplate');
var BaseTemplate = require('../../getui/sdk/getui/template/BaseTemplate');
var APNPayload = require('../../getui/sdk/payload/APNPayload');
var DictionaryAlertMsg = require('../../getui/sdk/payload/DictionaryAlertMsg');
var SimpleAlertMsg = require('../../getui/sdk/payload/SimpleAlertMsg');
var NotyPopLoadTemplate = require('../../getui/sdk/getui/template/NotyPopLoadTemplate');
var LinkTemplate = require('../../getui/sdk/getui/template/LinkTemplate');
var NotificationTemplate = require('../../getui/sdk/getui/template/NotificationTemplate');
var PopupTransmissionTemplate = require('../../getui/sdk/getui/template/PopupTransmissionTemplate');
var TransmissionTemplate = require('../../getui/sdk/getui/template/TransmissionTemplate');

var SingleMessage = require('../../getui/sdk/getui/message/SingleMessage');
var AppMessage = require('../../getui/sdk/getui/message/AppMessage');
var ListMessage = require('../../getui/sdk/getui/message/ListMessage');

// http的域名
var HOST = 'http://sdk.open.api.igexin.com/apiex.htm';

const config = require('../../../../config/config').getui;
const Push = require('./Push');
//https的域名
//var HOST = 'https://api.getui.com/apiex.htm';

//Android用户测试
var APPID = config.appid;
var APPKEY = config.appkey;
var MASTERSECRET = config.mastersecret;
var CID = '';
//IOS用户测试
//var DEVICETOKEN='';
var alias = 'demo';

var gt = new GeTui(HOST, APPKEY, MASTERSECRET);
gt.connect(function() {
  console.log('getui service connected');
});


class Getui extends Push {
  constructor() {
    super();
  }

  _NotificationTemplateDemo(notification) {
    let { from_name: title, content: text, from, roomid, type } = notification;
    var template = new NotificationTemplate({
      appId: APPID,
      appKey: APPKEY,
      title: title,
      text,
      logo: 'logo.png',
      isRing: true,
      isVibrate: true,
      isClearable: true,
      transmissionType: 2,
      transmissionContent: JSON.stringify({ sender: from, roomid, type })
    });
    return template;
  }

  /**
   * push message to single cid
   * @param {SingleMessage} message
   * @param {Target} target
   */
  _pushMessageToSingle(message, target) {
    return new Promise((resolve, reject) => {
      gt.pushMessageToSingle(message, target, function(err, res) {
        if (err != null && err.exception != null && err.exception instanceof RequestError) {
          var requestId = err.exception.requestId;
          return gt.pushMessageToSingle(message, target, requestId, function(err, res) {
            if (err) return reject(err);
            resolve(res);
          });
        }
        resolve(res);
      });
    });
  }

  _pushMessageToSingleBatch(message, targets) {
    process.env.gexin_pushSingleBatch_needAsync = true;
    var Batch = gt.getBatch();

    for (let t of targets) {
      //接收方
      var target = new Target({
        appId: APPID,
        clientId: t
          //        alias:'_lalala_'
      });
      Batch.add(message, target);
    }

    return new Promise((resolve, reject) => {

      Batch.submit(function(err, res) {
        if (err != null) {
          Batch.retry(function(err, res) {
            if (err) {
              return reject(err);
            }
            resolve(res);
            console.log('demo batch retry', res);
          });
        } else {
          console.log('demo batch submit', res);
          return resolve(res);
        }
      });
    });
  }

  /**
   * push message
   * @param {String} regId
   * @param {{}} notification
   */
  sendToRegId(regId, notification) {
    var template = this._NotificationTemplateDemo(notification);
    //    var template = LinkTemplateDemo();
    //    var template = NotificationTemplateDemo();
    //    var template = NotyPopLoadTemplateDemo();

    //个推信息体
    var message = new SingleMessage({
      isOffline: true, //是否离线
      offlineExpireTime: 3600 * 12 * 1000, //离线时间
      data: template, //设置推送消息类型
      pushNetWorkType: 0 //是否wifi ，0不限，1wifi
    });

    if (regId instanceof Array) {
      return this._pushMessageToSingleBatch(message, regId);
    } else {
      //接收方
      var target = new Target({
        appId: APPID,
        clientId: regId
      });
      //target.setAppId(APPID).setClientId(CID);
      return this._pushMessageToSingle(message, target);
    }

  }
}

var getui = null;

/**
 * @returns {Getui}
 */
module.exports = function() {
  if (!getui) getui = new Getui();
  return getui;
};

//getUserStatus();
// pushMessageToSingle();
//pushMessageToSingleBatch();
//pushMessageToList();
//pushMessageToApp();
//stoptask();
//setClientTag();
//getUserTags()

//别名绑定操作
//aliasBind();
//queryCID();
//queryAlias();
//aliasBatch();
//aliasUnBindAll();
//aliasUnBind();

//结果查询操作
//getPushResult();
//queryAppPushDataByDate();
//queryAppUserDataByDate();


//推送任务停止
function stoptask() {
  gt.stop('OSA-1125_FBLl4mxYjG9eZzVR18edd8', function(err, res) {
    console.log(res);
  });
}

function setClientTag() {
  gt.setClientTag(APPID, CID, ['aa', '哔哔', '》？》', '！@#￥%……&*（）'], function(err, res) {
    console.log(res);
  });
}

function getUserTags() {
  gt.getUserTags(APPID, CID, function(err, res) {
    console.log(res);
  });
}

function getUserStatus() {
  gt.getClientIdStatus(APPID, CID, function(err, res) {
    console.log(res);
  });
}



function pushMessageToList() {
  //process.env.gexin_pushList_needDetails = true;
  //process.env.gexin_pushList_needAsync=true;
  //process.env.=true;
  // var taskGroupName = 'test';
  var taskGroupName = 'toList任务组名';
  var template = TransmissionTemplateDemo();

  //个推信息体
  var message = new ListMessage({
    isOffline: true,
    offlineExpireTime: 3600 * 12 * 1000,
    data: template
  });

  gt.getContentId(message, taskGroupName, function(err, res) {
    var contentId = res;
    //接收方1
    var target1 = new Target({
      appId: APPID,
      clientId: CID
        //            alias:'_lalala_'
    });

    var targetList = [target1];
    //        gt.needDetails = true;

    console.log('getContentId', res);
    gt.pushMessageToList(contentId, targetList, function(err, res) {
      console.log(res);
    });
  });
}

function pushMessageToApp() {
  // var taskGroupName = 'test';
  var taskGroupName = null;
  var template = TransmissionTemplateDemo();

  //个推信息体
  //基于应用消息体
  var message = new AppMessage({
    isOffline: false,
    offlineExpireTime: 3600 * 12 * 1000,
    data: template,
    appIdList: [APPID],
    //        phoneTypeList: ['IOS'],
    //        provinceList: ['浙江'],
    //tagList: ['阿百川']
    speed: 10000
  });

  gt.pushMessageToApp(message, taskGroupName, function(err, res) {
    console.log(res);
  });
}

//消息模版：
// 1.TransmissionTemplate:透传功能模板
// 2.LinkTemplate:通知打开链接功能模板
// 3.NotificationTemplate：通知透传功能模板
// 4.NotyPopLoadTemplate：通知弹框下载功能模板

function NotyPopLoadTemplateDemo() {
  var template = new NotyPopLoadTemplate({
    appId: APPID,
    appKey: APPKEY,
    notyTitle: '个推',
    notyContent: '个推最新版点击下载',
    notyIcon: 'http://wwww.igetui.com/logo.png', // 通知栏logo
    isRing: true,
    isVibrate: true,
    isClearable: true,
    popTitle: '弹框标题',
    setPopContent: '弹框内容',
    popImage: '',
    popButton1: '下载', // 左键
    popButton2: '取消', // 右键
    loadIcon: 'http://www.photophoto.cn/m23/086/010/0860100017.jpg', // 弹框图片
    loadUrl: 'http://dizhensubao.igexin.com/dl/com.ceic.apk',
    loadTitle: '地震速报下载',
    autoInstall: false,
    actived: true
  });
  return template;
}

function LinkTemplateDemo() {
  var template = new LinkTemplate({
    appId: APPID,
    appKey: APPKEY,
    title: '个推',
    text: '个推最新版点击下载',
    logo: 'http://wwww.igetui.com/logo.png',
    logoUrl: 'https://www.baidu.com/img/bdlogo.png',
    isRing: true,
    isVibrate: true,
    isClearable: true,
    url: 'http://www.igetui.com'
  });

  return template;
}

function NotificationTemplateDemo() {
  var template = new NotificationTemplate({
    appId: APPID,
    appKey: APPKEY,
    title: '个推',
    text: '个推最新版点击下载',
    logo: 'http://www.igetui.com/logo.png',
    isRing: true,
    isVibrate: true,
    isClearable: true,
    transmissionType: 1,
    transmissionContent: '测试离线'
  });
  return template;
}

function TransmissionTemplateDemo() {
  var template = new TransmissionTemplate({
    appId: APPID,
    appKey: APPKEY,
    transmissionType: 1,
    transmissionContent: '测试离线'
  });
  //APN简单推送
  //var payload = new APNPayload();
  ////var alertMsg = new SimpleAlertMsg();
  ////alertMsg.alertMsg="";
  ////payload.alertMsg = alertMsg;
  //payload.badge=5;
  //payload.contentAvailable =1;
  //payload.category="";
  //payload.sound="";
  ////payload.customMsg.payload1="";
  //template.setApnInfo(payload);

  //APN高级推送
  //var payload = new APNPayload();
  //var alertMsg = new DictionaryAlertMsg();
  //alertMsg.body = "body";
  //alertMsg.actionLocKey = "actionLocKey";
  //alertMsg.locKey = "locKey";
  //alertMsg.locArgs = Array("locArgs");
  //alertMsg.launchImage = "launchImage";
  ////ios8.2以上版本支持
  //alertMsg.title = "title";
  //alertMsg.titleLocKey = "titleLocKey";
  //alertMsg.titleLocArgs = Array("titleLocArgs");
  //
  //payload.alertMsg=alertMsg;
  //payload.badge=5;
  //    payload.contentAvailable =1;
  //    payload.category="";
  //    payload.sound="";
  //    payload.customMsg.payload1="payload";
  //    template.setApnInfo(payload);
  return template;
}

function aliasBind() {
  gt.bindAlias(APPID, alias, CID, function(err, res) {
    console.log(res);
  });
}

function aliasBatch() {
  //    var target = new Target()
  //        .setClientId(CID)
  //        .setAlias('_lalala_');
  var target2 = new Target({
    alias: alias,
    clientId: CID
  });
  var targetList = [target2];
  gt.bindAlias(APPID, targetList, function(err, res) {
    console.log(res);
  });
}

function queryCID() {
  gt.queryClientId(APPID, alias, function(err, res) {
    console.log(res);
  });
}

function queryAlias() {
  gt.queryAlias(APPID, CID, function(err, res) {
    console.log(res);
  });
}

function aliasUnBind() {
  gt.unBindAlias(APPID, alias, CID, function(err, res) {
    console.log(res);
  });
}

function aliasUnBindAll() {
  gt.unBindAlias(APPID, alias, function(err, res) {
    console.log(res);
  });
}

function queryAppPushDataByDate() {
  gt.queryAppPushDataByDate(APPID, '20150910', function(err, res) {
    console.log(res);
  });
}

function queryAppUserDataByDate() {
  gt.queryAppUserDataByDate(APPID, '20150910', function(err, res) {
    console.log(res);
  });
}

function getPushResult() {
  gt.getPushResult('OSA-1125_FBLl4mxYjG9eZzVR18edd8', function(err, res) {
    console.log(res);
  });
}
