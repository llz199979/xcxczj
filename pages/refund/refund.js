// pages/refund/refund.js
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
     refundList:''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this
    var openid = app.globalData.openid
    wx.request({
      url: 'https://pay.mjktech.com.cn/wx/getOrderRefundList',
      data: {
        openid:openid
      },
      method: 'GET',
      header: {
        'content-type': 'application/json',
        'Authorization': app.globalData.token
      },
      success(res) {
        that.setData({
          refundList:res.data.data.orders,
          orderName : res.data.data.equipmentVO.commodity.name,
          orderUrl : res.data.data.equipmentVO.commodity.pictureUrl,
        })
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