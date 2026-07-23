// src/services/auth.service.js

const axios = require("axios");
const qs = require("querystring");

class AuthService {
  constructor() {
    this.baseUrl = process.env.FACEME_URL;
    this.account = process.env.FACEME_ACCOUNT;
    this.password = process.env.FACEME_PASSWORD;

    this.token = null;
    this.expirationDate = null;
  }

  async getToken() {
    if (this.token && !this.isExpired()) {
      return this.token;
    }

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