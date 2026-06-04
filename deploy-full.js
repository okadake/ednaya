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

console.log('Starting full deployment (all files)...');

ftpDeploy
  .deploy(config)
  .then((res) => {
    console.log('✓ Full deployment successful!');
    console.log('Deployed files:', res.length);
    process.exit(0);
  })
  .catch((err) => {
    console.error('✗ Deployment failed:');
    console.error(err);
    process.exit(1);
  });
