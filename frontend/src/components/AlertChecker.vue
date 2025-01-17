<template>
    <div>
      <!-- AlertChecker 组件不需要包含 StockFilter，只负责检查并提示用户 -->
    </div>
  </template>
  
  <script>
  import axios from 'axios';
  
  export default {
    name: 'AlertChecker',
    props: {
      userId: {
        type: Number,
        required: true
      }
    },
    mounted() {
      this.checkAlerts();
      setInterval(this.checkAlerts, 1000);  // 每秒钟检查一次
    },
    methods: {
      async checkAlerts() {
        try {
          const response = await axios.get('http://112.124.59.151:3101/api/alerts', {
            params: { user_id: this.userId }
          });
          console.log('alert :>> ', response.data.alert);
          if (response.data.alert) {
            alert('You have a new notification!');
          }
        } catch (error) {
          console.error('Error checking alerts:', error);
        }
      }
    }
  };
  </script>
  
  <style scoped>
  /* 你的样式 */
  </style>