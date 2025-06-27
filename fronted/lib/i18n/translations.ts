export type Language = 'zh' | 'en'

export interface Translations {
  // Common
  common: {
    loading: string
    error: string
    success: string
    cancel: string
    confirm: string
    save: string
    edit: string
    delete: string
    search: string
    filter: string
    reset: string
    submit: string
    back: string
    next: string
    previous: string
    close: string
    open: string
    refresh: string
    logout: string
    login: string
    register: string
    profile: string
    settings: string
    help: string
    about: string
    contact: string
    privacy: string
    terms: string
    language: string
    chinese: string
    english: string
  }
  
  // Login Page
  login: {
    title: string
    subtitle: string
    welcome: string
    email: string
    password: string
    rememberMe: string
    forgotPassword: string
    loginButton: string
    loggingIn: string
    noAccount: string
    createAccount: string
    orLoginWith: string
    oauth2Login: string
    demoAccount: string
    demoEmail: string
    demoPassword: string
    emailRequired: string
    emailInvalid: string
    passwordRequired: string
    passwordMinLength: string
    loginFailed: string
    loginError: string
    
    // Login Types
    accountLogin: string
    mobileLogin: string
    qrcodeLogin: string
    mobile: string
    verificationCode: string
    getCode: string
    scanLogin: string
    scanWithApp: string
    refreshQR: string
    noApp: string
    downloadApp: string
    
    // Terms
    agreeTerms: string
    privacyPolicy: string
    and: string
    userAgreement: string
    
    // Copyright
    copyright: string
  }
  
  // Dashboard
  dashboard: {
    welcome: string
    userInfo: string
    demoMode: string
    oauth2Provider: string
    refreshToken: string
    
    // Menu Items
    expenseApplication: string
    dataManagement: string
    travelExpense: string
    approvalManagement: string
    workflowTracking: string
    systemConfig: string
    reportAnalytics: string
    integrationManagement: string
    oauth2Demo: string
    
    // Other Menu
    accountSubjects: string
    financialManagement: string
    organizationalStructure: string
  }
  
  // OAuth2
  oauth2: {
    title: string
    subtitle: string
    selectProvider: string
    popularLogin: string
    domesticLogin: string
    securityNotice: string
    securityTitle: string
    securityDescription: string
    authStatus: string
    tokenInfo: string
    providerConfig: string
    features: string
    
    // Providers
    google: string
    github: string
    microsoft: string
    wechat: string
    dingtalk: string
    
    // Status
    authenticated: string
    unauthenticated: string
    processing: string
    success: string
    failed: string
    
    // Messages
    processingAuth: string
    loginSuccess: string
    loginFailed: string
    authError: string
    welcomeBack: string
    returnToLogin: string
    retryAuth: string
    
    // Token
    tokenType: string
    expiresIn: string
    scope: string
    accessToken: string
    refreshToken: string
    noTokenInfo: string
    
    // Features
    secureAuth: string
    pkceSupport: string
    multiProvider: string
    tokenRefresh: string
    csrfProtection: string
    sessionManagement: string
    
    // Security
    securityTip: string
    securityDescription2: string
  }
  
  // Errors
  errors: {
    networkError: string
    serverError: string
    unauthorized: string
    forbidden: string
    notFound: string
    validationError: string
    unknownError: string
  }
}

export const translations: Record<Language, Translations> = {
  zh: {
    common: {
      loading: '加载中...',
      error: '错误',
      success: '成功',
      cancel: '取消',
      confirm: '确认',
      save: '保存',
      edit: '编辑',
      delete: '删除',
      search: '搜索',
      filter: '筛选',
      reset: '重置',
      submit: '提交',
      back: '返回',
      next: '下一步',
      previous: '上一步',
      close: '关闭',
      open: '打开',
      refresh: '刷新',
      logout: '退出登录',
      login: '登录',
      register: '注册',
      profile: '个人资料',
      settings: '设置',
      help: '帮助',
      about: '关于',
      contact: '联系我们',
      privacy: '隐私政策',
      terms: '服务条款',
      language: '语言',
      chinese: '简体中文',
      english: 'English'
    },
    
    login: {
      title: 'POC SYSTEM',
      subtitle: '企业级管理系统',
      welcome: '欢迎回来',
      email: '邮箱',
      password: '密码',
      rememberMe: '记住密码',
      forgotPassword: '忘记密码',
      loginButton: '登录',
      loggingIn: '登录中...',
      noAccount: '还没有账号？',
      createAccount: '立即注册',
      orLoginWith: '或使用以下方式登录',
      oauth2Login: 'OAuth2 登录',
      demoAccount: '演示账号',
      demoEmail: '邮箱: demo@example.com',
      demoPassword: '密码: password',
      emailRequired: '请输入邮箱',
      emailInvalid: '请输入有效的邮箱地址',
      passwordRequired: '请输入密码',
      passwordMinLength: '密码至少需要6个字符',
      loginFailed: '邮箱或密码错误，请重试',
      loginError: '登录失败，请稍后重试',
      
      accountLogin: '账号登录',
      mobileLogin: '手机号登录',
      qrcodeLogin: '扫码登录',
      mobile: '手机号',
      verificationCode: '验证码',
      getCode: '获取验证码',
      scanLogin: '扫码登录',
      scanWithApp: '使用 POC 系统 App',
      refreshQR: '刷新二维码',
      noApp: '没有 App？',
      downloadApp: '立即下载',
      
      agreeTerms: '登录即表示同意',
      privacyPolicy: '《隐私政策》',
      and: '和',
      userAgreement: '《用户协议》',
      
      copyright: '©2002-2025 POC System. All rights reserved.'
    },
    
    dashboard: {
      welcome: '欢迎',
      userInfo: '用户信息',
      demoMode: '演示模式',
      oauth2Provider: 'OAuth2',
      refreshToken: '刷新令牌',
      
      expenseApplication: '日常费用申请',
      dataManagement: '人员信息管理',
      travelExpense: '差旅费报销',
      approvalManagement: '审批管理',
      workflowTracking: '工作流追踪',
      systemConfig: '系统配置管理',
      reportAnalytics: '报表分析',
      integrationManagement: '系统集成管理',
      oauth2Demo: 'OAuth2 认证',
      
      accountSubjects: '会计科目',
      financialManagement: '财务管理',
      organizationalStructure: '组织架构'
    },
    
    oauth2: {
      title: 'OAuth2 身份认证',
      subtitle: '安全的第三方登录系统演示',
      selectProvider: '选择您偏好的登录方式',
      popularLogin: '常用登录',
      domesticLogin: '国内登录',
      securityNotice: '安全保障',
      securityTitle: '安全保障',
      securityDescription: '我们使用 OAuth2 标准协议保护您的账户安全，不会存储您的密码信息。',
      authStatus: '认证状态',
      tokenInfo: '令牌信息',
      providerConfig: '提供商配置',
      features: '功能特性',
      
      google: 'Google',
      github: 'GitHub',
      microsoft: 'Microsoft',
      wechat: '微信',
      dingtalk: '钉钉',
      
      authenticated: '已认证',
      unauthenticated: '未认证',
      processing: '处理中',
      success: '成功',
      failed: '失败',
      
      processingAuth: '正在验证您的身份...',
      loginSuccess: '登录成功！正在跳转...',
      loginFailed: '认证失败，请重试',
      authError: '认证过程中出现错误',
      welcomeBack: '欢迎回来！',
      returnToLogin: '返回登录页面',
      retryAuth: '重试认证',
      
      tokenType: '令牌类型',
      expiresIn: '过期时间',
      scope: '作用域',
      accessToken: '访问令牌',
      refreshToken: '刷新令牌',
      noTokenInfo: '无令牌信息',
      
      secureAuth: '安全认证',
      pkceSupport: 'PKCE 支持',
      multiProvider: '多提供商',
      tokenRefresh: '令牌刷新',
      csrfProtection: 'CSRF 保护',
      sessionManagement: '会话管理',
      
      securityTip: '安全提示：',
      securityDescription2: '此系统使用 OAuth2 标准协议，不会存储您的密码。所有认证过程都通过第三方提供商的安全服务器进行。'
    },
    
    errors: {
      networkError: '网络连接错误',
      serverError: '服务器错误',
      unauthorized: '未授权访问',
      forbidden: '访问被拒绝',
      notFound: '页面未找到',
      validationError: '输入验证失败',
      unknownError: '未知错误'
    }
  },
  
  en: {
    common: {
      loading: 'Loading...',
      error: 'Error',
      success: 'Success',
      cancel: 'Cancel',
      confirm: 'Confirm',
      save: 'Save',
      edit: 'Edit',
      delete: 'Delete',
      search: 'Search',
      filter: 'Filter',
      reset: 'Reset',
      submit: 'Submit',
      back: 'Back',
      next: 'Next',
      previous: 'Previous',
      close: 'Close',
      open: 'Open',
      refresh: 'Refresh',
      logout: 'Logout',
      login: 'Login',
      register: 'Register',
      profile: 'Profile',
      settings: 'Settings',
      help: 'Help',
      about: 'About',
      contact: 'Contact',
      privacy: 'Privacy',
      terms: 'Terms',
      language: 'Language',
      chinese: '简体中文',
      english: 'English'
    },
    
    login: {
      title: 'POC SYSTEM',
      subtitle: 'Enterprise Management System',
      welcome: 'Welcome Back',
      email: 'Email',
      password: 'Password',
      rememberMe: 'Remember Me',
      forgotPassword: 'Forgot Password',
      loginButton: 'Login',
      loggingIn: 'Logging in...',
      noAccount: "Don't have an account?",
      createAccount: 'Sign Up',
      orLoginWith: 'Or login with',
      oauth2Login: 'OAuth2 Login',
      demoAccount: 'Demo Account',
      demoEmail: 'Email: demo@example.com',
      demoPassword: 'Password: password',
      emailRequired: 'Email is required',
      emailInvalid: 'Please enter a valid email address',
      passwordRequired: 'Password is required',
      passwordMinLength: 'Password must be at least 6 characters',
      loginFailed: 'Invalid email or password. Please try again.',
      loginError: 'An error occurred. Please try again later.',
      
      accountLogin: 'Account',
      mobileLogin: 'Mobile',
      qrcodeLogin: 'QR Code',
      mobile: 'Mobile Number',
      verificationCode: 'Verification Code',
      getCode: 'Get Code',
      scanLogin: 'Scan to Login',
      scanWithApp: 'Use POC System App',
      refreshQR: 'Refresh QR Code',
      noApp: 'No App?',
      downloadApp: 'Download Now',
      
      agreeTerms: 'By logging in, you agree to',
      privacyPolicy: 'Privacy Policy',
      and: 'and',
      userAgreement: 'User Agreement',
      
      copyright: '©2002-2025 POC System. All rights reserved.'
    },
    
    dashboard: {
      welcome: 'Welcome',
      userInfo: 'User Info',
      demoMode: 'Demo Mode',
      oauth2Provider: 'OAuth2',
      refreshToken: 'Refresh Token',
      
      expenseApplication: 'Expense Application',
      dataManagement: 'Personnel Management',
      travelExpense: 'Travel Expense',
      approvalManagement: 'Approval Management',
      workflowTracking: 'Workflow Tracking',
      systemConfig: 'System Configuration',
      reportAnalytics: 'Report Analytics',
      integrationManagement: 'Integration Management',
      oauth2Demo: 'OAuth2 Authentication',
      
      accountSubjects: 'Account Subjects',
      financialManagement: 'Financial Management',
      organizationalStructure: 'Organizational Structure'
    },
    
    oauth2: {
      title: 'OAuth2 Authentication',
      subtitle: 'Secure Third-party Login System Demo',
      selectProvider: 'Choose your preferred login method',
      popularLogin: 'Popular Login',
      domesticLogin: 'Domestic Login',
      securityNotice: 'Security Assurance',
      securityTitle: 'Security Assurance',
      securityDescription: 'We use OAuth2 standard protocol to protect your account security without storing your password information.',
      authStatus: 'Authentication Status',
      tokenInfo: 'Token Information',
      providerConfig: 'Provider Configuration',
      features: 'Features',
      
      google: 'Google',
      github: 'GitHub',
      microsoft: 'Microsoft',
      wechat: 'WeChat',
      dingtalk: 'DingTalk',
      
      authenticated: 'Authenticated',
      unauthenticated: 'Unauthenticated',
      processing: 'Processing',
      success: 'Success',
      failed: 'Failed',
      
      processingAuth: 'Verifying your identity...',
      loginSuccess: 'Login successful! Redirecting...',
      loginFailed: 'Authentication failed, please try again',
      authError: 'An error occurred during authentication',
      welcomeBack: 'Welcome back!',
      returnToLogin: 'Return to Login',
      retryAuth: 'Retry Authentication',
      
      tokenType: 'Token Type',
      expiresIn: 'Expires In',
      scope: 'Scope',
      accessToken: 'Access Token',
      refreshToken: 'Refresh Token',
      noTokenInfo: 'No Token Info',
      
      secureAuth: 'Secure Authentication',
      pkceSupport: 'PKCE Support',
      multiProvider: 'Multi-Provider',
      tokenRefresh: 'Token Refresh',
      csrfProtection: 'CSRF Protection',
      sessionManagement: 'Session Management',
      
      securityTip: 'Security Notice:',
      securityDescription2: 'This system uses OAuth2 standard protocol and does not store your passwords. All authentication processes are conducted through secure servers of third-party providers.'
    },
    
    errors: {
      networkError: 'Network connection error',
      serverError: 'Server error',
      unauthorized: 'Unauthorized access',
      forbidden: 'Access denied',
      notFound: 'Page not found',
      validationError: 'Validation failed',
      unknownError: 'Unknown error'
    }
  }
} 