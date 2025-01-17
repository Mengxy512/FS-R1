<template>
    <div>
      <NotificationPrefForm />
      <StockChart />
      <AlertChecker :userId="1" />  <!-- 假设用户ID为1 -->
    </div>
  </template>
  
  <script>
  import NotificationPrefForm from './NotificationPrefForm.vue';
  import StockChart from './StockChart.vue';
  import AlertChecker from './AlertChecker.vue';

  export default {
    name: 'MainComponent',
    components: {
      NotificationPrefForm,
      StockChart,
      AlertChecker 
    },
    async created() {
    },
  };
  </script>
  
  <style scoped>
  h1 {
    text-align: center;
    margin-bottom: 20px;
  }
  </style>