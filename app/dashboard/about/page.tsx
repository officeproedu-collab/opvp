import { BookOpen, Monitor, Bot, Info, Award } from 'lucide-react';
import ashengImage from '../../../assets/asheng1.png';

export default function AboutPage() {
  const subjects = [
    {
      title: 'MS Office',
      description: 'Master Microsoft Word, Excel, and PowerPoint for professional documentation, data analysis, and presentations.',
      icon: BookOpen,
    },
    {
      title: 'IT Knowledge',
      description: 'Core computing skills including internet & email, cloud storages, Google Forms, and computer hardware essentials.',
      icon: Monitor,
    },
    {
      title: 'AI & AI Chatbots',
      description: 'Introduction to artificial intelligence, leveraging AI chatbots for productivity, and understanding prompt engineering.',
      icon: Bot,
    }
  ];

  return (
    <main className="flex-1 max-w-5xl mx-auto w-full px-4 sm:px-6 py-8 animate-fade-in">
      <div className="mb-8">
        <h1 className="text-3xl font-700 tracking-tight flex items-center gap-3">
          <Info className="w-8 h-8 text-primary" />
          About Portal
        </h1>
        <p className="text-muted-foreground mt-2">Discover what you will learn and get to know your instructor.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 stagger-children">
        {subjects.map((subject, idx) => (
          <div key={idx} className="surface p-6 rounded-xl border border-border/50 hover:border-primary/30 transition-all duration-200">
            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
              <subject.icon className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-lg font-600 text-foreground mb-2">{subject.title}</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">{subject.description}</p>
          </div>
        ))}
      </div>

      {/* Lecturer Profile */}
      <div className="surface rounded-2xl overflow-hidden border border-border/50">
        <div className="h-32 bg-gradient-to-r from-primary/20 via-primary/10 to-transparent" />
        <div className="px-6 sm:px-10 pb-10">
          <div className="relative flex justify-center sm:justify-start -mt-16 mb-6">
            <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-background shadow-xl bg-secondary">
              <img 
                src={ashengImage.src} 
                alt="K. B. V. Ashen Lalantha" 
                className="w-full h-full object-cover object-center"
              />
            </div>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h2 className="text-2xl font-700 text-foreground">K. B. V. Ashen Lalantha</h2>
                <Award className="w-5 h-5 text-primary" />
              </div>
              <p className="text-primary font-500 mb-4">Lecturer &bull; B.Eng Software Engineer</p>
              <p className="text-muted-foreground max-w-2xl leading-relaxed">
                Welcome to the OfficePro Education Institute Video Portal! I am dedicated to helping you master essential IT skills, from everyday office tools to the latest advancements in AI. My goal is to provide practical, high-quality lessons that you can access at your own pace to build a strong foundation in technology.
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
