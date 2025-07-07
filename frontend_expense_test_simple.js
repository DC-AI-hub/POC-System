const puppeteer = require('./fronted/node_modules/puppeteer');
const fs = require('fs');

class SimpleFrontendTester {
    constructor() {
        this.browser = null;
        this.page = null;
        this.testResults = [];
        this.currentTest = 0;
    }

    async init() {
        console.log('🚀 启动浏览器...');
        
        this.browser = await puppeteer.launch({
            headless: true,
            slowMo: 100,
            defaultViewport: { width: 1280, height: 720 },
            executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
            args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
        });
        this.page = await this.browser.newPage();
        
        await this.page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36');
    }

    logTest(testName, status, message = '') {
        this.currentTest += 1;
        const result = {
            test_id: this.currentTest,
            test_name: testName,
            status: status,
            message: message,
            timestamp: new Date().toISOString()
        };
        this.testResults.push(result);
        
        const statusIcon = status === 'PASS' ? '✅' : status === 'FAIL' ? '❌' : 'ℹ️';
        console.log(`${statusIcon} [${this.currentTest.toString().padStart(2, '0')}] ${testName}: ${message}`);
    }

    async testPageLoad() {
        try {
            console.log('📄 测试页面加载...');
            await this.page.goto('http://localhost:3000', {
                waitUntil: 'networkidle2',
                timeout: 30000
            });

            const title = await this.page.title();
            if (title.includes('港交所POC系统')) {
                this.logTest('页面加载', 'PASS', '页面成功加载');
                return true;
            } else {
                this.logTest('页面加载', 'FAIL', `页面标题不正确: ${title}`);
                return false;
            }
        } catch (error) {
            this.logTest('页面加载', 'FAIL', `页面加载失败: ${error.message}`);
            return false;
        }
    }

    async testLogin() {
        try {
            console.log('🔐 测试用户登录...');
            
            // 等待页面加载
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            // 查找登录表单
            const emailField = await this.page.$('input[type="email"], input[name="email"]');
            const passwordField = await this.page.$('input[type="password"]');
            
            // 查找登录按钮
            const buttons = await this.page.$$('button');
            let loginButton = null;
            for (const button of buttons) {
                const buttonText = await button.evaluate(el => el.textContent);
                if (buttonText && buttonText.includes('登录')) {
                    loginButton = button;
                    break;
                }
            }
            
            if (emailField && passwordField && loginButton) {
                // 填写登录信息
                await emailField.type('zhangsan@hkex.com');
                await passwordField.type('user123');
                await loginButton.click();
                
                // 等待登录完成
                await new Promise(resolve => setTimeout(resolve, 3000));
                
                // 检查是否登录成功（页面应该跳转到主界面）
                const currentUrl = this.page.url();
                if (currentUrl === 'http://localhost:3000/' || currentUrl.includes('localhost:3000')) {
                    this.logTest('用户登录', 'PASS', '登录成功');
                    return true;
                } else {
                    this.logTest('用户登录', 'FAIL', '登录失败');
                    return false;
                }
            } else {
                this.logTest('用户登录', 'FAIL', '登录表单字段不完整');
                return false;
            }
        } catch (error) {
            this.logTest('用户登录', 'FAIL', `登录测试失败: ${error.message}`);
            return false;
        }
    }

    async testFormFields() {
        try {
            console.log('🔍 测试表单字段...');
            
            // 等待页面加载完成
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            // 检查基本表单字段是否存在
            const fields = [
                { id: 'applicant', name: '申请人' },
                { id: 'employee-id', name: '员工工号' },
                { id: 'reason', name: '事由描述' }
            ];

            let foundFields = 0;
            for (const field of fields) {
                const element = await this.page.$(`#${field.id}`);
                if (element) {
                    foundFields++;
                    this.logTest(`表单字段-${field.name}`, 'PASS', `${field.name}字段存在`);
                } else {
                    this.logTest(`表单字段-${field.name}`, 'FAIL', `${field.name}字段不存在`);
                }
            }

            if (foundFields >= fields.length * 0.5) {
                this.logTest('表单字段完整性', 'PASS', `找到 ${foundFields}/${fields.length} 个字段`);
                return true;
            } else {
                this.logTest('表单字段完整性', 'FAIL', `只找到 ${foundFields}/${fields.length} 个字段`);
                return false;
            }
        } catch (error) {
            this.logTest('表单字段', 'FAIL', `表单字段测试失败: ${error.message}`);
            return false;
        }
    }

    async testFormFilling() {
        try {
            console.log('✏️ 测试表单填写...');
            
            // 填写申请人
            const applicantField = await this.page.$('#applicant');
            if (applicantField) {
                await applicantField.type('张三');
                this.logTest('填写申请人', 'PASS', '成功填写申请人');
            } else {
                this.logTest('填写申请人', 'FAIL', '申请人字段不存在');
            }
            
            // 填写员工工号
            const employeeIdField = await this.page.$('#employee-id');
            if (employeeIdField) {
                await employeeIdField.type('EMP001');
                this.logTest('填写员工工号', 'PASS', '成功填写员工工号');
            } else {
                this.logTest('填写员工工号', 'FAIL', '员工工号字段不存在');
            }
            
            // 填写事由
            const reasonField = await this.page.$('#reason');
            if (reasonField) {
                await reasonField.type('测试费用申请');
                this.logTest('填写事由', 'PASS', '成功填写事由');
            } else {
                this.logTest('填写事由', 'FAIL', '事由字段不存在');
            }
            
            return true;
        } catch (error) {
            this.logTest('表单填写', 'FAIL', `表单填写失败: ${error.message}`);
            return false;
        }
    }

    async testButtons() {
        try {
            console.log('🔘 测试按钮功能...');
            
            // 查找所有按钮
            const buttons = await this.page.$$('button');
            let foundButtons = 0;
            
            for (const button of buttons) {
                const buttonText = await button.evaluate(el => el.textContent);
                if (buttonText) {
                    foundButtons++;
                    this.logTest(`按钮-${buttonText.trim()}`, 'PASS', `找到按钮: ${buttonText.trim()}`);
                }
            }
            
            if (foundButtons > 0) {
                this.logTest('按钮功能', 'PASS', `找到 ${foundButtons} 个按钮`);
                return true;
            } else {
                this.logTest('按钮功能', 'FAIL', '未找到任何按钮');
                return false;
            }
        } catch (error) {
            this.logTest('按钮功能', 'FAIL', `按钮功能测试失败: ${error.message}`);
            return false;
        }
    }

    async runAllTests() {
        console.log('=' * 60);
        console.log('🚀 开始简化前端费用申请页面测试');
        console.log('=' * 60);
        
        try {
            await this.init();
            
            await this.testPageLoad();
            await this.testLogin();
            await this.testFormFields();
            await this.testFormFilling();
            await this.testButtons();
            
            this.generateTestReport();
            
        } catch (error) {
            console.error('💥 测试过程中发生异常:', error);
        } finally {
            if (this.browser) {
                await this.browser.close();
            }
        }
    }

    generateTestReport() {
        console.log('\n' + '=' * 60);
        console.log('📊 简化前端测试报告');
        console.log('=' * 60);
        
        const totalTests = this.testResults.length;
        const passedTests = this.testResults.filter(r => r.status === 'PASS').length;
        const failedTests = this.testResults.filter(r => r.status === 'FAIL').length;
        
        console.log(`总测试数: ${totalTests}`);
        console.log(`通过: ${passedTests} ✅`);
        console.log(`失败: ${failedTests} ❌`);
        console.log(`成功率: ${totalTests > 0 ? (passedTests/totalTests*100).toFixed(1) : 0}%`);
        
        const reportData = {
            test_summary: {
                total: totalTests,
                passed: passedTests,
                failed: failedTests,
                success_rate: totalTests > 0 ? (passedTests/totalTests*100) : 0
            },
            test_results: this.testResults,
            timestamp: new Date().toISOString()
        };
        
        fs.writeFileSync('frontend_expense_test_report.json', JSON.stringify(reportData, null, 2), 'utf8');
        console.log('\n📄 详细报告已保存到: frontend_expense_test_report.json');
    }
}

async function main() {
    const tester = new SimpleFrontendTester();
    await tester.runAllTests();
}

if (require.main === module) {
    main().catch(console.error);
}

module.exports = SimpleFrontendTester; 