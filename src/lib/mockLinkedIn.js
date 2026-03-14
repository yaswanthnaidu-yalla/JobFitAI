const mockJobs = [
  { title: 'Frontend Engineer',
    description: 'Build and maintain responsive web applications using modern JavaScript frameworks. Required: 3+ years React or Vue, TypeScript, HTML5, CSS3, responsive design. Preferred: Next.js, GraphQL, Storybook, accessibility (WCAG), performance optimization.' },
  { title: 'Data Scientist',
    description: 'Analyze large-scale datasets to derive actionable business insights and build predictive models. Required: 3+ years Python, pandas, scikit-learn, SQL, statistical modeling. Preferred: TensorFlow/PyTorch, Spark, A/B testing, data visualization (Tableau/D3).' },
  { title: 'Product Manager',
    description: 'Own the product roadmap and drive cross-functional execution from discovery to launch. Required: 3+ years product management, user research, Agile/Scrum, data-driven decision-making, stakeholder communication. Preferred: SQL, Figma, growth experimentation, B2B SaaS experience.' },
  { title: 'DevOps Engineer',
    description: 'Design and maintain CI/CD pipelines, infrastructure-as-code, and cloud environments. Required: 3+ years AWS or GCP, Terraform, Docker, Kubernetes, Linux administration. Preferred: GitHub Actions, Prometheus/Grafana, Ansible, security hardening, cost optimization.' },
  { title: 'ML Engineer',
    description: 'Develop, train, and deploy machine learning models at scale in production systems. Required: 3+ years Python, TensorFlow or PyTorch, feature engineering, model evaluation, REST APIs. Preferred: MLflow, Kubeflow, distributed training, NLP/computer vision, real-time inference.' },
  { title: 'Backend Engineer',
    description: 'Build scalable backend services, APIs, and data pipelines for high-traffic applications. Required: 3+ years Python or Go, REST/gRPC APIs, PostgreSQL, Redis, microservices architecture. Preferred: Kafka, Elasticsearch, AWS Lambda, domain-driven design, observability tooling.' },
  { title: 'UI/UX Designer',
    description: 'Create user-centered designs from wireframes through high-fidelity prototypes and design systems. Required: 3+ years Figma, user research, interaction design, visual design, responsive/mobile-first design. Preferred: motion design, accessibility audits, HTML/CSS literacy, design tokens, usability testing.' },
  { title: 'QA Engineer',
    description: 'Develop and execute automated test strategies to ensure product quality across web and mobile platforms. Required: 3+ years Selenium or Cypress, test planning, API testing (Postman), regression testing, bug tracking (Jira). Preferred: Playwright, performance testing (k6/JMeter), CI/CD integration, mobile testing (Appium).' },
  { title: 'Cloud Architect',
    description: 'Design resilient, secure, and cost-effective multi-cloud architectures for enterprise workloads. Required: 5+ years AWS/Azure/GCP, networking (VPC, DNS, load balancing), IAM, high availability patterns, IaC (Terraform/CloudFormation). Preferred: multi-account strategies, FinOps, service mesh (Istio), serverless architectures, compliance frameworks.' },
  { title: 'Mobile Developer',
    description: 'Build performant, cross-platform mobile applications with delightful user experiences. Required: 3+ years React Native or Flutter, TypeScript/Dart, REST API integration, app store deployment, state management. Preferred: native iOS (Swift) or Android (Kotlin), push notifications, offline-first architecture, CI/CD for mobile, analytics integration.' },
]

export const mockJobImport = (url) =>
  new Promise(resolve =>
    setTimeout(() => {
      const randomIndex = Math.floor(Math.random() * mockJobs.length);
      resolve(mockJobs[randomIndex]);
    }, 1500)
  )

const mockProfiles = [
  { name: 'Sarah Chen', headline: 'Senior Backend Engineer at Google',
    skills: 'Python, REST APIs, PostgreSQL, AWS, Docker, system design' },
  { name: 'James Patel', headline: 'Full Stack Developer at Startupco',
    skills: 'Python, SQL, Node.js, REST APIs, basic AWS' },
  { name: 'Alex Wong', headline: 'Junior Developer at Agency',
    skills: 'JavaScript, HTML, CSS, basic Python, no backend experience' }
]

export const mockProfileImport = (url) =>
  new Promise(resolve =>
    setTimeout(() => {
      const randomIndex = Math.floor(Math.random() * mockProfiles.length);
      const base = mockProfiles[randomIndex];
      const uniqueSuffix = Math.floor(Math.random() * 100000);
      resolve({
        ...base,
        name: `${base.name} #${uniqueSuffix}`,
      });
    }, 1500)
  )