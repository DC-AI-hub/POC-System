# Comprehensive API and Component Documentation

## Table of Contents
1. [Backend REST APIs](#backend-rest-apis)
2. [Frontend API Routes](#frontend-api-routes)
3. [React Components](#react-components)
4. [Custom Hooks](#custom-hooks)
5. [Utility Functions](#utility-functions)
6. [Type Definitions](#type-definitions)
7. [Authentication](#authentication)
8. [Usage Examples](#usage-examples)

---

## Backend REST APIs

### Base URL: `http://localhost:8080`

### 1. Authentication Controller (`/api/auth`)

#### Login
- **POST** `/api/auth/login`
- **Description**: User authentication with JWT token generation
- **Request Body**:
```json
{
  "username": "string",
  "password": "string"
}
```
- **Response**:
```json
{
  "success": true,
  "token": "jwt_token_here",
  "user": {
    "id": "string",
    "username": "string",
    "email": "string",
    "roles": ["string"]
  }
}
```

#### Token Refresh
- **POST** `/api/auth/refresh`
- **Description**: Refresh JWT token
- **Headers**: `Authorization: Bearer <refresh_token>`

### 2. User Management (`/api/users`)

#### Get All Users
- **GET** `/api/users`
- **Description**: Retrieve all users with optional filtering
- **Query Params**: `role`, `status`, `department`
- **Response**: Array of user objects

#### Get User by ID
- **GET** `/api/users/{id}`
- **Description**: Get specific user details
- **Path Param**: `id` - User ID

#### Create User
- **POST** `/api/users`
- **Request Body**:
```json
{
  "name": "string",
  "email": "string",
  "department": "string",
  "role": "string"
}
```

#### Update User
- **PUT** `/api/users/{id}`
- **Description**: Update user information

#### Delete User
- **DELETE** `/api/users/{id}`
- **Description**: Soft delete user

### 3. Workflow Management (`/api/workflow`)

#### Get Workflows
- **GET** `/api/workflow`
- **Description**: Get all workflow templates
- **Response**:
```json
{
  "success": true,
  "data": [
    {
      "id": "number",
      "name": "string",
      "status": "active|inactive",
      "createTime": "timestamp"
    }
  ]
}
```

#### Get Workflow Nodes
- **GET** `/api/workflow/{workflowId}/nodes`
- **Description**: Get workflow execution nodes

#### Update Node Status
- **PUT** `/api/workflow/nodes/{nodeId}/status`
- **Request Body**:
```json
{
  "status": "completed|pending|rejected",
  "comment": "string"
}
```

### 4. Organization Management (`/api/organization`)

#### Get Organization Tree
- **GET** `/api/organization/tree`
- **Description**: Get complete organizational hierarchy
- **Response**: Nested tree structure

#### Get Departments
- **GET** `/api/organization/departments`
- **Description**: Get all departments

#### Get Positions
- **GET** `/api/organization/positions`
- **Query Params**: `departmentId` (optional)

#### Get Online Users
- **GET** `/api/organization/online-users`
- **Description**: Get currently active users

### 5. Expense Management (`/api/expense`)

#### Get Applications
- **GET** `/api/expense/applications`
- **Query Params**: `status`, `userId`
- **Description**: Get expense applications

#### Create Application
- **POST** `/api/expense/applications`
- **Request Body**:
```json
{
  "title": "string",
  "amount": "number",
  "currency": "string",
  "category": "string",
  "description": "string"
}
```

#### Submit Application
- **POST** `/api/expense/applications/{id}/submit`
- **Description**: Submit application for approval

#### Approve Application
- **POST** `/api/expense/applications/{id}/approve`
- **Request Body**:
```json
{
  "approved": "boolean",
  "comment": "string"
}
```

### 6. Proxy Management (`/api/proxy`)

#### Get Proxy Settings
- **GET** `/api/proxy/settings`
- **Description**: Get AB role proxy configurations

#### Create Proxy Setting
- **POST** `/api/proxy/settings`
- **Request Body**:
```json
{
  "userId": "string",
  "proxyUserId": "string",
  "startDate": "date",
  "endDate": "date",
  "permissions": ["string"]
}
```

### 7. Log Management (`/api/logs`)

#### Get System Logs
- **GET** `/api/logs/system`
- **Query Params**: `level`, `startDate`, `endDate`, `page`, `size`

#### Get Security Logs
- **GET** `/api/logs/security`
- **Query Params**: `action`, `userId`, `startDate`, `endDate`

#### Get Audit Logs
- **GET** `/api/logs/audit`
- **Query Params**: `module`, `operation`, `userId`

---

## Frontend API Routes

### 1. Health Check (`/api/health`)
- **GET** `/api/health/route`
- **Description**: Application health status

### 2. Integration Management (`/api/integrations`)

#### Get Integrations
- **GET** `/api/integrations`
- **Query Params**: `type`, `active`
- **Description**: Get integration configurations

#### Create Integration
- **POST** `/api/integrations`
- **Request Body**: Integration configuration object

#### Update Integrations
- **PUT** `/api/integrations`
- **Description**: Batch update integrations

#### Delete Integrations
- **DELETE** `/api/integrations?ids=comma,separated,ids`

---

## React Components

### 1. UI Components (`/components/ui/`)

#### Button Component
```typescript
interface ButtonProps {
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  asChild?: boolean;
  children: React.ReactNode;
  onClick?: () => void;
}
```

#### Dialog Component
```typescript
interface DialogProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  children: React.ReactNode;
}
```

#### Form Components
- `Input` - Text input with validation
- `Textarea` - Multi-line text input
- `Select` - Dropdown selector
- `Checkbox` - Boolean input
- `RadioGroup` - Single selection from options

#### Data Display
- `Table` - Data table with sorting and pagination
- `Card` - Content container
- `Badge` - Status indicators
- `Avatar` - User profile images

### 2. Business Components

#### Personnel Management Page
```typescript
// Usage
import PersonnelManagementPage from '@/components/personnel-management-page';

<PersonnelManagementPage />
```
- **Features**: Employee CRUD, department management, role assignment
- **Props**: None (self-contained)

#### Approval Management Page
```typescript
import ApprovalManagementPage from '@/components/approval-management-page';

<ApprovalManagementPage />
```
- **Features**: Approval workflow, status tracking, batch operations

#### Expense Application Page
```typescript
import ExpenseApplicationPage from '@/components/expense-application-page';

<ExpenseApplicationPage />
```
- **Features**: Expense form, attachment upload, approval tracking

#### Travel Expense Page
```typescript
import TravelExpensePage from '@/components/travel-expense-page';

<TravelExpensePage />
```
- **Features**: Multi-currency support, exchange rate management

#### Workflow Tracker
```typescript
import WorkflowTracker from '@/components/workflow-tracker';

<WorkflowTracker workflowId="string" />
```
- **Props**: `workflowId: string`
- **Features**: Real-time workflow status, node progression

#### System Config Page
```typescript
import SystemConfigPage from '@/components/system-config-page';

<SystemConfigPage />
```
- **Features**: Role management, permissions, system parameters

---

## Custom Hooks

### 1. Authentication Hook

```typescript
import { useOAuth2Auth } from '@/hooks/use-oauth2-auth';

const {
  login,
  logout,
  user,
  loading,
  error,
  isAuthenticated
} = useOAuth2Auth();

// Usage
await login('google');
```

### 2. System Configuration Hook

```typescript
import { useSystemConfig } from '@/hooks/use-system-config';

const {
  roles,
  permissions,
  categories,
  workflows,
  createRole,
  updateRole,
  deleteRole,
  loadingRoles,
  saving,
  error
} = useSystemConfig();

// Create new role
await createRole({
  name: 'Manager',
  code: 'manager',
  permissions: ['expense.approve'],
  level: 3,
  isActive: true
});
```

### 3. Personnel Management Hook

```typescript
import { usePersonnelManagement } from '@/hooks/use-personnel-management';

const {
  employees,
  departments,
  positions,
  addEmployee,
  updateEmployee,
  deleteEmployee,
  importEmployees,
  loading,
  error
} = usePersonnelManagement();
```

### 4. Approval Management Hook

```typescript
import { useApprovalManagement } from '@/hooks/use-approval-management';

const {
  applications,
  pendingCount,
  approve,
  reject,
  batchApprove,
  loading
} = useApprovalManagement();
```

### 5. Integration Hook

```typescript
import { useIntegration } from '@/hooks/use-integration';

const {
  integrations,
  createIntegration,
  updateIntegration,
  deleteIntegration,
  testConnection,
  syncData,
  loading
} = useIntegration();
```

### 6. Utility Hooks

#### useDebounce
```typescript
import { useDebounce } from '@/hooks/use-debounce';

const debouncedValue = useDebounce(value, 500);
```

#### useToast
```typescript
import { useToast } from '@/hooks/use-toast';

const { toast } = useToast();

toast({
  title: "Success",
  description: "Data saved successfully",
  variant: "default"
});
```

---

## Utility Functions

### 1. Class Name Utilities

```typescript
import { cn } from '@/lib/utils';

// Combine Tailwind classes with conditional logic
const className = cn(
  'base-class',
  condition && 'conditional-class',
  {
    'active': isActive,
    'disabled': isDisabled
  }
);
```

### 2. Authentication Utilities

```typescript
import { OAuth2Utils } from '@/lib/auth/oauth2-utils';

// Generate OAuth2 authorization URL
const authUrl = OAuth2Utils.buildAuthUrl('google', {
  state: 'random-state',
  scope: ['email', 'profile']
});

// Validate JWT token
const isValid = OAuth2Utils.validateToken(token);
```

### 3. Validation Utilities

```typescript
import { validateEmail, validatePassword } from '@/lib/validations';

const emailError = validateEmail('user@example.com');
const passwordError = validatePassword('password123');
```

---

## Type Definitions

### 1. Authentication Types

```typescript
interface UserProfile {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  provider: string;
  providerUserId: string;
}

interface AuthToken {
  accessToken: string;
  refreshToken?: string;
  tokenType: string;
  expiresIn: number;
}
```

### 2. Integration Types

```typescript
interface IntegrationConfig {
  id: string;
  name: string;
  type: 'auth' | 'finance' | 'hr' | 'notification' | 'storage';
  provider: string;
  endpoint: string;
  authType: 'basic' | 'oauth2' | 'saml' | 'ldap' | 'api_key';
  credentials: Record<string, string>;
  mapping: FieldMapping[];
  isActive: boolean;
}
```

### 3. Workflow Types

```typescript
interface WorkflowTemplate {
  id: string;
  name: string;
  code: string;
  type: string;
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
  conditions: WorkflowCondition[];
  isActive: boolean;
  version: string;
}
```

---

## Authentication

### OAuth2 Setup

1. **Configure OAuth2 Provider**:
```typescript
const oauth2Config: OAuth2Config = {
  providers: [
    {
      id: 'google',
      name: 'Google',
      clientId: process.env.GOOGLE_CLIENT_ID,
      scope: ['email', 'profile'],
      authUrl: 'https://accounts.google.com/oauth/authorize'
    }
  ],
  baseUrl: process.env.NEXTAUTH_URL,
  redirectPath: '/api/auth/callback'
};
```

2. **Use Authentication Hook**:
```typescript
const { login, logout, user, isAuthenticated } = useOAuth2Auth();

// Login with Google
await login('google');

// Logout
await logout();
```

### JWT Token Management

- Tokens are automatically refreshed
- Stored securely in HTTP-only cookies
- Include role-based permissions

---

## Usage Examples

### 1. Creating a New Employee

```typescript
const { addEmployee } = usePersonnelManagement();

const newEmployee = {
  name: 'John Doe',
  email: 'john.doe@company.com',
  department: 'Engineering',
  position: 'Software Developer',
  hireDate: new Date(),
  salary: {
    amount: 80000,
    currency: 'USD'
  }
};

await addEmployee(newEmployee);
```

### 2. Setting up System Integration

```typescript
const { createIntegration } = useIntegration();

const ldapIntegration = {
  name: 'LDAP User Authentication',
  type: 'auth' as const,
  provider: 'ldap',
  endpoint: 'ldap://dc.company.com:389',
  authType: 'basic' as const,
  credentials: {
    username: 'admin',
    password: 'secure_password'
  },
  mapping: [
    { sourceField: 'cn', targetField: 'name', dataType: 'string', required: true },
    { sourceField: 'mail', targetField: 'email', dataType: 'string', required: true }
  ]
};

await createIntegration(ldapIntegration);
```

### 3. Workflow Approval Process

```typescript
const { approve, reject } = useApprovalManagement();

// Approve application
await approve('application-id', {
  comment: 'Approved based on company policy',
  nextApprover: 'manager-id'
});

// Reject application
await reject('application-id', {
  reason: 'Insufficient documentation',
  requiredActions: ['Upload receipts', 'Provide justification']
});
```

### 4. Custom Component with Hooks

```typescript
function ExpenseForm() {
  const { categories } = useSystemConfig();
  const { createApplication } = useExpenseApplication();
  const { toast } = useToast();

  const handleSubmit = async (data: ExpenseFormData) => {
    try {
      await createApplication(data);
      toast({
        title: "Success",
        description: "Expense application created successfully"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create application",
        variant: "destructive"
      });
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Form fields */}
    </form>
  );
}
```

---

## Error Handling

All APIs return standardized error responses:

```json
{
  "success": false,
  "message": "Error description",
  "errors": ["Detailed error messages"],
  "timestamp": "2024-01-01T12:00:00Z",
  "requestId": "unique-request-id"
}
```

Hooks automatically handle errors and provide error states for UI handling.

---

## Performance Considerations

1. **Pagination**: All list APIs support pagination
2. **Caching**: API responses are cached using React Query
3. **Debouncing**: Search inputs use debounced values
4. **Lazy Loading**: Components are code-split for optimal loading
5. **Optimistic Updates**: UI updates immediately with rollback on error

---

## Security

1. **JWT Tokens**: All API calls require valid JWT tokens
2. **Role-Based Access**: Endpoints protected by user roles
3. **CORS**: Configured for production domains
4. **Input Validation**: All inputs validated on both client and server
5. **SQL Injection Protection**: Using parameterized queries