const request = ({
  url, method, data, headers,
}) => new Promise((resolve) => {
  const xhr = new XMLHttpRequest();
  xhr.open(method, url);
  Object.keys(headers || []).forEach((key) => {
    xhr.setRequestHeader(key, headers[key]);
  });
  xhr.onload = (e) => {
    resolve({
      data: e.target.response,
    });
  };
  xhr.send(data);
});

export default request;
