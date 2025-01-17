<template>
    <div>
      <form @submit.prevent="fetchData">
        <label for="timeUnit">选择时间单位:</label>
        <select v-model="timeUnit" id="timeUnit">
          <option value="second">秒</option>
          <option value="minute">分钟</option>
        </select>
  
        <label for="interval">选择时间间隔:</label>
        <select v-model="interval" id="interval">
          <option v-for="option in intervals" :key="option" :value="option">{{ option }}</option>
        </select>
  
        <label for="startTime">选择起始时间:</label>
        <input type="datetime-local" v-model="startTime" id="startTime" />
  
        <label for="endTime">选择结束时间:</label>
        <input type="datetime-local" v-model="endTime" id="endTime" />
  
        <button type="submit">获取数据</button>
      </form>
  
      <div id="chart" style="width: 100%; height: 500px;"></div>
    </div>
  </template>
  
  <script>
  import axios from 'axios';
  import * as echarts from 'echarts';
  
  export default {
    name: 'StockChart',
    data() {
      return {
        chart: null,
        timeUnit: 'second',
        interval: 1,
        intervals: [1, 5, 10, 20, 30, 60],
        startTime: '',
        endTime: '',
        stockData: []
      };
    },
    async created() {
      const now = new Date().toISOString().slice(0, 16); // 获取当前时间，格式为 YYYY-MM-DDTHH:MM
      this.startTime = now;
      this.endTime = now;
      await this.fetchData();
      this.initChart();
    },
    methods: {
      async fetchData() {
        try {
            console.log('startTime :>> ', new Date(this.startTime).getTime());
            console.log('endTime :>> ', new Date(this.endTime).getTime());
          const response = await axios.get('http://112.124.59.151:3100/api/stocks', {
            params: {
              timeUnit: this.timeUnit,
              interval: this.interval,
              startTime: new Date(this.startTime).getTime(),
              endTime: new Date(this.endTime).getTime()
            }
          });
          this.stockData = response.data;
          console.log('stockData :>> ', this.stockData);
          this.updateChart();
        } catch (error) {
          console.error('Error fetching stock data:', error);
        }
      },
      initChart() {
        this.chart = echarts.init(document.getElementById('chart'));
  
        // 初始图表配置
        const option = {
          title: {
            text: 'Stock Prices'
          },
          tooltip: {
          trigger: 'axis',
          show: true,
          formatter: (params) => {
            const [openPrice, closePrice] = params;
            console.log('params :>> ', params);
            return `
              time: ${new Date(openPrice.value[0]).toLocaleString()}<br/>
              open_price: ${openPrice.value[1]}<br/>
              close_price: ${closePrice.value[1]}
            `;
          }
         },
          legend: {
            data: ['Open Price', 'Close Price']
          },
          xAxis: {
            type: 'category',
            data: this.stockData.map(item => new Date(Number(item.interval_time)).toLocaleString())
          },
          yAxis: {
            type: 'value'
          },
          series: [
            {
              name: 'Open Price',
              type: 'line',
              data: this.stockData.map(item => parseFloat(item.open_price))
            },
            {
              name: 'Close Price',
              type: 'line',
              data: this.stockData.map(item => parseFloat(item.close_price))
            }
          ]
        };
  
        this.chart.setOption(option);
      },
      updateChart() {
        if(!this.chart) return;
        const newData = this.stockData;
        this.chart.setOption({
          xAxis: {
            data: newData.map(item => new Date(Number(item.interval_time)).toLocaleString())
          },
          series: [
            {
              name: 'Open Price',
              data: newData.map(item => parseFloat(item.open_price))
            },
            {
              name: 'Close Price',
              data: newData.map(item => parseFloat(item.close_price))
            }
          ]
        });
      }
    }
  };
  </script>
  
  <style scoped>
  #chart {
    width: 100%;
    height: 500px;
  }
  </style>