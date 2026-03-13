export const mockJobImport = (url) =>
  new Promise(resolve => setTimeout(() => resolve({
    title: 'Senior Software Engineer',
    description: 'We are looking for a Senior Software Engineer at TechCorp to build scalable backend systems using Python, design RESTful APIs, and work with PostgreSQL. Required: 3+ years Python, REST APIs, SQL. Preferred: AWS, Docker, Kubernetes.'
  }), 1500))

const mockProfiles = [
  { name: 'Sarah Chen', headline: 'Senior Backend Engineer at Google',
    skills: 'Python, REST APIs, PostgreSQL, AWS, Docker, system design' },
  { name: 'James Patel', headline: 'Full Stack Developer at Startupco',
    skills: 'Python, SQL, Node.js, REST APIs, basic AWS' },
  { name: 'Alex Wong', headline: 'Junior Developer at Agency',
    skills: 'JavaScript, HTML, CSS, basic Python, no backend experience' }
]
let i = 0
export const mockProfileImport = (url) =>
  new Promise(resolve => setTimeout(() => {
    resolve(mockProfiles[i++ % mockProfiles.length])
  }, 1500))