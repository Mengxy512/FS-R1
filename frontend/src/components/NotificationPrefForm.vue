<template>
    <div>
      <form @submit.prevent="submitForm" class="compact-form">
  
        <div class="form-group">
          <label for="open_price">Open Price Condition:</label>
          <select v-model="formData.preference.open_price" id="open_price" required>
            <option value="<">Less than previous interval</option>
            <option value=">">Greater than previous interval</option>
          </select>
        </div>
  
        <div class="form-group">
          <label for="close_price">Close Price Condition:</label>
          <select v-model="formData.preference.close_price" id="close_price" required>
            <option value="<">Less than previous interval</option>
            <option value=">">Greater than previous interval</option>
          </select>
        </div>
  
        <div class="form-group">
          <label for="next_time">Next Time:</label>
          <input type="datetime-local" v-model="formData.next_time" id="next_time" required />
        </div>
  
        <div class="form-group">
          <label for="time_interval">Time Interval (seconds):</label>
          <input type="number" v-model="formData.time_interval" id="time_interval" required />
        </div>
  
        <div class="form-group">
          <label for="time_unit">Time Unit:</label>
          <input type="text" v-model="formData.time_unit" id="time_unit" required />
        </div>
  
        <button type="submit">Submit</button>
      </form>
    </div>
  </template>
  
  <script>
  import axios from 'axios';
  
  export default {
    name: 'NotificationPrefForm',
    props: {
      initialData: {
        type: Object,
        default: () => ({
          user_id: '',
          preference: {
            open_price: '<',
            close_price: '>'
          },
          next_time: '',
          time_interval: '',
          time_unit: ''
        })
      }
    },
    data() {
      return {
        formData: { ...this.initialData }
      };
    },
    watch: {
      initialData: {
        handler(newValue) {
          this.formData = { ...newValue };
        },
        deep: true
      }
    },
    async created() {
      await this.fetchInitialData();
    },
    methods: {
      async fetchInitialData() {
        try {
          // 假设用户ID为1
          const response = await axios.get('http://112.124.59.151:3100/api/notificationPref', {
            params: { user_id: 1 }
          });
  
          console.log('response :>> ', response);
          // 回填表单数据
          if (response.data) {
            this.formData = response.data;
            this.formData.preference = JSON.parse(this.formData.preference);
            this.formData.next_time = new Date(this.formData.next_time).toISOString().slice(0, 16);
          }
          console.log('this.formData :>> ', this.formData);
        } catch (error) {
          console.error('Error fetching initial data:', error);
        }
      },
      async submitForm() {
        try {
          const response = await axios.post('http://112.124.59.151:3100/api/notificationPref', this.formData);
          console.log('Response:', response.data);
          this.$emit('formSubmitted');
          await this.fetchInitialData();  // 提交表单后重新获取现有的通知偏好设置
        } catch (error) {
          console.error('Error submitting form:', error);
        }
      }
    }
  };
  </script>
  
  <style scoped>
  .compact-form {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    width: 100%;
    max-width: 600px;
    margin: auto;
  }
  
  .form-group {
    flex: 1 1 45%; /* 控制每个表单项的宽度 */
    display: flex;
    flex-direction: column;
  }
  
  label {
    margin-bottom: 5px;
  }
  
  input, select, button {
    padding: 8px;
    margin-bottom: 10px;
    width: 100%;
  }
  
  button {
    flex: 1 1 90%;
    max-width: 200px;
    align-self: center;
  }
  </style>