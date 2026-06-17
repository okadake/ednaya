import FtpDeploy from 'ftp-deploy';
import dotenv from 'dotenv';

dotenv.config();

const ftpDeploy = new FtpDeploy();

const config = {
  user: process.env.FTP_USER,
  password: process.env.FTP_PASSWORD,
  host: 'ftp.lolipop.jp',
  port: 21,
  localRoot: './dist',
  remoteRoot: '/edna2026/ednaya/',
  include: ['**/*'],
  exclude: ['.DS_Store', 'node_modules/**/*'],
  deleteRemote: false,
  forcePasv: true,
  sftp: false,
};

console.log('Starting full deployment with detailed logging...\n');
console.log('Config:', {
  host: config.host,
  remoteRoot: config.remoteRoot,
  localRoot: config.localRoot,
});

ftpDeploy
  .deploy(config)
  .then((res) => {
    console.log('\n✓ Deployment successful!');
    console.log('Total files deployed:', res.length);
    if (res.length > 0) {
      console.log('\nFirst 10 files:');
      res.slice(0, 10).forEach((file) => console.log('  -', file));
      if (res.length > 10) {
        console.log(`  ... and ${res.length - 10} more files`);
      }
    }
    process.exit(0);
  })
  .catch((err) => {
    console.error('\n✗ Deployment failed:');
    console.error('Error:', err.message);
    if (err.code) console.error('Code:', err.code);
    process.exit(1);
  });
