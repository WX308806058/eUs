// background.js

const { app, BrowserWindow, screen, ipcMain } = require('electron')

const { join, dirname } = require('path');

const fs = require('fs');

const log = require('electron-log');

const { autoUpdater } = require('electron-updater');

// 屏蔽安全警告
// ectron Security Warning (Insecure Content-Security-Policy)
process.env['ELECTRON_DISABLE_SECURITY_WARNINGS'] = 'true';

// 当前环境是不是开发环境 (true 是 , false 不是)
const isDevelopment = process.env.NODE_ENV === 'development';

// 存在新版本时,默认自动下载更新,若想通过渲染进程手动触发,需要设置autoDownload为false
autoUpdater.autoDownload = false;

// 全局窗口变量
let mainWin = null, webc = null;

const mainWindow = (sizeObject) => {
    mainWin = new BrowserWindow({
        // 窗口图标
        icon: join(__dirname, 'resource/icon.ico'),
        width: sizeObject.width,
        minWidth: sizeObject.minWidth,
        height: sizeObject.height,
        minHeight: sizeObject.minHeight,
        webPreferences: {
            webSecurity: false,//禁用同源策略
            contextIsolation: false,
            nodeIntegration: true,
        }
    })

    webc = mainWin.webContents;

    // development模式
    if (process.env.VITE_DEV_SERVER_URL) {
        mainWin.loadURL(process.env.VITE_DEV_SERVER_URL)
        // 开启调试台
        webc.openDevTools()
        // mainWin.loadURL('https://www.qidian.com/')
    } else {
        mainWin.loadFile(join(__dirname, 'dist/index.html'))
    }

    // 隐藏自带菜单栏
    mainWin.setMenu(null);
}

app.whenReady().then(() => {

    // 2560 * 1440
    const displays = screen.getPrimaryDisplay();

    let widthSize = displays.size.width * displays.scaleFactor;

    let heightSize = displays.size.height * displays.scaleFactor;

    let sizeObject = {
        width: Math.ceil(widthSize * 0.6),
        height: Math.ceil(heightSize * 0.6),
        minWidth: Math.ceil(widthSize * 0.48),
        minHeight: Math.ceil(heightSize * 0.48)
    };
    mainWindow(sizeObject);
    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) mainWindow(sizeObject)
    })
})

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit()
})

ipcMain.on('app-version', () => {
    webc.send('app-version', { result: true, message: '版本号获取成功', data: app.getVersion() });
});

// 接收更新命令
ipcMain.on('download-update-now', () => {
    log.info('开始下载');
    //开始下载
    autoUpdater.downloadUpdate();
});

// TODO: 检查更新
ipcMain.on('check-update', () => {

    // 检查更新
    autoUpdater.checkForUpdates();

    //检查更新
    autoUpdater.on('checking-for-update', () => {
        log.info('正在检查更新');
        console.log('正在检查更新');
    });

    //没有可用更新
    autoUpdater.on('update-not-available', () => {
        log.info('已经是最新版本');
        console.log('已经是最新版本');
        webc.send('update-not-available', { result: false, message: '已经是最新版本' });
    });

    //有可用更新
    autoUpdater.on('update-available', (info) => {
        log.info('有新的版本可用');
        console.log('有新的版本可用');
        webc.send('update-available', { result: true, message: '有新的版本可用', data: info });
    });

    // 更新出错
    autoUpdater.on('error', (err) => {
        log.info('更新出错');
        console.log('更新出错');
        webc.send('update-error', { result: false, message: '更新出错', data: err });
    });

    // 下载进度
    autoUpdater.on('download-progress', (progressObj) => {
        // progressObj.percent 下载进度
        // progressObj.transferred 已经下载的数据
        // progressObj.total 需要下载的数据总大小
        let log_message = progressObj.percent + '% (' + progressObj.transferred + "/" + progressObj.total + ')'
        log.info('下载进度：' + log_message);

        webc.send('download-progress', { result: true, message: '当前下载进度', data: progressObj });
    });

    //更新下载完成
    autoUpdater.on('update-downloaded', (info) => {
        log.info('更新下载完成,准备安装...');
        //开始安装
        setTimeout(() => {
            autoUpdater.quitAndInstall();
        }, 500);
    });
});