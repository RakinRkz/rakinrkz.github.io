import type { Education, Role } from './types';

export const roles: Role[] = [
  {
    org: 'Cefalo',
    positions: [
      { title: 'Associate Software Engineer II', dates: 'Jan 2026 – Present' },
      { title: 'Associate Software Engineer I', dates: 'Nov 2024 – Jan 2026' },
    ],
    context:
      'Plorea Horeca (Plorea, Norway) — multi-tenant POS, ERP, and inventory SaaS suite serving 50+ hospitality businesses, with cloud-based reporting, payments, and third-party integrations. Built with C#, ASP.NET Core/Framework, TypeScript, React/Next.js, Vue.js, EF Core, SQL Server, OpenIddict, and IIS.',
    highlights: [
      'Built StockControl, an inventory application in the suite, from scratch — a React/Next.js + TypeScript frontend on a .NET REST backend — covering stock counting (inventory management), supplier delivery intake, and inter-store replenishment. Owned it end to end from an empty repository to production.',
      "Built StockControl's delivery-note scanning with Tesseract OCR, which extracts the data off supplier delivery notes automatically so staff no longer key receipts in by hand.",
      'Delivered 50+ features across backend services and web clients and cut page-load times ~60%; led authentication and authorization with OpenID Connect and OpenIddict.',
      'Resolved ~15 production incidents via logging and monitoring, and built a shared configuration system that cut configuration issues 5×.',
      'Work async with an overseas product team, delivering into a live product owned in another timezone.',
    ],
  },
  {
    org: 'Datavvy',
    positions: [{ title: 'Junior Software Developer', dates: 'Jul 2024 – Oct 2024' }],
    highlights: [
      'Built 3 Python data pipelines feeding ~6 Apache Superset and Dremio dashboards for analytics and reporting.',
      'Worked with AWS services (EC2, S3, EKS/Kubernetes) and Docker for deployment and data processing.',
    ],
  },
  {
    org: 'Dashcam Heroz',
    positions: [{ title: 'Software Engineering Intern', dates: 'Sept 2023 – Apr 2024' }],
    highlights: [
      'Built Flask backend services for video processing and post management using FFmpeg, raising throughput to 1.5× more clips per hour.',
      'Developed Flutter mobile features for a cross-platform app, following agile development practices.',
      'Assisted with cloud deployment using AWS Lightsail, Lambda, and Firebase.',
    ],
  },
  {
    org: 'Beetles',
    location: 'Dhaka, Bangladesh',
    positions: [{ title: 'Cyber Security Trainee', dates: 'May 2023 – Jun 2023' }],
    highlights: [
      'Gained hands-on experience in offensive security using Metasploitable and Ghidra.',
      'Learned fundamentals of vulnerability analysis and reverse engineering.',
    ],
  },
];

export const education: Education = {
  degree: 'BSc in Computer Science and Engineering',
  school: 'Islamic University of Technology',
  location: 'Gazipur, Bangladesh',
  dates: 'Jan 2020 – May 2024',
};
