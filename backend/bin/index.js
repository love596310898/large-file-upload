const http = require('http');
const path = require('path');
const fse = require('fs-extra');
const multiparty = require('multiparty');

// eslint-disable-next-line new-cap
const server = new http.createServer();
const UPLOAD_DIR = path.resolve(__dirname, '..', 'target'); // 大文件存储目录

const resolvePost = (req) => new Promise((resolve) => {
  let chunk = '';
  req.on('data', (data) => {
    chunk += data;
  });
  req.on('end', () => {
    resolve(JSON.parse(chunk));
  });
});

// 合并切片;
const mergeFileChunk = async (filePath, filename) => {
  const chunkDir = `${UPLOAD_DIR}/${filename}`;
  const chunkPaths = await fse.readdir(chunkDir);
  await fse.writeFile(filePath, '');
  chunkPaths.forEach((chunkPath) => {
    fse.appendFileSync(filePath, fse.readFileSync(`${chunkDir}/${chunkPath}`));
    fse.unlinkSync(`${chunkDir}/${chunkPath}`);
  });
  fse.rmdirSync(chunkDir); // 合并后删除保存切片的目录
};

server.on('request', async (req, res) => {
  res.setHeader('Access-Control-Allow-Headers', '*');
  res.setHeader('Access-Control-Allow-Origin', '*');
  if (req.method === 'OPTIONS') {
    res.status = 200;
    res.end();
    return;
  }
  const multipart = new multiparty.Form();

  multipart.parse(req, async (err, fields, files) => {
    if (err) {
      return;
    }
    const [chunk] = files.chunk;
    const [hash] = fields.hash;
    const [filename] = fields.filename;
    const chunkDir = `${UPLOAD_DIR}/${filename}`;

    // 切片目录不存在，创建切片目录
    if (!fse.existsSync(chunkDir)) {
      await fse.mkdirs(chunkDir);
    }

    // fs-extra 专用方法，类似 fs.rename 并且跨平台
    // fs-extra 的 rename 方法 windows 平台会有权限问题
    // https://github.com/meteor/meteor/issues/7852#issuecomment-255767835
    await fse.move(chunk.path, `${chunkDir}/${hash}`);
    res.end('received file chunk');
  });
  if (req.url === '/merge') {
    const data = await resolvePost(req);
    const { filename } = data;
    const filePath = `${UPLOAD_DIR}/finish.${filename}`;
    try {
      await mergeFileChunk(filePath, filename);
    } catch (e) {
      global.console.log(e);
    }
    res.end(
      JSON.stringify({
        code: 0,
        message: 'file merged success',
      }),
    );
  }
});

server.listen(3000, () => global.console.log('正在监听 3000 端口'));
