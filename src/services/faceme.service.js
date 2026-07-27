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

  async post(url, data = {}, options = {}) {
    return this.request(options, async (token) => {
      return this.client.post(url, data, {
        headers: {
          Authorization: token,
          "Content-Type": "application/json"
        }
      });
    });
  }

  async postForm(url, data = {}, options = {}) {
    return this.request(options, async (token) => {
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

  async postMultipart(url, formData, options={}) {
    return this.request(options, async (token) => {
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

  async request(options={}, callback) {
    try {
      const token = await authService.getToken(options);
      const response = await callback(token);

      return response.data;
    } catch (error) {
      if (error.response?.status === 401) {
        authService.clearToken();

        const token = await authService.getToken(options);
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