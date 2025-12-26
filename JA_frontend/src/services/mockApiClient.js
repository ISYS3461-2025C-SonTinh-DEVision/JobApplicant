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
            {
              id: "j03",
              title: "Full Stack Engineer",
              company: "InnovateLabs",
              location: "Thailand",
              employmentType: "Full-time",
              salary: "2000–3500 USD",
              skills: ["Node.js", "React", "MongoDB"],
              fresher: false,
            },
            {
              id: "j04",
              title: "UI/UX Designer",
              company: "Creative Studio",
              location: "Vietnam",
              employmentType: "Contract",
              salary: "1000–1500 USD",
              skills: ["Figma", "Adobe XD", "Prototyping"],
              fresher: true,
            },
            {
              id: "j05",
              title: "DevOps Engineer",
              company: "SystemX",
              location: "Malaysia",
              employmentType: "Full-time",
              salary: "1500–2500 USD",
              skills: ["AWS", "Docker", "Kubernetes"],
              fresher: false,
            },
            {
              id: "j06",
              title: "Data Scientist",
              company: "DataMinds",
              location: "Singapore",
              employmentType: "Part-time",
              salary: "1800–3000 USD",
              skills: ["Python", "TensorFlow", "SQL"],
              fresher: false,
            },
            {
              id: "j07",
              title: "Mobile Developer (Flutter)",
              company: "AppWiz",
              location: "Vietnam",
              employmentType: "Full-time",
              salary: "1200–2000 USD",
              skills: ["Flutter", "Dart", "Firebase"],
              fresher: true,
            },
            {
              id: "j08",
              title: "Product Manager",
              company: "BizSolutions",
              location: "Thailand",
              employmentType: "Full-time",
              salary: "2500–4000 USD",
              skills: ["Agile", "Scrum", "JIRA"],
              fresher: false,
            },
            {
              id: "j09",
              title: "QA Engineer",
              company: "QualityFirst",
              location: "Malaysia",
              employmentType: "Internship",
              salary: "800–1200 USD",
              skills: ["Selenium", "Java", "TestNG"],
              fresher: true,
            },
            {
              id: "j10",
              title: "Senior Go Developer",
              company: "SpeedyBack",
              location: "Singapore",
              employmentType: "Contract",
              salary: "3000–5000 USD",
              skills: ["Go", "gRPC", "Microservices"],
              fresher: false,
            },
            {
              id: "j11",
              title: "Frontend Developer (Vue.js)",
              company: "WebTech",
              location: "Vietnam",
              employmentType: "Part-time",
              salary: "1000–1800 USD",
              skills: ["Vue.js", "JavaScript", "Tailwind"],
              fresher: false,
            },
            {
              id: "j12",
              title: "System Administrator",
              company: "NetSecure",
              location: "Thailand",
              employmentType: "Full-time",
              salary: "1000–1500 USD",
              skills: ["Linux", "Bash", "Network Security"],
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
