import type { SkillGroup } from './types';

export const skillGroups: SkillGroup[] = [
  { label: 'Languages', items: ['C#', 'TypeScript', 'Python', 'Dart', 'Go', 'JavaScript (ES6)', 'Java', 'C++', 'C'] },
  {
    label: 'Backend & APIs',
    items: ['ASP.NET Core', 'ASP.NET Framework', 'Node.js/Express', 'Flask', 'REST APIs', 'OpenID Connect', 'OAuth 2.0'],
  },
  { label: 'Frontend', items: ['React', 'Next.js', 'Vue.js', 'HTML', 'CSS'] },
  { label: 'Mobile', items: ['Flutter', 'Dart (cross-platform iOS/Android)'] },
  { label: 'Databases', items: ['Microsoft SQL Server', 'PostgreSQL', 'MySQL', 'MongoDB'] },
  {
    label: 'Architecture',
    items: ['Microservices', 'Multi-tenancy', 'Background Jobs', 'Caching', 'MQTT', 'SignalR'],
  },
  {
    label: 'Cloud & DevOps',
    items: ['AWS (EC2, S3, EKS)', 'Azure', 'Docker', 'Kubernetes', 'IIS', 'Linux', 'CI/CD'],
  },
  {
    label: 'AI & Data',
    items: ['Llama.cpp', 'RAG', 'Tesseract OCR', 'TensorFlow', 'MediaPipe', 'OpenCV', 'YOLO', 'Apache Superset', 'Dremio'],
  },
  {
    label: 'Observability',
    items: ['Logging', 'Monitoring', 'Alerting', 'Incident Response', 'SQL Performance Profiling'],
  },
  { label: 'Tools', items: ['Git', 'Postman', 'Jira', 'Claude Code', 'OpenCode (agentic development)'] },
];
