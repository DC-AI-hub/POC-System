const puppeteer = require('./fronted/node_modules/puppeteer');
const fs = require('fs');
const path = require('path');

class FrontendExpenseTester {
    constructor() {
        this.browser = null;
        this.page = null;
        this.testResults = [];
        this.currentTest = 0;
    }

    async init() {
        console.log('🚀 启动浏览器...');
        
        // 尝试使用本地Chrome
        const executablePath = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
        
        this.browser = await puppeteer.launch({
            headless: true, // 使用无头模式，避免Chrome依赖问题
            slowMo: 100, // 放慢操作速度，便于观察
            defaultViewport: { width: 1280, height: 720 },
            executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
            args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
        });
        this.page = await this.browser.newPage();
        
        // 设置用户代理
        await this.page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36');
    }

    logTest(testName, status, message = '', data = null) {
        this.currentTest += 1;
        const result = {
            test_id: this.currentTest,
            test_name: testName,
            status: status,
            message: message,
            timestamp: new Date().toISOString(),
            data: data
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

            // 检查页面标题
            const title = await this.page.title();
            if (title.includes('港交所POC系统') || title.includes('费用申请')) {
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

    async testFormValidation() {
        try {
            console.log('🔍 测试表单验证...');
            
            // 测试必填字段验证
            const requiredFields = [
                { selector: '#applicant', name: '申请人' },
                { selector: '#employee-id', name: '员工工号' },
                { selector: '#department', name: '所属部门' },
                { selector: '#application-date', name: '申请日期' },
                { selector: '#expense-date', name: '申请费用日' },
                { selector: '#company', name: '费用所属公司' },
                { selector: '#reason', name: '事由描述' }
            ];

            for (const field of requiredFields) {
                // 清空字段
                await this.page.click(field.selector);
                await this.page.keyboard.down('Control');
                await this.page.keyboard.press('A');
                await this.page.keyboard.up('Control');
                await this.page.keyboard.press('Backspace');
                
                // 点击其他位置触发验证
                await this.page.click('body');
                await this.page.waitForTimeout(500);

                // 检查错误信息
                const errorElement = await this.page.$(`${field.selector} + .text-red-500, ${field.selector} + div .text-red-500`);
                if (errorElement) {
                    this.logTest(`表单验证-${field.name}`, 'PASS', `${field.name}字段验证正常`);
                } else {
                    this.logTest(`表单验证-${field.name}`, 'FAIL', `${field.name}字段验证失败`);
                }
            }

            return true;
        } catch (error) {
            this.logTest('表单验证', 'FAIL', `表单验证测试失败: ${error.message}`);
            return false;
        }
    }

    async testFormFilling() {
        try {
            console.log('✏️ 测试表单填写...');
            
            // 填写基本信息
            await this.page.type('#applicant', '张三');
            await this.page.type('#employee-id', 'EMP001');
            
            // 选择部门
            await this.page.click('#department');
            await this.page.waitForSelector('[role="option"]');
            await this.page.click('[role="option"]');
            
            // 填写日期
            const today = new Date().toISOString().split('T')[0];
            await this.page.type('#application-date', today);
            
            const tomorrow = new Date(Date.now() + 24*60*60*1000).toISOString().split('T')[0];
            await this.page.type('#expense-date', tomorrow);
            
            // 选择公司
            await this.page.click('#company');
            await this.page.waitForSelector('[role="option"]');
            await this.page.click('[role="option"]');
            
            // 填写事由
            await this.page.type('#reason', '测试费用申请，用于系统功能验证和测试');
            
            // 填写费用明细
            await this.page.click('input[name="expenseItems.0.expenseCategory"]');
            await this.page.waitForSelector('[role="option"]');
            await this.page.click('[role="option"]');
            
            await this.page.type('input[name="expenseItems.0.purpose"]', '购买办公用品');
            await this.page.type('input[name="expenseItems.0.amount"]', '150.00');
            
            this.logTest('表单填写', 'PASS', '表单填写完成');
            return true;
        } catch (error) {
            this.logTest('表单填写', 'FAIL', `表单填写失败: ${error.message}`);
            return false;
        }
    }

    async testExpenseItemsManagement() {
        try {
            console.log('📋 测试费用明细管理...');
            
            // 测试添加费用明细
            const addButton = await this.page.$('button');
            const addButtonText = await addButton.evaluate(el => el.textContent);
            if (addButtonText && addButtonText.includes('增加明细')) {
                await addButton.click();
                await this.page.waitForTimeout(500);
                
                // 检查是否添加了新行
                const expenseRows = await this.page.$$('table tbody tr');
                if (expenseRows.length >= 2) {
                    this.logTest('添加费用明细', 'PASS', '成功添加费用明细行');
                } else {
                    this.logTest('添加费用明细', 'FAIL', '添加费用明细行失败');
                }
            }
            
            // 测试删除费用明细
            const deleteButtons = await this.page.$$('button[aria-label*="删除"], button:contains("删除")');
            if (deleteButtons.length > 1) {
                await deleteButtons[1].click(); // 删除第二行
                await this.page.waitForTimeout(500);
                
                const updatedRows = await this.page.$$('table tbody tr');
                if (updatedRows.length === 1) {
                    this.logTest('删除费用明细', 'PASS', '成功删除费用明细行');
                } else {
                    this.logTest('删除费用明细', 'FAIL', '删除费用明细行失败');
                }
            }
            
            return true;
        } catch (error) {
            this.logTest('费用明细管理', 'FAIL', `费用明细管理测试失败: ${error.message}`);
            return false;
        }
    }

    async testTotalCalculation() {
        try {
            console.log('🧮 测试总金额计算...');
            
            // 填写多个费用明细
            await this.page.type('input[name="expenseItems.0.amount"]', '100.00');
            
            // 添加第二行
            const addButton = await this.page.$('button:contains("增加明细")');
            if (addButton) {
                await addButton.click();
                await this.page.waitForTimeout(500);
                
                // 填写第二行
                await this.page.type('input[name="expenseItems.1.amount"]', '200.00');
                
                // 检查总金额
                await this.page.waitForTimeout(1000);
                const totalElement = await this.page.$('text/合计：¥300.00');
                if (totalElement) {
                    this.logTest('总金额计算', 'PASS', '总金额计算正确');
                } else {
                    this.logTest('总金额计算', 'FAIL', '总金额计算错误');
                }
            }
            
            return true;
        } catch (error) {
            this.logTest('总金额计算', 'FAIL', `总金额计算测试失败: ${error.message}`);
            return false;
        }
    }

    async testFormSubmission() {
        try {
            console.log('📤 测试表单提交...');
            
            // 测试保存功能
            const saveButton = await this.page.$('button:contains("保存")');
            if (saveButton) {
                await saveButton.click();
                await this.page.waitForTimeout(2000);
                
                // 检查是否有成功提示
                const successToast = await this.page.$('.toast-success, .bg-green-500, [data-testid="toast-success"]');
                if (successToast) {
                    this.logTest('表单保存', 'PASS', '表单保存成功');
                } else {
                    this.logTest('表单保存', 'FAIL', '表单保存失败');
                }
            }
            
            // 测试提交审批功能
            const submitButton = await this.page.$('button:contains("提交审批")');
            if (submitButton) {
                await submitButton.click();
                await this.page.waitForTimeout(3000);
                
                // 检查是否有提交成功提示
                const submitSuccessToast = await this.page.$('.toast-success, .bg-green-500, [data-testid="toast-success"]');
                if (submitSuccessToast) {
                    this.logTest('提交审批', 'PASS', '提交审批成功');
                } else {
                    this.logTest('提交审批', 'FAIL', '提交审批失败');
                }
            }
            
            return true;
        } catch (error) {
            this.logTest('表单提交', 'FAIL', `表单提交测试失败: ${error.message}`);
            return false;
        }
    }

    async testResponsiveDesign() {
        try {
            console.log('📱 测试响应式设计...');
            
            // 测试移动端视图
            await this.page.setViewport({ width: 375, height: 667 });
            await this.page.waitForTimeout(1000);
            
            // 检查页面是否正常显示
            const isVisible = await this.page.evaluate(() => {
                return document.body.offsetWidth > 0 && document.body.offsetHeight > 0;
            });
            
            if (isVisible) {
                this.logTest('响应式设计-移动端', 'PASS', '移动端视图正常显示');
            } else {
                this.logTest('响应式设计-移动端', 'FAIL', '移动端视图显示异常');
            }
            
            // 恢复桌面端视图
            await this.page.setViewport({ width: 1280, height: 720 });
            await this.page.waitForTimeout(1000);
            
            return true;
        } catch (error) {
            this.logTest('响应式设计', 'FAIL', `响应式设计测试失败: ${error.message}`);
            return false;
        }
    }

    async testAccessibility() {
        try {
            console.log('♿ 测试无障碍访问...');
            
            // 检查表单标签关联
            const formLabels = await this.page.$$eval('label', labels => 
                labels.map(label => ({
                    for: label.getAttribute('for'),
                    text: label.textContent
                }))
            );
            
            let accessibilityScore = 0;
            for (const label of formLabels) {
                if (label.for) {
                    const input = await this.page.$(`#${label.for}`);
                    if (input) {
                        accessibilityScore++;
                    }
                }
            }
            
            if (accessibilityScore >= formLabels.length * 0.8) {
                this.logTest('无障碍访问', 'PASS', `无障碍访问良好 (${accessibilityScore}/${formLabels.length})`);
            } else {
                this.logTest('无障碍访问', 'FAIL', `无障碍访问需要改进 (${accessibilityScore}/${formLabels.length})`);
            }
            
            return true;
        } catch (error) {
            this.logTest('无障碍访问', 'FAIL', `无障碍访问测试失败: ${error.message}`);
            return false;
        }
    }

    async runAllTests() {
        console.log('=' * 60);
        console.log('🚀 开始前端费用申请页面功能测试');
        console.log('=' * 60);
        
        try {
            await this.init();
            
            // 运行各项测试
            await this.testPageLoad();
            await this.testFormValidation();
            await this.testFormFilling();
            await this.testExpenseItemsManagement();
            await this.testTotalCalculation();
            await this.testFormSubmission();
            await this.testResponsiveDesign();
            await this.testAccessibility();
            
            // 生成测试报告
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
        console.log('📊 前端测试报告');
        console.log('=' * 60);
        
        const totalTests = this.testResults.length;
        const passedTests = this.testResults.filter(r => r.status === 'PASS').length;
        const failedTests = this.testResults.filter(r => r.status === 'FAIL').length;
        const infoTests = this.testResults.filter(r => r.status === 'INFO').length;
        
        console.log(`总测试数: ${totalTests}`);
        console.log(`通过: ${passedTests} ✅`);
        console.log(`失败: ${failedTests} ❌`);
        console.log(`信息: ${infoTests} ℹ️`);
        console.log(`成功率: ${totalTests > 0 ? (passedTests/totalTests*100).toFixed(1) : 0}%`);
        
        // 保存详细报告
        const reportData = {
            test_summary: {
                total: totalTests,
                passed: passedTests,
                failed: failedTests,
                info: infoTests,
                success_rate: totalTests > 0 ? (passedTests/totalTests*100) : 0
            },
            test_results: this.testResults,
            timestamp: new Date().toISOString()
        };
        
        fs.writeFileSync('frontend_expense_test_report.json', JSON.stringify(reportData, null, 2), 'utf8');
        console.log('\n📄 详细报告已保存到: frontend_expense_test_report.json');
        
        // 显示失败的测试
        const failedResults = this.testResults.filter(r => r.status === 'FAIL');
        if (failedResults.length > 0) {
            console.log(`\n❌ 失败的测试 (${failedResults.length}):`);
            failedResults.forEach(result => {
                console.log(`  - ${result.test_name}: ${result.message}`);
            });
        }
    }
}

// 运行测试
async function main() {
    const tester = new FrontendExpenseTester();
    await tester.runAllTests();
}

if (require.main === module) {
    main().catch(console.error);
}

module.exports = FrontendExpenseTester; 