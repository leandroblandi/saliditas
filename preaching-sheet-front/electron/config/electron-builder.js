/**
 * electron-builder configuration
 */
const BuilderConfig = {
  appId: 'com.preachingsheet.app',
  productName: 'Saliditas',
  
  directories: {
    output: 'release'
  },
  
  files: [
    'dist/**/*',
    'node_modules/**/*',
    'electron/splash/*',
    'electron/main/main.js'
  ],
  
  win: {
    target: 'nsis',
    icon: 'public/favicon.ico'
  },
  
  mac: {
    target: 'dmg',
    icon: 'public/favicon.ico'
  },
  
  linux: {
    target: 'AppImage',
    icon: 'public/favicon.ico'
  },
  
  extraResources: [
    {
      from: 'backend/',
      to: 'backend',
      filter: ['**/*']
    },
    {
      from: '../excel-to-image-service/',
      to: 'excel-to-image-service',
      filter: ['**/*']
    }
  ],
  
  nsis: {
    oneClick: false,
    allowToChangeInstallationDirectory: true,
    createDesktopShortcut: true,
    createStartMenuShortcut: true
  }
};

module.exports = BuilderConfig;
