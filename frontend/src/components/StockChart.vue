<template>
    <h2>K-chart</h2>
    <div>
      <form @submit.prevent="fetchData">

        <label for="interval">Time interval:</label>
        <select v-model="interval" id="interval">
          <option v-for="option in intervals" :key="option" :value="option">{{ option }}</option>
        </select>
        <label for="timeUnit">Time unit:</label>
        <select v-model="timeUnit" id="timeUnit">
          <option value="second">second</option>
          <option value="minute">minute</option>
        </select>

        <label for="startTime">Start time:</label>
        <input type="datetime-local" v-model="startTime" id="startTime" />
  
        <label for="endTime">End time:</label>
        <input type="datetime-local" v-model="endTime" id="endTime" />
  
        <button type="submit">Plot</button>
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
        timeUnit: 'minute',
        interval: 1,
        intervals: [1, 5, 10, 20, 30, 60],
        startTime: new Date(1737084270000).toISOString().slice(0, 16),
        endTime: new Date(1738095270000).toISOString().slice(0, 16),
        stockData: []
      };
    },
    async created() {
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