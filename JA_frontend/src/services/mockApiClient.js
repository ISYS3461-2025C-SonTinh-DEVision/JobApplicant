export const mockApiClient = {
  get: async (url) => {
    switch (url) {
      /* ===================== AUTH ===================== */
      case "/auth/me":
        return {
          data: {
            id: "u01",
            email: "tran.truong@gmail.com",
            role: "APPLICANT",
            country: "Vietnam",
            premium: true,
          },
        };

      /* ===================== PROFILE ===================== */
      case "/profile/me":
        return {
          data: {
            id: "u01",
            name: "Trần Trường",
            email: "tran.truong@gmail.com",
            phone: "+84901234567",
            country: "Vietnam",
            city: "Hồ Chí Minh",
            skills: ["React", "Spring Boot", "Docker"],
            education: [
              {
                degree: "Bachelor of Software Engineering",
                institution: "RMIT University Vietnam",
                from: 2021,
                to: 2025,
                gpa: 85,
              },
            ],
            experience: [
              {
                title: "Frontend Intern",
                from: "06-2024",
                to: "12-2024",
                description: "Built React components and forms for job matching platform",
              },
            ],
          },
        };

      case "/profile/applications":
        return {
          data: [
            {
              id: "a01",
              jobTitle: "Frontend Developer Intern",
              company: "TechCorp",
              status: "Pending",
              appliedAt: "2025-05-01",
            },
            {
              id: "a02",
              jobTitle: "Junior Software Engineer",
              company: "Cloudify",
              status: "Rejected",
              appliedAt: "2025-04-15",
            },
          ],
        };

      /* ===================== JOBS ===================== */
      case "/jobs":
        return {
          data: [
            {
              id: "j01",
              title: "Frontend Developer Intern",
              company: "TechCorp",
              location: "Vietnam",
              employmentType: "Internship",
              salary: "500–800 USD",
              skills: ["React", "HTML", "CSS"],
              fresher: true,
            },
            {
              id: "j02",
              title: "Backend Developer",
              company: "Cloudify",
              location: "Singapore",
              employmentType: "Full-time",
              salary: "1200–1800 USD",
              skills: ["Spring Boot", "Kafka", "PostgreSQL"],
              fresher: false,
            },
          ],
        };

      case "/jobs/j01":
        return {
          data: {
            id: "j01",
            title: "Frontend Developer Intern",
            company: "TechCorp",
            description:
              "Work with React and modern frontend tooling in an agile team.",
            requirements: ["React", "Git", "Basic REST knowledge"],
            location: "Vietnam",
            employmentType: "Internship",
          },
        };

      /* ===================== SUBSCRIPTION ===================== */
      case "/subscription":
        return {
          data: {
            premium: true,
            plan: "Monthly",
            price: 10,
            renewalDate: "2025-06-01",
          },
        };

      /* ===================== ADMIN ===================== */
      case "/admin/applicants":
        return {
          data: [
            {
              id: "u01",
              email: "tran.truong@gmail.com",
              country: "Vietnam",
              premium: true,
              status: "Active",
            },
            {
              id: "u02",
              email: "le.minh@gmail.com",
              country: "Singapore",
              premium: false,
              status: "Inactive",
            },
          ],
        };

      case "/admin/jobs":
        return {
          data: [
            {
              id: "j01",
              title: "Frontend Developer Intern",
              company: "TechCorp",
              status: "Active",
            },
            {
              id: "j02",
              title: "Backend Developer",
              company: "Cloudify",
              status: "Closed",
            },
          ],
        };

      default:
        throw new Error(`Unknown endpoint: ${url}`);
    }
  },
};
