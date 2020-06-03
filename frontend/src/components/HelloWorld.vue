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
    /**
     * 这里使用el-input有个坑 当type是原生的file类型时 change事件的回调函数 ev是一个空字符串 这里需要使用原生的input标签
     * 这里使用Object.assign 是为了在二次选择文件时覆盖之前选择的文件
     */
    handleFileChange(e) {
      const [file] = e.target.files;
      if (!file) return;
      Object.assign(this.$data, this.$options.data());
      this.file = file;
    },
    /**
     * 这里利用buffer的slice方法将文件分割成多个文件切片(更小的buffer)
     */
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
    /**
     * 利用FormData类封装buffer 进行切片上传
     */
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
    /**
     * 发送合并切片的请求
     */
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
