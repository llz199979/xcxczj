// pages/order/order.js
var app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    orderList: [],
    orderUrl: "",
    orderName: ""
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this;
    that.getOderList()
  },
  getOderList() {
    var that = this
    var openid = app.globalData.openid
    var token = app.globalData.token
    wx.request({
      url: 'https://pay.mjktech.com.cn/wx/getOrderList',
      data: {
        openid: openid,
      },
      method: 'GET',
      header: {
        'content-type': 'application/json',
        'Authorization': token
      },
      success: (res) => {
        that.setData({
          orderList: res.data.data.orders,
          orderName: res.data.data.equipmentVO.commodity.name,
          orderUrl: res.data.data.equipmentVO.commodity.pictureUrl,
        })
      },
      fail(err) {
        console.log('未获取到订单列表', err)
      }
    })
  },
  //退款
  refund(e) {
    var that = this
    var token = app.globalData.token
    var orderNumber = e.currentTarget.dataset['order']
    wx.request({
      url: 'https://pay.mjktech.com.cn/wx/wxRefund',
      data: {
        openid: app.globalData.openid,
        orderNumber: orderNumber
      },
      method: 'GET',
      header: {
        'content-type': 'application/json',
        'Authorization': token
      }, // 设置请求的 header
      success: (res) => {
        wx.showToast({
          title: '退款成功',
        })
        that.getOderList()
      }
    })
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})