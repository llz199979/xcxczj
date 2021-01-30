//index.js
const app = getApp()

Page({
  data: {
    avatarUrl: '',
    nickName: '',
    user:'',
    menuitems: [
      { text: '我的订单', url: '../order/order', icon: '/utils/img/order.png', tips: '' },
      { text: '退款记录', url: '../refund/refund', icon: '/utils/img/record.png', tips: '' },
      { text: '用户反馈', url: '../feedback/feedback', icon: '/utils/img/fankui.png', tips: '' },
      { text: '补货', url: '../cpfr/cpfr', icon: '/utils/img/detail.png', tips: '' },
    ]
  },

  onLoad: function () {
    // 获取用户信息
    var that = this
   
    wx.getSetting({
      success: res => {
        that.setData({
          user:res.authSetting['scope.userInfo']
        })
        if (res.authSetting['scope.userInfo']) {
          // 已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框
          wx.getUserInfo({
            success: res => {
              that.setData({
                avatarUrl: res.userInfo.avatarUrl,
                nickName: res.userInfo.nickName
              })
            }
          })
        }
      }
    })
  },
  onLogin: function (e) {
    //1. 调用登录接口获取临时登录code
    var that = this
    wx.login({
      success: res => {
        if (res.code) {
          console.log(res.code)
          let code = res.code;
          //2. 访问登录凭证校验接口获取session_key、openid
          //pay.mjktech.com.cn
          var host="https://pay.mjktech.com.cn";
          wx.request({
            url: host+"/wx/user/wx55952aaa3636e8a4/login?code=code",
            data: {
              appid: "wx55952aaa3636e8a4",
              secret: "c7c0df0e90ef0a58b08abe9b2661020e",
              code: res.code,
              grant_type: "authorization_code"
            },
            method: 'GET', // OPTIONS, GET, HEAD, POST, PUT, DELETE, TRACE, CONNECT
            header: {
              'content-type': 'application/json'
            }, // 设置请求的 header
            success:(res) => {
              console.log("data", res)
              wx.showToast({
                title: '登录成功',
                icon: 'success',
                duration: 2000                        
              })
              that.onLoad()
              if(res.statusCode==200){
                wx.switchTab({
                  url: '../mine/mine',
                })
              }
            },
            fail: function (err) {
              console.log(err);
            }
          })
        }
      }
    })
  }
})