const getDataFromRequest = (req) => (req.method === "GET" ? req.query : req.body);

export default {
  getDataFromRequest,
};
