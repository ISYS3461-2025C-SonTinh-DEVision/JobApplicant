# **DEVision – JobSeeker Subsystem**

### **Overview**
This repository is developed by the **Son Tinh Squad – JobSeeker Team** for the course **EEET2582/ISYS3461: System Architecture and Design** at **RMIT University**.  
The **DEVision project** is a recruitment platform designed to connect Computer Science job seekers and employers.  

The system is divided into two subsystems:
- **JobSeeker (this repository):** Handles applicant registration, authentication, profile management, job search, job applications, and premium subscription features.  
- **JobManager:** Manages company registration, job postings, applicant searches, and subscription services for employers.

---

### **Project Objectives**
The **JobSeeker subsystem** aims to:
- Enable users to create and manage professional profiles.  
- Allow searching and applying for jobs across multiple technical domains.  
- Support premium users with real-time job notifications via **Kafka message streaming** from the JobManager subsystem.  
- Establish a robust, maintainable backend and frontend architecture ready for future scalability.

---

### **Architecture Direction**

#### **Frontend**
- Developed with **React (Medium-level architecture)**.  
- Organized in a **component-based structure** for reusability and clarity.  
- Includes REST helper modules for API communication and responsive UI design.  

#### **Backend**
- Built using **Spring Boot (Java)** with **Modular Monolith** architecture (Medium level).  
- Designed to evolve into **Microservice-based architecture (Ultimo level)** if time allows.  
- Implements layered structure (**Controller → Service → Repository → DTO**).  
- Integrates **MongoDB** for flexible data modeling.  
- Planned usage of **Kafka** for asynchronous messaging and **Docker** for containerized deployment.

---

### **Milestone 1 Focus**
- Define **System Context** and **Container diagrams** (C4 Model).  
- Develop the **Conceptual Data Model (ERD)**.  
- Design backend and frontend **Container + Component architectures**.  
- Document architectural justifications based on maintainability, scalability, and reusability principles.  
- Set up **GitHub Project Board** for progress tracking and collaboration among team members.

---

### **Team Structure – Son Tinh Squad**

| **Team** | **Responsibility** | **Members** |
|-----------|--------------------|--------------|
| **JobSeeker Team** | Applicant-side system (this repo) | *(add other members)* |
| **JobManager Team** | Employer-side system | *(add other members)* |

---

### **Tools & Technologies**
- **Backend:** Spring Boot, Java, MongoDB, Redis, Kafka  
- **Frontend:** React, HTML, CSS, JavaScript  
- **Deployment:** Docker  
- **Version Control:** GitHub  
- **Project Management:** GitHub Projects  

---

### **License**
This project is part of the **RMIT University – System Architecture and Design** coursework.  
All materials are used strictly for educational and assessment purposes.

---
