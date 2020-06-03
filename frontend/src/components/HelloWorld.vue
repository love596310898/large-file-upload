<template>
  <div class="hello-world">
    <input
      type="file"
      @change="handleFileChange"
    >
    <el-button @click="handleUpload">
      上传
    </el-button>
  </div>
</template>

<script>
import request from '@/utils/request.js';

const LENGTH = 10; // 切片数量

export default {
  name: 'HelloWorld',
  data() {
    return {
      file: null,
      data: [],
    };
  },
  methods: {
    handleFileChange(e) {
      const [file] = e.target.files;
      if (!file) return;
      Object.assign(this.$data, this.$options.data());
      this.file = file;
    },
    // 生成文件切片
    createFileChunk(file, length = LENGTH) {
      const fileChunkList = [];
      const chunkSize = Math.ceil(file.size / length);
      let cur = 0;
      while (cur < file.size) {
        fileChunkList.push({ file: file.slice(cur, cur + chunkSize) });
        cur += chunkSize;
      }
      return fileChunkList;
    },
    // 上传切片
    async uploadChunks() {
      const requestList = this.data
        .map(({ chunk }, index) => {
          const formData = new FormData();
          formData.append('chunk', chunk);
          formData.append('hash', index);
          formData.append('filename', this.file.name);
          return { formData };
        })
        .map(async ({ formData }) => request({
          method: 'post',
          url: 'http://localhost:3000',
          data: formData,
        }));
      const result = await Promise.all(requestList); // 并发切片
      global.console.log(result);
      const finish = await this.mergeRequest(); // 发送合并请求
      global.console.log(finish);
    },
    // 合并切片
    mergeRequest() {
      return request({
        method: 'post',
        url: 'http://localhost:3000/merge',
        headers: {
          'content-type': 'application/json',
        },
        data: JSON.stringify({
          filename: this.file.name,
        }),
      });
    },
    async handleUpload() {
      if (!this.file) return;
      const fileChunkList = this.createFileChunk(this.file);
      this.data = fileChunkList.map(({ file }, index) => ({
        chunk: file,
        hash: `${this.file.name}-${index}`, // 文件名 数组下标
      }));
      await this.uploadChunks();
    },
  },
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
</style>
