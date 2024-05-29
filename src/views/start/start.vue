<template>
    <div class="container">
        <button @click="checkUpdate()">Check Update</button>
    </div>
    <textarea v-model="jsonData" rows="15"></textarea>
</template>

<script setup>
import { ref, reactive, onMounted, h } from 'vue';

const { ipcRenderer } = require('electron');

const jsonData = ref('');

const checkUpdate = () => {

    ipcRenderer.send('check-update');

    ipcRenderer.on('update-not-available', (event, args) => {
        jsonData.value = JSON.stringify(args);
    });

    ipcRenderer.on('update-available', (event, args) => {
        jsonData.value = JSON.stringify(args);
    });
}

// onMounted 在组件挂载完成后执行
onMounted(() => { })
</script>

<style>
.container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    color: black;
}
</style>