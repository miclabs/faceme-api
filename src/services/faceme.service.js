// src/services/faceme.service.js

const axios = require("axios");
const authService = require("./auth.service");

class FaceMeService {
  constructor() {
    this.client = axios.create({
      baseURL: process.env.FACEME_URL,
      timeout: 60000
    });
  }

  async postForm(url, data = {}) {
    return this.request(async (token) => {
      return this.client.post(
        url,
        new URLSearchParams(data).toString(),
        {
          headers: {
            "Authorization": token,
            "Content-Type": "application/x-www-form-urlencoded"
          }
        }
      );
    });
  }

  async postMultipart(url, formData) {
    return this.request(async (token) => {
      return this.client.post(
        url,
        formData,
        {
          headers: {
            "Authorization": token,
            ...formData.getHeaders()
          },
          maxBodyLength: Infinity,
          maxContentLength: Infinity
        }
      );
    });
  }

  async request(callback) {
    try {
      const token = await authService.getToken();
      const response = await callback(token);

      return response.data;
    } catch (error) {
      if (error.response?.status === 401) {
        authService.clearToken();

        const token = await authService.getToken();
        const response = await callback(token);

        return response.data;
      }

      if (error.response?.data) {
        throw new Error(JSON.stringify(error.response.data));
      }

      throw error;
    }
  }
}

module.exports = new FaceMeService();