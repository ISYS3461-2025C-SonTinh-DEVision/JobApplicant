/**
 * Skills Data Configuration
 * Popular skills organized by category with icons for smart skill selection
 * Architecture: A.2.a Data Transformation Layer
 */

// Skill categories with icons and colors
export const SKILL_CATEGORIES = {
    frontend: {
        name: 'Frontend',
        icon: '🎨',
        color: 'from-blue-500 to-cyan-500',
        bgColor: 'bg-blue-500/10',
        borderColor: 'border-blue-500/30'
    },
    backend: {
        name: 'Backend',
        icon: '⚙️',
        color: 'from-green-500 to-emerald-500',
        bgColor: 'bg-green-500/10',
        borderColor: 'border-green-500/30'
    },
    devops: {
        name: 'DevOps',
        icon: '🚀',
        color: 'from-purple-500 to-violet-500',
        bgColor: 'bg-purple-500/10',
        borderColor: 'border-purple-500/30'
    },
    database: {
        name: 'Database',
        icon: '🗄️',
        color: 'from-orange-500 to-amber-500',
        bgColor: 'bg-orange-500/10',
        borderColor: 'border-orange-500/30'
    },
    mobile: {
        name: 'Mobile',
        icon: '📱',
        color: 'from-pink-500 to-rose-500',
        bgColor: 'bg-pink-500/10',
        borderColor: 'border-pink-500/30'
    },
    ai: {
        name: 'AI/ML',
        icon: '🤖',
        color: 'from-indigo-500 to-purple-500',
        bgColor: 'bg-indigo-500/10',
        borderColor: 'border-indigo-500/30'
    },
    tools: {
        name: 'Tools',
        icon: '🛠️',
        color: 'from-gray-500 to-slate-500',
        bgColor: 'bg-gray-500/10',
        borderColor: 'border-gray-500/30'
    }
};

// Popular skills organized by category
export const POPULAR_SKILLS = {
    frontend: [
        { name: 'React', icon: '⚛️', level: 'popular' },
        { name: 'Vue.js', icon: '💚', level: 'popular' },
        { name: 'Angular', icon: '🅰️', level: 'popular' },
        { name: 'TypeScript', icon: '📘', level: 'popular' },
        { name: 'JavaScript', icon: '💛', level: 'popular' },
        { name: 'HTML5', icon: '🌐', level: 'basic' },
        { name: 'CSS3', icon: '🎨', level: 'basic' },
        { name: 'Tailwind CSS', icon: '💨', level: 'popular' },
        { name: 'Next.js', icon: '▲', level: 'hot' },
        { name: 'Redux', icon: '💜', level: 'popular' },
        { name: 'Sass', icon: '💗', level: 'basic' },
        { name: 'Webpack', icon: '📦', level: 'basic' }
    ],
    backend: [
        { name: 'Node.js', icon: '💚', level: 'popular' },
        { name: 'Python', icon: '🐍', level: 'popular' },
        { name: 'Java', icon: '☕', level: 'popular' },
        { name: 'Spring Boot', icon: '🍃', level: 'popular' },
        { name: 'Express.js', icon: '🚂', level: 'popular' },
        { name: 'Django', icon: '🎸', level: 'popular' },
        { name: 'FastAPI', icon: '⚡', level: 'hot' },
        { name: 'Go', icon: '🔵', level: 'hot' },
        { name: 'Rust', icon: '🦀', level: 'hot' },
        { name: 'C#', icon: '💜', level: 'popular' },
        { name: '.NET', icon: '🟣', level: 'popular' },
        { name: 'PHP', icon: '🐘', level: 'basic' }
    ],
    devops: [
        { name: 'Docker', icon: '🐳', level: 'popular' },
        { name: 'Kubernetes', icon: '☸️', level: 'hot' },
        { name: 'AWS', icon: '☁️', level: 'popular' },
        { name: 'Azure', icon: '💠', level: 'popular' },
        { name: 'GCP', icon: '🔷', level: 'popular' },
        { name: 'CI/CD', icon: '🔄', level: 'popular' },
        { name: 'Jenkins', icon: '🎩', level: 'basic' },
        { name: 'GitHub Actions', icon: '⚡', level: 'hot' },
        { name: 'Terraform', icon: '🏗️', level: 'hot' },
        { name: 'Linux', icon: '🐧', level: 'basic' },
        { name: 'Nginx', icon: '🟢', level: 'basic' },
        { name: 'Ansible', icon: '🔧', level: 'basic' }
    ],
    database: [
        { name: 'PostgreSQL', icon: '🐘', level: 'popular' },
        { name: 'MySQL', icon: '🐬', level: 'popular' },
        { name: 'MongoDB', icon: '🍃', level: 'popular' },
        { name: 'Redis', icon: '🔴', level: 'popular' },
        { name: 'Elasticsearch', icon: '🔍', level: 'hot' },
        { name: 'SQLite', icon: '📄', level: 'basic' },
        { name: 'Oracle', icon: '🔶', level: 'basic' },
        { name: 'Firebase', icon: '🔥', level: 'popular' },
        { name: 'GraphQL', icon: '💜', level: 'hot' },
        { name: 'Prisma', icon: '△', level: 'hot' }
    ],
    mobile: [
        { name: 'React Native', icon: '📱', level: 'popular' },
        { name: 'Flutter', icon: '💙', level: 'hot' },
        { name: 'Swift', icon: '🍎', level: 'popular' },
        { name: 'Kotlin', icon: '🟣', level: 'popular' },
        { name: 'iOS', icon: '📱', level: 'popular' },
        { name: 'Android', icon: '🤖', level: 'popular' }
    ],
    ai: [
        { name: 'Machine Learning', icon: '🧠', level: 'hot' },
        { name: 'TensorFlow', icon: '🔶', level: 'popular' },
        { name: 'PyTorch', icon: '🔥', level: 'hot' },
        { name: 'OpenAI', icon: '🤖', level: 'hot' },
        { name: 'LangChain', icon: '🔗', level: 'hot' },
        { name: 'NLP', icon: '💬', level: 'popular' },
        { name: 'Computer Vision', icon: '👁️', level: 'popular' }
    ],
    tools: [
        { name: 'Git', icon: '📚', level: 'basic' },
        { name: 'GitHub', icon: '🐙', level: 'basic' },
        { name: 'VS Code', icon: '💻', level: 'basic' },
        { name: 'Jira', icon: '📊', level: 'basic' },
        { name: 'Figma', icon: '🎨', level: 'popular' },
        { name: 'Postman', icon: '📮', level: 'basic' },
        { name: 'Swagger', icon: '📝', level: 'basic' },
        { name: 'Agile', icon: '🔄', level: 'popular' },
        { name: 'Scrum', icon: '📋', level: 'popular' }
    ]
};

// Get all skills as flat array
export const getAllSkills = () => {
    const allSkills = [];
    Object.entries(POPULAR_SKILLS).forEach(([category, skills]) => {
        skills.forEach(skill => {
            allSkills.push({
                ...skill,
                category
            });
        });
    });
    return allSkills;
};

// Get skill info by name
export const getSkillInfo = (skillName) => {
    const allSkills = getAllSkills();
    return allSkills.find(s => s.name.toLowerCase() === skillName.toLowerCase()) || {
        name: skillName,
        icon: '⭐',
        level: 'custom',
        category: 'tools'
    };
};

// Get category for a skill
export const getSkillCategory = (skillName) => {
    for (const [category, skills] of Object.entries(POPULAR_SKILLS)) {
        if (skills.some(s => s.name.toLowerCase() === skillName.toLowerCase())) {
            return SKILL_CATEGORIES[category];
        }
    }
    return SKILL_CATEGORIES.tools; // Default category
};

// Search skills by query
export const searchSkills = (query) => {
    if (!query.trim()) return [];
    const lowerQuery = query.toLowerCase();
    return getAllSkills().filter(skill =>
        skill.name.toLowerCase().includes(lowerQuery)
    ).slice(0, 10);
};

// Get hot/trending skills
export const getHotSkills = () => {
    return getAllSkills().filter(skill => skill.level === 'hot');
};

// Get popular skills for quick add
export const getQuickAddSkills = () => {
    const frontendPopular = POPULAR_SKILLS.frontend.slice(0, 4);
    const backendPopular = POPULAR_SKILLS.backend.slice(0, 4);
    const devopsPopular = POPULAR_SKILLS.devops.slice(0, 2);
    const dbPopular = POPULAR_SKILLS.database.slice(0, 2);

    return [...frontendPopular, ...backendPopular, ...devopsPopular, ...dbPopular];
};

export default {
    SKILL_CATEGORIES,
    POPULAR_SKILLS,
    getAllSkills,
    getSkillInfo,
    getSkillCategory,
    searchSkills,
    getHotSkills,
    getQuickAddSkills
};
