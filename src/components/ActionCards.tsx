import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { LifeBuoy, Users, Megaphone } from 'lucide-react';

const CARDS = [
  {
    key: 'help',
    icon: LifeBuoy,
    color: '#e07b39',
    bg: '#fff5ef',
    href: '/what-you-can-do/found-nest',
  },
  {
    key: 'volunteer',
    icon: Users,
    color: '#0d7a8a',
    bg: '#e8f6f8',
    href: '/volunteers/info',
  },
  {
    key: 'spread',
    icon: Megaphone,
    color: '#5a7abf',
    bg: '#eef2fb',
    href: '/what-we-do/caretta-conservation',
  },
];

const CONTENT: Record<string, Record<string, { title: string; desc: string }>> = {
  ru: {
    help:      { title: 'Помощь',                         desc: 'Нашёл гнездо или кто-то его трогает? Узнай, что делать.' },
    volunteer: { title: 'Стать волонтёром',               desc: 'Присоединяйся к нам и помоги защитить черепах на месте.' },
    spread:    { title: 'Расскажи о нас',                 desc: 'Поделись с родными, знакомыми и детьми — это важно.' },
    support:   { title: 'Поддержи нас',                   desc: 'Твоя поддержка помогает нам продолжать работу.' },
  },
  en: {
    help:      { title: 'Get Help',                       desc: 'Found a nest or someone is touching it? Learn what to do.' },
    volunteer: { title: 'Become a Volunteer',             desc: 'Join our team and help protect turtles on the ground.' },
    spread:    { title: 'Spread the Word',                desc: 'Tell your family, friends and children — it matters.' },
    support:   { title: 'Support Us',                     desc: 'Your support helps us continue our work.' },
  },
  tr: {
    help:      { title: 'Yardım Et',                      desc: 'Yuva mı buldun ya da birileri ona mı dokunuyor? Ne yapacağını öğren.' },
    volunteer: { title: 'Gönüllü Ol',                     desc: 'Ekibimize katıl ve kaplumbağaları korumaya yardım et.' },
    spread:    { title: 'Bizi Anlat',                     desc: 'Ailenle, arkadaşlarınla ve çocuklarınla paylaş.' },
    support:   { title: 'Bizi Destekle',                  desc: 'Desteğin çalışmalarımızı sürdürmemize yardımcı olur.' },
  },
};

export default async function ActionCards({ locale }: { locale: string }) {
  const lang = (locale in CONTENT ? locale : 'ru') as keyof typeof CONTENT;
  const content = CONTENT[lang];

  return (
    <section className="py-12 bg-white">
      <div className="container">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-4xl mx-auto">
          {CARDS.map(({ key, icon: Icon, color, bg, href }) => {
            const disabled = false;
            const { title, desc } = content[key];

            const inner = (
              <div
                className={`flex flex-col items-center text-center p-9 rounded-2xl border-2 h-full transition-all duration-200 ${
                  disabled
                    ? 'opacity-60 cursor-not-allowed border-gray-200 bg-gray-50'
                    : 'border-transparent hover:shadow-xl hover:-translate-y-1 cursor-pointer'
                }`}
                style={disabled ? {} : { backgroundColor: bg }}
              >
                <div
                  className="w-20 h-20 rounded-full flex items-center justify-center mb-5 shrink-0"
                  style={{ backgroundColor: disabled ? '#e5e7eb' : `${color}22`, color: disabled ? '#9ca3af' : color }}
                >
                  <Icon size={36} strokeWidth={1.5} />
                </div>
                <h3
                  className="font-bold text-lg mb-2 leading-snug"
                  style={{ color: disabled ? '#9ca3af' : '#1a2632' }}
                >
                  {title}
                </h3>
                <p className="text-sm leading-relaxed" style={{ color: disabled ? '#c0c0c0' : '#5a7282' }}>
                  {desc}
                </p>
              </div>
            );

            return disabled ? (
              <div key={key}>{inner}</div>
            ) : (
              <Link key={key} href={href} className="block h-full">
                {inner}
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
