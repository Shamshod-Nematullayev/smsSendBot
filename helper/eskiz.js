class Eskiz {
  constructor(data) {
    this.data = data;
  }
  async getBalance() {
    const res = await fetch("http://notify.eskiz.uz/api/user/get-limit", {
      Accept: "*/*",
      Authorization: `Bearer ${data.token}`,
    });
    const data = res.json();
    return data;
  }
}

module.exports = { Eskiz };
