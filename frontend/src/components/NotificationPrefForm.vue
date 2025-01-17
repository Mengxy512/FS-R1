<template>
  <h2>Notification Preferences</h2>
  <div class="container mt-3">
    <form @submit.prevent="submitForm" class="row g-3 align-items-center compact-form">
      <div class="col-auto">
        <label for="open_price" class="form-label">Open Price Condition:</label>
        <select v-model="formData.preference.open_price" id="open_price" class="form-select" required>
          <option value="<">Less than previous interval</option>
          <option value=">">Greater than previous interval</option>
        </select>

        <label for="close_price" class="form-label">Close Price Condition:</label>
        <select v-model="formData.preference.close_price" id="close_price" class="form-select" required>
          <option value="<">Less than previous interval</option>
          <option value=">">Greater than previous interval</option>
        </select>
      </div>

      <div class="col-auto">
        <label for="next_time" class="form-label">Next Time:</label>
        <input type="datetime-local" v-model="formData.next_time" id="next_time" class="form-control" required />

        <label for="time_interval" class="form-label">Time Interval:</label>
        <input type="number" v-model="formData.time_interval" id="time_interval" class="form-control" required />

        <label for="timeUnit">Time unit:</label>
        <select v-model="formData.time_unit" id="timeUnit">
          <option value="second">second</option>
          <option value="minute">minute</option>
        </select>

        <button type="submit" class="btn btn-primary mt-4">Submit</button>
      </div>
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
        const response = await axios.get('http://112.124.59.151:3100/api/notificationPref', {
          params: { user_id: 1 }
        });

        console.log('response :>> ', response);
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
        await this.fetchInitialData();  
      } catch (error) {
        console.error('Error submitting form:', error);
      }
    }
  }
};
</script>

<style scoped>
.compact-form {
  flex-wrap: nowrap; /* 强制在一行内 */
}

.form-group {
  flex: 1 1 auto; 
}

.form-group label {
  margin-bottom: 5px;
}

.form-group input, .form-group select {
  width: 100%;
}

button {
  max-width: 200px;
  align-self: center;
}
</style>