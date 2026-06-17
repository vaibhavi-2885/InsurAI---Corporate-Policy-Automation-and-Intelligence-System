# 🛡️ InsurAI - Corporate Policy Automation and Intelligence System

**An Enterprise-Grade Insurance Platform with AI-Powered Policy Management, Automated Claims Processing, and Digital Document Generation**

---

## 📋 Project Overview

**InsurAI** is a comprehensive insurance management platform designed for enterprises to automate policy lifecycle management, streamline claims processing, and provide intelligent customer service through advanced AI capabilities. Built with **Spring Boot** and **MySQL**, the system handles policy sales, renewals, amendments, claims management, and digital document generation with enterprise-grade security and scalability.

### Core Mission
Transform insurance operations through automation, reduce processing time, enhance customer experience, and provide intelligent policy management solutions for modern insurance corporations.

---

## ✨ Key Features

### 🔐 **User & Role Management**
- Multi-role authentication (CUSTOMER, AGENT, ADMIN)
- User registration and role-based access control
- Secure JWT-based authentication
- Agent availability management with scheduling

### 💼 **Policy Management**
- **Policy Purchase** - Create new insurance policies with comprehensive details
- **Policy Renewal** - Automated renewal process with extended coverage periods
- **Policy Amendments** - Customer-initiated changes (address, nominee, contact info)
- **Policy Document Generation** - Digital policy certificates with unique identifiers
- **Policy Tracking** - Real-time policy status monitoring (ACTIVE, EXPIRED, RENEWED)

### 📋 **Insurance Plans**
- Multiple insurance categories (HEALTH, LIFE, VEHICLE, TRAVEL, INVESTMENT)
- Customizable coverage amounts and base premiums
- Detailed plan features, eligibility criteria, and claim processes
- Dynamic quote generation based on age, health status, and term years

### ⚖️ **Claims Management**
- **Claim Filing** - User-friendly claim submission process
- **Automated Approval Logic** - Intelligent auto-approval for low-value claims
- **Admin Review Queue** - Centralized admin dashboard for claim management
- **Status Tracking** - Real-time claim status (PENDING, APPROVED, REJECTED)
- **Incident Documentation** - Capture incident date, reason, and claim amount

### 📄 **Digital Document Management**
- **PDF Policy Generation** - Automated Certificate of Insurance generation
- **Digital Fingerprinting** - Unique digital signature hashes for authenticity
- **Document Versioning** - Complete audit trail of policy documents
- **Download Management** - Secure policy document downloads

### 📧 **Communication & Notifications**
- **Email Service** - Transactional emails for policy purchase, renewal, claims
- **Receipt Notifications** - Automated payment confirmation emails
- **Claim Updates** - Real-time claim status notifications
- **Customizable Templates** - Flexible email messaging

### 🤖 **AI Chat Support** (API Ready)
- Chat request handling for customer inquiries
- Conversation history management
- Integration-ready for AI/ML models

### 🔧 **Admin Dashboard**
- Centralized policy management
- Claims queue and approval workflow
- Amendment request processing
- Agent availability scheduling
- Comprehensive reporting capabilities

---

## 🏗️ Architecture

### **Layered Architecture**
```
┌─────────────────────────────────────┐
│        Frontend (React Vite)         │
├─────────────────────────────────────┤
│       Spring Boot REST API            │
│  (Controllers, Services, DTOs)       │
├─────────────────────────────────────┤
│    Entity Layer (JPA/Hibernate)      │
├─────────────────────────────────────┤
│    MySQL Database                    │
└─────────────────────────────────────┘
```

### **Key Components**

| Layer | Components |
|-------|-----------|
| **Controllers** | PolicyController, ClaimController, PolicyAmendmentController, PolicyDocumentController |
| **Services** | EmailService, PdfService |
| **Entities** | User, Policy, Claim, InsurancePlan, PolicyAmendment, PolicyDocument, AgentAvailability |
| **Repositories** | PolicyRepository, ClaimRepository, PolicyAmendmentRepository, UserRepository |
| **DTOs** | QuoteRequest, ChatRequest |

---

## 🛠️ Tech Stack

### **Backend**
- **Java 21** - Modern Java runtime
- **Spring Boot 3.4.12** - Web framework
- **Spring Data JPA** - Database abstraction
- **MySQL Connector** - Database driver
- **OpenPDF** - PDF generation and manipulation
- **Lombok** - Boilerplate reduction
- **Spring Boot Mail** - Email service integration

### **Frontend**
- **React** with **Vite** (Port: 5173/5174)
- **Modern JavaScript/TypeScript**

### **Database**
- **MySQL** - Relational database
- **Hibernate ORM** - Object-relational mapping

### **Additional Tools**
- **Maven** - Build automation
- **JUnit & Spring Boot Test** - Testing framework

---

## 📦 Installation & Setup

### Prerequisites
- Java 21 or higher
- Maven 3.8+
- MySQL 8.0+
- Node.js 16+ (for frontend)
- Git

### Backend Setup

1. **Clone the Repository**
   ```bash
   git clone https://github.com/vaibhavi-2885/InsurAI---Corporate-Policy-Automation-and-Intelligence-System.git
   cd backend
   ```

2. **Configure Database**
   Create `application.properties`:
   ```properties
   spring.datasource.url=jdbc:mysql://localhost:3306/insurai_db
   spring.datasource.username=root
   spring.datasource.password=your_password
   spring.jpa.hibernate.ddl-auto=update
   spring.jpa.show-sql=true
   
   # Email Configuration (Optional)
   spring.mail.host=smtp.gmail.com
   spring.mail.port=587
   spring.mail.username=your_email@gmail.com
   spring.mail.password=your_app_password
   ```

3. **Build the Project**
   ```bash
   mvn clean install
   ```

4. **Run the Application**
   ```bash
   mvn spring-boot:run
   ```

   The server will start on `http://localhost:8080`

### Frontend Setup

1. **Navigate to Frontend Directory** (if applicable)
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

   Frontend will run on `http://localhost:5173`

---

## 📚 API Endpoints

### **User Management**
- `POST /api/users/register` - Register new user
- `POST /api/users/login` - User login
- `GET /api/users/{id}` - Get user profile

### **Policies**
- `POST /api/policies/buy` - Purchase new policy
- `PUT /api/policies/renew/{policyId}` - Renew existing policy
- `GET /api/policies/user/{userId}` - Get user's policies
- `GET /api/policies/{id}` - Get policy details
- `GET /api/policies/{id}/pdf` - Download policy PDF

### **Claims**
- `POST /api/claims/file` - File a new claim
- `GET /api/claims/all` - Get all claims (Admin)
- `PUT /api/claims/{id}/status` - Update claim status

### **Policy Amendments**
- `POST /api/amendments/submit` - Submit amendment request
- `GET /api/amendments/pending` - Get pending amendments (Admin)
- `PUT /api/amendments/{id}/status` - Approve/Reject amendment

### **Documents**
- `POST /api/v1/documents/generate-policy` - Generate digital policy
- `GET /api/v1/documents/my-policies` - Get user's policy documents

### **Insurance Plans**
- `GET /api/plans` - Get all available plans
- `POST /api/plans/quote` - Generate policy quote

### **Chat (AI Support)**
- `POST /api/chat` - Send chat message

---

## 🗄️ Database Schema

### **Key Tables**

| Table | Purpose |
|-------|---------|
| `users` | User accounts (customers, agents, admins) |
| `policies` | Insurance policy records |
| `insurance_plans` | Available insurance plans |
| `claims` | Insurance claims |
| `policy_amendments` | Policy change requests |
| `policy_documents` | Digital policy certificates |
| `agent_availability` | Agent scheduling |

---

## 🔐 Security Features

- ✅ JWT authentication for secure API access
- ✅ Role-based access control (RBAC)
- ✅ CORS configuration for trusted origins
- ✅ Input validation and sanitization
- ✅ Digital signature hashing for document authenticity
- ✅ Secure email communication
- ✅ Environment variable management

---

## 📋 Business Workflows

### **Policy Purchase Flow**
```
Customer → Select Plan → Fill Details → Payment → Policy Generated → Email Receipt
```

### **Claim Processing Flow**
```
File Claim → Auto-Approve (if < ₹500) → OR Manual Review (Admin) → Approve/Reject → Notification
```

### **Policy Amendment Flow**
```
Submit Request → Admin Review → Approve/Reject → Update Policy → Notify Customer
```

### **Policy Renewal Flow**
```
Old Policy → Extend End Date → Mark as ACTIVE → Email Confirmation
```

---

## 🚀 Performance & Scalability

- Spring Boot's async email processing (threading)
- JPA query optimization with custom repository methods
- Database indexing on frequently queried fields
- RESTful API design for scalable client-server communication

---

## 📊 Features by User Role

### **Customer**
- Purchase insurance policies
- Renew existing policies
- File claims
- Request policy amendments
- View policy documents
- Chat with support

### **Agent**
- View assigned policies
- Manage availability schedule
- Support customers
- Process renewals

### **Admin**
- Full policy management
- Claims approval workflow
- Amendment approval
- Comprehensive reporting
- User management
- Plan management

---

## 🔄 Future Enhancements

- [ ] Advanced AI chatbot integration
- [ ] Real-time claim settlement
- [ ] Mobile application (iOS/Android)
- [ ] Blockchain-based policy verification
- [ ] Predictive analytics dashboard
- [ ] Integration with payment gateways
- [ ] Multi-language support
- [ ] Advanced reporting and analytics

---

## 🤝 Contributing

Contributions are welcome! Follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📝 License

This project is licensed under the ISC License.

---

## 👤 Author

**Vaibhavi Sharma** (@vaibhavi-2885)

---

## 📧 Support & Contact

For support, questions, or issues:
- Open an issue on the GitHub repository
- Contact the development team

---

## 🎯 Project Statistics

- **Language**: Java (100%)
- **Framework**: Spring Boot 3.4.12
- **Database**: MySQL
- **API Style**: RESTful
- **Authentication**: JWT

---

## ⭐ Show Your Support

If you find this project helpful, please give it a ⭐️!

---

## 📚 Documentation

For detailed API documentation and setup guides, please refer to the inline code comments and JavaDoc in the source files.

**Quick Links:**
- [GitHub Repository](https://github.com/vaibhavi-2885/InsurAI---Corporate-Policy-Automation-and-Intelligence-System)
- [Spring Boot Documentation](https://spring.io/projects/spring-boot)
- [MySQL Documentation](https://dev.mysql.com/doc/)
