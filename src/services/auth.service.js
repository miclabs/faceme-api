// src/services/auth.service.js

const axios = require("axios");
const qs = require("querystring");

class AuthService {
  constructor() {
    this.baseUrl = null;
    this.account = null;
    this.password = null;

    this.token = null;
    this.expirationDate = null;
  }

  async loadConfig(deviceId, authorization) {
    const { data } = await axios.get(
      `https://driveoffalert.com/api/fma/config`,
      {
        params: {
          device_id: deviceId || 372,
        },
        headers: {
          Authorization: authorization || 'Token token=87a1a2da53a07abecc402c0a77ee1172',
        },
      }
    );

    const ip = data.ip?.trim();

    this.baseUrl = ip
      ? `http://${ip}`
      : process.env.FACEME_URL;

    this.account = data.username?.trim() || process.env.FACEME_ACCOUNT;
    this.password = data.password?.trim() || process.env.FACEME_PASSWORD;
  }

  getBaseUrl(authorization, deviceId) {
    return this.baseUrl;
  }

  async getToken(options) {
    if (this.token && !this.isExpired()) {
      return this.token;
    }

    await this.loadConfig(options.deviceId, options.authorization)
    return this.login();
  }

  async login() {
    const response = await axios.post(
      `${this.baseUrl}/api/website/account/signIn`,
      qs.stringify({
        account: this.account,
        password: this.password
      }),
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded"
        }
      }
    );

    this.token = response.data.token;
    this.expirationDate = response.data.expirationDate;

    return this.token;
  }

  clearToken() {
    this.token = null;
    this.expirationDate = null;
  }

  isExpired() {
    if (!this.expirationDate) {
      return true;
    }

    return new Date() >= new Date(this.expirationDate);
  }
}

module.exports = new AuthService();