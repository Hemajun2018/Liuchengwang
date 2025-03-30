const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// 数据库连接信息
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || '3306',
  user: process.env.DB_USERNAME || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_DATABASE || 'liuchengwang'
};

// 执行SQL文件
function executeSqlFile(filePath) {
  return new Promise((resolve, reject) => {
    const sql = fs.readFileSync(filePath, 'utf8');
    
    const command = `mysql -h${dbConfig.host} -P${dbConfig.port} -u${dbConfig.user} -p${dbConfig.password} ${dbConfig.database} -e "${sql}"`;
    
    console.log(`执行SQL文件: ${filePath}`);
    
    exec(command, (error, stdout, stderr) => {
      if (error) {
        console.error(`执行出错: ${error.message}`);
        reject(error);
        return;
      }
      
      if (stderr) {
        console.error(`stderr: ${stderr}`);
      }
      
      console.log(`stdout: ${stdout}`);
      console.log(`SQL文件执行成功: ${filePath}`);
      resolve();
    });
  });
}

// 执行TypeScript迁移文件
function executeTypeScriptFile(filePath) {
  return new Promise((resolve, reject) => {
    console.log(`编译并执行TypeScript文件: ${filePath}`);
    
    // 先编译TypeScript文件
    exec(`npx tsc ${filePath}`, (error, stdout, stderr) => {
      if (error) {
        console.error(`编译出错: ${error.message}`);
        reject(error);
        return;
      }
      
      // 获取编译后的JS文件路径
      const jsFilePath = filePath.replace('.ts', '.js');
      
      // 执行编译后的JS文件
      exec(`node ${jsFilePath}`, (error, stdout, stderr) => {
        if (error) {
          console.error(`执行出错: ${error.message}`);
          reject(error);
          return;
        }
        
        if (stderr) {
          console.error(`stderr: ${stderr}`);
        }
        
        console.log(`stdout: ${stdout}`);
        console.log(`TypeScript文件执行成功: ${filePath}`);
        
        // 删除临时JS文件
        fs.unlinkSync(jsFilePath);
        
        resolve();
      });
    });
  });
}

// 主函数
async function runMigrations() {
  try {
    // 执行SQL迁移
    await executeSqlFile(path.join(__dirname, 'alter-projects-table.sql'));
    
    // 执行TypeScript迁移
    await executeTypeScriptFile(path.join(__dirname, 'migrate-prerequisites.ts'));
    
    console.log('所有迁移执行完成');
  } catch (error) {
    console.error('迁移执行失败:', error);
    process.exit(1);
  }
}

// 执行迁移
runMigrations(); 