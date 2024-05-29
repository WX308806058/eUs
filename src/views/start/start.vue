<template>
    <div class="page-container">
        <a-spin :tip="aSpinTip" :spinning="aSpinShow">


            <a-button type="primary" @click="checkUpdate">检查更新</a-button>
            <div class="textarea-txt">
                <!-- <textarea v-model="jsonData" rows="5"></textarea> -->
                <a-textarea v-model:value="jsonData" placeholder="jsonData" :auto-size="{ minRows: 2, maxRows: 10 }" />
            </div>
            <label>{{ appVersion }}</label>

            <div v-show="aProgressShow">
                <div class="progress-container">
                    <a-progress type="circle" :percent="aProgressValue" />
                </div>
                <label>{{ aProgressTip }}</label>

                <a-modal v-model:open="aModalShow" title="系统提示" @ok="downloadUpdate" @cancel="aModalShow = false">
                    {{ aModalContent }}
                </a-modal>
            </div>

        </a-spin>
    </div>
</template>

<script setup>
import { ref, reactive, onMounted, h } from 'vue';

const { ipcRenderer } = require('electron');

const jsonData = ref(''),
    appVersion = ref('0.0.0'),
    aSpinShow = ref(false),
    aModalShow = ref(false),
    aModalContent = ref(''),
    aProgressValue = ref(0),
    aProgressTip = ref(''),
    aProgressShow = ref(false),
    aSpinTip = ref('');

const checkUpdate = () => {

    aSpinShow.value = true; aSpinTip.value = '正在检查更新...';

    ipcRenderer.send('check-update');

    ipcRenderer.on('update-not-available', (event, args) => {
        jsonData.value = JSON.stringify(args, null, 4);
        aSpinShow.value = false;
    });

    ipcRenderer.on('update-available', (event, args) => {
        jsonData.value = JSON.stringify(args, null, 4);
        aSpinShow.value = false;
        setTimeout(() => { aModalShow.value = true; aModalContent.value = `新的版本 ${args.data.version} 已发布,请及时更新！`; }, 100)
    });

    ipcRenderer.on('update-error', (event, args) => {
        jsonData.value = JSON.stringify(args, null, 4);
        aSpinShow.value = false;
    });
}

const downloadUpdate = () => {

    aModalShow.value = false;

    ipcRenderer.send('download-update-now');

    aSpinShow.value = true; aSpinTip.value = '正在获取资源...';

    ipcRenderer.on('download-progress-now', (event, args) => {

        aSpinShow.value = false;

        aProgressShow.value = true;

        aProgressValue.value = args.percent.toFixed(2);

        aProgressTip.value = '已下载 ' + (args.transferred / (1024 * 1024)).toFixed(2) + ' MB' + ',共计 ' + (args.total / (1024 * 1024)).toFixed(2) + ' MB';
    });
}

// onMounted 在组件挂载完成后执行
onMounted(() => {
    ipcRenderer.send('app-version');

    ipcRenderer.once('app-version', (event, args) => {
        appVersion.value = `当前系统版本号: ${args.data}`;
    });
})
</script>

<style>
.container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    color: black;
}

.page-container {
    width: 100%;
    height: auto;
}

.textarea-txt {
    width: 100%;
    height: auto;
    margin-top: 20px;
}

.progress-container {
    margin-top: 20px;
}
</style>