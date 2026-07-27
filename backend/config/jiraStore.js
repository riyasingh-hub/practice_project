let accessToken = null;
let refreshToken = null;
let cloudId = null;

module.exports = {
  getAccessToken: () => accessToken,
  setAccessToken: (token) => {
    accessToken = token;
  },

  getRefreshToken: () => refreshToken,
  setRefreshToken: (token) => {
    refreshToken = token;
  },

  getCloudId: () => cloudId,
  setCloudId: (id) => {
    cloudId = id;
  }
};